import type { OrderStatus, Product } from '../types'

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

export function suggestedReportCategory(status: OrderStatus): string {
  if (status === 'Dikirim' || status === 'Diterima') return 'Paket belum diterima'
  if (status === 'Belum Bayar') return 'Masalah pembayaran'
  if (status === 'Selesai') return 'Status pesanan tidak akurat'
  return 'Lainnya'
}
