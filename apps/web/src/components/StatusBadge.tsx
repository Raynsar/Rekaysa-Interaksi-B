import type { OrderStatus } from '../types'

const STATUS_CLASS: Record<OrderStatus, string> = {
  'Belum Bayar': 'belum-bayar',
  Dikemas: 'dikemas',
  Dikirim: 'dikirim',
  Diterima: 'diterima',
  Selesai: 'selesai',
  Dibatalkan: 'dibatalkan',
}

interface StatusBadgeProps {
  status: OrderStatus
  receivedBadge?: boolean
}

export default function StatusBadge({ status, receivedBadge = false }: StatusBadgeProps) {
  const label = receivedBadge ? 'Diterima' : status
  const variant = receivedBadge ? 'diterima' : STATUS_CLASS[status]

  return <span className={`status-badge status-badge--${variant}`}>{label}</span>
}
