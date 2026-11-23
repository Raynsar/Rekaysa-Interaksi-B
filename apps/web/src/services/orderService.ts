import { FILTER_TABS, type FilterTab, type Order } from '../types'

export function canCompleteOrder(order: Order): boolean {
  return order.status === 'Diterima' || order.receivedBadge === true
}

export function matchesFilter(order: Order, tab: FilterTab): boolean {
  if (tab === 'Semua') return true
  // "Diterima" is a temporary badge, so it is counted inside "Dikirim".
  if (tab === 'Dikirim') return order.status === 'Dikirim' || order.status === 'Diterima'
  return order.status === tab
}

export function countByFilter(orders: Order[]): Record<FilterTab, number> {
  const counts = Object.fromEntries(FILTER_TABS.map((tab) => [tab, 0])) as Record<
    FilterTab,
    number
  >
  orders.forEach((order) => {
    FILTER_TABS.forEach((tab) => {
      if (matchesFilter(order, tab)) counts[tab] += 1
    })
  })
  return counts
}

function reduceOrder(order: Order, auto: boolean): Order {
  return {
    ...order,
    status: 'Selesai',
    receivedBadge: false,
    autoCompleteOptIn: false,
    autoCompleted: auto ? true : order.autoCompleted,
  }
}

export function completeOrderIn(orders: Order[], orderId: string): Order[] {
  return orders.map((order) =>
    order.id === orderId && order.status !== 'Selesai' && order.status !== 'Dibatalkan'
      ? reduceOrder(order, false)
      : order,
  )
}

export function autoCompleteIn(orders: Order[], orderId: string): Order[] {
  return orders.map((order) =>
    order.id === orderId && order.autoCompleteOptIn && !order.autoCompleted
      ? reduceOrder(order, true)
      : order,
  )
}
