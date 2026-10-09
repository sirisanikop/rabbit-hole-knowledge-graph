import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import {
  HelpCircle,
  Sparkles,
  GitBranch,
  Layers,
  Lightbulb,
  Radio,
  Flag,
  Target,
  Tag,
} from 'lucide-react'

const CATEGORY_THEMES = {
  paradox: {
    badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    dot: 'bg-purple-400',
    glowDot: 'bg-purple-500',
    glowHover: 'hover:border-purple-500/50 hover:shadow-purple-500/15',
    icon: HelpCircle,
  },
  theory: {
    badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    dot: 'bg-sky-400',
    glowDot: 'bg-sky-500',
    glowHover: 'hover:border-sky-500/50 hover:shadow-sky-500/15',
    icon: Layers,
  },
  architecture: {
    badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    dot: 'bg-indigo-400',
    glowDot: 'bg-indigo-500',
    glowHover: 'hover:border-indigo-500/50 hover:shadow-indigo-500/15',
    icon: Sparkles,
  },
  question: {
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    dot: 'bg-amber-400',
    glowDot: 'bg-amber-500',
    glowHover: 'hover:border-amber-500/50 hover:shadow-amber-500/15',
    icon: Lightbulb,
  },
  model: {
    badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    dot: 'bg-cyan-400',
    glowDot: 'bg-cyan-400',
    glowHover: 'hover:border-cyan-500/50 hover:shadow-cyan-500/15',
    icon: Radio,
  },
  philosophy: {
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    dot: 'bg-rose-400',
    glowDot: 'bg-rose-500',
    glowHover: 'hover:border-rose-500/50 hover:shadow-rose-500/15',
    icon: GitBranch,
  },
  frontier: {
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-400',
    glowDot: 'bg-emerald-500',
    glowHover: 'hover:border-emerald-500/50 hover:shadow-emerald-500/15',
    icon: Sparkles,
  },
}

