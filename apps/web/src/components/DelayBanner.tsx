import { AlertTriangle } from 'lucide-react'
import { Link } from '../utils/router'

export default function DelayBanner({ orderId }: { orderId: string }) {
  return (
    <section className="notice notice--warning" role="status">
      <div className="row">
        <AlertTriangle size={20} aria-hidden="true" />
        <div className="stack">
          <strong>Pengiriman terlambat</strong>
          <span>
            Pesanan {orderId} melewati batas akhir estimasi. Periksa status paket atau ajukan
            bantuan dari aplikasi.
          </span>
        </div>
      </div>
      <div className="notice__actions">
        <Link to={`/report/${orderId}`} className="button button--outline">
          Laporkan Masalah
        </Link>
      </div>
    </section>
  )
}
