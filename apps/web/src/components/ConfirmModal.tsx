import { useEffect } from 'react'

interface ConfirmModalProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onClose: () => void
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Ya, Selesaikan',
  cancelLabel = 'Batal',
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-modal-title" className="section-title">
          {title}
        </h2>
        <p className="muted">{message}</p>
        <div className="modal__actions">
          <button type="button" className="button button--outline" onClick={onClose}>
            {cancelLabel}
          </button>
          <button type="button" className="button button--primary" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
