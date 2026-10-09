import { useMemo } from 'react'
import { Filter, RotateCcw, X, Search } from 'lucide-react'
import { CONCEPT_CATEGORIES } from '../data'

export default function CategoryFilterBar({
  nodes,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onClearSearch,
  onResetFilters,
  matchCount,
  totalCount,
}) {
  const hasActiveFilters = selectedCategory !== 'all' || Boolean(searchQuery.trim())

  // Calculate count of nodes per category
  const categoryCounts = useMemo(() => {
    const counts = { all: nodes.length }
    nodes.forEach((node) => {
      const key = (node.data?.categoryKey || '').toLowerCase()
      counts[key] = (counts[key] || 0) + 1
    })
    return counts
  }, [nodes])

  return (
    <div
      role="region"
      aria-label="Category and search filters"
      className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md px-3 sm:px-4 py-2 z-10 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
    >
      {/* Category Filter Pills (horizontal scrollable on mobile) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
        <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1 mr-1 shrink-0">
          <Filter className="w-3 h-3 text-indigo-400" />
          <span className="hidden sm:inline">Category:</span>
        </span>

        {/* 'All' Filter Pill */}
        <button
          onClick={() => onSelectCategory('all')}
          aria-pressed={selectedCategory === 'all'}
          aria-label="Filter all concepts"
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 cursor-pointer focus-visible:ring-1 focus-visible:ring-indigo-500 ${
            selectedCategory === 'all'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
              : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
          }`}
        >
          <span>All</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              selectedCategory === 'all'
                ? 'bg-indigo-700/80 text-indigo-100'
                : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {categoryCounts.all || 0}
          </span>
        </button>

        {/* Individual Category Pills */}
        {CONCEPT_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.key
          const count = categoryCounts[cat.key] || 0
          if (count === 0 && !isSelected) return null

          return (
            <button
              key={cat.key}
              onClick={() => onSelectCategory(isSelected ? 'all' : cat.key)}
              aria-pressed={isSelected}
              aria-label={`Filter by ${cat.label}`}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 cursor-pointer focus-visible:ring-1 focus-visible:ring-indigo-500 ${
                isSelected
                  ? 'bg-zinc-800 text-white border border-indigo-500/60 shadow-sm'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
              }`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected
                    ? 'bg-zinc-700 text-zinc-200'
                    : 'bg-zinc-800/80 text-zinc-400'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Filter Status & Reset Action */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto ml-auto">
          <span className="text-[11px] text-zinc-400 flex items-center gap-1">
            <Search className="w-3 h-3 text-indigo-400" />
            <span>
              Matches: <strong className="text-zinc-200">{matchCount}</strong> of{' '}
              {totalCount}
            </span>
          </span>

          {searchQuery.trim() && (
            <button
              onClick={onClearSearch}
              aria-label="Clear active search text"
              className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
            >
              <span>Clear search</span>
              <X className="w-3 h-3 text-zinc-500" />
            </button>
          )}

          <button
            onClick={onResetFilters}
            aria-label="Reset all search filters"
            className="text-[11px] font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      )}
    </div>
  )
}
