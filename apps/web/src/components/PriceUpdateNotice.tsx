import { formatCurrency } from '../services/priceService'

interface PriceUpdateNoticeProps {
  previousTotal: number
  currentTotal: number
}

export default function PriceUpdateNotice({
  previousTotal,
  currentTotal,
}: PriceUpdateNoticeProps) {
  return (
    <p className="notice notice--warning" role="status">
      <strong>Harga diperbarui.</strong> Harga berubah dari {formatCurrency(previousTotal)} menjadi{' '}
      {formatCurrency(currentTotal)}. Rincian di bawah sudah memakai nilai terbaru.
    </p>
  )
}
