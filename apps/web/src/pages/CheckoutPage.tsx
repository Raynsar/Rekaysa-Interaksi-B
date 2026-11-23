import { MapPin } from 'lucide-react'
import { useNavigate } from '../utils/router'
import { useApp } from '../context/AppContext'
import { demoProduct } from '../services/demoData'
import { formatCurrency, getEffectivePrice } from '../services/priceService'
import { useToast } from '../components/ToastProvider'
import PriceBreakdown from '../components/PriceBreakdown'
import PriceUpdateNotice from '../components/PriceUpdateNotice'

export default function CheckoutPage() {
  const { state, demo, actions } = useApp()
  const effective = getEffectivePrice(demoProduct.price, demo.priceOverride)
  const quantity = state.cart.find((item) => item.productId === demoProduct.id)?.quantity ?? 0
  const total = effective.breakdown.total * quantity
  const { showToast } = useToast()
  const navigate = useNavigate()

  const pay = () => {
    const orderId = actions.checkout()
    if (!orderId) {
      showToast('Keranjang kosong. Tambahkan produk terlebih dahulu.', 'error')
      return
    }
    showToast('Pesanan dibuat dan tersinkron di daftar pesanan.', 'success')
    navigate(`/orders/${orderId}`)
  }

  return (
    <div className="stack stack--large">
      <h1 className="page-title">Checkout</h1>

      {effective.updated && (
        <PriceUpdateNotice
          previousTotal={effective.previousTotal}
          currentTotal={effective.breakdown.total}
        />
      )}

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
                <span className="muted">
                  {quantity} item · {formatCurrency(effective.breakdown.total)} per item
                </span>
              </div>
            </div>
          </section>
        </div>

        <section className="card checkout-summary stack">
          <h2 className="section-title">Ringkasan pembayaran</h2>
          <div className="row checkout-summary__row">
            <span className="muted">Total pembayaran</span>
            <strong className="price">{formatCurrency(total)}</strong>
          </div>
          <PriceBreakdown breakdown={effective.breakdown} label="Rincian Biaya" defaultOpen />
          <button
            type="button"
            className="button button--primary button--block"
            onClick={pay}
            disabled={quantity <= 0}
          >
            Bayar Sekarang
          </button>
        </section>
      </div>
    </div>
  )
}
