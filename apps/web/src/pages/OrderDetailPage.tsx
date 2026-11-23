import { useState } from 'react'
import { ArrowLeft, Flag } from 'lucide-react'
import { Link, useNavigate } from '../utils/router'
import { useApp } from '../context/AppContext'
import { canCompleteOrder } from '../services/orderService'
import { isDelayed, isReminderDue } from '../services/timeService'
import ConfirmModal from '../components/ConfirmModal'
import DelayBanner from '../components/DelayBanner'
import DeliveryEstimate from '../components/DeliveryEstimate'
import PriceBreakdown from '../components/PriceBreakdown'
import ReminderBanner from '../components/ReminderBanner'
import StatusBadge from '../components/StatusBadge'
import NotFoundPage from './NotFoundPage'
import type { Order } from '../types'

const TIMELINE_STEPS = ['Belum Bayar', 'Dikemas', 'Dikirim', 'Selesai'] as const

function timelineIndex(order: Order): number {
  if (order.status === 'Dibatalkan') return -1
  if (order.status === 'Diterima') return TIMELINE_STEPS.indexOf('Dikirim')
  return TIMELINE_STEPS.indexOf(order.status as (typeof TIMELINE_STEPS)[number])
}

export default function OrderDetailPage({ orderId }: { orderId: string }) {
  const { state, now, actions } = useApp()
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const order = state.orders.find((item) => item.id === orderId)

  if (!order) return <NotFoundPage />

  const activeIndex = timelineIndex(order)
  const canComplete = canCompleteOrder(order)
  const delayed = isDelayed(order, now)
  const reminderDue = canComplete && isReminderDue(order, now)

  const finish = () => {
    if (busy) return
    setBusy(true)
    const changed = actions.completeOrder(order.id)
    setConfirmOpen(false)
    setBusy(false)
    if (changed) navigate('/orders?status=Selesai')
  }

  const waitAutomatically = () => {
    actions.optInAutoComplete(order.id)
  }

  return (
    <div className="stack stack--large">
      <Link to="/orders" className="back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        Kembali ke Pesanan
      </Link>

      <section className="card card--lg stack">
        <div className="order-detail__head">
          <div className="stack">
            <span className="muted">Belanjaan · {order.id}</span>
            <h1 className="page-title">{order.productName}</h1>
            <span className="muted">Dipesan {order.placedAt}</span>
          </div>
          <StatusBadge status={order.status} receivedBadge={order.receivedBadge} />
        </div>

        <ol className="timeline" aria-label="Progres pesanan">
          {TIMELINE_STEPS.map((step, index) => (
            <li
              key={step}
              className={`timeline__step${index === activeIndex ? ' timeline__step--active' : ''}`}
              aria-current={index === activeIndex ? 'step' : undefined}
            >
              {step}
            </li>
          ))}
          {order.status === 'Dibatalkan' && (
            <li className="timeline__step timeline__step--cancelled">Dibatalkan</li>
          )}
        </ol>
      </section>

      {delayed && <DelayBanner orderId={order.id} />}

      {reminderDue && (
        <ReminderBanner
          order={order}
          optedIn={Boolean(order.autoCompleteOptIn)}
          onComplete={() => setConfirmOpen(true)}
          onWait={waitAutomatically}
        />
      )}

      <DeliveryEstimate order={order} />

      <section className="card stack">
        <h2 className="section-title">Rincian pesanan</h2>
        {order.items.map((item) => (
          <div key={item.name} className="row checkout-summary__row">
            <span>{item.name} · {item.quantity} item</span>
            <strong>{item.price.toLocaleString('id-ID')}</strong>
          </div>
        ))}
        <PriceBreakdown breakdown={order.price} defaultOpen />
      </section>

      <section className="card stack">
        <h2 className="section-title">Aksi pesanan</h2>
        <div className="order-detail__actions">
          {canComplete && (
            <button
              type="button"
              className="button button--primary"
              onClick={() => setConfirmOpen(true)}
            >
              Selesaikan Pesanan
            </button>
          )}
          {order.status === 'Dikirim' && (
            <button type="button" className="button button--secondary">
              Lacak Paket
            </button>
          )}
          {order.status === 'Selesai' && (
            <>
              <button type="button" className="button button--primary">
                Lunasi Sekarang
              </button>
              {order.spaylater && (
                <span className="muted">Cicilan SPayLater siap dilunasi.</span>
              )}
            </>
          )}
          {order.autoCompleteOptIn && !order.autoCompleted && (
            <span className="muted">Menunggu penyelesaian otomatis.</span>
          )}
          <Link to={`/report/${order.id}`} className="button button--outline">
            <Flag size={16} aria-hidden="true" />
            Laporkan Masalah
          </Link>
        </div>
      </section>

      <ConfirmModal
        open={confirmOpen}
        title="Selesaikan pesanan ini?"
        message="Pastikan paket sudah kamu terima."
        confirmLabel={busy ? 'Memproses...' : 'Ya, Selesaikan'}
        onClose={() => setConfirmOpen(false)}
        onConfirm={finish}
      />
    </div>
  )
}
