import { useState } from 'react'
import { Link } from '../utils/router'
import { demoProduct } from '../services/demoData'
import { computePriceBreakdown, formatCurrency } from '../services/priceService'

export default function CartPage() {
  const [quantity, setQuantity] = useState(1)
  const price = computePriceBreakdown(demoProduct.price)
  const subtotal = price.total * quantity

  return (
    <div className="stack stack--large">
      <h1 className="page-title">Keranjang</h1>

      <div className="card cart-item">
        <div className="cart-item__thumb" aria-hidden="true">Produk</div>
        <div className="stack cart-item__info">
          <strong>{demoProduct.name}</strong>
          <span className="muted">{formatCurrency(price.total)} per item</span>
          <div className="quantity">
            <button
              type="button"
              className="quantity__button"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              aria-label="Kurangi jumlah"
            >
              -
            </button>
            <span aria-live="polite">{quantity}</span>
            <button
              type="button"
              className="quantity__button"
              onClick={() => setQuantity((value) => value + 1)}
              aria-label="Tambah jumlah"
            >
              +
            </button>
          </div>
        </div>
        <strong className="cart-item__subtotal">{formatCurrency(subtotal)}</strong>
      </div>

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
