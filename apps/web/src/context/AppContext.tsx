import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react'
import { useToast } from '../components/ToastProvider'
import { useAutoComplete } from '../hooks/useAutoComplete'
import { useClock } from '../hooks/useClock'
import { usePersistentState } from '../hooks/usePersistentState'
import { closeAd, registerImpression } from '../services/adFrequencyService'
import { demoProduct } from '../services/demoData'
import { autoCompleteIn, completeOrderIn } from '../services/orderService'
import {
  computePriceBreakdown,
  getEffectivePrice,
} from '../services/priceService'
import { reportValidator, ticketGenerator, type ReportErrors } from '../services/reportService'
import { storageService } from '../services/storageService'
import {
  APP_STATE_KEY,
  DEMO_STATE_KEY,
  DEMO_WRITE_OPTIONS,
  createInitialState,
  defaultDemoState,
  type AppState,
} from '../services/stateService'
import {
  HOUR_MS,
  estimateRangeLabel,
  isDelayed,
  systemClock,
  toIso,
} from '../services/timeService'
import {
  addNotification,
  buildNotification,
} from '../services/notificationService'
import type {
  DemoState,
  NotificationKind,
  NotificationRecord,
  Order,
  ReportFormValue,
  Ticket,
} from '../types'

interface ReportResult {
  errors: ReportErrors
  ticket: Ticket | null
  storageFailed?: boolean
}

interface AppActions {
  completeOrder: (orderId: string) => boolean
  optInAutoComplete: (orderId: string) => boolean
  recordNotification: (
    orderId: string,
    kind: NotificationKind,
    message: string,
  ) => boolean
  closeAd: () => void
  registerAdImpression: () => void
  setShowAds: (value: boolean) => void
  setNotifyDelay: (value: boolean) => void
  setCartQuantity: (productId: string, quantity: number) => void
  checkout: () => string | null
  saveDraft: (orderId: string, value: ReportFormValue) => void
  clearDraft: (orderId: string) => void
  submitReport: (orderId: string, value: ReportFormValue) => ReportResult
  setDemoFlag: <K extends keyof DemoState>(key: K, value: DemoState[K]) => void
  resetDemo: () => void
  resetAll: () => void
}

