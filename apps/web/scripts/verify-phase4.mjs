import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const CHROME =
  process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const DEBUG_PORT = 9334
const BASE_URL = process.env.BASE_URL ?? 'http://127.0.0.1:5173'
const APP_KEY = 'shopee-tracking-state-v1'
const DEMO_KEY = 'shopee-tracking-demo-v1'
const VIEWPORT = { width: 1024, height: 900 }

const screenshotDir = join(process.cwd(), '..', '..', 'docs', 'screenshots', 'phase4')
const validationDir = join(process.cwd(), '..', '..', 'docs', 'validation', 'phase4')

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

const checks = []
function record(id, pass, detail) {
  checks.push({ id, status: pass ? 'Pass' : 'Fail', detail })
}

async function main() {
  await mkdir(screenshotDir, { recursive: true })
  await mkdir(validationDir, { recursive: true })

  const chrome = spawn(
    CHROME,
    [
      '--headless=new',
      `--remote-debugging-port=${DEBUG_PORT}`,
      `--user-data-dir=${join(tmpdir(), `opencode-phase4-chrome-${Date.now()}`)}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-gpu',
      '--hide-scrollbars',
      `--window-size=${VIEWPORT.width},${VIEWPORT.height}`,
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
    await cdp.send('Emulation.setDeviceMetricsOverride', { ...VIEWPORT, deviceScaleFactor: 1, mobile: false })

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
      await sleep(300)
    }

    const reset = async (hash, label) => {
      await navigate(hash, `${label}-pre`)
      await evaluate('localStorage.clear()')
      await navigate(hash, `${label}-fresh`)
    }

    const state = () =>
      evaluate(`JSON.parse(localStorage.getItem(${JSON.stringify(APP_KEY)}) ?? 'null')`)

    const demoState = () =>
      evaluate(`JSON.parse(localStorage.getItem(${JSON.stringify(DEMO_KEY)}) ?? 'null')`)

    const text = (selector) =>
      evaluate(`document.querySelector(${JSON.stringify(selector)})?.textContent ?? null`)

    const toasts = () =>
      evaluate(`[...document.querySelectorAll('.toast')].map((node) => node.textContent)`)

    const clickText = (label) =>
      evaluate(`(() => {
        const wanted = ${JSON.stringify(label)};
        const nodes = [...document.querySelectorAll('button, a, label')];
        const node = nodes.find((item) => item.textContent.trim() === wanted)
          ?? nodes.find((item) => item.textContent.includes(wanted));
        if (!node) return false;
        node.click();
        return true;
      })()`)

    const clickSelector = (selector) =>
      evaluate(`(() => {
        const node = document.querySelector(${JSON.stringify(selector)});
        if (!node) return false;
        node.click();
        return true;
      })()`)

    const setInput = (selector, value) =>
      evaluate(`(() => {
        const node = document.querySelector(${JSON.stringify(selector)});
        if (!node) return false;
        const proto = node.tagName === 'TEXTAREA'
          ? HTMLTextAreaElement.prototype
          : node.tagName === 'SELECT'
            ? HTMLSelectElement.prototype
            : HTMLInputElement.prototype;
        const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
        setter.call(node, ${JSON.stringify(value)});
        node.dispatchEvent(new Event('input', { bubbles: true }));
        node.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      })()`)

    const screenshot = async (name) => {
      const shot = await cdp.send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: false,
      })
      await writeFile(join(screenshotDir, `${name}.png`), Buffer.from(shot.data, 'base64'))
      return `docs/screenshots/phase4/${name}.png`
    }

    const evidence = { generatedAt: new Date().toISOString(), tool: 'Chrome headless via CDP', checks: [] }

    // Scenario 1: complete order → Selesai, tab, toast, persistence.
    await reset('/orders/ORD-2026-004', 'complete')
    const beforeComplete = await text('.status-badge')
    await clickText('Selesaikan Pesanan')
    await sleep(120)
    const modalShown = await evaluate(`Boolean(document.querySelector('[role="dialog"]'))`)
    await clickText('Ya, Selesaikan')
    await sleep(350)
    const afterComplete = await text('.status-badge')
    const completedState = await state()
    const completedOrder = completedState.orders.find((order) => order.id === 'ORD-2026-004')
    const completionNotification = completedState.notifications.find(
      (item) => item.id === 'ORD-2026-004:auto-complete',
    )
    const completionToasts = await toasts()
    const activeTab = await evaluate(
      `document.querySelector('[role="tab"][aria-selected="true"]')?.textContent ?? null`,
    )
    const listedAfterComplete = await evaluate(
      `[...document.querySelectorAll('.order-card')].some((node) => node.textContent.includes('ORD-2026-004'))`,
    )
    const completionHash = await evaluate('location.hash')

    record('S1 modal konfirmasi tampil', modalShown, 'Modal muncul sebelum konfirmasi')
    record(
      'S1 status menjadi Selesai',
      beforeComplete === 'Diterima' && afterComplete === 'Selesai' && completedOrder.status === 'Selesai' && completedOrder.receivedBadge === false,
      { before: beforeComplete, after: afterComplete, stored: completedOrder.status, badge: completedOrder.receivedBadge ?? false },
    )
    record(
      'S1 notifikasi tersimpan',
      completionNotification?.status === 'sent',
      completionNotification ?? null,
    )
    record(
      'S1 toast tampil',
      completionToasts.some((item) => item.includes('ORD-2026-004') || item.includes('tersinkron')),
      completionToasts,
    )
    record(
      'S1 pindah ke tab Selesai',
      completionHash.includes('status=Selesai') && Boolean(activeTab?.startsWith('Selesai')) && listedAfterComplete,
      { hash: completionHash, activeTab, listed: listedAfterComplete },
    )
    const completionShot = await screenshot('completion-success-orders')

    await navigate('/orders/ORD-2026-004', 'complete-reload')
    const afterReload = await text('.status-badge')
    record('S3 AC-036 persistence', afterReload === 'Selesai', { badgeAfterReload: afterReload })
    const persistedShot = await screenshot('completion-persisted-detail')

    // Scenario 2: cancel in modal keeps status.
    await reset('/orders/ORD-2026-004', 'cancel')
    await clickText('Selesaikan Pesanan')
    await sleep(120)
    await clickText('Batal')
    await sleep(150)
    const cancelBadge = await text('.status-badge')
    const cancelState = await state()
    const cancelOrder = cancelState.orders.find((order) => order.id === 'ORD-2026-004')
    const cancelModalClosed = await evaluate(`!document.querySelector('[role="dialog"]')`)
    record(
      'S2 batal status tetap',
      cancelBadge === 'Diterima' && cancelOrder.status === 'Diterima' && cancelModalClosed,
      { badge: cancelBadge, stored: cancelOrder.status, modalClosed: cancelModalClosed },
    )

    // Scenario 3: ad cooldown and impression cap.
    await reset('/', 'ad')
    const adBeforeClose = await evaluate(`Boolean(document.querySelector('.ad-banner'))`)
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 900, deviceScaleFactor: 1, mobile: false })
    await navigate('/', 'ad-mobile')
    const adShot = await screenshot('ad-banner-mobile')
    await cdp.send('Emulation.setDeviceMetricsOverride', { ...VIEWPORT, deviceScaleFactor: 1, mobile: false })
    await clickSelector('.ad-banner__close')
    await sleep(180)
    const adAfterClose = await evaluate(`Boolean(document.querySelector('.ad-banner'))`)
    const adFrequency = (await state()).adFrequency
    record(
      'S4 tutup iklan → cooldown',
      adBeforeClose && !adAfterClose && typeof adFrequency.lastClosedAt === 'number',
      { before: adBeforeClose, after: adAfterClose, frequency: adFrequency },
    )
    await navigate('/', 'ad-reload')
    const adAfterReload = await evaluate(`Boolean(document.querySelector('.ad-banner'))`)
    record('S4 AC-017 cooldown setelah reload', !adAfterReload, { visibleAfterReload: adAfterReload })

    await evaluate(`(() => {
      const key = ${JSON.stringify(APP_KEY)};
      const current = JSON.parse(localStorage.getItem(key));
      current.adFrequency = { date: new Date().toISOString().slice(0, 10), impressions: 3 };
      localStorage.setItem(key, JSON.stringify(current));
      return true;
    })()`)
    await navigate('/', 'ad-cap')
    const adAfterCap = await evaluate(`Boolean(document.querySelector('.ad-banner'))`)
    record('S4 batas 3 tayangan/hari', !adAfterCap, { visibleAfterCap: adAfterCap })

    // Scenario 4: report validation, draft persistence and ticket.
    await reset('/report/ORD-2026-004', 'report')
    const attached = await evaluate(`({
      id: document.querySelector('#report-order-id')?.value ?? null,
      status: document.querySelector('#report-status')?.value ?? null,
    })`)
    record(
      'S5 AC-023 lampiran otomatis',
      attached.id === 'ORD-2026-004' && attached.status === 'Diterima',
      attached,
    )
    await clickText('Kirim Laporan')
    await sleep(150)
    const fieldErrors = await evaluate(
      `[...document.querySelectorAll('.field__error')].map((node) => node.textContent)`,
    )
    const ticketsBeforeValid = (await state()).tickets.length
    record(
      'S5 AC-024 validasi deskripsi',
      fieldErrors.some((item) => item.includes('Deskripsi wajib diisi')) && ticketsBeforeValid === 0,
      { fieldErrors, ticketsBeforeValid },
    )

    const draftDescription = 'Paket diterima tapi status belum berubah.'
    await setInput('#report-description', draftDescription)
    await sleep(200)
    const savedDraft = (await state()).reportDrafts['ORD-2026-004']
    record('S5 draft persisten', savedDraft?.description === draftDescription, savedDraft ?? null)

    await navigate('/report/ORD-2026-004', 'report-reload')
    const retainedDraft = await evaluate(`document.querySelector('#report-description')?.value ?? null`)
    record('S5 draft setelah reload', retainedDraft === draftDescription, { retainedDraft })
    const draftShot = await screenshot('report-draft-reloaded')

    await clickText('Kirim Laporan')
    await sleep(250)
    const successText = await text('.notice--success')
    const reportedState = await state()
    const ticket = reportedState.tickets.at(-1)
    record(
      'S5 AC-022 tiket diterbitkan',
      /TKT-\d{4}-\d{6}/.test(successText ?? '') &&
        reportedState.tickets.length === 1 &&
        ticket?.orderId === 'ORD-2026-004' &&
        !reportedState.reportDrafts['ORD-2026-004'],
      { successText, ticket, tickets: reportedState.tickets.length, draftRemoved: !reportedState.reportDrafts['ORD-2026-004'] },
    )
    const ticketShot = await screenshot('report-success')

    // Scenario 6: demo panel and forced localStorage failure.
    await reset('/account', 'demo-storage')
    const demoPanelVisible = await evaluate(`document.body.innerText.includes('Panel Demo')`)
    record('S6 Panel Demo tersedia di Account', demoPanelVisible, { visible: demoPanelVisible })
    const demoPanelShot = await screenshot('demo-panel-account')

    await clickText('Force gagal tulis localStorage')
    await sleep(180)
    const forcedStorage = await demoState()
    record('S6 flag demo tersimpan', forcedStorage?.failStorageWrite === true, forcedStorage)

    await navigate('/orders/ORD-2026-004', 'demo-storage-detail')
    await clickText('Selesaikan Pesanan')
    await sleep(120)
    await clickText('Ya, Selesaikan')
    await sleep(250)
    const rollbackBadge = await text('.status-badge')
    const rollbackState = await state()
    const rollbackOrder = rollbackState.orders.find((order) => order.id === 'ORD-2026-004')
    const rollbackToasts = await toasts()
    record(
      'S6 AC-039 rollback status',
      rollbackBadge === 'Diterima' && rollbackOrder.status === 'Diterima',
      { badge: rollbackBadge, stored: rollbackOrder.status },
    )
    record(
      'S6 AC-039 toast error',
      rollbackToasts.some((item) => /Gagal menyimpan|Storage write failed|gagal disimpan/i.test(item)),
      rollbackToasts,
    )
    record(
      'S6 AC-039 tanpa duplikasi notifikasi',
      !rollbackState.notifications.some((item) => item.orderId === 'ORD-2026-004'),
      rollbackState.notifications,
    )
    const rollbackShot = await screenshot('storage-failure-rollback')

    // Scenario 7: forced notification failure recorded without order change.
    await reset('/account', 'demo-notification')
    await evaluate(`(() => {
      localStorage.clear();
      localStorage.setItem(${JSON.stringify(DEMO_KEY)}, JSON.stringify({
        failStorageWrite: false,
        failNotification: true,
      }));
      return true;
    })()`)
    await navigate('/orders/ORD-2026-003', 'demo-notification-detail')
    await sleep(350)
    const notificationState = await state()
    const failedNotification = notificationState.notifications.find(
      (item) => item.id === 'ORD-2026-003:delay',
    )
    const delayedOrder = notificationState.orders.find((order) => order.id === 'ORD-2026-003')
    const notificationToasts = await toasts()
    const delayBannerVisible = await evaluate(`document.body.innerText.includes('Pengiriman terlambat')`)
    record(
      'S7 AC-021 kegagalan dicatat',
      failedNotification?.status === 'failed' && Boolean(failedNotification.error),
      failedNotification ?? null,
    )
    record('S7 AC-021 data pesanan tidak berubah', delayedOrder.status === 'Dikirim', { status: delayedOrder.status })
    record(
      'S7 AC-021 umpan balik error',
      notificationToasts.some((item) => item.includes('Notifikasi gagal dicatat')),
      notificationToasts,
    )
    record('S7 notifikasi keterlambatan tampil', delayBannerVisible, { visible: delayBannerVisible })
    const notificationShot = await screenshot('notification-failure-detail')

    // Scenario 8: demo price override and single price source.
    await reset('/account', 'demo-price')
    await setInput('#demo-price-override', '75000')
    await sleep(200)
    await navigate('/checkout', 'price-checkout')
    const priceNotice = await text('.notice--warning')
    const checkoutPrice = await text('.checkout-summary .price')
    record(
      'S8 AC-040 pesan harga diperbarui',
      (priceNotice ?? '').includes('Harga diperbarui') && (priceNotice ?? '').includes('75.000'),
      priceNotice,
    )
    record('S8 AC-040 harga checkout baru', (checkoutPrice ?? '').includes('75.000'), { checkoutPrice })
    const priceShot = await screenshot('price-update-checkout')

    await navigate('/product', 'price-product')
    const productPrice = await text('.product-info .price')
    await navigate('/', 'price-home')
    const homePrice = await text('.product-preview .price')
    record(
      'S8 sumber harga tunggal',
      (productPrice ?? '').includes('75.000') && (homePrice ?? '').includes('75.000'),
      { productPrice, homePrice },
    )

    await navigate('/account', 'demo-reset')
    await clickText('Reset Demo')
    await sleep(200)
    const resetDemo = await demoState()
    record(
      'S8 Reset Demo',
      resetDemo?.failStorageWrite === false &&
        resetDemo?.failNotification === false &&
        resetDemo?.priceOverride === undefined,
      resetDemo,
    )

    // Scenario 9: auto-complete only after opt-in.
    await reset('/orders/ORD-2026-004', 'autocomplete')
    await evaluate(`(() => {
      const key = ${JSON.stringify(APP_KEY)};
      const current = JSON.parse(localStorage.getItem(key));
      const order = current.orders.find((item) => item.id === 'ORD-2026-004');
      order.autoCompleteAt = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      order.autoCompleteOptIn = false;
      localStorage.setItem(key, JSON.stringify(current));
      return true;
    })()`)
    await navigate('/orders/ORD-2026-004', 'autocomplete-no-optin')
    await sleep(350)
    const withoutOptIn = await text('.status-badge')
    record('S9 tanpa opt-in tidak auto-selesai', withoutOptIn === 'Diterima', { badge: withoutOptIn })

    await evaluate(`(() => {
      const key = ${JSON.stringify(APP_KEY)};
      const current = JSON.parse(localStorage.getItem(key));
      const order = current.orders.find((item) => item.id === 'ORD-2026-004');
      order.autoCompleteOptIn = true;
      localStorage.setItem(key, JSON.stringify(current));
      return true;
    })()`)
    await navigate('/orders/ORD-2026-004', 'autocomplete-optin')
    await sleep(450)
    const afterAuto = await text('.status-badge')
    const autoState = await state()
    const autoOrder = autoState.orders.find((order) => order.id === 'ORD-2026-004')
    const autoNotification = autoState.notifications.find(
      (item) => item.id === 'ORD-2026-004:auto-complete',
    )
    record(
      'S9 auto-selesai setelah opt-in',
      afterAuto === 'Selesai' && autoOrder.status === 'Selesai' && autoOrder.autoCompleted === true,
      { badge: afterAuto, stored: autoOrder.status, autoCompleted: autoOrder.autoCompleted },
    )
    record('S9 notifikasi auto-selesai', autoNotification?.status === 'sent', autoNotification ?? null)
    const autoShot = await screenshot('autocomplete-finished')

    // Responsive smoke test for the new Phase 4 UI.
    await evaluate('localStorage.clear()')
    const responsive = []
    for (const width of [390, 768, 1024, 1440]) {
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false,
      })
      for (const [route, hash] of [
        ['home', '/'],
        ['detail', '/orders/ORD-2026-004'],
        ['report', '/report/ORD-2026-004'],
        ['account', '/account'],
      ]) {
        await navigate(hash, `responsive-${route}-${width}`)
        const metrics = await evaluate(`(() => ({
          innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          overflow: document.documentElement.scrollWidth > innerWidth,
        }))()`)
        responsive.push({ width, route, ...metrics })
      }
    }
    record(
      'S10 tidak ada overflow pada UI Phase 4',
      responsive.every((item) => !item.overflow),
      responsive.filter((item) => item.overflow),
    )

    const summary = {
      total: checks.length,
      passed: checks.filter((item) => item.status === 'Pass').length,
      failed: checks.filter((item) => item.status === 'Fail').length,
    }

    evidence.summary = summary
    evidence.checks = checks
    evidence.screenshots = [
      adShot,
      completionShot,
      persistedShot,
      draftShot,
      ticketShot,
      demoPanelShot,
      rollbackShot,
      notificationShot,
      priceShot,
      autoShot,
    ]
    evidence.responsive = responsive

    await writeFile(join(validationDir, 'phase4-runtime.json'), `${JSON.stringify(evidence, null, 2)}\n`)
    await writeFile(join(validationDir, 'responsive.json'), `${JSON.stringify({ responsive, summary: { checks: responsive.length, overflow: responsive.filter((item) => item.overflow).length } }, null, 2)}\n`)
    console.log(JSON.stringify(summary, null, 2))

    cdp.close()
    if (summary.failed > 0) process.exitCode = 1
  } finally {
    chrome.kill()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
