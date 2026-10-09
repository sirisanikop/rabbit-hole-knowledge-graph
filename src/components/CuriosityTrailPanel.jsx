import {
  Compass,
  ArrowRight,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Flag,
  Target,
  ChevronRight,
  Layers,
} from 'lucide-react'

export default function CuriosityTrailPanel({
  nodes,
  startNodeId,
  endNodeId,
  onSelectStartNode,
  onSelectEndNode,
  trailResult,
  onClearTrail,
  onSelectNode,
  selectedNodeId,
}) {
  const startNode = nodes.find((n) => n.id === startNodeId)
  const endNode = nodes.find((n) => n.id === endNodeId)

  const handleSwap = () => {
    const temp = startNodeId
    onSelectStartNode(endNodeId)
    onSelectEndNode(temp)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-zinc-100 flex items-center gap-1.5">
              <span>Curiosity Trail</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 font-mono">
                BFS
              </span>
            </h3>
            <p className="text-[10px] text-zinc-400">
              Shortest path between concepts
            </p>
          </div>
        </div>

        {(startNodeId || endNodeId || trailResult) && (
          <button
            type="button"
            onClick={onClearTrail}
            aria-label="Clear active trail selection"
            className="text-[10.5px] text-zinc-400 hover:text-rose-400 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Clear trail selection"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Selectors Card */}
      <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
        {/* Starting Concept */}
        <div>
          <label htmlFor="trail-start-node" className="text-[11px] font-medium text-zinc-400 flex items-center justify-between mb-1">
            <span className="flex items-center gap-1">
              <Flag className="w-3 h-3 text-emerald-400" />
              Starting Point
            </span>
            {selectedNodeId && selectedNodeId !== startNodeId && (
              <button
                type="button"
                onClick={() => onSelectStartNode(selectedNodeId)}
                aria-label="Use currently selected concept as start"
                className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                Use Selected
              </button>
            )}
          </label>
          <select
            id="trail-start-node"
            value={startNodeId || ''}
            onChange={(e) => onSelectStartNode(e.target.value || null)}
            aria-label="Choose starting concept"
            className="w-full px-2.5 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
          >
            <option value="" className="text-zinc-500">
              -- Choose starting concept --
            </option>
            {nodes.map((node) => (
              <option key={node.id} value={node.id} className="bg-zinc-900 text-zinc-200">
                {node.data?.title || node.id}
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-1">
          <button
            type="button"
            onClick={handleSwap}
            disabled={!startNodeId && !endNodeId}
            aria-label="Swap starting and destination concepts"
            title="Swap start and destination"
            className="p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-400 hover:text-white transition-colors cursor-pointer active:scale-95"
          >
            <ArrowUpDown className="w-3 h-3" />
          </button>
        </div>

        {/* Destination Concept */}
        <div>
          <label htmlFor="trail-end-node" className="text-[11px] font-medium text-zinc-400 flex items-center justify-between mb-1">
            <span className="flex items-center gap-1">
              <Target className="w-3 h-3 text-cyan-400" />
              Destination
            </span>
            {selectedNodeId && selectedNodeId !== endNodeId && (
              <button
                type="button"
                onClick={() => onSelectEndNode(selectedNodeId)}
                aria-label="Use currently selected concept as destination"
                className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                Use Selected
              </button>
            )}
          </label>
          <select
            id="trail-end-node"
            value={endNodeId || ''}
            onChange={(e) => onSelectEndNode(e.target.value || null)}
            aria-label="Choose destination concept"
            className="w-full px-2.5 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all cursor-pointer"
          >
            <option value="" className="text-zinc-500">
              -- Choose destination concept --
            </option>
            {nodes.map((node) => (
              <option key={node.id} value={node.id} className="bg-zinc-900 text-zinc-200">
                {node.data?.title || node.id}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Result Display */}
      {startNodeId && endNodeId && (
        <div className="space-y-2">
          {trailResult ? (
            /* Path found */
            <div className="space-y-2.5">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-xs">
                <span className="text-emerald-300 font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Trail Connected!
                </span>
                <span className="text-[11px] font-mono text-emerald-400">
                  {trailResult.hops} {trailResult.hops === 1 ? 'hop' : 'hops'} • {trailResult.nodes.length} concepts
                </span>
              </div>

              {/* Step Sequence List */}
              <div className="space-y-1.5">
                <span className="text-[10.5px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-zinc-400" />
                  Inquiry Sequence
                </span>

                <div className="space-y-1">
                  {trailResult.nodes.map((tNode, idx) => {
                    const isFirst = idx === 0
                    const isLast = idx === trailResult.nodes.length - 1
                    const isCurrent = tNode.id === selectedNodeId

                    return (
                      <div key={tNode.id} className="space-y-1">
                        <button
                          type="button"
                          onClick={() => onSelectNode(tNode.id)}
                          aria-label={`Jump to concept step ${idx + 1}: ${tNode.data?.title || tNode.id}`}
                          className={`w-full p-2 rounded-xl text-left transition-all flex items-center justify-between group cursor-pointer border ${
                            isCurrent
                              ? 'bg-emerald-950/40 border-emerald-500/50 text-white shadow-sm'
                              : isFirst
                              ? 'bg-zinc-900/80 border-emerald-500/30 text-zinc-200 hover:border-emerald-500/60'
                              : isLast
                              ? 'bg-zinc-900/80 border-cyan-500/30 text-zinc-200 hover:border-cyan-500/60'
                              : 'bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                          }`}
                        >
                          <div className="min-w-0 flex-1 flex items-center gap-2">
                            <span
                              className={`w-4 h-4 rounded-full text-[9px] font-mono font-bold flex items-center justify-center shrink-0 ${
                                isFirst
                                  ? 'bg-emerald-500 text-zinc-950'
                                  : isLast
                                  ? 'bg-cyan-500 text-zinc-950'
                                  : 'bg-zinc-800 text-zinc-300'
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <div className="truncate">
                              <p className="text-xs font-medium truncate">
                                {tNode.data?.title || tNode.id}
                              </p>
                              <p className="text-[10px] text-zinc-400">
                                {tNode.data?.category}
                              </p>
                            </div>
                          </div>

                          <ChevronRight
                            className={`w-3.5 h-3.5 transition-transform ${
                              isCurrent ? 'text-emerald-400 translate-x-0.5' : 'text-zinc-600 group-hover:text-zinc-400'
                            }`}
                          />
                        </button>

                        {!isLast && (
                          <div className="flex justify-center py-0.5">
                            <ArrowRight className="w-3 h-3 text-emerald-500/70 rotate-90" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* No path exists empty state */
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-2 text-xs text-amber-300">
              <div className="flex items-center gap-1.5 font-semibold text-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>No Connected Trail Found</span>
              </div>
              <p className="text-[11px] text-amber-300/85 leading-relaxed">
                No path currently connects <strong className="text-amber-100">"{startNode?.data?.title}"</strong> and <strong className="text-amber-100">"{endNode?.data?.title}"</strong>.
              </p>
              <p className="text-[10.5px] text-zinc-400 pt-0.5 leading-relaxed">
                Tip: Drag an edge between node ports to connect these clusters, or add a bridging question.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
