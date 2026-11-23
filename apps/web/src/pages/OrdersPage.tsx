import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Link, useRouter } from '../utils/router'
import { useApp } from '../context/AppContext'
import { countByFilter, matchesFilter } from '../services/orderService'
import FilterTabs from '../components/FilterTabs'
import OrderCard from '../components/OrderCard'
import EmptyState from '../components/EmptyState'
import { FILTER_TABS, type FilterTab } from '../types'

function initialTab(search: string): FilterTab {
  const requested = new URLSearchParams(search).get('status')
  return FILTER_TABS.find((tab) => tab === requested) ?? 'Semua'
}

export default function OrdersPage() {
  const { state } = useApp()
  const { search } = useRouter()
  const [activeTab, setActiveTab] = useState<FilterTab>(() => initialTab(search))
  const [query, setQuery] = useState('')

  const counts = useMemo(() => countByFilter(state.orders), [state.orders])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return state.orders.filter((order) => {
      if (!matchesFilter(order, activeTab)) return false
      if (!needle) return true
      return (
        order.id.toLowerCase().includes(needle) ||
        order.productName.toLowerCase().includes(needle)
      )
    })
  }, [state.orders, activeTab, query])

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
