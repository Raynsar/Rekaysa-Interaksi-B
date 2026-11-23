import { Clock3 } from 'lucide-react'
import type { Order } from '../types'

interface ReminderBannerProps {
  order: Order
  optedIn: boolean
  onComplete: () => void
  onWait: () => void
}

export default function ReminderBanner({
  order,
  optedIn,
  onComplete,
  onWait,
}: ReminderBannerProps) {
  return (
    <section className="notice notice--info" role="status">
      <div className="row">
        <Clock3 size={20} aria-hidden="true" />
        <div className="stack">
          <strong>Pengingat penyelesaian otomatis</strong>
          <span>
            {optedIn
              ? 'Kamu memilih Tunggu Otomatis. Pesanan akan selesai otomatis saat batas waktu terlewat.'
              : 'Pesanan akan selesai otomatis dalam 24 jam. Selesaikan sekarang atau tunggu otomatis.'}
          </span>
          <span className="muted">ID pesanan: {order.id}</span>
        </div>
      </div>
      <div className="notice__actions">
        <button type="button" className="button button--primary" onClick={onComplete}>
          Selesaikan Sekarang
        </button>
        {!optedIn && (
          <button type="button" className="button button--outline" onClick={onWait}>
            Tunggu Otomatis
          </button>
        )}
      </div>
    </section>
  )
}
