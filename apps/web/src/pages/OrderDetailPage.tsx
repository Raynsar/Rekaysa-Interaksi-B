import { useState } from 'react'
import { ArrowLeft, Flag } from 'lucide-react'
import { Link } from '../utils/router'
import { canCompleteInPreview, findDemoOrder } from '../services/demoData'
import ConfirmModal from '../components/ConfirmModal'
import DeliveryEstimate from '../components/DeliveryEstimate'
import PriceBreakdown from '../components/PriceBreakdown'
import StatusBadge from '../components/StatusBadge'
import { useToast } from '../components/ToastProvider'
import NotFoundPage from './NotFoundPage'
import type { Order } from '../types'

const TIMELINE_STEPS = ['Belum Bayar', 'Dikemas', 'Dikirim', 'Selesai'] as const

function timelineIndex(order: Order): number {
  if (order.status === 'Dibatalkan') return -1
  if (order.status === 'Diterima') return TIMELINE_STEPS.indexOf('Dikirim')
  return TIMELINE_STEPS.indexOf(order.status as (typeof TIMELINE_STEPS)[number])
}

export default function OrderDetailPage({ orderId }: { orderId: string }) {
  const order = findDemoOrder(orderId)
  const { showToast } = useToast()
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (!order) return <NotFoundPage />

  const activeIndex = timelineIndex(order)

  const confirmComplete = () => {
    setConfirmOpen(false)
    showToast('Konfirmasi diterima. Perubahan status diaktifkan pada Phase 4.', 'success')
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

      <DeliveryEstimate order={order} />

      <section className="card stack">
        <h2 className="section-title">Rincian pesanan</h2>
        {order.items.map((item) => (
          <div key={item.name} className="row checkout-summary__row">
            <span>{item.name} · {item.quantity} item</span>
            <strong>{order.price.total.toLocaleString('id-ID')}</strong>
          </div>
        ))}
        <PriceBreakdown breakdown={order.price} defaultOpen />
      </section>

      <section className="card stack">
        <h2 className="section-title">Aksi pesanan</h2>
        <div className="order-detail__actions">
          {canCompleteInPreview(order) && (
            <button
              type="button"
              className="button button--primary"
              onClick={() => setConfirmOpen(true)}
            >
              Selesaikan Pesanan
            </button>
          )}
          {order.status === 'Dikirim' && (
            <button
              type="button"
              className="button button--secondary"
              onClick={() => showToast('Lacak paket tersedia setelah integrasi kurir.', 'info')}
            >
              Lacak Paket
            </button>
          )}
          {order.status === 'Selesai' && (
            <>
              <button
                type="button"
                className="button button--primary"
                onClick={() =>
                  showToast('Pelunasan SPayLater ditampilkan sebagai UI simulasi.', 'info')
                }
              >
                Lunasi Sekarang
              </button>
              {order.spaylater && (
                <span className="muted">Cicilan SPayLater siap dilunasi.</span>
              )}
            </>
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
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmComplete}
      />
    </div>
  )
}
