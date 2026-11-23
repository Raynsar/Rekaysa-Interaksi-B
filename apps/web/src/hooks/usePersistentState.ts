import { useCallback, useRef, useState } from 'react'
import {
  createStorageService,
  storageService,
  type WriteOptions,
} from '../services/storageService'

type StorageService = ReturnType<typeof createStorageService>

export interface UsePersistentStateOptions {
  service?: StorageService
  writeOptions?: WriteOptions
}

export function usePersistentState<T>(
  key: string,
  initial: T | (() => T),
  options: UsePersistentStateOptions = {},
) {
  const service = options.service ?? storageService
  const initialRef = useRef(initial)
  const freshValue = () =>
    typeof initialRef.current === 'function'
      ? (initialRef.current as () => T)()
      : initialRef.current

  const [state, setState] = useState<T>(() => service.read(key, freshValue()))
  const stateRef = useRef(state)
  const [error, setError] = useState<string | null>(null)

  const update = useCallback(
    (next: T | ((previous: T) => T)): boolean => {
      const value = typeof next === 'function' ? (next as (previous: T) => T)(stateRef.current) : next
      try {
        service.write(key, value, options.writeOptions)
        stateRef.current = value
        setState(value)
        setError(null)
        return true
      } catch (cause) {
        // Rollback: keep the previous value and surface the error.
        setError(cause instanceof Error ? cause.message : 'Storage write failed')
        return false
      }
    },
    [key, service, options.writeOptions],
  )

  const reset = useCallback(() => {
    const value = freshValue()
    try {
      service.write(key, value, { bypassFailure: true })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Storage reset failed')
      return false
    }
    stateRef.current = value
    setState(value)
    setError(null)
    return true
  }, [key, service])

  return { state, update, error, reset }
}
