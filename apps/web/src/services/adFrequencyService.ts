import type { AdFrequency } from '../types'
import { HOUR_MS } from './timeService'

export const MAX_ADS_PER_DAY = 3
export const AD_COOLDOWN_HOURS = 24

export function dayKey(now: number): string {
  return new Date(now).toISOString().slice(0, 10)
}

export function canShowAd(frequency: AdFrequency | undefined, now: number): boolean {
  if (!frequency) return true
  if (
    frequency.lastClosedAt !== undefined &&
    now - frequency.lastClosedAt < AD_COOLDOWN_HOURS * HOUR_MS
  ) {
    return false
  }
  if (frequency.date !== dayKey(now)) return true
  return frequency.impressions < MAX_ADS_PER_DAY
}

export function registerImpression(frequency: AdFrequency | undefined, now: number): AdFrequency {
  const date = dayKey(now)
  if (!frequency || frequency.date !== date) {
    return { date, impressions: 1, lastClosedAt: frequency?.lastClosedAt }
  }
  return { ...frequency, impressions: frequency.impressions + 1 }
}

export function closeAd(frequency: AdFrequency | undefined, now: number): AdFrequency {
  const date = dayKey(now)
  const base = frequency && frequency.date === date ? frequency : { date, impressions: 0 }
  return { ...base, lastClosedAt: now }
}
