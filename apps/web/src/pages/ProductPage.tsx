import { ShoppingCart } from 'lucide-react'
import { useNavigate } from '../utils/router'
import { useApp } from '../context/AppContext'
import { demoProduct } from '../services/demoData'
import { formatCurrency, getEffectivePrice } from '../services/priceService'
import { useToast } from '../components/ToastProvider'
import PriceBreakdown from '../components/PriceBreakdown'
import PriceUpdateNotice from '../components/PriceUpdateNotice'

export default function ProductPage() {
  const { demo, actions } = useApp()
  const effective = getEffectivePrice(demoProduct.price, demo.priceOverride)
  const { showToast } = useToast()
  const navigate = useNavigate()

  const addToCart = () => {
    actions.setCartQuantity(demoProduct.id, 1)
    showToast('Produk ditambahkan ke keranjang.', 'success')
    navigate('/cart')
  }

  return (
    <div className="stack stack--large">
      {effective.updated && (
        <PriceUpdateNotice
          previousTotal={effective.previousTotal}
          currentTotal={effective.breakdown.total}
        />
      )}

      <div className="product-layout">
        <div className="product-gallery" aria-label={`Ilustrasi ${demoProduct.name}`}>
          <PackageGlyph />
        </div>

        <div className="stack product-info">
          <span className="muted">Produk · {demoProduct.id}</span>
          <h1 className="page-title">{demoProduct.name}</h1>
          <p className="muted">{demoProduct.description}</p>

          <div className="stack">
            <span className="muted">Harga final</span>
            <span className="price">{formatCurrency(effective.breakdown.total)}</span>
            <span className="muted">Sudah termasuk ongkir dan biaya ukuran khusus</span>
          </div>

          <PriceBreakdown breakdown={effective.breakdown} defaultOpen />

          <button type="button" className="button button--primary button--block" onClick={addToCart}>
            <ShoppingCart size={20} aria-hidden="true" />
            Tambah ke Keranjang
          </button>
        </div>
      </div>
    </div>
  )
}

function PackageGlyph() {
  return (
    <svg
      width="96"
      height="96"
      viewBox="0 0 96 96"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="12" y="12" width="72" height="72" rx="12" fill="var(--color-primary-light)" />
      <path
        d="M48 26 68 37v22L48 70 28 59V37l20-11Z"
        stroke="var(--color-primary)"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="m28 37 20 11 20-11M48 48v22" stroke="var(--color-primary)" strokeWidth="4" />
    </svg>
  )
}
