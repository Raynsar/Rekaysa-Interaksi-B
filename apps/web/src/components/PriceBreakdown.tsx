import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { formatCurrency } from '../services/priceService'
import type { PriceBreakdown as PriceBreakdownModel } from '../types'

interface PriceBreakdownProps {
  breakdown: PriceBreakdownModel
  label?: string
  defaultOpen?: boolean
}

export default function PriceBreakdown({
  breakdown,
  label = 'Rincian Biaya',
  defaultOpen = false,
}: PriceBreakdownProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="price-breakdown">
      <button
        type="button"
        className="price-breakdown__toggle"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="price-breakdown__label">{label}</span>
        <span className="price-breakdown__total">{formatCurrency(breakdown.total)}</span>
        <ChevronDown
          size={20}
          aria-hidden="true"
          className={`price-breakdown__chevron${open ? ' price-breakdown__chevron--open' : ''}`}
        />
      </button>

      {open && (
        <dl className="price-breakdown__list">
          <div className="price-breakdown__row">
            <dt>Harga produk</dt>
            <dd>{formatCurrency(breakdown.basePrice)}</dd>
          </div>
          <div className="price-breakdown__row">
            <dt>Biaya ukuran khusus</dt>
            <dd>{formatCurrency(breakdown.oversizeFee)}</dd>
          </div>
          <div className="price-breakdown__row">
            <dt>Ongkos kirim</dt>
            <dd>{formatCurrency(breakdown.shippingFee)}</dd>
          </div>
          <div className="price-breakdown__row">
            <dt>Biaya layanan</dt>
            <dd>{formatCurrency(breakdown.serviceFee)}</dd>
          </div>
          <div className="price-breakdown__row">
            <dt>Diskon</dt>
            <dd>-{formatCurrency(breakdown.discount)}</dd>
          </div>
          <div className="price-breakdown__row price-breakdown__row--total">
            <dt>Total akhir</dt>
            <dd>{formatCurrency(breakdown.total)}</dd>
          </div>
        </dl>
      )}
    </section>
  )
}
