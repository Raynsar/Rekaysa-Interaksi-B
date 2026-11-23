import { useState } from 'react'
import { X } from 'lucide-react'

/** Static Phase 3 banner used only for layout verification. */
export default function AdBanner() {
  const [closed, setClosed] = useState(false)

  if (closed) return null

  return (
    <aside className="ad-banner" aria-label="Iklan">
      <div className="ad-banner__body">
        <span className="ad-banner__label">Iklan · contoh statis</span>
        <strong>Ransel kampus baru, diskon hari ini</strong>
        <span className="ad-banner__hint">Banner tidak menutupi aksi utama.</span>
      </div>
      <button
        type="button"
        className="ad-banner__close"
        onClick={() => setClosed(true)}
        aria-label="Tutup iklan"
      >
        <X size={20} aria-hidden="true" />
      </button>
    </aside>
  )
}
