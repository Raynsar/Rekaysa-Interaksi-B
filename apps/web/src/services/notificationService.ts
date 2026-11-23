import type { NotificationKind, NotificationRecord } from '../types'

export function notificationId(orderId: string, kind: NotificationKind): string {
  return `${orderId}:${kind}`
}

export function buildNotification(
  orderId: string,
  kind: NotificationKind,
  message: string,
  createdAt: number,
  status: NotificationRecord['status'] = 'sent',
  error?: string,
): NotificationRecord {
  return { id: notificationId(orderId, kind), orderId, kind, message, createdAt, status, error }
}

/** Keeps the first delivery for a given `${orderId}:${kind}` pair. */
export function addNotification(
  current: NotificationRecord[],
  incoming: NotificationRecord,
): NotificationRecord[] {
  if (current.some((item) => item.id === incoming.id)) return current
  return [...current, incoming]
}
