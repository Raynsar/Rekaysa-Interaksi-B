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

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}