interface AppContextValue {
  state: AppState
  demo: DemoState
  now: number
  actions: AppActions
  storageError: string | null
  demoError: string | null
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({
  children,
  initialNow,
}: {
  children: ReactNode
  initialNow?: number
}) {
  const seedNow = useRef(initialNow ?? systemClock.now())
  const appStorage = usePersistentState<AppState>(APP_STATE_KEY, () =>
    createInitialState(seedNow.current),
  )
  const demoStorage = usePersistentState<DemoState>(DEMO_STATE_KEY, defaultDemoState, {
    writeOptions: DEMO_WRITE_OPTIONS,
  })

  const now = useClock(30000, seedNow.current)
  const { showToast } = useToast()
  const state = appStorage.state
  const demo = demoStorage.state

  useEffect(() => {
    storageService.setForceFailure(demo.failStorageWrite)
  }, [demo.failStorageWrite])

  useEffect(() => {
    if (!appStorage.error) return
    showToast(
      `Gagal menyimpan data: ${appStorage.error}. Perubahan dibatalkan.`,
      'error',
    )
  }, [appStorage.error, showToast])

  const recordNotification = useCallback(
    (orderId: string, kind: NotificationKind, message: string): boolean => {
      const forcedFailure = demo.failNotification
      const status: NotificationRecord['status'] = forcedFailure ? 'failed' : 'sent'
      const error = forcedFailure ? 'Demo: layanan notifikasi gagal' : undefined
      let recorded = false

      appStorage.update((previous) => {
        const candidate = buildNotification(orderId, kind, message, now, status, error)
        if (previous.notifications.some((item) => item.id === candidate.id)) return previous
        recorded = true
        return { ...previous, notifications: addNotification(previous.notifications, candidate) }
      })

      return recorded
    },
    [appStorage.update, demo.failNotification, now],
  )

  const completeOrder = useCallback(
    (orderId: string): boolean => {
      let changed = false
      const written = appStorage.update((previous) => {
        const target = previous.orders.find((order) => order.id === orderId)
        if (!target || target.status === 'Selesai' || target.status === 'Dibatalkan') {
          return previous
        }
        changed = true
        return { ...previous, orders: completeOrderIn(previous.orders, orderId) }
      })

      if (!written) return false
      if (changed) {
        recordNotification(orderId, 'auto-complete', `Pesanan ${orderId} telah selesai.`)
      }
      return changed
    },
    [appStorage.update, recordNotification],
  )

  const autoCompleteOrder = useCallback(
    (orderId: string): boolean => {
      let changed = false
      const written = appStorage.update((previous) => {
        const target = previous.orders.find((order) => order.id === orderId)
        if (!target?.autoCompleteOptIn || target.autoCompleted) return previous
        changed = true
        return { ...previous, orders: autoCompleteIn(previous.orders, orderId) }
      })

      if (!written) return false
      if (changed) {
        recordNotification(
          orderId,
          'auto-complete',
          `Pesanan ${orderId} selesai otomatis setelah pilihan Tunggu Otomatis.`,
        )
      }
      return changed
    },
    [appStorage.update, recordNotification],
  )

  const optInAutoComplete = useCallback(
    (orderId: string): boolean =>
      appStorage.update((previous) => ({
        ...previous,
        orders: previous.orders.map((order) =>
          order.id === orderId ? { ...order, autoCompleteOptIn: true } : order,
        ),
      })),
    [appStorage.update],
  )

  const saveDraft = useCallback(
    (orderId: string, value: ReportFormValue) => {
      appStorage.update((previous) => ({
        ...previous,
        reportDrafts: { ...previous.reportDrafts, [orderId]: value },
      }))
    },
    [appStorage.update],
  )

  const clearDraft = useCallback(
    (orderId: string) => {
      appStorage.update((previous) => {
        const drafts = { ...previous.reportDrafts }
        delete drafts[orderId]
        return { ...previous, reportDrafts: drafts }
      })
    },
    [appStorage.update],
  )

  const submitReport = useCallback(
    (orderId: string, value: ReportFormValue): ReportResult => {
      const errors = reportValidator(value)
      if (Object.keys(errors).length > 0) return { errors, ticket: null }

      let issued: Ticket | null = null
      const written = appStorage.update((previous) => {
        const counter = previous.ticketCounter + 1
        const ticket: Ticket = {
          number: ticketGenerator(counter, now),
          orderId,
          category: value.category,
          description: value.description,
          evidenceName: value.evidenceName,
          evidenceSize: value.evidenceSize,
          createdAt: now,
        }
        issued = ticket
        const drafts = { ...previous.reportDrafts }
        delete drafts[orderId]
        return {
          ...previous,
          tickets: [...previous.tickets, ticket],
          ticketCounter: counter,
          reportDrafts: drafts,
        }
      })

      return { errors: {}, ticket: issued, storageFailed: !written }
    },
    [appStorage.update, now],
  )

  const closeAdAction = useCallback(
    () => appStorage.update((previous) => ({ ...previous, adFrequency: closeAd(previous.adFrequency, now) })),
    [appStorage.update, now],
  )

  const registerAdImpressionAction = useCallback(
    () =>
      appStorage.update((previous) => ({
        ...previous,
        adFrequency: registerImpression(previous.adFrequency, now),
      })),
    [appStorage.update, now],
  )

  const setShowAds = useCallback(
    (value: boolean) => appStorage.update((previous) => ({ ...previous, showAds: value })),
    [appStorage.update],
  )

  const setNotifyDelay = useCallback(
    (value: boolean) => appStorage.update((previous) => ({ ...previous, notifyDelay: value })),
    [appStorage.update],
  )

  const setCartQuantity = useCallback(
    (productId: string, quantity: number) =>
      appStorage.update((previous) => {
        const current = previous.cart.find((item) => item.productId === productId)
        if (quantity <= 0) {
          return {
            ...previous,
            cart: previous.cart.filter((item) => item.productId !== productId),
          }
        }
        if (current) {
          return {
            ...previous,
            cart: previous.cart.map((item) =>
              item.productId === productId ? { ...item, quantity } : item,
            ),
          }
        }
        return { ...previous, cart: [...previous.cart, { productId, quantity }] }
      }),
    [appStorage.update],
  )

  const checkout = useCallback((): string | null => {
    const quantity =
      state.cart.find((item) => item.productId === demoProduct.id)?.quantity ?? 0
    if (quantity <= 0) return null

    const effective = getEffectivePrice(demoProduct.price, demo.priceOverride)
    const unit = effective.breakdown
    const price = computePriceBreakdown({
      basePrice: unit.basePrice * quantity,
      oversizeFee: unit.oversizeFee * quantity,
      shippingFee: unit.shippingFee,
      serviceFee: unit.serviceFee,
      discount: unit.discount * quantity,
    })

    let orderId: string | null = null
    const written = appStorage.update((previous) => {
      const counter = previous.orderCounter + 1
      const id = `ORD-${new Date(now).getFullYear()}-${String(counter).padStart(3, '0')}`
      orderId = id
      return {
        ...previous,
        orderCounter: counter,
        cart: [],
        orders: [
          ...previous.orders,
          {
            id,
            productName: demoProduct.name,
            status: 'Dikemas',
            items: [{ name: demoProduct.name, quantity, price: unit.total }],
            price,
            estimateMinDays: 3,
            estimateMaxDays: 6,
            estimateLabel: estimateRangeLabel(3, 6),
            estimateEndAt: toIso(now + 4 * 24 * HOUR_MS),
            placedAt: toIso(now),
            trackingNote: 'Pembayaran berhasil, pesanan sedang disiapkan penjual.',
          },
        ],
      }
    })

    return written ? orderId : null
  }, [appStorage.update, demo.priceOverride, now, state.cart])

  const setDemoFlag = useCallback(
    <K extends keyof DemoState>(key: K, value: DemoState[K]) => {
      demoStorage.update((previous) => ({ ...previous, [key]: value }))
    },
    [demoStorage.update],
  )

  const resetDemo = useCallback(() => {
    demoStorage.reset()
  }, [demoStorage.reset])

  const resetAll = useCallback(() => {
    appStorage.reset()
    demoStorage.reset()
  }, [appStorage.reset, demoStorage.reset])

  useEffect(() => {
    if (!state.notifyDelay) return
    state.orders.forEach((order) => {
      if (isDelayed(order, now)) {
        recordNotification(
          order.id,
          'delay',
          `Pesanan ${order.id} terlambat melewati batas estimasi. Periksa status atau ajukan bantuan.`,
        )
      }
    })
  }, [state.orders, state.notifyDelay, now, recordNotification])

  const seenNotifications = useRef<Set<string>>(
    new Set(state.notifications.map((item) => item.id)),
  )

  useEffect(() => {
    state.notifications.forEach((notification) => {
      if (seenNotifications.current.has(notification.id)) return
      seenNotifications.current.add(notification.id)
      if (notification.status === 'sent') {
        showToast(notification.message, notification.kind === 'delay' ? 'warning' : 'success')
      } else {
        showToast(`Notifikasi gagal dicatat: ${notification.error ?? notification.message}`, 'error')
      }
    })
  }, [state.notifications, showToast])

  useAutoComplete(state.orders, now, autoCompleteOrder)

  const actions = useMemo<AppActions>(
    () => ({
      completeOrder,
      optInAutoComplete,
      recordNotification,
      closeAd: closeAdAction,
      registerAdImpression: registerAdImpressionAction,
      setShowAds,
      setNotifyDelay,
      setCartQuantity,
      checkout,
      saveDraft,
      clearDraft,
      submitReport,
      setDemoFlag,
      resetDemo,
      resetAll,
    }),
    [
      completeOrder,
      optInAutoComplete,
      recordNotification,
      closeAdAction,
      registerAdImpressionAction,
      setShowAds,
      setNotifyDelay,
      setCartQuantity,
      checkout,
      saveDraft,
      clearDraft,
      submitReport,
      setDemoFlag,
      resetDemo,
      resetAll,
    ],
  )

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      demo,
      now,
      actions,
      storageError: appStorage.error,
      demoError: demoStorage.error,
    }),
    [state, demo, now, actions, appStorage.error, demoStorage.error],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used inside AppProvider')
  return context
}

export function useOrders(): Order[] {
  return useApp().state.orders
}
