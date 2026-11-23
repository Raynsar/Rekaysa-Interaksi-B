import type { AppState } from '../services/stateService'
import { canShowAd } from '../services/adFrequencyService'

interface AdActions {
  closeAd: () => void
  registerImpression: () => void
}

export function useAdFrequency(state: AppState, now: number, actions: AdActions) {
  return {
    canShow: state.showAds && canShowAd(state.adFrequency, now),
    impressions: state.adFrequency.impressions,
    lastClosedAt: state.adFrequency.lastClosedAt,
    closeAd: actions.closeAd,
    registerImpression: actions.registerImpression,
  }
}
