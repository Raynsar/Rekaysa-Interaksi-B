import type { Order } from '../types'

export const HOUR_MS = 60 * 60 * 1000
export const AUTO_COMPLETE_AFTER_HOURS = 48
export const REMINDER_LEAD_HOURS = 24

export interface Clock {
  now(): number
}

export const systemClock: Clock = {
  now: () => Date.now(),
}

export function toIso(timestamp: number): string {
  return new Date(timestamp).toISOString()
}

export function fromIso(value: string | number): number {
  return typeof value === 'number' ? value : Date.parse(value)
}

export function hoursUntil(deadline: string | number, now: number): number {
  return (fromIso(deadline) - now) / HOUR_MS
}

export function autoCompleteAtFromDelivered(deliveredAt: string | number): string {
  return toIso(fromIso(deliveredAt) + AUTO_COMPLETE_AFTER_HOURS * HOUR_MS)
}

export function reminderAtFromAutoComplete(autoCompleteAt: string | number): number {
  return fromIso(autoCompleteAt) - REMINDER_LEAD_HOURS * HOUR_MS
}

export function estimateRangeLabel(minDays: number, maxDays: number): string {
  return `${minDays}–${maxDays} hari`
}

const ACTIVE_SHIPPING_STATUSES = ['Dikemas', 'Dikirim', 'Diterima'] as const

type DelaySubject = Pick<Order, 'status' | 'estimateEndAt'>
type ReminderSubject = Pick<Order, 'status' | 'autoCompleteAt'>

export function isDelayed(order: DelaySubject, now: number): boolean {
  if (!(ACTIVE_SHIPPING_STATUSES as readonly string[]).includes(order.status)) return false
  return now > fromIso(order.estimateEndAt)
}

export function isReminderDue(order: ReminderSubject, now: number): boolean {
  if (!order.autoCompleteAt) return false
  if (order.status === 'Selesai' || order.status === 'Dibatalkan') return false
  const reminderAt = reminderAtFromAutoComplete(order.autoCompleteAt)
  const deadline = fromIso(order.autoCompleteAt)
  return now >= reminderAt && now < deadline
}
