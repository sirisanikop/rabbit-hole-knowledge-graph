import { memo, useState, useRef, useEffect, useCallback } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
} from '@xyflow/react'
import { X, Pencil, Check } from 'lucide-react'

function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  selected,
  data = {},
}) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  })

  const onDelete = data.onDelete
  const onUpdateLabel = data.onUpdateLabel
  const onStartEdit = data.onStartEdit
  const onStopEdit = data.onStopEdit
  const currentLabel = label || data?.label || 'Inquiry Path'

  const [internalIsEditing, setInternalIsEditing] = useState(false)
  const isEditing = Boolean(data.isEditing || internalIsEditing)

  const [draftLabel, setDraftLabel] = useState(currentLabel)
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  const [prevEditing, setPrevEditing] = useState(false)
  if (isEditing && !prevEditing) {
    setPrevEditing(true)
    setDraftLabel(currentLabel)
  } else if (!isEditing && prevEditing) {
    setPrevEditing(false)
  }

  // Auto-focus and select text when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleStartEdit = useCallback(
    (e) => {
      if (e) {
        e.stopPropagation()
        e.preventDefault()
      }
      setDraftLabel(currentLabel)
      setInternalIsEditing(true)
      if (onStartEdit) {
        onStartEdit(id)
      }
    },
    [currentLabel, onStartEdit, id]
  )

  const handleCancel = useCallback(
    (e) => {
      if (e) {
        e.stopPropagation()
        e.preventDefault()
      }
      setDraftLabel(currentLabel)
      setInternalIsEditing(false)
      if (onStopEdit) {
        onStopEdit()
      }
    },
    [currentLabel, onStopEdit]
  )

  const handleSave = useCallback(
    (e) => {
      if (e) {
        e.stopPropagation()
        e.preventDefault()
      }
      const trimmed = (draftLabel || '').trim()
      // If user clears the field or submits whitespace, cancel without losing original label
      if (!trimmed) {
        handleCancel()
        return
      }

      if (onUpdateLabel) {
        onUpdateLabel(id, trimmed)
      }

      setInternalIsEditing(false)
      if (onStopEdit) {
        onStopEdit()
      }
    },
    [draftLabel, handleCancel, onUpdateLabel, id, onStopEdit]
  )

  const handleKeyDown = useCallback(
    (e) => {
      e.stopPropagation()
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSave()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleCancel()
      }
    },
    [handleSave, handleCancel]
  )

  const handleBadgeKeyDown = useCallback(
    (e) => {
      if (!isEditing && (e.key === 'Enter' || e.key === 'F2' || e.key === 'e' || e.key === 'E')) {
        e.stopPropagation()
        e.preventDefault()
        handleStartEdit()
      }
    },
    [isEditing, handleStartEdit]
  )

  // Commit on click outside if valid, otherwise cleanly revert
  useEffect(() => {
    if (!isEditing) return

    const handlePointerDownOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        const trimmed = (draftLabel || '').trim()
        if (trimmed && trimmed !== currentLabel) {
          if (onUpdateLabel) {
            onUpdateLabel(id, trimmed)
          }
        }
        setInternalIsEditing(false)
        if (onStopEdit) {
          onStopEdit()
        }
      }
    }

    document.addEventListener('pointerdown', handlePointerDownOutside)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDownOutside)
    }
  }, [isEditing, draftLabel, currentLabel, id, onUpdateLabel, onStopEdit])

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: selected ? '#818cf8' : (style.stroke || '#6366f1'),
          strokeWidth: selected ? 2.5 : (style.strokeWidth || 1.75),
          transition: 'stroke 0.2s, stroke-width 0.2s',
        }}
      />
      <EdgeLabelRenderer>
        <div
          ref={containerRef}
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className={`nodrag nopan group flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/95 border text-[10.5px] font-medium shadow-xl transition-all select-none backdrop-blur-md ${
            isEditing
              ? 'border-indigo-500 bg-zinc-900 ring-2 ring-indigo-500/40 z-30 shadow-2xl'
              : selected
              ? 'border-indigo-500/80 text-indigo-200 ring-2 ring-indigo-500/30'
              : 'border-zinc-800/90 text-zinc-300 hover:border-zinc-700 hover:text-white'
          }`}
        >
          {isEditing ? (
            <form
              onSubmit={handleSave}
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <input
                ref={inputRef}
                type="text"
                value={draftLabel}
                onChange={(e) => setDraftLabel(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Connection label..."
                className="w-32 sm:w-44 px-2 py-0.5 text-[11px] bg-zinc-950 text-zinc-100 border border-indigo-500/80 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-400 placeholder-zinc-500 shadow-inner"
              />
              <button
                type="submit"
                onMouseDown={(e) => e.preventDefault()}
                title="Save label (Enter)"
                aria-label="Save connection label"
                className="w-5 h-5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm"
              >
                <Check className="w-2.5 h-2.5" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleCancel}
                title="Cancel (Esc)"
                aria-label="Cancel editing"
                className="w-5 h-5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition-all cursor-pointer shrink-0"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </form>
          ) : (
            <>
              <button
                type="button"
                onClick={handleStartEdit}
                onDoubleClick={handleStartEdit}
                onKeyDown={handleBadgeKeyDown}
                title="Click or double-click to edit connection label (Enter/F2)"
                aria-label={`Connection label: ${currentLabel}. Click or double-click to edit.`}
                className="flex items-center gap-1.5 hover:text-indigo-300 cursor-pointer transition-colors max-w-[200px] group/btn"
              >
                <span className="truncate">{currentLabel}</span>
                <Pencil className="w-2.5 h-2.5 text-zinc-500 group-hover/btn:text-indigo-400 group-hover:text-indigo-400 transition-colors shrink-0" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  if (onDelete) {
                    onDelete(id)
                  }
                }}
                title="Remove connection"
                aria-label="Remove connection"
                className="w-4 h-4 rounded-full bg-zinc-800/80 hover:bg-rose-500 hover:text-white text-zinc-400 flex items-center justify-center transition-all ml-0.5 cursor-pointer shrink-0"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

export default memo(CustomEdge)
