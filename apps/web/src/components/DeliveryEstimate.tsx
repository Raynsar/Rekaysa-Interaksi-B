import { Truck } from 'lucide-react'
import type { Order } from '../types'

export default function DeliveryEstimate({ order }: { order: Order }) {
  return (
    <section className="card delivery-estimate">
      <div className="row">
        <Truck size={24} aria-hidden="true" />
        <div className="stack">
          <strong>Estimasi tiba</strong>
          <span>
            {order.estimateLabel} · rentang {order.estimateMinDays}–{order.estimateMaxDays} hari
          </span>
        </div>
      </div>
      {order.trackingNote && <p className="muted">{order.trackingNote}</p>}
    </section>
  )
}
