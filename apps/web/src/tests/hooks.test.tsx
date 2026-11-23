import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useAdFrequency } from '../hooks/useAdFrequency'
import { useAutoComplete } from '../hooks/useAutoComplete'
import { useClock } from '../hooks/useClock'
import { usePersistentState } from '../hooks/usePersistentState'
import { dayKey } from '../services/adFrequencyService'
import { createStorageService } from '../services/storageService'
import { createInitialState, type AppState } from '../services/stateService'
import { HOUR_MS, systemClock, toIso } from '../services/timeService'
import { demoProduct } from '../services/demoData'
import { computePriceBreakdown } from '../services/priceService'
import type { Order } from '../types'

const NOW = Date.UTC(2026, 1, 10, 9)

function memoryStorage() {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value)
    },
    removeItem: (key: string) => {
      values.delete(key)
    },
    values,
  }
}

function order(overrides: Partial<Order> = {}): Order {
  return {
    id: 'ORD-TEST',
    productName: 'Produk Uji',
    status: 'Diterima',
    items: [],
    price: computePriceBreakdown(demoProduct.price),
    estimateMinDays: 2,
    estimateMaxDays: 4,
    estimateLabel: '2–4 hari',
    estimateEndAt: toIso(NOW + HOUR_MS),
    placedAt: toIso(NOW - 24 * HOUR_MS),
    autoCompleteAt: toIso(NOW - HOUR_MS),
    ...overrides,
  }
}

describe('usePersistentState', () => {
  it('AC-039: a failed write keeps the previous state and reports the error', () => {
    const storage = memoryStorage()
    const service = createStorageService(storage)
    const { result } = renderHook(() =>
      usePersistentState('state-key', { count: 0 }, { service }),
    )

    let written = false
    act(() => {
      written = result.current.update({ count: 1 })
    })
    expect(written).toBe(true)
    expect(result.current.state.count).toBe(1)
    expect(JSON.parse(storage.values.get('state-key') ?? '{}').count).toBe(1)

    act(() => service.setForceFailure(true))
    act(() => {
      written = result.current.update({ count: 2 })
    })

    expect(written).toBe(false)
    expect(result.current.state.count).toBe(1)
    expect(result.current.error).toBe('Storage write failed')
    expect(JSON.parse(storage.values.get('state-key') ?? '{}').count).toBe(1)

    act(() => service.setForceFailure(false))
    act(() => {
      written = result.current.reset()
    })
    expect(written).toBe(true)
    expect(result.current.state.count).toBe(0)
    expect(result.current.error).toBeNull()
  })
})

describe('useAutoComplete', () => {
  it('does not run without opt-in and runs once after opt-in', () => {
    const onComplete = vi.fn()
    const overdue = order({ autoCompleteOptIn: false })
    const { rerender } = renderHook(
      ({ orders, now }) => useAutoComplete(orders, now, onComplete),
      { initialProps: { orders: [overdue], now: NOW } },
    )

    expect(onComplete).not.toHaveBeenCalled()

    rerender({ orders: [{ ...overdue, autoCompleteOptIn: true }], now: NOW })
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith('ORD-TEST')

    rerender({ orders: [{ ...overdue, autoCompleteOptIn: true, autoCompleted: true }], now: NOW })
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('does not complete a future deadline', () => {
    const onComplete = vi.fn()
    const future = order({
      autoCompleteOptIn: true,
      autoCompleteAt: toIso(NOW + HOUR_MS),
    })
    renderHook(() => useAutoComplete([future], NOW, onComplete))
    expect(onComplete).not.toHaveBeenCalled()
  })
})

describe('useAdFrequency', () => {
  const actions = { closeAd: vi.fn(), registerImpression: vi.fn() }
  const baseState: AppState = { ...createInitialState(NOW), adFrequency: { date: dayKey(NOW), impressions: 0 } }

  it('AC-017: hides the ad after 3 impressions', () => {
    const { result, rerender } = renderHook(
      ({ state, now }) => useAdFrequency(state, now, actions),
      { initialProps: { state: baseState, now: NOW } },
    )
    expect(result.current.canShow).toBe(true)

    rerender({
      state: { ...baseState, adFrequency: { date: dayKey(NOW), impressions: 3 } },
      now: NOW,
    })
    expect(result.current.canShow).toBe(false)
  })

  it('AC-017: hides the ad during the 24-hour close cooldown', () => {
    const state: AppState = {
      ...baseState,
      adFrequency: { date: dayKey(NOW), impressions: 1, lastClosedAt: NOW - 2 * HOUR_MS },
    }
    const { result, rerender } = renderHook(
      ({ current, now }) => useAdFrequency(current, now, actions),
      { initialProps: { current: state, now: NOW } },
    )
    expect(result.current.canShow).toBe(false)

    rerender({ current: state, now: NOW + 22 * HOUR_MS })
    expect(result.current.canShow).toBe(true)
  })

  it('honours the global showAds switch', () => {
    const { result } = renderHook(() =>
      useAdFrequency({ ...baseState, showAds: false }, NOW, actions),
    )
    expect(result.current.canShow).toBe(false)
  })
})

describe('useClock', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('is deterministic when given an initial time and an injected clock', () => {
    vi.useFakeTimers()
    const nowSpy = vi.spyOn(systemClock, 'now').mockReturnValue(NOW)
    const { result } = renderHook(() => useClock(1000, NOW))

    expect(result.current).toBe(NOW)

    nowSpy.mockReturnValue(NOW + 1000)
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current).toBe(NOW + 1000)
  })
})
