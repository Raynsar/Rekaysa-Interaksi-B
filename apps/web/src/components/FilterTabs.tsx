import { FILTER_TABS, type FilterTab } from '../types'

interface FilterTabsProps {
  value: FilterTab
  counts: Record<FilterTab, number>
  onChange: (tab: FilterTab) => void
}

export default function FilterTabs({ value, counts, onChange }: FilterTabsProps) {
  return (
    <div className="filter-tabs" role="tablist" aria-label="Filter status pesanan">
      {FILTER_TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={value === tab}
          className={`filter-tabs__tab${value === tab ? ' filter-tabs__tab--active' : ''}`}
          onClick={() => onChange(tab)}
        >
          {tab}
          <span className="filter-tabs__count">{counts[tab]}</span>
        </button>
      ))}
    </div>
  )
}
