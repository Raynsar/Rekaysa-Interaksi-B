import type { ReactNode } from 'react'
import { ClipboardList, Home, Package, ShoppingCart, User } from 'lucide-react'
import { Link, useRouter } from '../utils/router'
import AdBanner from './AdBanner'

const NAV_ITEMS = [
  { to: '/', label: 'Beranda', icon: Home },
  { to: '/product', label: 'Produk', icon: Package },
  { to: '/cart', label: 'Keranjang', icon: ShoppingCart },
  { to: '/orders', label: 'Pesanan', icon: ClipboardList },
  { to: '/account', label: 'Akun', icon: User },
]

function isActive(path: string, to: string): boolean {
  if (to === '/') return path === '/'
  return path === to || path.startsWith(`${to}/`)
}

export default function AppShell({ children }: { children: ReactNode }) {
  const { path } = useRouter()

  const renderNavItem = (item: (typeof NAV_ITEMS)[number]) => {
    const Icon = item.icon
    return (
      <Link
        key={item.to}
        to={item.to}
        className={`nav-link${isActive(path, item.to) ? ' nav-link--active' : ''}`}
        aria-label={item.label}
      >
        <Icon size={20} aria-hidden="true" />
        <span>{item.label}</span>
      </Link>
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Navigasi utama">
        <div className="sidebar__brand">Shopee Tracking</div>
        <nav className="sidebar__nav">{NAV_ITEMS.map(renderNavItem)}</nav>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div className="topbar__brand">Shopee Tracking</div>
          <nav className="topbar__nav tablet-nav" aria-label="Navigasi tablet">
            {NAV_ITEMS.map(renderNavItem)}
          </nav>
          <Link to="/account" className="topbar__account" aria-label="Buka akun">
            <User size={20} aria-hidden="true" />
          </Link>
        </header>

        <AdBanner />
        <main className="page-content">{children}</main>

        <nav className="bottom-nav" aria-label="Navigasi bawah">
          {NAV_ITEMS.map(renderNavItem)}
        </nav>
      </div>
    </div>
  )
}
