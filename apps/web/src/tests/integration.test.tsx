import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App'
import { ToastProvider } from '../components/ToastProvider'
import { AppProvider, useApp } from '../context/AppContext'
import {
  APP_STATE_KEY,
  DEMO_STATE_KEY,
  createInitialState,
  defaultDemoState,
  type AppState,
} from '../services/stateService'
import { HOUR_MS, toIso } from '../services/timeService'

const NOW = Date.UTC(2026, 3, 20, 8)
const ORDER_ID = 'ORD-2026-004'

function seed(mutate?: (state: AppState) => void, hash = `#/orders/${ORDER_ID}`) {
  localStorage.clear()
  const state = createInitialState(NOW)
  mutate?.(state)
  localStorage.setItem(APP_STATE_KEY, JSON.stringify(state))
  localStorage.setItem(DEMO_STATE_KEY, JSON.stringify(defaultDemoState))
  window.location.hash = hash
}

function stored(): AppState {
  return JSON.parse(localStorage.getItem(APP_STATE_KEY) ?? '{}') as AppState
}

function orderFrom(state: AppState, id = ORDER_ID) {
  const target = state.orders.find((order) => order.id === id)
  if (!target) throw new Error(`Missing order ${id}`)
  return target
}

async function go(hash: string) {
  await act(async () => {
    window.location.hash = hash
    window.dispatchEvent(new Event('hashchange'))
  })
}

