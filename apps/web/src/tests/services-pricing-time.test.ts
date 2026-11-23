import { describe, expect, it } from 'vitest'
import { demoProduct } from '../services/demoData'
import {
  computePriceBreakdown,
  formatCurrency,
  getEffectivePrice,
} from '../services/priceService'
import {
  AUTO_COMPLETE_AFTER_HOURS,
  HOUR_MS,
  REMINDER_LEAD_HOURS,
  autoCompleteAtFromDelivered,
  estimateRangeLabel,
  fromIso,
  hoursUntil,
  isDelayed,
  isReminderDue,
  reminderAtFromAutoComplete,
  toIso,
} from '../services/timeService'
import type { Order } from '../types'

const NOW = Date.UTC(2026, 0, 15, 12)

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

describe('priceService', () => {
  it('AC-001/002/003: one breakdown is consistent across pages', () => {
    const breakdown = computePriceBreakdown(demoProduct.price)

    expect(breakdown.total).toBe(48_500)
    expect(breakdown.total).toBe(
      breakdown.basePrice +
        breakdown.oversizeFee +
        breakdown.shippingFee +
        breakdown.serviceFee -
        breakdown.discount,
    )

    const unchanged = getEffectivePrice(demoProduct.price)
    expect(unchanged.updated).toBe(false)
    expect(unchanged.previousTotal).toBe(breakdown.total)
    expect(unchanged.breakdown).toEqual(breakdown)

    const changed = getEffectivePrice(demoProduct.price, 75_000)
    expect(changed.updated).toBe(true)
    expect(changed.previousTotal).toBe(48_500)
    expect(changed.breakdown.total).toBe(75_000)
    expect(formatCurrency(changed.breakdown.total)).toContain('75.000')
  })
})

describe('timeService', () => {
  it('computes hoursUntil, the 48h deadline and the 24h reminder', () => {
    const deliveredAt = NOW - 47 * HOUR_MS
    const deadline = autoCompleteAtFromDelivered(deliveredAt)

    expect(fromIso(deadline) - fromIso(deliveredAt)).toBe(
      AUTO_COMPLETE_AFTER_HOURS * HOUR_MS,
    )
    expect(reminderAtFromAutoComplete(deadline)).toBe(
      fromIso(deadline) - REMINDER_LEAD_HOURS * HOUR_MS,
    )
    expect(hoursUntil(deadline, NOW)).toBeCloseTo(1, 8)
    expect(hoursUntil(toIso(NOW - 2 * HOUR_MS), NOW)).toBe(-2)
  })

  it('formats the delivery range label', () => {
    expect(estimateRangeLabel(2, 5)).toBe('2–5 hari')
  })

  it('AC-019: detects delay only for active shipping statuses past the range', () => {
    expect(isDelayed(order({ status: 'Dikirim', estimateEndAt: toIso(NOW - HOUR_MS) }), NOW)).toBe(
      true,
    )
    expect(isDelayed(order({ status: 'Dikemas', estimateEndAt: toIso(NOW - HOUR_MS) }), NOW)).toBe(
      true,
    )
    expect(isDelayed(order({ status: 'Diterima', estimateEndAt: toIso(NOW - HOUR_MS) }), NOW)).toBe(
      true,
    )
    expect(isDelayed(order({ status: 'Dikirim', estimateEndAt: toIso(NOW + HOUR_MS) }), NOW)).toBe(
      false,
    )
    expect(isDelayed(order({ status: 'Selesai', estimateEndAt: toIso(NOW - HOUR_MS) }), NOW)).toBe(
      false,
    )
    expect(isDelayed(order({ status: 'Dibatalkan', estimateEndAt: toIso(NOW - HOUR_MS) }), NOW)).toBe(
      false,
    )
  })

  it('AC-007: reminder is due only in the 24h window before auto-complete', () => {
    const autoCompleteAt = toIso(NOW + 12 * HOUR_MS)
    const subject = { status: 'Diterima' as const, autoCompleteAt }

    expect(isReminderDue(subject, NOW - 13 * HOUR_MS)).toBe(false)
    expect(isReminderDue(subject, NOW - 12 * HOUR_MS)).toBe(true)
    expect(isReminderDue(subject, NOW)).toBe(true)
    expect(isReminderDue(subject, NOW + 12 * HOUR_MS)).toBe(false)
    expect(isReminderDue({ ...subject, status: 'Selesai' }, NOW)).toBe(false)
    expect(isReminderDue({ status: 'Diterima' }, NOW)).toBe(false)
  })
})