function CustomNode({ data, selected }) {
  const themeKey = (data.categoryKey || data.categoryColor || 'paradox').toLowerCase()
  const theme = CATEGORY_THEMES[themeKey] || CATEGORY_THEMES.paradox
  const IconComponent = theme.icon || Sparkles
  const isQuestion = Boolean(data.isQuestion || data.title?.endsWith('?'))

  const isInTrail = Boolean(data.isInTrail)
  const isMatchHighlight = Boolean(data.hasActiveFilter && data.isSearchMatch)

  let borderStyle = `border-zinc-800/90 bg-zinc-900/90 hover:bg-zinc-900/98 ${theme.glowHover}`
  if (isInTrail) {
    borderStyle =
      'border-emerald-400 bg-zinc-900/95 ring-2 ring-emerald-400/80 shadow-[0_0_32px_rgba(16,185,129,0.35)]'
  } else if (isMatchHighlight) {
    borderStyle =
      'border-amber-400 bg-zinc-900/95 ring-2 ring-amber-400/70 shadow-[0_0_28px_rgba(251,191,36,0.25)]'
  } else if (selected) {
    borderStyle =
      'border-indigo-500 bg-zinc-900 ring-2 ring-indigo-500/60 shadow-[0_0_24px_rgba(99,102,241,0.3)]'
  }

  const tags = Array.isArray(data.tags) ? data.tags : []

  return (
    <div
      role="button"
      tabIndex={0}
      aria-selected={selected}
      aria-label={`${data.title || 'Concept node'}: ${data.category || 'Category'}`}
      className={`group relative w-72 rounded-2xl border transition-all duration-200 select-none shadow-2xl backdrop-blur-xl hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(0,0,0,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${borderStyle}`}
    >
      {/* 4 Connection Ports for multidirectional linking */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        title="Input port (Top)"
        aria-label="Connect incoming edge to top port"
        className="!w-3 !h-3 !bg-zinc-700 !border-2 !border-zinc-950 hover:!bg-indigo-400 hover:!scale-125 hover:!shadow-[0_0_10px_rgba(99,102,241,0.9)] transition-all !cursor-crosshair"
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        className="pointer-events-none opacity-0 !w-3 !h-3"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        title="Output port (Bottom)"
        aria-label="Drag outgoing edge from bottom port"
        className="!w-3 !h-3 !bg-zinc-700 !border-2 !border-zinc-950 hover:!bg-indigo-400 hover:!scale-125 hover:!shadow-[0_0_10px_rgba(99,102,241,0.9)] transition-all !cursor-crosshair"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        className="pointer-events-none opacity-0 !w-3 !h-3"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        title="Input port (Left)"
        aria-label="Connect incoming edge to left port"
        className="!w-3 !h-3 !bg-zinc-700 !border-2 !border-zinc-950 hover:!bg-indigo-400 hover:!scale-125 hover:!shadow-[0_0_10px_rgba(99,102,241,0.9)] transition-all !cursor-crosshair"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        className="pointer-events-none opacity-0 !w-3 !h-3"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        title="Output port (Right)"
        aria-label="Drag outgoing edge from right port"
        className="!w-3 !h-3 !bg-zinc-700 !border-2 !border-zinc-950 hover:!bg-indigo-400 hover:!scale-125 hover:!shadow-[0_0_10px_rgba(99,102,241,0.9)] transition-all !cursor-crosshair"
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        className="pointer-events-none opacity-0 !w-3 !h-3"
      />

      <div className="p-3.5 space-y-2.5">
        {/* Top Meta: Visual Beacon + Category Badge + Trail/Match Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Small Glowing Visual Indicator */}
            <span className="relative flex h-2 w-2 shrink-0">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isInTrail
                    ? 'bg-emerald-400'
                    : isMatchHighlight
                    ? 'bg-amber-400'
                    : theme.glowDot
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isInTrail
                    ? 'bg-emerald-400'
                    : isMatchHighlight
                    ? 'bg-amber-400'
                    : theme.dot
                }`}
              />
            </span>

            {/* Category Badge */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border truncate ${theme.badge}`}
            >
              <IconComponent className="w-2.5 h-2.5 shrink-0" />
              <span className="truncate">{data.category || 'Concept'}</span>
            </span>
          </div>

          {/* Right Status / Trail / Match Badges */}
          <div className="flex items-center gap-1 shrink-0">
            {data.isTrailStart ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/25 text-emerald-300 border border-emerald-500/50">
                <Flag className="w-2.5 h-2.5 text-emerald-400" />
                Start
              </span>
            ) : data.isTrailEnd ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-cyan-500/25 text-cyan-300 border border-cyan-500/50">
                <Target className="w-2.5 h-2.5 text-cyan-400" />
                Dest
              </span>
            ) : isInTrail ? (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Step {data.trailStep}
              </span>
            ) : isMatchHighlight ? (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                Match
              </span>
            ) : null}

            <span className="text-[10px] text-zinc-500 font-mono tracking-tight shrink-0">
              {isQuestion ? 'Inquiry' : data.depth || 'Concept'}
            </span>
          </div>
        </div>

        {/* Question / Concept Title */}
        <h3
          className={`text-[12.5px] font-semibold leading-snug tracking-tight transition-colors line-clamp-2 ${
            isInTrail
              ? 'text-emerald-200 group-hover:text-white'
              : isMatchHighlight
              ? 'text-amber-200 group-hover:text-white'
              : isQuestion
              ? 'text-indigo-200 group-hover:text-white'
              : 'text-zinc-100 group-hover:text-white'
          }`}
        >
          {data.title}
        </h3>

        {/* Short Summary */}
        {data.summary && (
          <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
            {data.summary}
          </p>
        )}

        {/* Tags preview pill list (if any tags) */}
        {tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 pt-0.5">
            {tags.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400 text-[9.5px] border border-zinc-700/40"
              >
                <Tag className="w-2 h-2 text-zinc-500" />
                <span className="truncate max-w-[80px]">{tag}</span>
              </span>
            ))}
            {tags.length > 2 && (
              <span className="text-[9px] text-zinc-500 font-mono">
                +{tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Bottom Meta & Status */}
        <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500">
          <span className="flex items-center gap-1 text-zinc-400">
            <GitBranch className="w-3 h-3 text-zinc-500" />
            <span>{data.connectionsCount || 0} branches</span>
          </span>

          {data.status && (
            <span className="px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-300 font-medium border border-zinc-700/60 text-[9px] tracking-wide uppercase">
              {data.status}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(CustomNode)
