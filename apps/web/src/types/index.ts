export const ORDER_STATUSES = [
  'Belum Bayar',
  'Dikemas',
  'Dikirim',
  'Diterima',
  'Selesai',
  'Dibatalkan',
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const FILTER_TABS = [
  'Semua',
  'Belum Bayar',
  'Dikemas',
  'Dikirim',
  'Selesai',
  'Dibatalkan',
] as const

export type FilterTab = (typeof FILTER_TABS)[number]

export interface PriceComponents {
  basePrice: number
  oversizeFee: number
  shippingFee: number
  serviceFee: number
  discount: number
}

export interface PriceBreakdown extends PriceComponents {
  total: number
}

export interface OrderItem {
  name: string
  quantity: number
  price: number
}

export interface Order {
  id: string
  productName: string
  status: OrderStatus
  receivedBadge?: boolean
  items: OrderItem[]
  price: PriceBreakdown
  estimateMinDays: number
  estimateMaxDays: number
  estimateLabel: string
  placedAt: string
  spaylater?: boolean
  trackingNote?: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: PriceComponents
}
