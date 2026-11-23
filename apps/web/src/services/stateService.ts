import type {
  AdFrequency,
  DemoState,
  NotificationRecord,
  Order,
  ReportFormValue,
  Ticket,
} from '../types'
import { demoProduct } from './demoData'
import { dayKey } from './adFrequencyService'
import { computePriceBreakdown } from './priceService'
import { HOUR_MS, autoCompleteAtFromDelivered, toIso } from './timeService'

export const APP_STATE_KEY = 'shopee-tracking-state-v1'
export const DEMO_STATE_KEY = 'shopee-tracking-demo-v1'

export interface AppState {
  orders: Order[]
  orderCounter: number
  cart: { productId: string; quantity: number }[]
  showAds: boolean
  notifyDelay: boolean
  reportDrafts: Record<string, ReportFormValue>
  tickets: Ticket[]
  ticketCounter: number
  adFrequency: AdFrequency
  notifications: NotificationRecord[]
}

export const defaultDemoState: DemoState = {
  failStorageWrite: false,
  failNotification: false,
}

export const DEMO_WRITE_OPTIONS = { bypassFailure: true } as const

export function createInitialState(now: number): AppState {
  const price = computePriceBreakdown(demoProduct.price)
  const deliveredAt = now - 47 * HOUR_MS
  const autoCompleteAt = autoCompleteAtFromDelivered(deliveredAt)

  const items = [{ name: demoProduct.name, quantity: 1, price: price.total }]
  const base = {
    items,
    price,
    placedAt: toIso(now - 4 * 24 * HOUR_MS),
  }

  const orders: Order[] = [
    {
      ...base,
      id: 'ORD-2026-001',
      productName: demoProduct.name,
      status: 'Dikemas',
      estimateMinDays: 3,
      estimateMaxDays: 6,
      estimateLabel: '3–6 hari',
      estimateEndAt: toIso(now + 2 * 24 * HOUR_MS),
      trackingNote: 'Pesanan sedang disiapkan penjual.',
    },
    {
      ...base,
      id: 'ORD-2026-002',
      productName: 'Botol Minum Tumbler 750ml',
      status: 'Belum Bayar',
      estimateMinDays: 3,
      estimateMaxDays: 6,
      estimateLabel: '3–6 hari',
      estimateEndAt: toIso(now + 3 * 24 * HOUR_MS),
    },
    {
      ...base,
      id: 'ORD-2026-003',
      productName: 'Headphone Wireless Studio',
      status: 'Dikirim',
      estimateMinDays: 2,
      estimateMaxDays: 5,
      estimateLabel: '2–5 hari',
      estimateEndAt: toIso(now - 2 * HOUR_MS),
      trackingNote: 'Dalam perjalanan ke kota tujuan.',
    },
    {
      ...base,
      id: 'ORD-2026-004',
      productName: demoProduct.name,
      status: 'Diterima',
      receivedBadge: true,
      estimateMinDays: 2,
      estimateMaxDays: 4,
      estimateLabel: '2–4 hari',
      estimateEndAt: toIso(now + 24 * HOUR_MS),
      deliveredAt: toIso(deliveredAt),
      autoCompleteAt,
      trackingNote: 'Paket sudah diterima. Selesaikan pesanan atau tunggu otomatis.',
    },
    {
      ...base,
      id: 'ORD-2026-005',
      productName: 'Sepatu Sneakers Kampus',
      status: 'Selesai',
      estimateMinDays: 3,
      estimateMaxDays: 5,
      estimateLabel: '3–5 hari',
      estimateEndAt: toIso(now - 24 * HOUR_MS),
      spaylater: true,
    },
    {
      ...base,
      id: 'ORD-2026-006',
      productName: 'Meja Lipat Portable',
      status: 'Dibatalkan',
      estimateMinDays: 3,
      estimateMaxDays: 6,
      estimateLabel: '3–6 hari',
      estimateEndAt: toIso(now - 24 * HOUR_MS),
      trackingNote: 'Pesanan dibatalkan oleh pembeli.',
    },
  ]

  return {
    orders,
    orderCounter: orders.length,
    cart: [{ productId: demoProduct.id, quantity: 1 }],
    showAds: true,
    notifyDelay: true,
    reportDrafts: {},
    tickets: [],
    ticketCounter: 0,
    adFrequency: { date: dayKey(now), impressions: 0 },
    notifications: [],
  }
}
