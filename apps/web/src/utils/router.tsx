import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react'

interface RouterValue {
  path: string
  search: string
  navigate: (to: string) => void
}

const RouterContext = createContext<RouterValue | null>(null)

function normalize(to: string): string {
  const value = to.startsWith('/') ? to : `/${to}`
  return value || '/'
}

function readLocation(): { path: string; search: string } {
  const raw = window.location.hash.replace(/^#/, '')
  const separator = raw.indexOf('?')
  if (separator === -1) return { path: normalize(raw), search: '' }
  return { path: normalize(raw.slice(0, separator)), search: raw.slice(separator + 1) }
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState(readLocation)

  useEffect(() => {
    const onHashChange = () => setLocation(readLocation())
    window.addEventListener('hashchange', onHashChange)

    if (!window.location.hash) {
      window.location.replace('#/')
    }

    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = useCallback((to: string) => {
    window.location.hash = normalize(to)
  }, [])

  const value = useMemo(
    () => ({ path: location.path, search: location.search, navigate }),
    [location.path, location.search, navigate],
  )

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

export function useRouter(): RouterValue {
  const context = useContext(RouterContext)
  if (!context) throw new Error('useRouter must be used inside RouterProvider')
  return context
}

interface LinkProps {
  to: string
  children: ReactNode
  className?: string
  'aria-label'?: string
}

export function useNavigate(): (to: string) => void {
  return useRouter().navigate
}

export function Link({ to, children, className, 'aria-label': ariaLabel }: LinkProps) {
  const { navigate } = useRouter()

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
    event.preventDefault()
    navigate(to)
  }

  return (
    <a
      href={`#${normalize(to)}`}
      className={className}
      aria-label={ariaLabel}
      onClick={handleClick}
    >
      {children}
    </a>
  )
}

export function matchRoute(pattern: string, path: string): Record<string, string> | null {
  const patternParts = pattern.split('/').filter(Boolean)
  const pathParts = path.split('/').filter(Boolean)

  if (patternParts.length !== pathParts.length) return null

  const params: Record<string, string> = {}
  for (let index = 0; index < patternParts.length; index += 1) {
    const patternPart = patternParts[index]
    if (patternPart.startsWith(':')) {
      params[patternPart.slice(1)] = decodeURIComponent(pathParts[index])
    } else if (patternPart !== pathParts[index]) {
      return null
    }
  }

  return params
}
