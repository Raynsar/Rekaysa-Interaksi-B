import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import '../styles/global.css'
import componentCss from '../styles/components.css?raw'
import tokensCss from '../styles/tokens.css?raw'
import AdBanner from '../components/AdBanner'
import ConfirmModal from '../components/ConfirmModal'
import DeliveryEstimate from '../components/DeliveryEstimate'
import FilterTabs from '../components/FilterTabs'
import PriceBreakdown from '../components/PriceBreakdown'
import ReminderBanner from '../components/ReminderBanner'
import ReportForm from '../components/ReportForm'
import { ToastProvider } from '../components/ToastProvider'
import { AppProvider } from '../context/AppContext'
import { demoProduct } from '../services/demoData'
import { computePriceBreakdown } from '../services/priceService'
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_EVIDENCE_BYTES,
  reportValidator,
  type ReportErrors,
} from '../services/reportService'
import { dayKey } from '../services/adFrequencyService'
import { APP_STATE_KEY, createInitialState } from '../services/stateService'
import { HOUR_MS, toIso } from '../services/timeService'
import { FILTER_TABS, type FilterTab, type Order, type ReportFormValue } from '../types'

const NOW = Date.UTC(2026, 2, 12, 10)

function order(overrides: Partial<Order> = {}): Order {
  return {
    id: 'ORD-2026-004',
    productName: demoProduct.name,
    status: 'Diterima',
    receivedBadge: true,
    items: [],
    price: computePriceBreakdown(demoProduct.price),
    estimateMinDays: 2,
    estimateMaxDays: 5,
    estimateLabel: '2–5 hari',
    estimateEndAt: toIso(NOW + 24 * HOUR_MS),
    placedAt: toIso(NOW - 24 * HOUR_MS),
    autoCompleteAt: toIso(NOW + 12 * HOUR_MS),
    ...overrides,
  }
}

describe('PriceBreakdown', () => {
  it('AC-002: expands and collapses with an accessible expandable row', async () => {
    const user = userEvent.setup()
    render(<PriceBreakdown breakdown={computePriceBreakdown(demoProduct.price)} />)

    const toggle = screen.getByRole('button', { name: /Rincian Biaya/ })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Harga produk')).not.toBeInTheDocument()

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Harga produk')).toBeVisible()
    expect(screen.getByText('Biaya layanan')).toBeVisible()
    expect(screen.getByText('Total akhir')).toBeVisible()

    await user.click(toggle)
    expect(screen.queryByText('Harga produk')).not.toBeInTheDocument()
  })
})

describe('ConfirmModal', () => {
  it('AC-006/008/038: Batal, Ya and Escape are keyboard/button reachable', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onClose = vi.fn()
    render(
      <ConfirmModal
        open
        title="Selesaikan pesanan ini?"
        message="Pastikan paket sudah kamu terima."
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(screen.getByText('Selesaikan pesanan ini?')).toBeVisible()

    await user.keyboard('{Escape}')
    await user.click(screen.getByRole('button', { name: 'Batal' }))
    await user.click(screen.getByRole('button', { name: 'Ya, Selesaikan' }))

    expect(onClose).toHaveBeenCalledTimes(2)
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })
})

describe('ReportForm', () => {
  function Harness() {
    const [value, setValue] = useState<ReportFormValue>({ category: '', description: '' })
    const [errors, setErrors] = useState<ReportErrors>({})
    const change = (next: ReportFormValue) => {
      setValue(next)
      setErrors(reportValidator(next))
    }
    const submit = () => setErrors(reportValidator(value))

    return (
      <ReportForm
        orderId="ORD-2026-004"
        status="Diterima"
        value={value}
        errors={errors}
        onChange={change}
        onSubmit={submit}
      />
    )
  }

  it('AC-023: attaches order ID and status automatically', () => {
    render(<Harness />)
    const orderId = screen.getByLabelText('ID Pesanan') as HTMLInputElement
    const status = screen.getByLabelText('Status Pesanan') as HTMLInputElement

    expect(orderId).toHaveValue('ORD-2026-004')
    expect(orderId).toHaveAttribute('readonly')
    expect(status).toHaveValue('Diterima')
    expect(status).toHaveAttribute('readonly')
  })

  it('AC-024/029: shows per-field errors, 1000-char limit and 5MB evidence limit', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Kirim Laporan' }))

    expect(screen.getByText('Kategori wajib dipilih.')).toBeVisible()
    expect(screen.getByText('Deskripsi wajib diisi.')).toBeVisible()

    const description = screen.getByLabelText(/^Deskripsi/) as HTMLTextAreaElement
    expect(description).toHaveAttribute('maxLength', String(MAX_DESCRIPTION_LENGTH))
    fireEvent.change(description, {
      target: { value: 'Paket diterima tetapi status belum berubah.' },
    })

    const oversized = new File(
      [new Uint8Array(MAX_EVIDENCE_BYTES + 1)],
      'bukti-besar.png',
      { type: 'image/png' },
    )
    const evidence = screen.getByLabelText(/Bukti/) as HTMLInputElement
    await user.upload(evidence, oversized)

    expect(await screen.findByText('Ukuran bukti maksimal 5MB.')).toBeVisible()
    expect(screen.getByText(/bukti-besar\.png/)).toBeVisible()
    expect(screen.queryByText('Deskripsi wajib diisi.')).not.toBeInTheDocument()
  })

  it('AC-024: enforces the 1000-character validator rule', async () => {
    render(<Harness />)
    const description = screen.getByLabelText(/^Deskripsi/) as HTMLTextAreaElement

    fireEvent.change(description, { target: { value: 'a'.repeat(MAX_DESCRIPTION_LENGTH + 1) } })

    expect(await screen.findByText('Deskripsi maksimal 1000 karakter.')).toBeVisible()
  })
})

