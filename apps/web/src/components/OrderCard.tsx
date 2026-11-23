import { ChevronRight } from 'lucide-react'
import { Link } from '../utils/router'
import { formatCurrency } from '../services/priceService'
import StatusBadge from './StatusBadge'
import type { Order } from '../types'

export default function OrderCard({ order }: { order: Order }) {
  return (
    <article className="card order-card">
      <div className="order-card__head">
        <div className="stack">
          <span className="muted order-card__id">Belanjaan · {order.id}</span>
          <strong>{order.productName}</strong>
        </div>
        <StatusBadge status={order.status} receivedBadge={order.receivedBadge} />
      </div>

      <div className="order-card__meta">
        <span>Estimasi tiba: {order.estimateLabel}</span>
        <span className="order-card__total">{formatCurrency(order.price.total)}</span>
      </div>

      <div className="order-card__actions">
        <Link to={`/orders/${order.id}`} className="button button--outline">
          Lihat Detail
          <ChevronRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}
