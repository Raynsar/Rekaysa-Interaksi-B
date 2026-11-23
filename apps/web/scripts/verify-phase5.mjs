import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const CHROME =
  process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const DEBUG_PORT = 9335
const BASE_URL = process.env.BASE_URL ?? 'http://127.0.0.1:5173'
const WIDTHS = [390, 1440]
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

const screenshotDir = join(process.cwd(), '..', '..', 'docs', 'screenshots', 'phase5')
const validationDir = join(process.cwd(), '..', '..', 'docs', 'validation', 'phase5')

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

  const created = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/new?about:blank`, {
    method: 'PUT',
  })
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
  const standardCard = document.querySelector('.page-content .card:not(.card--lg)');
  const input = document.querySelector('.page-content .input, .page-content .select, .page-content .textarea');
  const close = document.querySelector('.ad-banner__close');
  const heading = document.querySelector('.page-content .page-title');
  const section = document.querySelector('.page-content .section-title');
  const content = document.querySelector('.page-content');
  const activeTab = document.querySelector('.filter-tabs__tab--active');
  const navigation = performance.getEntriesByType('navigation')[0];

  const sample = (element, properties) => {
    if (!element) return null;
    const style = getComputedStyle(element);
    return Object.fromEntries(properties.map((property) => [property, style[property]]));
  };

  let primaryAction = { present: false, visible: false, covered: false };
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
    performance: navigation ? {
      domContentLoadedMs: Math.round(navigation.domContentLoadedEventEnd),
      loadMs: Math.round(navigation.loadEventEnd),
      durationMs: Math.round(navigation.duration),
    } : null,
    visual: {
      body: sample(document.body, ['backgroundColor', 'color', 'fontFamily', 'fontSize']),
      primaryButton: sample(button, ['backgroundColor', 'borderRadius', 'minHeight', 'fontSize', 'fontWeight']),
      h1: sample(heading, ['fontSize', 'fontWeight', 'lineHeight']),
      h2: sample(section, ['fontSize', 'fontWeight']),
      statusBadge: sample(badge, ['backgroundColor', 'color', 'borderRadius', 'fontSize', 'padding']),
      card: sample(card, ['backgroundColor', 'borderColor', 'borderRadius']),
      cardStandard: sample(standardCard, ['padding']),
      input: sample(input, ['minHeight', 'borderColor', 'borderRadius', 'fontSize']),
      adClose: sample(close, ['width', 'height']),
      pageContent: sample(content, ['paddingLeft', 'paddingTop']),
      activeTab: sample(activeTab, ['backgroundColor', 'borderColor', 'color']),
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
      `--user-data-dir=${join(tmpdir(), `opencode-phase5-chrome-${Date.now()}`)}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-gpu',
      '--hide-scrollbars',
      `--window-size=${WIDTHS[1]},${HEIGHT}`,
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

    const evaluate = async (expression) => {
      const response = await cdp.send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true,
      })
      if (response.exceptionDetails) {
        throw new Error(response.exceptionDetails.text ?? 'Runtime.evaluate failed')
      }
      return response.result.value
    }

    const navigate = async (hash, label) => {
      cdp.events.length = 0
      await cdp.send('Page.navigate', {
        url: `${BASE_URL}/?case=${encodeURIComponent(label)}-${Date.now()}#${hash}`,
      })
      await waitForEvent(cdp.events, 'Page.loadEventFired')
      await evaluate('localStorage.clear()')
      cdp.events.length = 0
      await cdp.send('Page.reload')
      await waitForEvent(cdp.events, 'Page.loadEventFired')
      await sleep(250)
    }

    const results = []
    for (const width of WIDTHS) {
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width,
        height: HEIGHT,
        deviceScaleFactor: 1,
        mobile: false,
      })

      for (const route of ROUTES) {
        await navigate(route.path, `${route.slug}-${width}`)
        const evaluation = await cdp.send('Runtime.evaluate', {
          expression: METRICS_EXPRESSION,
          returnByValue: true,
        })
        const metrics = JSON.parse(evaluation.result.value)

        const shot = await cdp.send('Page.captureScreenshot', {
          format: 'png',
          captureBeyondViewport: false,
        })
        const screenshot = `docs/screenshots/phase5/${route.slug}-${width}.png`
        await writeFile(join(screenshotDir, `${route.slug}-${width}.png`), Buffer.from(shot.data, 'base64'))

        results.push({ route: route.slug, path: route.path, width, ...metrics, screenshot })
      }
    }

    const expectedNavigation = (width) => ({
      bottomNav: width < 640,
      sidebar: width >= 1024,
      tabletNav: width >= 640 && width < 1024,
    })

    const mismatches = []
    const compare = (result, field, actual, expected) => {
      if (actual != null && actual !== expected) {
        mismatches.push({ route: result.route, width: result.width, field, actual, expected })
      }
    }

    for (const result of results) {
      const expectedNav = expectedNavigation(result.width)
      for (const [key, expected] of Object.entries(expectedNav)) {
        if (result.navigation[key] !== expected) {
          mismatches.push({
            route: result.route,
            width: result.width,
            field: `navigation.${key}`,
            actual: result.navigation[key],
            expected,
          })
        }
      }

      const visual = result.visual ?? {}
      compare(result, 'body.backgroundColor', visual.body?.backgroundColor, 'rgb(245, 245, 245)')
      compare(result, 'body.color', visual.body?.color, 'rgb(33, 33, 33)')
      compare(result, 'body.fontFamily', visual.body?.fontFamily, 'Inter, system-ui, sans-serif')
      compare(result, 'body.fontSize', visual.body?.fontSize, '14px')
      compare(result, 'button.backgroundColor', visual.primaryButton?.backgroundColor, 'rgb(238, 77, 45)')
      compare(result, 'button.borderRadius', visual.primaryButton?.borderRadius, '8px')
      compare(result, 'button.minHeight', visual.primaryButton?.minHeight, '40px')
      compare(result, 'button.fontSize', visual.primaryButton?.fontSize, '14px')
      compare(result, 'button.fontWeight', visual.primaryButton?.fontWeight, '600')
      compare(result, 'h1.fontSize', visual.h1?.fontSize, '28px')
      compare(result, 'h1.fontWeight', visual.h1?.fontWeight, '700')
      compare(result, 'h2.fontSize', visual.h2?.fontSize, '22px')
      compare(result, 'h2.fontWeight', visual.h2?.fontWeight, '600')
      compare(result, 'statusBadge.borderRadius', visual.statusBadge?.borderRadius, '999px')
      compare(result, 'statusBadge.fontSize', visual.statusBadge?.fontSize, '12px')
      compare(result, 'statusBadge.padding', visual.statusBadge?.padding, '4px 10px')
      compare(result, 'card.backgroundColor', visual.card?.backgroundColor, 'rgb(255, 255, 255)')
      compare(result, 'card.borderColor', visual.card?.borderColor, 'rgb(229, 229, 229)')
      compare(result, 'card.borderRadius', visual.card?.borderRadius, '12px')
      compare(result, 'cardStandard.padding', visual.cardStandard?.padding, '16px')
      compare(result, 'input.minHeight', visual.input?.minHeight, '40px')
      compare(result, 'input.borderColor', visual.input?.borderColor, 'rgb(229, 229, 229)')
      compare(result, 'input.borderRadius', visual.input?.borderRadius, '8px')
      compare(result, 'input.fontSize', visual.input?.fontSize, '14px')
      compare(result, 'pageContent.paddingTop', visual.pageContent?.paddingTop, result.width === 390 ? '24px' : '32px')
      compare(result, 'pageContent.paddingLeft', visual.pageContent?.paddingLeft, result.width === 390 ? '16px' : '48px')

      if (visual.h1?.lineHeight && visual.h1?.fontSize) {
        const ratio = Number.parseFloat(visual.h1.lineHeight) / Number.parseFloat(visual.h1.fontSize)
        if (!(ratio >= 1.2 && ratio <= 1.4)) {
          mismatches.push({
            route: result.route,
            width: result.width,
            field: 'h1.lineHeightRatio',
            actual: ratio.toFixed(2),
            expected: '1.2–1.4',
          })
        }
      }

      if (visual.adClose) {
        const widthPx = Number.parseFloat(visual.adClose.width)
        const heightPx = Number.parseFloat(visual.adClose.height)
        if (widthPx < 44 || heightPx < 44) {
          mismatches.push({
            route: result.route,
            width: result.width,
            field: 'adClose.touchTarget',
            actual: `${widthPx}x${heightPx}`,
            expected: '>=44x44',
          })
        }
      }

      if (visual.activeTab) {
        compare(result, 'activeTab.backgroundColor', visual.activeTab.backgroundColor, 'rgb(238, 77, 45)')
        compare(result, 'activeTab.borderColor', visual.activeTab.borderColor, 'rgb(238, 77, 45)')
        compare(result, 'activeTab.color', visual.activeTab.color, 'rgb(255, 255, 255)')
      }
    }

    const overflow = results.filter((result) => result.hasHorizontalOverflow)
    const covered = results.filter((result) => result.primaryAction.present && result.primaryAction.covered)
    const notVisible = results.filter((result) => result.primaryAction.present && !result.primaryAction.visible)
    const slow = results.filter((result) => (result.performance?.durationMs ?? 0) > 3000)

    const summary = {
      screenshots: results.length,
      visualDeviations: mismatches.length,
      horizontalOverflow: overflow.length,
      navigationMismatches: mismatches.filter((item) => item.field.startsWith('navigation.')).length,
      primaryActionCovered: covered.length,
      primaryActionNotVisible: notVisible.length,
      performanceOver3s: slow.length,
      sources: [
        'docs/validation/phase3/overflow.json',
        'docs/validation/phase4/phase4-runtime.json',
        'docs/validation/phase4/responsive.json',
        'apps/web/src/tests/*.test.ts(x)',
      ],
    }

    const report = {
      generatedAt: new Date().toISOString(),
      tool: 'Chrome headless via DevTools Protocol',
      chromePath: CHROME,
      baseUrl: BASE_URL,
      breakpoints: WIDTHS,
      viewportHeight: HEIGHT,
      routes: ROUTES.map((route) => route.slug),
      expectedDesignSystem: 'DESIGN-SYSTEM.md v2.0',
      results,
      mismatches,
      overflow: overflow.map((item) => `${item.route}@${item.width}`),
      primaryActionCovered: covered.map((item) => `${item.route}@${item.width}`),
      primaryActionNotVisible: notVisible.map((item) => `${item.route}@${item.width}`),
      performanceOver3s: slow.map((item) => ({
        route: `${item.route}@${item.width}`,
        durationMs: item.performance.durationMs,
      })),
      summary,
    }

    await writeFile(join(validationDir, 'visual-audit.json'), `${JSON.stringify(report, null, 2)}\n`)
    console.log(JSON.stringify(summary, null, 2))

    cdp.close()
    if (mismatches.length > 0 || overflow.length > 0 || covered.length > 0 || slow.length > 0) {
      process.exitCode = 1
    }
  } finally {
    chrome.kill()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
