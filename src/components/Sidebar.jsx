import {
  FolderKanban,
  Network,
  ChevronRight,
  Database,
  Filter,
  SearchX,
  X,
  Compass,
} from 'lucide-react'
import { CONCEPT_CATEGORIES } from '../data'

export default function Sidebar({
  savedGraphs,
  activeGraphId,
  onSelectGraph,
  nodes,
  selectedNodeId,
  onSelectNode,
  selectedCategory,
  onSelectCategory,
  trailResult,
  onClearTrail,
  onResetToSampleGraph,
  onClose,
  isOpen,
}) {
  if (!isOpen) return null

  return (
    <aside
      aria-label="Sidebar navigation and concept outline"
      className="w-64 border-r border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md flex flex-col h-full shrink-0 select-none z-10 transition-all duration-200"
    >
      {/* Top Section: Saved Graphs Header */}
      <div className="p-3 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
          <span>Curiosity Graphs</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="md:hidden p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Saved Graphs List */}
      <div className="p-2 space-y-1 overflow-y-auto max-h-40 border-b border-zinc-800/80">
        {savedGraphs.map((graph) => {
          const isActive = graph.id === activeGraphId
          return (
            <button
              key={graph.id}
              onClick={() => onSelectGraph(graph.id)}
              aria-current={isActive ? 'true' : undefined}
              aria-label={`Switch to graph: ${graph.title}`}
              className={`w-full text-left p-2 rounded-lg transition-all flex items-start gap-2.5 cursor-pointer focus-visible:ring-1 focus-visible:ring-indigo-500 ${
                isActive
                  ? 'bg-indigo-950/40 border border-indigo-500/40 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
              }`}
            >
              <div
                className="w-2 h-2 rounded-full mt-1.5 shrink-0 shadow-sm"
                style={{ backgroundColor: graph.color || '#6366f1' }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-200 truncate">
                    {graph.title}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {graph.nodeCount}n
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                  {graph.subtitle}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Middle Section: Current Graph Outline / Filtered Nodes */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-3 pt-3 pb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Network className="w-3.5 h-3.5 text-sky-400" />
            <span>Trail Concepts</span>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">
            {nodes.length}
          </span>
        </div>

        <div className="flex-1 p-2 space-y-1 overflow-y-auto">
          {nodes.length === 0 ? (
            <div className="p-4 text-center space-y-2 my-auto">
              <SearchX className="w-6 h-6 text-zinc-500 mx-auto" />
              <p className="text-xs text-zinc-400 font-medium">
                No matching concepts
              </p>
              <p className="text-[10.5px] text-zinc-500 leading-relaxed">
                Try modifying your search or clearing category filters.
              </p>
            </div>
          ) : (
            nodes.map((node) => {
              const isSelected = node.id === selectedNodeId
              return (
                <button
                  key={node.id}
                  onClick={() => onSelectNode(node.id)}
                  aria-selected={isSelected}
                  aria-label={`View concept: ${node.data?.title || node.id}`}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all flex items-center justify-between group cursor-pointer focus-visible:ring-1 focus-visible:ring-indigo-500 ${
                    isSelected
                      ? 'bg-indigo-600/20 text-indigo-300 font-medium border border-indigo-500/40 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
                  }`}
                >
                  <span className="truncate pr-2">
                    {node.data?.title || node.id}
                  </span>
                  <ChevronRight
                    className={`w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-transform ${
                      isSelected ? 'translate-x-0.5 text-indigo-400' : ''
                    }`}
                  />
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Categories Quick Filter Glance */}
      <div className="px-3 py-2.5 border-t border-zinc-800/80 bg-zinc-950/40">
        <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-2">
          <span className="font-medium flex items-center gap-1.5">
            <Filter className="w-3 h-3 text-indigo-400" />
            Category Filter
          </span>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => onSelectCategory && onSelectCategory('all')}
              className="text-[10px] text-indigo-400 hover:underline cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto no-scrollbar">
          {CONCEPT_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.key
            return (
              <button
                key={cat.key}
                onClick={() =>
                  onSelectCategory &&
                  onSelectCategory(isActive ? 'all' : cat.key)
                }
                aria-pressed={isActive}
                aria-label={`Filter by ${cat.label}`}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors flex items-center gap-1 cursor-pointer border focus-visible:ring-1 focus-visible:ring-indigo-500 ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Curiosity Trail Status Card */}
      {trailResult && (
        <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/70 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              <span>Active Trail (BFS)</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400">
              {trailResult.hops} {trailResult.hops === 1 ? 'hop' : 'hops'}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-[10.5px] space-y-1">
            <p className="text-zinc-200 font-medium truncate">
              {trailResult.nodes[0]?.data?.title}
            </p>
            <p className="text-[10px] text-emerald-400">
              ↓ {trailResult.hops} {trailResult.hops === 1 ? 'connection' : 'connections'}
            </p>
            <p className="text-zinc-200 font-medium truncate">
              {trailResult.nodes[trailResult.nodes.length - 1]?.data?.title}
            </p>
            <button
              type="button"
              onClick={onClearTrail}
              className="text-[10px] text-zinc-400 hover:text-rose-400 pt-1 transition-colors cursor-pointer block"
            >
              Clear Trail ✕
            </button>
          </div>
        </div>
      )}

      {/* Bottom Footer: Graph Stats */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/90 flex items-center justify-between text-[11px] text-zinc-400">
        <div className="flex items-center gap-1.5">
          <Database className="w-3 h-3 text-indigo-400" />
          <span>Curiosity DB</span>
        </div>
        <div className="flex items-center gap-2">
          {onResetToSampleGraph && (
            <button
              type="button"
              onClick={onResetToSampleGraph}
              title="Reset graph to default sample data"
              aria-label="Reset graph to default sample data"
              className="text-[10px] text-zinc-500 hover:text-indigo-400 transition-colors cursor-pointer"
            >
              Reset Demo
            </button>
          )}
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Saved
          </span>
        </div>
      </div>
    </aside>
  )
}
