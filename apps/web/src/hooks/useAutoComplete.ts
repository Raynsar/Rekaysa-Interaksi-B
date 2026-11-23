import { useEffect, useRef } from 'react'
import type { Order } from '../types'
import { fromIso } from '../services/timeService'

export function useAutoComplete(
  orders: Order[],
  now: number,
  onComplete: (orderId: string) => boolean,
): void {
  const completeRef = useRef(onComplete)

  useEffect(() => {
    completeRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    orders.forEach((order) => {
      if (
        order.autoCompleteOptIn &&
        !order.autoCompleted &&
        order.autoCompleteAt &&
        order.status !== 'Selesai' &&
        order.status !== 'Dibatalkan' &&
        fromIso(order.autoCompleteAt) <= now
      ) {
        completeRef.current(order.id)
      }
    })
  }, [orders, now])
}
