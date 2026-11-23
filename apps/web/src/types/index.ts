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
  estimateEndAt: string
  placedAt: string
  deliveredAt?: string
  autoCompleteAt?: string
  autoCompleteOptIn?: boolean
  autoCompleted?: boolean
  spaylater?: boolean
  trackingNote?: string
}

export interface CartItem {
  productId: string
  quantity: number
}

export type NotificationKind = 'delay' | 'auto-complete'

export interface NotificationRecord {
  id: string
  orderId: string
  kind: NotificationKind
  message: string
  createdAt: number
  status: 'sent' | 'failed'
  error?: string
}

export interface ReportFormValue {
  category: string
  description: string
  evidenceName?: string
  evidenceSize?: number
}

export interface Ticket {
  number: string
  orderId: string
  category: string
  description: string
  evidenceName?: string
  evidenceSize?: number
  createdAt: number
}

export interface AdFrequency {
  date: string
  impressions: number
  lastClosedAt?: number
}

export interface DemoState {
  failStorageWrite: boolean
  failNotification: boolean
  priceOverride?: number
}

export interface Product {
  id: string
  name: string
  description: string
  price: PriceComponents
}
