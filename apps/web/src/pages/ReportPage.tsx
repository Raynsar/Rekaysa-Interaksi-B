import { ArrowLeft } from 'lucide-react'
import { Link } from '../utils/router'
import { findDemoOrder } from '../services/demoData'
import ReportForm from '../components/ReportForm'
import { useToast } from '../components/ToastProvider'
import NotFoundPage from './NotFoundPage'
import type { OrderStatus } from '../types'

function defaultCategory(status: OrderStatus): string {
  if (status === 'Dikirim' || status === 'Diterima') return 'Paket belum diterima'
  if (status === 'Belum Bayar') return 'Masalah pembayaran'
  if (status === 'Selesai') return 'Status pesanan tidak akurat'
  return 'Lainnya'
}

export default function ReportPage({ orderId }: { orderId: string }) {
  const order = findDemoOrder(orderId)
  const { showToast } = useToast()

  if (!order) return <NotFoundPage />

  return (
    <div className="stack stack--large">
      <Link to={`/orders/${order.id}`} className="back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        Kembali ke Detail Pesanan
      </Link>

      <ReportForm
        orderId={order.id}
        status={order.status}
        defaultCategory={defaultCategory(order.status)}
        onSubmit={() =>
          showToast('Laporan valid. Nomor tiket diterbitkan pada Phase 4.', 'success')
        }
      />
    </div>
  )
}
