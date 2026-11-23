export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export interface WriteOptions {
  /** Used by the demo flag store so it can be switched off after a forced failure. */
  bypassFailure?: boolean
}

export class StorageWriteError extends Error {
  constructor(message = 'Storage write failed') {
    super(message)
    this.name = 'StorageWriteError'
  }
}

export function createStorageService(storage: StorageLike) {
  let forceWriteFailure = false

  const read = <T>(key: string, fallback: T): T => {
    try {
      const raw = storage.getItem(key)
      if (raw === null) return fallback
      return JSON.parse(raw) as T
    } catch (error) {
      console.warn(`Failed to read storage key "${key}"`, error)
      return fallback
    }
  }

  const write = <T>(key: string, value: T, options: WriteOptions = {}): void => {
    if (forceWriteFailure && !options.bypassFailure) {
      throw new StorageWriteError()
    }
    storage.setItem(key, JSON.stringify(value))
  }

  const remove = (key: string, options: WriteOptions = {}): void => {
    if (forceWriteFailure && !options.bypassFailure) {
      throw new StorageWriteError()
    }
    storage.removeItem(key)
  }

  return {
    read,
    write,
    remove,
    setForceFailure(value: boolean) {
      forceWriteFailure = value
    },
    getForceFailure() {
      return forceWriteFailure
    },
  }
}

const memoryStorage: StorageLike = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}

export const storageService = createStorageService(
  typeof window === 'undefined' ? memoryStorage : window.localStorage,
)
