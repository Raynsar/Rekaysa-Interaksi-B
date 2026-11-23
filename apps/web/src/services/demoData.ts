import { computePriceBreakdown } from './priceService'
import type { Order, Product } from '../types'

/**
 * Demo seed used by the Phase 3 UI. Phase 4 replaces the in-memory source
 * with the persistent order store; the shape stays the same.
 */
export const demoProduct: Product = {
  id: 'PROD-001',
  name: 'Tas Ransel Kampus Premium',
  description:
    'Ransel harian untuk kuliah dengan kompartemen laptop dan bahan anti-air.',
  price: {
    basePrice: 36000,
    oversizeFee: 5500,
    shippingFee: 9000,
    serviceFee: 1000,
    discount: 3000,
  },
}

const productPrice = computePriceBreakdown(demoProduct.price)

const baseOrder = {
  items: [{ name: demoProduct.name, quantity: 1, price: productPrice.total }],
  price: productPrice,
  placedAt: '23 Nov 2026',
}

export const demoOrders: Order[] = [
  {
    ...baseOrder,
    id: 'ORD-2026-001',
    productName: demoProduct.name,
    status: 'Dikemas',
    estimateMinDays: 3,
    estimateMaxDays: 6,
    estimateLabel: '26–29 Nov 2026',
    trackingNote: 'Pesanan sedang disiapkan penjual.',
  },
  {
    ...baseOrder,
    id: 'ORD-2026-002',
    productName: 'Botol Minum Tumbler 750ml',
    status: 'Belum Bayar',
    estimateMinDays: 3,
    estimateMaxDays: 6,
    estimateLabel: '26–29 Nov 2026',
  },
  {
    ...baseOrder,
    id: 'ORD-2026-003',
    productName: 'Headphone Wireless Studio',
    status: 'Dikirim',
    estimateMinDays: 2,
    estimateMaxDays: 5,
    estimateLabel: '25–28 Nov 2026',
    trackingNote: 'Dalam perjalanan ke kota tujuan.',
  },
  {
    ...baseOrder,
    id: 'ORD-2026-004',
    productName: demoProduct.name,
    status: 'Diterima',
    receivedBadge: true,
    estimateMinDays: 2,
    estimateMaxDays: 4,
    estimateLabel: '25–27 Nov 2026',
    trackingNote: 'Paket sudah diterima. Selesaikan pesanan untuk melepaskan pembayaran.',
  },
  {
    ...baseOrder,
    id: 'ORD-2026-005',
    productName: 'Sepatu Sneakers Kampus',
    status: 'Selesai',
    estimateMinDays: 3,
    estimateMaxDays: 5,
    estimateLabel: '25–27 Nov 2026',
    spaylater: true,
  },
  {
    ...baseOrder,
    id: 'ORD-2026-006',
    productName: 'Meja Lipat Portable',
    status: 'Dibatalkan',
    estimateMinDays: 3,
    estimateMaxDays: 6,
    estimateLabel: '26–29 Nov 2026',
    trackingNote: 'Pesanan dibatalkan oleh pembeli.',
  },
]

export function findDemoOrder(id: string): Order | undefined {
  return demoOrders.find((order) => order.id === id)
}

/** Phase 3 rule preview; Phase 4 moves this into the order service. */
export function canCompleteInPreview(order: Order): boolean {
  return order.status === 'Diterima' || order.receivedBadge === true
}
