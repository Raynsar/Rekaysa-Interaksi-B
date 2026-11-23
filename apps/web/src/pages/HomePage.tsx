import { ArrowRight, ClipboardList, Package, Truck } from 'lucide-react'
import { Link } from '../utils/router'
import { useApp } from '../context/AppContext'
import { demoProduct } from '../services/demoData'
import { formatCurrency, getEffectivePrice } from '../services/priceService'
import OrderCard from '../components/OrderCard'
import PriceUpdateNotice from '../components/PriceUpdateNotice'

export default function HomePage() {
  const { state, demo } = useApp()
  const effective = getEffectivePrice(demoProduct.price, demo.priceOverride)
  const latestOrder = state.orders[0]

  return (
    <div className="stack stack--large">
      <section className="card card--lg hero">
        <span className="hero__eyebrow">Peningkatan pelacakan pesanan</span>
        <h1 className="page-title">Pesanan jelas, kontrol tetap di tanganmu.</h1>
        <p className="muted">
          Harga final sejak beranda, status yang akurat, dan penyelesaian pesanan
          yang bisa kamu kendalikan sendiri.
        </p>
        <div className="row">
          <Link to="/orders" className="button button--primary">
            Lihat Pesanan
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link to="/product" className="button button--outline">
            Lihat Produk
          </Link>
        </div>
      </section>

      {effective.updated && (
        <PriceUpdateNotice
          previousTotal={effective.previousTotal}
          currentTotal={effective.breakdown.total}
        />
      )}

      <section className="stack">
        <h2 className="section-title">Harga final sejak awal</h2>
        <div className="card product-preview">
          <div className="stack">
            <strong>{demoProduct.name}</strong>
            <span className="muted">{demoProduct.description}</span>
            <span className="price">{formatCurrency(effective.breakdown.total)}</span>
            <span className="muted">Termasuk biaya ukuran khusus dan ongkir</span>
          </div>
          <Link to="/product" className="button button--secondary">
            Detail Produk
          </Link>
        </div>
      </section>

      {latestOrder && (
        <section className="stack">
          <h2 className="section-title">Pesanan terbaru</h2>
          <OrderCard order={latestOrder} />
        </section>
      )}

      <section className="feature-grid">
        <div className="card stack">
          <Package size={24} aria-hidden="true" />
          <strong>Harga konsisten</strong>
          <span className="muted">Beranda sampai checkout memakai satu sumber harga.</span>
        </div>
        <div className="card stack">
          <Truck size={24} aria-hidden="true" />
          <strong>Estimasi rentang</strong>
          <span className="muted">Kapan paket tiba lebih mudah diperkirakan.</span>
        </div>
        <div className="card stack">
          <ClipboardList size={24} aria-hidden="true" />
          <strong>Laporan in-app</strong>
          <span className="muted">Masalah pesanan dilaporkan tanpa keluar aplikasi.</span>
        </div>
      </section>
    </div>
  )
}
