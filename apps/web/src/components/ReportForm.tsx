import type { FormEvent } from 'react'
import type { OrderStatus, ReportFormValue } from '../types'
import type { ReportErrors } from '../services/reportService'
import { MAX_DESCRIPTION_LENGTH } from '../services/reportService'

const CATEGORY_OPTIONS = [
  'Paket belum diterima',
  'Paket rusak',
  'Barang tidak sesuai',
  'Status pesanan tidak akurat',
  'Masalah pembayaran',
  'Lainnya',
]

interface ReportFormProps {
  orderId: string
  status: OrderStatus
  value: ReportFormValue
  errors: ReportErrors
  submitting?: boolean
  successTicket?: string | null
  onChange: (value: ReportFormValue) => void
  onSubmit: () => void
}

export default function ReportForm({
  orderId,
  status,
  value,
  errors,
  submitting = false,
  successTicket = null,
  onChange,
  onSubmit,
}: ReportFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form className="card card--lg stack report-form" onSubmit={handleSubmit} noValidate>
      <div className="stack">
        <h2 className="section-title">Laporkan Masalah Pesanan</h2>
        <p className="muted">
          Detail pesanan dilampirkan otomatis, jadi kamu tidak perlu mengetik ulang.
        </p>
      </div>

      {successTicket && (
        <p className="notice notice--success" role="status">
          <strong>Laporan diterima.</strong> Nomor tiket kamu: {successTicket}
        </p>
      )}

      <div className="report-form__attachments">
        <div className="field">
          <label className="field__label" htmlFor="report-order-id">
            ID Pesanan
          </label>
          <input id="report-order-id" className="input" value={orderId} readOnly />
          <span className="muted">Terisi otomatis dari pesanan.</span>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="report-status">
            Status Pesanan
          </label>
          <input id="report-status" className="input" value={status} readOnly />
        </div>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="report-category">
          Kategori masalah <span aria-hidden="true">*</span>
        </label>
        <select
          id="report-category"
          className="select"
          value={value.category}
          onChange={(event) => onChange({ ...value, category: event.target.value })}
          aria-invalid={Boolean(errors.category)}
        >
          <option value="">Pilih kategori</option>
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {errors.category && <span className="field__error">{errors.category}</span>}
      </div>

      <div className="field">
        <label className="field__label" htmlFor="report-description">
          Deskripsi <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="report-description"
          className="textarea"
          value={value.description}
          maxLength={MAX_DESCRIPTION_LENGTH}
          onChange={(event) => onChange({ ...value, description: event.target.value })}
          placeholder="Ceritakan masalah yang kamu alami"
          aria-invalid={Boolean(errors.description)}
        />
        <span className="muted">
          {value.description.length}/{MAX_DESCRIPTION_LENGTH} karakter
        </span>
        {errors.description && <span className="field__error">{errors.description}</span>}
      </div>

      <div className="field">
        <label className="field__label" htmlFor="report-evidence">
          Bukti (opsional)
        </label>
        <input
          id="report-evidence"
          className="input"
          type="file"
          accept="image/*,.pdf"
          onChange={(event) => {
            const file = event.target.files?.[0]
            onChange({
              ...value,
              evidenceName: file?.name,
              evidenceSize: file?.size,
            })
          }}
          aria-invalid={Boolean(errors.evidence)}
        />
        {value.evidenceName && (
          <span className="muted">
            {value.evidenceName} · {((value.evidenceSize ?? 0) / 1024).toFixed(1)} KB
          </span>
        )}
        {errors.evidence && <span className="field__error">{errors.evidence}</span>}
      </div>

      <div className="report-form__actions">
        <button
          type="submit"
          className="button button--primary button--block"
          disabled={submitting}
        >
          {submitting ? 'Mengirim...' : 'Kirim Laporan'}
        </button>
      </div>
    </form>
  )
}
