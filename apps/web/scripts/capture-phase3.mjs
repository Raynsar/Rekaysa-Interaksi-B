import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const CHROME =
  process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const DEBUG_PORT = 9333
const BASE_URL = process.env.BASE_URL ?? 'http://127.0.0.1:5173'
const WIDTHS = [390, 768, 1024, 1440]
const HEIGHT = 900

const ROUTES = [
  { slug: 'home', path: '/' },
  { slug: 'product', path: '/product' },
  { slug: 'cart', path: '/cart' },
  { slug: 'checkout', path: '/checkout' },
  { slug: 'orders', path: '/orders' },
  { slug: 'order-detail-normal', path: '/orders/ORD-2026-001' },
  { slug: 'order-detail-diterima', path: '/orders/ORD-2026-004' },
  { slug: 'order-detail-selesai', path: '/orders/ORD-2026-005' },
  { slug: 'report', path: '/report/ORD-2026-004' },
  { slug: 'account', path: '/account' },
  { slug: 'not-found', path: '/route-tidak-dikenal' },
]

const screenshotDir = join(process.cwd(), '..', '..', 'docs', 'screenshots', 'phase3')
const validationDir = join(process.cwd(), '..', '..', 'docs', 'validation', 'phase3')

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function waitForEndpoint(url, timeoutMs = 20000) {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url)
      if (response.ok) return response.json()
    } catch {
      // Chrome is still starting.
    }
    await sleep(200)
  }
  throw new Error(`DevTools endpoint not reachable: ${url}`)
}

async function findPageTarget() {
  const response = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`)
  const targets = await response.json()
  const existing = targets.find((target) => target.type === 'page')
  if (existing) return existing

  const created = await fetch(
    `http://127.0.0.1:${DEBUG_PORT}/json/new?about:blank`,
    { method: 'PUT' },
  )
  return created.json()
}

function connect(targetUrl) {
  const socket = new WebSocket(targetUrl)
  const pending = new Map()
  const events = []
  let nextId = 0

  socket.onmessage = (message) => {
    const payload = JSON.parse(message.data)
    if (payload.id && pending.has(payload.id)) {
      const { resolve, reject } = pending.get(payload.id)
      pending.delete(payload.id)
      if (payload.error) reject(new Error(JSON.stringify(payload.error)))
      else resolve(payload.result)
    } else if (payload.method) {
      events.push(payload.method)
    }
  }

  return {
    ready: new Promise((resolve, reject) => {
      socket.onopen = resolve
      socket.onerror = reject
    }),
    events,
    send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = ++nextId
        pending.set(id, { resolve, reject })
        socket.send(JSON.stringify({ id, method, params }))
      })
    },
    close() {
      socket.close()
    },
  }
}

async function waitForEvent(events, method, timeoutMs = 10000) {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    if (events.includes(method)) return
    await sleep(50)
  }
  throw new Error(`Timed out waiting for ${method}`)
}

const METRICS_EXPRESSION = `(() => {
  const nav = document.querySelector('.bottom-nav');
  const side = document.querySelector('.sidebar');
  const tablet = document.querySelector('.tablet-nav');
  const button = document.querySelector('.page-content .button--primary');
  const badge = document.querySelector('.status-badge');
  const card = document.querySelector('.page-content .card');
  const close = document.querySelector('.ad-banner__close');
  const content = document.querySelector('.page-content');
  let primaryAction = { present: false, visible: false, covered: false };

  const sample = (element, properties) => {
    if (!element) return null;
    const style = getComputedStyle(element);
    return Object.fromEntries(properties.map((property) => [property, style[property]]));
  };

  if (button) {
    button.scrollIntoView({ block: 'center', inline: 'nearest' });
    const rect = button.getBoundingClientRect();
    const hit = document.elementFromPoint(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
    );
    primaryAction = {
      present: true,
      visible: rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.bottom <= innerHeight,
      covered: !(hit && (hit === button || button.contains(hit))),
    };
    window.scrollTo(0, 0);
  }

  return JSON.stringify({
    innerWidth,
    documentScrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    hasHorizontalOverflow: document.documentElement.scrollWidth > innerWidth,
    navigation: {
      bottomNav: nav ? getComputedStyle(nav).display !== 'none' : false,
      sidebar: side ? getComputedStyle(side).display !== 'none' : false,
      tabletNav: tablet ? getComputedStyle(tablet).display !== 'none' : false,
    },
    primaryAction,
    visual: {
      body: sample(document.body, ['backgroundColor', 'color', 'fontFamily']),
      primaryButton: sample(button, ['backgroundColor', 'borderRadius', 'minHeight', 'fontSize', 'fontWeight']),
      statusBadge: sample(badge, ['backgroundColor', 'color', 'borderRadius', 'fontSize']),
      card: sample(card, ['backgroundColor', 'borderColor', 'borderRadius']),
      adClose: sample(close, ['width', 'height']),
      pageContent: sample(content, ['paddingLeft', 'paddingTop']),
    },
  });
})()`

