import type { ReportFormValue } from '../types'

export type ReportErrors = Partial<Record<'category' | 'description' | 'evidence', string>>

export const MAX_DESCRIPTION_LENGTH = 1000
export const MAX_EVIDENCE_BYTES = 5 * 1024 * 1024

export function reportValidator(value: ReportFormValue): ReportErrors {
  const errors: ReportErrors = {}

  if (!value.category) errors.category = 'Kategori wajib dipilih.'
  if (!value.description.trim()) {
    errors.description = 'Deskripsi wajib diisi.'
  } else if (value.description.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `Deskripsi maksimal ${MAX_DESCRIPTION_LENGTH} karakter.`
  }
  if (value.evidenceSize !== undefined && value.evidenceSize > MAX_EVIDENCE_BYTES) {
    errors.evidence = 'Ukuran bukti maksimal 5MB.'
  }

  return errors
}

export function ticketGenerator(counter: number, now: number): string {
  const year = new Date(now).getFullYear()
  return `TKT-${year}-${String(counter).padStart(6, '0')}`
}
