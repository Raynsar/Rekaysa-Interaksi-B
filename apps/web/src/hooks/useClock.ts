import { useEffect, useState } from 'react'
import { systemClock } from '../services/timeService'

export function useClock(intervalMs = 30000, initialNow?: number): number {
  const [now, setNow] = useState(() => initialNow ?? systemClock.now())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(systemClock.now()), intervalMs)
    return () => window.clearInterval(timer)
  }, [intervalMs])

  return now
}
