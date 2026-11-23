import { MapPin } from 'lucide-react'
import { useNavigate } from '../utils/router'
import { demoProduct } from '../services/demoData'
import { computePriceBreakdown, formatCurrency } from '../services/priceService'
import { useToast } from '../components/ToastProvider'
import PriceBreakdown from '../components/PriceBreakdown'

export default function CheckoutPage() {
  const price = computePriceBreakdown(demoProduct.price)
  const { showToast } = useToast()
  const navigate = useNavigate()

  const pay = () => {
    showToast('Checkout siap diproses. Status pesanan diaktifkan pada fase berikutnya.', 'info')
    navigate('/orders')
  }

  return (
    <div className="stack stack--large">
      <h1 className="page-title">Checkout</h1>

      <div className="checkout-layout">
        <div className="stack">
          <section className="card stack">
            <h2 className="section-title">Alamat pengiriman</h2>
            <div className="row">
              <MapPin size={20} aria-hidden="true" />
              <div className="stack">
                <strong>Raka Pratama</strong>
                <span className="muted">Surabaya, Jawa Timur · simulasi alamat</span>
              </div>
            </div>
          </section>

          <section className="card stack">
            <h2 className="section-title">Produk dipesan</h2>
            <div className="row checkout-item">
              <div className="cart-item__thumb" aria-hidden="true">Produk</div>
              <div className="stack">
                <strong>{demoProduct.name}</strong>
                <span className="muted">1 item · {formatCurrency(price.total)}</span>
              </div>
            </div>
          </section>
        </div>

        <section className="card checkout-summary stack">
          <h2 className="section-title">Ringkasan pembayaran</h2>
          <div className="row checkout-summary__row">
            <span className="muted">Total pembayaran</span>
            <strong className="price">{formatCurrency(price.total)}</strong>
          </div>
          <PriceBreakdown breakdown={price} label="Rincian Biaya" defaultOpen />
          <button type="button" className="button button--primary button--block" onClick={pay}>
            Bayar Sekarang
          </button>
        </section>
      </div>
    </div>
  )
}
