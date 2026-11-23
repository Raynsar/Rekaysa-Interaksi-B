import { describe, expect, it } from 'vitest'
import {
  AD_COOLDOWN_HOURS,
  MAX_ADS_PER_DAY,
  canShowAd,
  closeAd,
  dayKey,
  registerImpression,
} from '../services/adFrequencyService'
import { demoProduct } from '../services/demoData'
import {
  addNotification,
  buildNotification,
  notificationId,
} from '../services/notificationService'
import {
  autoCompleteIn,
  canCompleteOrder,
  completeOrderIn,
  countByFilter,
  matchesFilter,
} from '../services/orderService'
import { computePriceBreakdown } from '../services/priceService'
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_EVIDENCE_BYTES,
  reportValidator,
  ticketGenerator,
} from '../services/reportService'
import { HOUR_MS, toIso } from '../services/timeService'
import { FILTER_TABS, type Order } from '../types'

const NOW = Date.UTC(2026, 4, 1, 12)

function order(overrides: Partial<Order> = {}): Order {
  return {
    id: 'ORD-TEST',
    productName: 'Produk Uji',
    status: 'Dikirim',
    items: [],
    price: computePriceBreakdown(demoProduct.price),
    estimateMinDays: 2,
    estimateMaxDays: 5,
    estimateLabel: '2–5 hari',
    estimateEndAt: toIso(NOW + HOUR_MS),
    placedAt: toIso(NOW - 24 * HOUR_MS),
    ...overrides,
  }
}

describe('reportService', () => {
  it('AC-024: rejects per-field errors for required inputs', () => {
    expect(reportValidator({ category: '', description: '   ' })).toEqual({
      category: 'Kategori wajib dipilih.',
      description: 'Deskripsi wajib diisi.',
    })
  })

  it('AC-024/029: enforces 1000 characters and 5MB evidence without losing other fields', () => {
    const valid = reportValidator({
      category: 'Paket rusak',
      description: 'a'.repeat(MAX_DESCRIPTION_LENGTH),
      evidenceName: 'bukti.png',
      evidenceSize: MAX_EVIDENCE_BYTES,
    })
    expect(valid).toEqual({})

    const tooLong = reportValidator({
      category: 'Paket rusak',
      description: 'a'.repeat(MAX_DESCRIPTION_LENGTH + 1),
      evidenceName: 'bukti.png',
      evidenceSize: MAX_EVIDENCE_BYTES + 1,
    })
    expect(tooLong.description).toContain('1000 karakter')
    expect(tooLong.evidence).toBe('Ukuran bukti maksimal 5MB.')
    expect(tooLong.category).toBeUndefined()
  })

  it('AC-022: generates a unique TKT-YYYY-NNNNNN number', () => {
    expect(ticketGenerator(1, NOW)).toBe('TKT-2026-000001')
    expect(ticketGenerator(42, NOW)).toBe('TKT-2026-000042')
    expect(ticketGenerator(1, NOW)).not.toBe(ticketGenerator(2, NOW))
  })
})

describe('notificationService', () => {
  it('AC-020: deduplicates by ${orderId}:${kind}', () => {
    const first = buildNotification('ORD-1', 'delay', 'Pertama', NOW)
    const duplicate = buildNotification('ORD-1', 'delay', 'Kedua', NOW + HOUR_MS)
    const differentKind = buildNotification('ORD-1', 'auto-complete', 'Ketiga', NOW + 2 * HOUR_MS)

    expect(notificationId('ORD-1', 'delay')).toBe('ORD-1:delay')
    expect(first.id).toBe('ORD-1:delay')
    expect(addNotification([], first)).toEqual([first])
    expect(addNotification([first], duplicate)).toEqual([first])
    expect(addNotification([first], differentKind)).toHaveLength(2)
  })

  it('records failed notifications without changing the record status field', () => {
    const failed = buildNotification(
      'ORD-1',
      'delay',
      'Gagal',
      NOW,
      'failed',
      'Demo: layanan notifikasi gagal',
    )
    expect(failed.status).toBe('failed')
    expect(failed.error).toBe('Demo: layanan notifikasi gagal')
    expect(addNotification([], failed)).toEqual([failed])
  })
})

describe('orderService', () => {
  it('AC-011/041: Diterima is a badge inside Dikirim, never its own tab', () => {
    const received = order({ status: 'Diterima', receivedBadge: true })
    const badgeOnly = order({ id: 'ORD-BADGE', status: 'Dikirim', receivedBadge: true })

    expect(FILTER_TABS).toEqual([
      'Semua',
      'Belum Bayar',
      'Dikemas',
      'Dikirim',
      'Selesai',
      'Dibatalkan',
    ])
    expect(FILTER_TABS).not.toContain('Diterima')
    expect(canCompleteOrder(received)).toBe(true)
    expect(canCompleteOrder(badgeOnly)).toBe(true)
    expect(canCompleteOrder(order({ status: 'Dikirim' }))).toBe(false)
    expect(matchesFilter(received, 'Dikirim')).toBe(true)
    expect(matchesFilter(badgeOnly, 'Dikirim')).toBe(true)

    const counts = countByFilter([received, badgeOnly, order({ id: 'ORD-BAYAR', status: 'Belum Bayar' })])
    expect(counts.Dikirim).toBe(2)
    expect(counts['Belum Bayar']).toBe(1)
    expect(counts.Semua).toBe(3)
  })

  it('AC-005/009: completion is idempotent and clears the received badge', () => {
    const received = order({ status: 'Diterima', receivedBadge: true })
    const once = completeOrderIn([received], received.id)
    const twice = completeOrderIn(once, received.id)

    expect(once[0].status).toBe('Selesai')
    expect(once[0].receivedBadge).toBe(false)
    expect(twice).toEqual(once)
  })

  it('auto-completes only opted-in orders', () => {
    const optedIn = order({ id: 'ORD-YES', status: 'Diterima', autoCompleteOptIn: true })
    const notOptedIn = order({ id: 'ORD-NO', status: 'Diterima', autoCompleteOptIn: false })

    const completed = autoCompleteIn([optedIn, notOptedIn], 'ORD-YES')
    expect(completed.find((item) => item.id === 'ORD-YES')?.status).toBe('Selesai')
    expect(completed.find((item) => item.id === 'ORD-YES')?.autoCompleted).toBe(true)
    expect(completed.find((item) => item.id === 'ORD-NO')?.status).toBe('Diterima')
  })
})

describe('adFrequencyService', () => {
  it('AC-017: allows at most 3 impressions per day', () => {
    let frequency = canShowAd(undefined, NOW) ? registerImpression(undefined, NOW) : undefined
    expect(frequency).toBeDefined()
    frequency = registerImpression(frequency, NOW)
    frequency = registerImpression(frequency, NOW)

    expect(frequency?.impressions).toBe(MAX_ADS_PER_DAY)
    expect(canShowAd(frequency, NOW)).toBe(false)
    expect(canShowAd(frequency, NOW + 24 * HOUR_MS)).toBe(true)
  })

  it('AC-017: applies a 24-hour cooldown after the close button', () => {
    const closed = closeAd({ date: dayKey(NOW), impressions: 1 }, NOW)
    expect(closed.lastClosedAt).toBe(NOW)
    expect(canShowAd(closed, NOW + HOUR_MS)).toBe(false)
    expect(canShowAd(closed, NOW + AD_COOLDOWN_HOURS * HOUR_MS)).toBe(true)
  })
})
