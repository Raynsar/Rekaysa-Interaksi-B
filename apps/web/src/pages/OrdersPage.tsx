import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { demoOrders } from '../services/demoData'
import FilterTabs from '../components/FilterTabs'
import OrderCard from '../components/OrderCard'
import EmptyState from '../components/EmptyState'
import { Link } from '../utils/router'
import { FILTER_TABS, type FilterTab, type Order } from '../types'

function matchesTab(order: Order, tab: FilterTab): boolean {
  if (tab === 'Semua') return true
  // "Diterima" is a temporary badge, not a filter tab: it belongs to "Dikirim".
  if (tab === 'Dikirim') return order.status === 'Dikirim' || order.status === 'Diterima'
  return order.status === tab
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('Semua')
  const [query, setQuery] = useState('')

  const counts = useMemo(() => {
    const result = Object.fromEntries(FILTER_TABS.map((tab) => [tab, 0])) as Record<
      FilterTab,
      number
    >
    demoOrders.forEach((order) => {
      FILTER_TABS.forEach((tab) => {
        if (matchesTab(order, tab)) result[tab] += 1
      })
    })
    return result
  }, [])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return demoOrders.filter((order) => {
      if (!matchesTab(order, activeTab)) return false
      if (!needle) return true
      return (
        order.id.toLowerCase().includes(needle) ||
        order.productName.toLowerCase().includes(needle)
      )
    })
  }, [activeTab, query])

  const resetFilters = () => {
    setActiveTab('Semua')
    setQuery('')
  }

  return (
    <div className="stack stack--large">
      <div className="stack">
        <h1 className="page-title">Pesanan Saya</h1>
        <p className="muted">Filter berdasarkan status atau cari berdasarkan ID dan nama produk.</p>
      </div>

      <div className="orders-toolbar">
        <div className="search-box">
          <Search size={20} className="search-box__icon" aria-hidden="true" />
          <input
            type="search"
            className="input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari ID pesanan atau produk"
            aria-label="Cari pesanan"
          />
        </div>
      </div>

      <FilterTabs value={activeTab} counts={counts} onChange={setActiveTab} />

      {filtered.length === 0 ? (
        <EmptyState
          title="Tidak ada pesanan pada status ini"
          description="Coba kata kunci lain atau kembalikan filter ke Semua."
          actionLabel="Reset Filter"
          onAction={resetFilters}
        />
      ) : (
        <div className="order-list">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

      <div className="card stack">
        <strong>Contoh halaman detail pesanan</strong>
        <div className="row">
          <Link to="/orders/ORD-2026-001" className="button button--outline">
            Detail Normal
          </Link>
          <Link to="/orders/ORD-2026-004" className="button button--outline">
            Detail Diterima
          </Link>
          <Link to="/orders/ORD-2026-005" className="button button--outline">
            Detail Selesai
          </Link>
        </div>
      </div>
    </div>
  )
}