describe('AdBanner', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('AC-014/015/016/034: closes in one tap, has no link, and uses a 44x44 target', async () => {
    const user = userEvent.setup()
    localStorage.setItem(
      APP_STATE_KEY,
      JSON.stringify({
        ...createInitialState(NOW),
        adFrequency: { date: dayKey(NOW), impressions: 0 },
      }),
    )

    render(
      <ToastProvider>
        <AppProvider initialNow={NOW}>
          <AdBanner />
        </AppProvider>
      </ToastProvider>,
    )

    const ad = screen.getByRole('complementary', { name: 'Iklan' })
    expect(within(ad).queryByRole('link')).toBeNull()

    const close = within(ad).getByRole('button', { name: 'Tutup iklan' })
    expect(tokensCss).toMatch(/--touch-target-min:\s*44px/)
    expect(componentCss).toMatch(
      /\.ad-banner__close[\s\S]*?width:\s*var\(--touch-target-min\)/,
    )

    const computed = getComputedStyle(close)
    if (computed.width.endsWith('px') && computed.height.endsWith('px')) {
      expect(computed.width).toBe('44px')
      expect(computed.height).toBe('44px')
    }

    await user.click(close)
    await waitFor(() =>
      expect(screen.queryByRole('complementary', { name: 'Iklan' })).not.toBeInTheDocument(),
    )

    const stored = JSON.parse(localStorage.getItem(APP_STATE_KEY) ?? '{}')
    expect(stored.adFrequency.lastClosedAt).toBeGreaterThan(0)
  })
})

describe('ReminderBanner', () => {
  it('AC-007: offers Selesaikan Sekarang and Tunggu Otomatis before opt-in', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    const onWait = vi.fn()
    const { rerender } = render(
      <ReminderBanner
        order={order()}
        optedIn={false}
        onComplete={onComplete}
        onWait={onWait}
      />,
    )

    expect(screen.getByText(/Pesanan akan selesai otomatis dalam 24 jam/)).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Selesaikan Sekarang' }))
    await user.click(screen.getByRole('button', { name: 'Tunggu Otomatis' }))
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onWait).toHaveBeenCalledTimes(1)

    rerender(
      <ReminderBanner order={order()} optedIn onComplete={onComplete} onWait={onWait} />,
    )
    expect(screen.getByText(/Kamu memilih Tunggu Otomatis/)).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Tunggu Otomatis' })).not.toBeInTheDocument()
  })
})

describe('FilterTabs', () => {
  it('AC-011: renders exactly six tabs and excludes Diterima', async () => {
    const user = userEvent.setup()
    const counts = Object.fromEntries(FILTER_TABS.map((tab) => [tab, 0])) as Record<
      FilterTab,
      number
    >
    const onChange = vi.fn()
    render(<FilterTabs value="Semua" counts={counts} onChange={onChange} />)

    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(6)
    expect(tabs.map((tab) => tab.textContent?.replace(/\d+$/, ''))).toEqual([...FILTER_TABS])
    expect(screen.queryByRole('tab', { name: /Diterima/ })).toBeNull()

    await user.click(screen.getByRole('tab', { name: /Selesai/ }))
    expect(onChange).toHaveBeenCalledWith('Selesai')
  })
})

describe('DeliveryEstimate', () => {
  it('AC-018: shows the estimate as a range with a text label', () => {
    render(<DeliveryEstimate order={order()} />)
    expect(screen.getByText('Estimasi tiba')).toBeVisible()
    expect(screen.getByText(/2–5 hari · rentang 2–5 hari/)).toBeVisible()
  })
})