async function main() {
  await mkdir(screenshotDir, { recursive: true })
  await mkdir(validationDir, { recursive: true })

  const chrome = spawn(
    CHROME,
    [
      '--headless=new',
      `--remote-debugging-port=${DEBUG_PORT}`,
      `--user-data-dir=${join(tmpdir(), `opencode-phase3-chrome-${Date.now()}`)}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-gpu',
      '--hide-scrollbars',
      `--window-size=1440,${HEIGHT}`,
      'about:blank',
    ],
    { stdio: 'ignore' },
  )

  try {
    await waitForEndpoint(`http://127.0.0.1:${DEBUG_PORT}/json/version`)
    const target = await findPageTarget()
    const cdp = connect(target.webSocketDebuggerUrl)
    await cdp.ready

    await cdp.send('Page.enable')
    await cdp.send('Runtime.enable')

    const results = []

    for (const width of WIDTHS) {
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width,
        height: HEIGHT,
        deviceScaleFactor: 1,
        mobile: false,
      })

      for (const route of ROUTES) {
        cdp.events.length = 0
        await cdp.send('Page.navigate', {
          url: `${BASE_URL}/?case=${route.slug}-${width}#${route.path}`,
        })
        await waitForEvent(cdp.events, 'Page.loadEventFired')
        await sleep(350)

        const evaluation = await cdp.send('Runtime.evaluate', {
          expression: METRICS_EXPRESSION,
          returnByValue: true,
        })
        const metrics = JSON.parse(evaluation.result.value)

        const shot = await cdp.send('Page.captureScreenshot', {
          format: 'png',
          captureBeyondViewport: false,
        })
        await writeFile(
          join(screenshotDir, `${route.slug}-${width}.png`),
          Buffer.from(shot.data, 'base64'),
        )

        results.push({
          route: route.slug,
          path: route.path,
          width,
          ...metrics,
          screenshot: `docs/screenshots/phase3/${route.slug}-${width}.png`,
        })
      }
    }

    const expectedNavigation = (width) => ({
      bottomNav: width < 640,
      sidebar: width >= 1024,
      tabletNav: width >= 640 && width < 1024,
    })

    const navigationMismatches = results.filter((result) => {
      const expected = expectedNavigation(result.width)
      return (
        result.navigation.bottomNav !== expected.bottomNav ||
        result.navigation.sidebar !== expected.sidebar ||
        result.navigation.tabletNav !== expected.tabletNav
      )
    })

    const expectedVisual = {
      bodyBackground: 'rgb(245, 245, 245)',
      primaryBackground: 'rgb(238, 77, 45)',
      primaryRadius: '8px',
      primaryMinHeight: '40px',
      primaryFontSize: '14px',
      primaryFontWeight: '600',
      badgeRadius: '999px',
      badgeFontSize: '12px',
      cardBackground: 'rgb(255, 255, 255)',
      cardBorder: 'rgb(229, 229, 229)',
      cardRadius: '12px',
      adCloseMin: 44,
    }

    const visualMismatches = []
    for (const result of results) {
      const visual = result.visual ?? {}
      const checks = [
        ['body.background', visual.body?.backgroundColor, expectedVisual.bodyBackground],
        ['button.background', visual.primaryButton?.backgroundColor, expectedVisual.primaryBackground],
        ['button.radius', visual.primaryButton?.borderRadius, expectedVisual.primaryRadius],
        ['button.minHeight', visual.primaryButton?.minHeight, expectedVisual.primaryMinHeight],
        ['button.fontSize', visual.primaryButton?.fontSize, expectedVisual.primaryFontSize],
        ['button.fontWeight', visual.primaryButton?.fontWeight, expectedVisual.primaryFontWeight],
        ['badge.radius', visual.statusBadge?.borderRadius, expectedVisual.badgeRadius],
        ['badge.fontSize', visual.statusBadge?.fontSize, expectedVisual.badgeFontSize],
        ['card.background', visual.card?.backgroundColor, expectedVisual.cardBackground],
        ['card.border', visual.card?.borderColor, expectedVisual.cardBorder],
        ['card.radius', visual.card?.borderRadius, expectedVisual.cardRadius],
      ]

      for (const [field, actual, expected] of checks) {
        if (actual != null && actual !== expected) {
          visualMismatches.push({
            route: result.route,
            width: result.width,
            field,
            actual,
            expected,
          })
        }
      }

      if (visual.adClose) {
        const width = Number.parseFloat(visual.adClose.width)
        const height = Number.parseFloat(visual.adClose.height)
        if (width < expectedVisual.adCloseMin || height < expectedVisual.adCloseMin) {
          visualMismatches.push({
            route: result.route,
            width: result.width,
            field: 'adClose.touchTarget',
            actual: `${width}x${height}`,
            expected: `>=${expectedVisual.adCloseMin}`,
          })
        }
      }
    }

    const report = {
      generatedAt: new Date().toISOString(),
      tool: 'Chrome headless via DevTools Protocol',
      chromePath: CHROME,
      baseUrl: BASE_URL,
      breakpoints: WIDTHS,
      viewportHeight: HEIGHT,
      routes: ROUTES.map((route) => route.slug),
      results,
      summary: {
        checks: results.length,
        horizontalOverflow: results.filter((r) => r.hasHorizontalOverflow).length,
        navigationMismatches: navigationMismatches.map((r) => ({
          route: r.route,
          width: r.width,
          actual: r.navigation,
          expected: expectedNavigation(r.width),
        })),
        primaryActionCovered: results
          .filter((r) => r.primaryAction.present && r.primaryAction.covered)
          .map((r) => `${r.route}@${r.width}`),
        primaryActionNotVisible: results
          .filter((r) => r.primaryAction.present && !r.primaryAction.visible)
          .map((r) => `${r.route}@${r.width}`),
        visualMismatches,
      },
    }

    await writeFile(
      join(validationDir, 'overflow.json'),
      `${JSON.stringify(report, null, 2)}\n`,
    )
    console.log(JSON.stringify(report.summary, null, 2))
    cdp.close()
  } finally {
    chrome.kill()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
