import { useState, type FormEvent } from 'react'
import type { OrderStatus } from '../types'

interface ReportPayload {
  category: string
  description: string
  evidenceName?: string
  evidenceSize?: number
}

interface ReportFormProps {
  orderId: string
  status: OrderStatus
  defaultCategory: string
  onSubmit: (payload: ReportPayload) => void
}

type FieldErrors = Partial<Record<'category' | 'description' | 'evidence', string>>

const MAX_DESCRIPTION = 1000
const MAX_EVIDENCE_BYTES = 5 * 1024 * 1024

const CATEGORY_OPTIONS = [
  'Paket belum diterima',
  'Paket rusak',
  'Barang tidak sesuai',
  'Status pesanan tidak akurat',
  'Masalah pembayaran',
  'Lainnya',
]

function suggestedCategory(status: OrderStatus): string {
  if (status === 'Dikirim') return 'Paket belum diterima'
  if (status === 'Belum Bayar') return 'Masalah pembayaran'
  if (status === 'Selesai') return 'Status pesanan tidak akurat'
  return 'Lainnya'
}

export default function ReportForm({
  orderId,
  status,
  defaultCategory,
  onSubmit,
}: ReportFormProps) {
  const [category, setCategory] = useState(defaultCategory || suggestedCategory(status))
  const [description, setDescription] = useState('')
  const [evidence, setEvidence] = useState<File | null>(null)
  const [errors, setErrors] = useState<FieldErrors>({})

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors: FieldErrors = {}
    if (!category) nextErrors.category = 'Kategori wajib dipilih.'
    if (!description.trim()) {
      nextErrors.description = 'Deskripsi wajib diisi.'
    } else if (description.length > MAX_DESCRIPTION) {
      nextErrors.description = `Deskripsi maksimal ${MAX_DESCRIPTION} karakter.`
    }
    if (evidence && evidence.size > MAX_EVIDENCE_BYTES) {
      nextErrors.evidence = 'Ukuran bukti maksimal 5MB.'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    onSubmit({
      category,
      description: description.trim(),
      evidenceName: evidence?.name,
      evidenceSize: evidence?.size,
    })
  }

  return (
    <form className="card card--lg stack report-form" onSubmit={handleSubmit} noValidate>
      <div className="stack">
        <h2 className="section-title">Laporkan Masalah Pesanan</h2>
        <p className="muted">
          Detail pesanan dilampirkan otomatis, jadi kamu tidak perlu mengetik ulang.
        </p>
      </div>

      <div className="report-form__attachments">
        <div className="field">
          <label className="field__label" htmlFor="report-order-id">
            ID Pesanan
          </label>
          <input
            id="report-order-id"
            className="input"
            value={orderId}
            readOnly
            aria-describedby="report-order-id-hint"
          />
          <span id="report-order-id-hint" className="muted">
            Terisi otomatis dari pesanan.
          </span>
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
          value={category}
          onChange={(event) => setCategory(event.target.value)}
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
          value={description}
          maxLength={MAX_DESCRIPTION}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Ceritakan masalah yang kamu alami"
          aria-invalid={Boolean(errors.description)}
        />
        <span className="muted">
          {description.length}/{MAX_DESCRIPTION} karakter
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
          onChange={(event) => setEvidence(event.target.files?.[0] ?? null)}
          aria-invalid={Boolean(errors.evidence)}
        />
        {evidence && (
          <span className="muted">
            {evidence.name} · {(evidence.size / 1024).toFixed(1)} KB
          </span>
        )}
        {errors.evidence && <span className="field__error">{errors.evidence}</span>}
      </div>

      <div className="report-form__actions">
        <button type="submit" className="button button--primary button--block">
          Kirim Laporan
        </button>
      </div>
    </form>
  )
}