describe('Phase 5 integration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('AC-005/008/010/013/026/036: completion updates detail, tab, toast and storage', async () => {
    const user = userEvent.setup()
    seed()
    render(<App initialNow={NOW} />)

    const completeButton = await screen.findByRole('button', { name: 'Selesaikan Pesanan' })
    expect(completeButton).toBeEnabled()
    await user.click(completeButton)
    expect(await screen.findByRole('dialog')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Ya, Selesaikan' }))

    expect(await screen.findByRole('heading', { name: 'Pesanan Saya' })).toBeVisible()
    await waitFor(() => expect(orderFrom(stored()).status).toBe('Selesai'))
    expect(screen.getByText(new RegExp(`${ORDER_ID} telah selesai`))).toBeVisible()

    const card = document.querySelector('.order-card') as HTMLElement
    expect(card.textContent).toContain(ORDER_ID)
    expect(within(card).getByText('Selesai')).toBeVisible()
    expect(
      screen.getByRole('tab', { name: /^Selesai/ }).getAttribute('aria-selected'),
    ).toBe('true')

    await go(`#/orders/${ORDER_ID}`)
    await waitFor(() =>
      expect(document.querySelector('.status-badge')?.textContent).toBe('Selesai'),
    )
    expect(screen.getByRole('button', { name: 'Lunasi Sekarang' })).toBeVisible()
    expect(orderFrom(stored()).receivedBadge).toBe(false)
  })

  it('AC-011/012/027/042: filter, search and empty state with reset', async () => {
    const user = userEvent.setup()
    seed(undefined, '#/orders')
    render(<App initialNow={NOW} />)

    await user.click(await screen.findByRole('tab', { name: /^Belum Bayar/ }))
    expect(screen.getByText(/ORD-2026-002/)).toBeVisible()
    expect(screen.queryByText(new RegExp(ORDER_ID))).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('Cari pesanan'), 'tidak-ada')
    expect(screen.getByText('Tidak ada pesanan pada status ini')).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Reset Filter' }))
    expect(await screen.findByText(new RegExp(ORDER_ID))).toBeVisible()
  })

  it('AC-007/036: auto-complete runs only after Tunggu Otomatis opt-in', async () => {
    seed((state) => {
      const target = orderFrom(state)
      target.autoCompleteAt = toIso(NOW - HOUR_MS)
      target.autoCompleteOptIn = false
    })

    const first = render(<App initialNow={NOW} />)
    await waitFor(() =>
      expect(document.querySelector('.status-badge')?.textContent).toBe('Diterima'),
    )
    expect(stored().notifications.some((item) => item.orderId === ORDER_ID)).toBe(false)
    first.unmount()

    const current = stored()
    localStorage.setItem(
      APP_STATE_KEY,
      JSON.stringify({
        ...current,
        orders: current.orders.map((order) =>
          order.id === ORDER_ID
            ? { ...order, autoCompleteOptIn: true, autoCompleteAt: toIso(NOW - HOUR_MS) }
            : order,
        ),
      }),
    )
    window.location.hash = `#/orders/${ORDER_ID}`
    render(<App initialNow={NOW} />)

    await waitFor(() =>
      expect(document.querySelector('.status-badge')?.textContent).toBe('Selesai'),
    )
    const notifications = stored().notifications.filter((item) => item.orderId === ORDER_ID)
    expect(notifications).toHaveLength(1)
    expect(notifications[0].id).toBe(`${ORDER_ID}:auto-complete`)
  })

  it('AC-009/020: repeated completion produces one status change and notification', async () => {
    const user = userEvent.setup()
    seed()

    function DoubleComplete() {
      const { actions } = useApp()
      return (
        <button
          type="button"
          onClick={() => {
            actions.completeOrder(ORDER_ID)
            actions.completeOrder(ORDER_ID)
          }}
        >
          Selesaikan dua kali
        </button>
      )
    }

    render(
      <ToastProvider>
        <AppProvider initialNow={NOW}>
          <DoubleComplete />
        </AppProvider>
      </ToastProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Selesaikan dua kali' }))
    await waitFor(() => expect(orderFrom(stored()).status).toBe('Selesai'))
    const notifications = stored().notifications.filter((item) => item.orderId === ORDER_ID)
    expect(notifications).toHaveLength(1)
  })

  it('AC-022/024/029: report validation keeps data and issues one ticket', async () => {
    const user = userEvent.setup()
    seed(undefined, `#/report/${ORDER_ID}`)
    render(<App initialNow={NOW} />)

    await user.click(await screen.findByRole('button', { name: 'Kirim Laporan' }))
    expect(await screen.findByText('Deskripsi wajib diisi.')).toBeVisible()

    await user.type(screen.getByLabelText(/^Deskripsi/), 'Paket rusak saat diterima.')
    expect(stored().reportDrafts[ORDER_ID]?.description).toBe('Paket rusak saat diterima.')

    await user.click(screen.getByRole('button', { name: 'Kirim Laporan' }))
    expect(await screen.findByText(/TKT-\d{4}-\d{6}/)).toBeVisible()
    expect(stored().tickets).toHaveLength(1)
    expect(stored().reportDrafts[ORDER_ID]).toBeUndefined()
  })

  it('AC-025: the active main navigation follows the route', async () => {
    const user = userEvent.setup()
    seed(undefined, '#/orders')
    render(<App initialNow={NOW} />)

    const ordersLinks = screen.getAllByRole('link', { name: 'Pesanan' })
    expect(ordersLinks.length).toBeGreaterThan(0)
    expect(ordersLinks.every((link) => link.classList.contains('nav-link--active'))).toBe(true)

    await user.click(screen.getAllByRole('link', { name: 'Akun' })[0])
    expect(await screen.findByRole('heading', { name: 'Akun' })).toBeVisible()
    expect(
      screen.getAllByRole('link', { name: 'Akun' }).every((link) =>
        link.classList.contains('nav-link--active'),
      ),
    ).toBe(true)
  })

  it('AC-037: only the namespaced local-storage state is read', async () => {
    seed(undefined, '#/orders')
    localStorage.setItem(
      'foreign-user-orders',
      JSON.stringify([{ id: 'ORD-FOREIGN', productName: 'Pesanan pengguna lain' }]),
    )
    render(<App initialNow={NOW} />)

    expect(await screen.findByText(new RegExp(ORDER_ID))).toBeVisible()
    expect(screen.queryByText(/ORD-FOREIGN/)).not.toBeInTheDocument()
    expect(Object.keys(localStorage)).toEqual(
      expect.arrayContaining([APP_STATE_KEY, DEMO_STATE_KEY, 'foreign-user-orders']),
    )
  })
})
