import { Link } from '../utils/router'
import { useApp } from '../context/AppContext'
import { demoProduct } from '../services/demoData'
import { formatCurrency, getEffectivePrice } from '../services/priceService'
import PriceUpdateNotice from '../components/PriceUpdateNotice'

export default function CartPage() {
  const { state, demo, actions } = useApp()
  const effective = getEffectivePrice(demoProduct.price, demo.priceOverride)
  const quantity = state.cart.find((item) => item.productId === demoProduct.id)?.quantity ?? 0
  const subtotal = effective.breakdown.total * quantity

  return (
    <div className="stack stack--large">
      <h1 className="page-title">Keranjang</h1>

      {effective.updated && (
        <PriceUpdateNotice
          previousTotal={effective.previousTotal}
          currentTotal={effective.breakdown.total}
        />
      )}

      {quantity > 0 ? (
        <div className="card cart-item">
          <div className="cart-item__thumb" aria-hidden="true">Produk</div>
          <div className="stack cart-item__info">
            <strong>{demoProduct.name}</strong>
            <span className="muted">{formatCurrency(effective.breakdown.total)} per item</span>
            <div className="quantity">
              <button
                type="button"
                className="quantity__button"
                onClick={() => actions.setCartQuantity(demoProduct.id, Math.max(1, quantity - 1))}
                aria-label="Kurangi jumlah"
              >
                -
              </button>
              <span aria-live="polite">{quantity}</span>
              <button
                type="button"
                className="quantity__button"
                onClick={() => actions.setCartQuantity(demoProduct.id, quantity + 1)}
                aria-label="Tambah jumlah"
              >
                +
              </button>
            </div>
          </div>
          <strong className="cart-item__subtotal">{formatCurrency(subtotal)}</strong>
        </div>
      ) : (
        <div className="card stack">
          <strong className="section-title">Keranjang kosong</strong>
          <p className="muted">Tambahkan produk terlebih dahulu sebelum checkout.</p>
          <Link to="/product" className="button button--primary">
            Lihat Produk
          </Link>
        </div>
      )}

      <div className="card checkout-summary">
        <div className="row checkout-summary__row">
          <span className="muted">Subtotal ({quantity} item)</span>
          <strong>{formatCurrency(subtotal)}</strong>
        </div>
        <Link to="/checkout" className="button button--primary button--block">
          Lanjut ke Checkout
        </Link>
      </div>
    </div>
  )
}
