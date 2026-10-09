import { useState } from 'react'
import {
  Compass,
  Search,
  Plus,
  Maximize2,
  LayoutGrid,
  PanelLeft,
  PanelRight,
  X,
  RotateCcw,
  Download,
  Upload,
  Check,
  Loader2,
} from 'lucide-react'

export default function Toolbar({
  searchQuery,
  onSearchChange,
  onClearSearch,
  onAddNode,
  onFitView,
  onAutoLayout,
  onExport,
  onImportClick,
  toggleLeftSidebar,
  toggleRightSidebar,
  leftSidebarOpen,
  rightSidebarOpen,
  hasActiveFilters,
  onResetFilters,
  matchCount,
  totalCount,
}) {
  const [layoutLoading, setLayoutLoading] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)

  const handleAutoLayoutClick = () => {
    setLayoutLoading(true)
    onAutoLayout()
    setTimeout(() => {
      setLayoutLoading(false)
    }, 500)
  }

  const handleExportClick = () => {
    setExportSuccess(true)
    onExport()
    setTimeout(() => {
      setExportSuccess(false)
    }, 1200)
  }

  return (
    <header className="h-14 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between gap-2 sm:gap-3 z-20 shrink-0">
      {/* Left: Branding & Left Sidebar Toggle */}
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 shrink-0">
        <button
          onClick={toggleLeftSidebar}
          aria-label={leftSidebarOpen ? 'Collapse left sidebar' : 'Expand left sidebar'}
          className="relative group p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70 focus-visible:ring-2 focus-visible:ring-indigo-500/60 transition-colors cursor-pointer"
        >
          <PanelLeft className="w-4 h-4" />
          <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute left-0 -bottom-8 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-md text-[10px] text-zinc-200 whitespace-nowrap shadow-xl z-50 pointer-events-none">
            {leftSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          </span>
        </button>

        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/25 via-purple-500/20 to-sky-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner shrink-0 ring-1 ring-white/5">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>

          <div className="flex flex-col leading-none">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-semibold text-xs sm:text-sm text-zinc-100 tracking-tight">
                Rabbit Hole
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium hidden md:inline">
                Curiosity Graph
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5 tracking-tight hidden sm:inline">
              Explore interconnected thought
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Global Search with Clear, Result Count & Keyboard Hint */}
      <div className="flex-1 max-w-xs sm:max-w-md mx-1 sm:mx-3">
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
          <input
            id="global-search-input"
            type="text"
            role="searchbox"
            aria-label="Search concepts by title, description, or tags"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search concepts, thesis, tags... (⌘K)"
            className="w-full h-8 pl-8 sm:pl-9 pr-14 sm:pr-18 text-xs bg-zinc-900/90 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/50 transition-all"
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery ? (
              <>
                {matchCount !== totalCount && (
                  <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">
                    {matchCount}/{totalCount}
                  </span>
                )}
                <button
                  type="button"
                  onClick={onClearSearch}
                  aria-label="Clear search input"
                  className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </>
            ) : (
              <kbd className="text-[10px] text-zinc-400 border border-zinc-800 px-1 rounded bg-zinc-950 font-mono hidden sm:inline">
                ⌘K
              </kbd>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions, Graph Controls & Inspector Toggle */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            aria-label="Reset active search and filters"
            className="h-8 px-2 sm:px-2.5 rounded-lg text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hidden md:inline-flex items-center gap-1 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}

        {/* Canvas & Storage Control Group */}
        <div className="flex items-center border border-zinc-800 rounded-lg p-0.5 bg-zinc-900/70 shadow-sm">
          {/* Fit View */}
          <div className="relative group">
            <button
              onClick={onFitView}
              aria-label="Fit graph to view"
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 focus-visible:ring-1 focus-visible:ring-indigo-500 transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded-md text-[10px] text-zinc-200 whitespace-nowrap shadow-xl z-50 pointer-events-none">
              Fit View
            </span>
          </div>

          {/* Auto Layout */}
          <div className="relative group">
            <button
              onClick={handleAutoLayoutClick}
              disabled={layoutLoading}
              aria-label="Auto-organize graph layout"
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 focus-visible:ring-1 focus-visible:ring-indigo-500 transition-colors cursor-pointer"
            >
              {layoutLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              ) : (
                <LayoutGrid className="w-3.5 h-3.5" />
              )}
            </button>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded-md text-[10px] text-zinc-200 whitespace-nowrap shadow-xl z-50 pointer-events-none">
              Auto Layout
            </span>
          </div>

          {/* Export JSON */}
          <div className="relative group">
            <button
              onClick={handleExportClick}
              aria-label="Export graph to JSON file backup"
              className="p-1.5 rounded-md text-zinc-400 hover:text-indigo-300 hover:bg-zinc-800/80 focus-visible:ring-1 focus-visible:ring-indigo-500 transition-colors cursor-pointer"
            >
              {exportSuccess ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
            </button>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded-md text-[10px] text-zinc-200 whitespace-nowrap shadow-xl z-50 pointer-events-none">
              {exportSuccess ? 'Downloaded!' : 'Export JSON'}
            </span>
          </div>

          {/* Import JSON */}
          <div className="relative group">
            <button
              onClick={onImportClick}
              aria-label="Import graph from JSON file backup"
              className="p-1.5 rounded-md text-zinc-400 hover:text-emerald-300 hover:bg-zinc-800/80 focus-visible:ring-1 focus-visible:ring-indigo-500 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded-md text-[10px] text-zinc-200 whitespace-nowrap shadow-xl z-50 pointer-events-none">
              Import JSON
            </span>
          </div>
        </div>

        {/* Add Concept Node Action */}
        <button
          onClick={onAddNode}
          aria-label="Add new concept node"
          className="inline-flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/25 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-indigo-400 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Node</span>
        </button>

        {/* Right Sidebar (Details) Toggle */}
        <button
          onClick={toggleRightSidebar}
          aria-label={rightSidebarOpen ? 'Collapse inspector panel' : 'Open inspector panel'}
          className="relative group p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70 focus-visible:ring-2 focus-visible:ring-indigo-500/60 transition-colors cursor-pointer"
        >
          <PanelRight className="w-4 h-4" />
          <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 -bottom-8 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-md text-[10px] text-zinc-200 whitespace-nowrap shadow-xl z-50 pointer-events-none">
            {rightSidebarOpen ? 'Collapse inspector' : 'Open inspector'}
          </span>
        </button>
      </div>
    </header>
  )
}
