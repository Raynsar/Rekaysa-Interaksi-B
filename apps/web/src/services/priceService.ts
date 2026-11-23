import type { PriceBreakdown, PriceComponents } from '../types'

/** Single source of truth for price composition. */
export function computePriceBreakdown(input: PriceComponents): PriceBreakdown {
  const total =
    input.basePrice +
    input.oversizeFee +
    input.shippingFee +
    input.serviceFee -
    input.discount

  return { ...input, total }
}

export interface EffectivePrice {
  breakdown: PriceBreakdown
  previousTotal: number
  updated: boolean
}

/**
 * Applies a demo price override while keeping the breakdown internally
 * consistent: the difference is absorbed by the base product price.
 */
export function getEffectivePrice(
  components: PriceComponents,
  override?: number,
): EffectivePrice {
  const previous = computePriceBreakdown(components)
  if (override === undefined || override === previous.total) {
    return { breakdown: previous, previousTotal: previous.total, updated: false }
  }

  const delta = override - previous.total
  const breakdown = computePriceBreakdown({ ...components, basePrice: components.basePrice + delta })
  return { breakdown, previousTotal: previous.total, updated: true }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}
