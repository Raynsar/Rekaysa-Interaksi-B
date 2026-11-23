import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { dayKey } from '../services/adFrequencyService'
import { useAdFrequency } from '../hooks/useAdFrequency'

export default function AdBanner() {
  const { state, now, actions } = useApp()
  const { canShow } = useAdFrequency(state, now, {
    closeAd: actions.closeAd,
    registerImpression: actions.registerAdImpression,
  })
  const registeredRef = useRef<string | null>(null)

  useEffect(() => {
    if (!state.showAds || !canShow) return
    const key = `${dayKey(now)}:${state.adFrequency.lastClosedAt ?? 'none'}`
    if (registeredRef.current === key) return
    registeredRef.current = key
    actions.registerAdImpression()
  }, [
    state.showAds,
    canShow,
    state.adFrequency.lastClosedAt,
    now,
    actions.registerAdImpression,
  ])

  if (!canShow) return null

  return (
    <aside className="ad-banner" aria-label="Iklan">
      <div className="ad-banner__body">
        <span className="ad-banner__label">Iklan</span>
        <strong>Ransel kampus baru, diskon hari ini</strong>
        <span className="ad-banner__hint">Ditutup dalam satu ketukan tanpa membuka aplikasi.</span>
      </div>
      <button
        type="button"
        className="ad-banner__close"
        onClick={actions.closeAd}
        aria-label="Tutup iklan"
      >
        <X size={20} aria-hidden="true" />
      </button>
    </aside>
  )
}
