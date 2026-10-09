import { useState, useEffect, useCallback } from 'react'
import {
  X,
  Sparkles,
  ExternalLink,
  GitBranch,
  FileText,
  Bookmark,
  Share2,
  Tag,
  ArrowUpRight,
  PlusCircle,
  HelpCircle,
  Edit3,
  Trash2,
  Check,
  Compass,
  Flag,
  Target,
  Pencil,
} from 'lucide-react'
import { CONCEPT_CATEGORIES } from '../data'
import CuriosityTrailPanel from './CuriosityTrailPanel'

export default function NodeDetailPanel({
  allNodes = [],
  selectedNode,
  connectedNodes = [],
  edges = [],
  onUpdateEdgeLabel,
  onClose,
  onSelectConnectedNode,
  onDeepenTrail,
  onUpdateNode,
  onRequestDeleteNode,
  onDisconnectNodes,
  startNodeId,
  endNodeId,
  onSelectStartNode,
  onSelectEndNode,
  trailResult,
  onClearTrail,
  onOpenCreateNode,
  isOpen,
}) {
  const [activeTab, setActiveTab] = useState('details') // 'details' | 'trail'
  const [isEditing, setIsEditing] = useState(false)
  const [prevNodeId, setPrevNodeId] = useState(selectedNode?.id)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [shareFeedback, setShareFeedback] = useState(false)

  // Edge label inline editing in sidebar
  const [editingEdgeId, setEditingEdgeId] = useState(null)
  const [edgeDraftLabel, setEdgeDraftLabel] = useState('')

  const data = selectedNode?.data || {}
  const [editTitle, setEditTitle] = useState(data.title || '')
  const [editSummary, setEditSummary] = useState(data.summary || '')
  const initialCategoryMatched = CONCEPT_CATEGORIES.some((c) => c.key === data.categoryKey)
  const [editCategoryKey, setEditCategoryKey] = useState(
    initialCategoryMatched ? (data.categoryKey || 'paradox') : 'custom'
  )
  const [customCategoryInput, setCustomCategoryInput] = useState(
    initialCategoryMatched ? '' : (data.category || '')
  )
  const [editNotes, setEditNotes] = useState(data.notes || '')
  const [editTags, setEditTags] = useState((data.tags || []).join(', '))

  // Reset edit state when selected node changes
  if (selectedNode?.id !== prevNodeId) {
    setPrevNodeId(selectedNode?.id)
    setIsEditing(false)
    setIsBookmarked(false)
    setShareFeedback(false)
    setEditTitle(data.title || '')
    setEditSummary(data.summary || '')
    const isMatched = CONCEPT_CATEGORIES.some((c) => c.key === data.categoryKey)
    setEditCategoryKey(isMatched ? (data.categoryKey || 'paradox') : 'custom')
    setCustomCategoryInput(isMatched ? '' : (data.category || ''))
    setEditNotes(data.notes || '')
    setEditTags((data.tags || []).join(', '))
    setEditingEdgeId(null)
    setEdgeDraftLabel('')
  }

  const saveEdit = useCallback(() => {
    if (!editTitle.trim() || !selectedNode) return

    let finalCategory = ''
    let finalCategoryKey = editCategoryKey

    if (editCategoryKey === 'custom') {
      const customVal = customCategoryInput.trim() || data.category || 'General'
      finalCategory = customVal
      finalCategoryKey =
        customVal.toLowerCase().replace(/[^a-z0-9_-]/g, '-') || 'custom'
    } else {
      const categoryObj =
        CONCEPT_CATEGORIES.find((c) => c.key === editCategoryKey) ||
        CONCEPT_CATEGORIES[0]
      finalCategory = categoryObj.label
      finalCategoryKey = categoryObj.key
    }

    const parsedTags = editTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    onUpdateNode(selectedNode.id, {
      title: editTitle.trim(),
      summary: editSummary.trim(),
      category: finalCategory,
      categoryKey: finalCategoryKey,
      categoryColor: finalCategoryKey,
      notes: editNotes.trim(),
      tags: parsedTags,
      isQuestion: editTitle.trim().endsWith('?'),
    })

    setIsEditing(false)
  }, [
    editTitle,
    editSummary,
    editCategoryKey,
    customCategoryInput,
    editNotes,
    editTags,
    selectedNode,
    data.category,
    onUpdateNode,
  ])

  // Handle keyboard shortcuts in edit mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isEditing) return
      if (e.key === 'Escape') {
        setIsEditing(false)
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        saveEdit()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isEditing, saveEdit])

  const handleStartEdit = () => {
    setEditTitle(data.title || '')
    setEditSummary(data.summary || '')
    setEditCategoryKey(data.categoryKey || 'paradox')
    setEditNotes(data.notes || '')
    setEditTags((data.tags || []).join(', '))
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleSaveEdit = (e) => {
    e.preventDefault()
    saveEdit()
  }

  const handleStartEditEdge = useCallback((edgeId, currentLabel) => {
    setEditingEdgeId(edgeId)
    setEdgeDraftLabel(currentLabel || 'Inquiry Path')
  }, [])

  const handleCancelEditEdge = useCallback(() => {
    setEditingEdgeId(null)
    setEdgeDraftLabel('')
  }, [])

  const handleSaveEditEdge = useCallback(
    (edgeId, originalLabel) => {
      const trimmed = edgeDraftLabel.trim()
      if (!trimmed) {
        handleCancelEditEdge()
        return
      }
      if (trimmed !== originalLabel && onUpdateEdgeLabel) {
        onUpdateEdgeLabel(edgeId, trimmed)
      }
      setEditingEdgeId(null)
      setEdgeDraftLabel('')
    },
    [edgeDraftLabel, onUpdateEdgeLabel, handleCancelEditEdge]
  )

  if (!isOpen) return null

  const currentCategory =
    CONCEPT_CATEGORIES.find((c) => c.key === (data.categoryKey || 'paradox')) ||
    CONCEPT_CATEGORIES[0]

  const handleShareClick = () => {
    if (!selectedNode) return
    const text = `Rabbit Hole: "${data.title}"\n${data.summary || ''}`
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {})
    }
    setShareFeedback(true)
    setTimeout(() => setShareFeedback(false), 1400)
  }

  return (
    <aside
      aria-label="Concept Inspector and Details"
      className="max-md:fixed max-md:inset-y-0 max-md:right-0 max-md:z-30 max-md:w-[85vw] max-md:max-w-sm max-md:shadow-2xl md:relative md:w-84 lg:w-96 border-l border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md flex flex-col h-full shrink-0 z-10 overflow-hidden transition-all duration-200"
    >
      {/* Top Navigation Tabs & Header */}
      <div className="border-b border-zinc-800/80 bg-zinc-900/50">
        <div className="p-2.5 pb-0 flex items-center justify-between gap-2">
          {/* Tabs */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              aria-selected={activeTab === 'details'}
              className={`px-3 py-1.5 text-xs font-medium rounded-t-lg transition-colors cursor-pointer border-t border-x ${
                activeTab === 'details'
                  ? 'bg-zinc-950 text-white border-zinc-800 border-b-transparent -mb-[1px]'
                  : 'text-zinc-400 hover:text-zinc-200 border-transparent'
              }`}
            >
              Concept Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('trail')}
              aria-selected={activeTab === 'trail'}
              className={`px-3 py-1.5 text-xs font-medium rounded-t-lg transition-colors cursor-pointer border-t border-x flex items-center gap-1.5 ${
                activeTab === 'trail'
                  ? 'bg-zinc-950 text-emerald-400 border-zinc-800 border-b-transparent -mb-[1px]'
                  : 'text-zinc-400 hover:text-zinc-200 border-transparent'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Curiosity Trail</span>
              {trailResult && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
          </div>

          {/* Close Panel Button */}
          <button
            onClick={onClose}
            aria-label="Close details inspector"
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 focus-visible:ring-1 focus-visible:ring-indigo-500 transition-colors cursor-pointer"
            title="Close details"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 sm:space-y-5">
        {activeTab === 'trail' ? (
          /* ================= CURIOSITY TRAIL TAB ================= */
          <CuriosityTrailPanel
            nodes={allNodes}
            startNodeId={startNodeId}
            endNodeId={endNodeId}
            onSelectStartNode={onSelectStartNode}
            onSelectEndNode={onSelectEndNode}
            trailResult={trailResult}
            onClearTrail={onClearTrail}
            onSelectNode={onSelectConnectedNode}
            selectedNodeId={selectedNode?.id}
          />
        ) : !selectedNode ? (
          /* ================= NO NODE SELECTED EMPTY STATE ================= */
          <div className="text-center py-12 px-2 space-y-3.5">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mx-auto shadow-inner">
              <HelpCircle className="w-6 h-6 text-zinc-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-200">
                No Concept Selected
              </h3>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto mt-1 leading-relaxed">
                Click any concept on the canvas to inspect its thesis, field notes, and connections.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2 max-w-xs mx-auto">
              {onOpenCreateNode && (
                <button
                  type="button"
                  onClick={onOpenCreateNode}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Create New Concept</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveTab('trail')}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>Calculate Curiosity Trail (BFS)</span>
              </button>
            </div>
          </div>
        ) : isEditing ? (
          /* ================= EDIT MODE ================= */
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" />
                Editing Concept
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {selectedNode.id}
              </span>
            </div>

            {/* Edit Title */}
            <div>
              <label htmlFor="edit-concept-title" className="block text-xs font-medium text-zinc-300 mb-1">
                Title / Question <span className="text-indigo-400">*</span>
              </label>
              <input
                id="edit-concept-title"
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
              />
            </div>

            {/* Edit Category */}
            <div>
              <label htmlFor="edit-concept-category" className="block text-xs font-medium text-zinc-300 mb-1">
                Category
              </label>
              <select
                id="edit-concept-category"
                value={editCategoryKey}
                onChange={(e) => setEditCategoryKey(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
              >
                {CONCEPT_CATEGORIES.map((cat) => (
                  <option key={cat.key} value={cat.key} className="bg-zinc-900 text-zinc-200">
                    {cat.label}
                  </option>
                ))}
                <option value="custom" className="bg-zinc-900 text-indigo-300">
                  Custom Category...
                </option>
              </select>

              {editCategoryKey === 'custom' && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    placeholder="Enter custom category name..."
                    className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                  />
                </div>
              )}
            </div>

            {/* Edit Summary */}
            <div>
              <label htmlFor="edit-concept-summary" className="block text-xs font-medium text-zinc-300 mb-1">
                Description / Core Thesis
              </label>
              <textarea
                id="edit-concept-summary"
                rows={3}
                value={editSummary}
                onChange={(e) => setEditSummary(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Edit Notes */}
            <div>
              <label htmlFor="edit-concept-notes" className="block text-xs font-medium text-zinc-300 mb-1">
                Field Notes
              </label>
              <textarea
                id="edit-concept-notes"
                rows={3}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Observation notes, counter-arguments, papers..."
                className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Edit Tags */}
            <div>
              <label htmlFor="edit-concept-tags" className="block text-xs font-medium text-zinc-300 mb-1">
                Tags (comma separated)
              </label>
              <input
                id="edit-concept-tags"
                type="text"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Save / Cancel buttons */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[10px] text-zinc-500 font-mono">
                ⌘+Enter to save
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-[0.98]"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* ================= VIEW DETAILS MODE ================= */
          <>
            {/* Header Meta: Category + Trail Shortcuts */}
            <div className="flex items-center justify-between gap-2">
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border truncate ${currentCategory.badgeClass}`}
              >
                {data.category || 'Concept'}
              </span>

              {/* Set Start / Set End Trail Shortcuts */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    onSelectStartNode(selectedNode.id)
                    setActiveTab('trail')
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 transition-all cursor-pointer border ${
                    startNodeId === selectedNode.id
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-emerald-300 hover:border-emerald-500/50'
                  }`}
                  title="Set as Curiosity Trail starting point"
                >
                  <Flag className="w-2.5 h-2.5" />
                  <span>Start</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectEndNode(selectedNode.id)
                    setActiveTab('trail')
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 transition-all cursor-pointer border ${
                    endNodeId === selectedNode.id
                      ? 'bg-cyan-600 text-white border-cyan-500'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-cyan-300 hover:border-cyan-500/50'
                  }`}
                  title="Set as Curiosity Trail destination"
                >
                  <Target className="w-2.5 h-2.5" />
                  <span>Dest</span>
                </button>
              </div>
            </div>

            {/* Title & Depth */}
            <div>
              <span className="text-[11px] text-zinc-500 font-mono">
                {selectedNode.id} • {data.depth || 'Concept'}
              </span>
              <h2 className="text-sm sm:text-base font-bold text-zinc-100 tracking-tight mt-0.5 leading-snug">
                {data.title}
              </h2>
            </div>

            {/* Summary / Core Thesis */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Core Thesis
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/70">
                {data.summary || 'No description provided yet.'}
              </p>
            </div>

            {/* Exploration Notes */}
            {data.notes && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  Field Notes
                </span>
                <div className="text-xs text-zinc-400 leading-relaxed bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/70 border-l-2 border-l-sky-500">
                  {data.notes}
                </div>
              </div>
            )}

            {/* Connected Concepts */}
            {connectedNodes.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                  Connected Trails ({connectedNodes.length})
                </span>
                <div className="space-y-1.5">
                  {connectedNodes.map((cNode) => {
                    const connectingEdge = edges.find(
                      (e) =>
                        (e.source === selectedNode.id && e.target === cNode.id) ||
                        (e.source === cNode.id && e.target === selectedNode.id)
                    )
                    const edgeLabel = connectingEdge?.label || 'Inquiry Path'
                    const isEditingThisEdge =
                      connectingEdge && editingEdgeId === connectingEdge.id

                    return (
                      <div
                        key={cNode.id}
                        className="group/item p-2 rounded-xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/70 hover:border-zinc-700 text-xs text-zinc-300 transition-all space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => onSelectConnectedNode(cNode.id)}
                            className="truncate text-left flex-1 font-medium text-zinc-200 hover:text-white transition-colors cursor-pointer"
                            title="Jump to concept"
                          >
                            {cNode.data?.title || cNode.id}
                          </button>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => onSelectConnectedNode(cNode.id)}
                              className="text-[10px] text-zinc-500 hover:text-indigo-400 transition-colors px-1.5 py-0.5 rounded cursor-pointer"
                              title="Jump to node"
                            >
                              Jump ↗
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                onDisconnectNodes &&
                                onDisconnectNodes(selectedNode.id, cNode.id)
                              }
                              title="Disconnect trail between these concepts"
                              className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {connectingEdge && (
                          <div className="flex items-center pt-0.5">
                            {isEditingThisEdge ? (
                              <div
                                className="flex items-center gap-1 w-full"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="text"
                                  value={edgeDraftLabel}
                                  onChange={(e) => setEdgeDraftLabel(e.target.value)}
                                  onKeyDown={(e) => {
                                    e.stopPropagation()
                                    if (e.key === 'Enter') {
                                      e.preventDefault()
                                      handleSaveEditEdge(connectingEdge.id, edgeLabel)
                                    } else if (e.key === 'Escape') {
                                      e.preventDefault()
                                      handleCancelEditEdge()
                                    }
                                  }}
                                  placeholder="Connection label..."
                                  autoFocus
                                  className="flex-1 px-2 py-0.5 text-[10.5px] bg-zinc-950 text-zinc-100 border border-indigo-500/80 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditEdge(connectingEdge.id, edgeLabel)}
                                  className="w-5 h-5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
                                  title="Save label (Enter)"
                                >
                                  <Check className="w-2.5 h-2.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelEditEdge}
                                  className="w-5 h-5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition-all cursor-pointer shrink-0"
                                  title="Cancel (Esc)"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleStartEditEdge(connectingEdge.id, edgeLabel)}
                                title="Click to edit connection label"
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-950/70 hover:bg-zinc-800 border border-zinc-800 hover:border-indigo-500/50 text-[10px] text-zinc-400 hover:text-indigo-200 transition-all cursor-pointer group/label"
                              >
                                <span className="truncate max-w-[170px]">{edgeLabel}</span>
                                <Pencil className="w-2.5 h-2.5 text-zinc-500 group-hover/label:text-indigo-400 shrink-0 transition-colors" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Tags */}
            {data.tags && data.tags.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-purple-400" />
                  Curiosity Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {data.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md text-[10.5px] bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-default"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Connected References */}
            {data.links && data.links.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                  Reading & Sources
                </span>
                <ul className="space-y-1.5">
                  {data.links.map((link, idx) => (
                    <li key={idx}>
                      <a
                        href={link.url}
                        onClick={(e) => e.preventDefault()}
                        className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-indigo-300 transition-all group"
                      >
                        <span className="truncate">{link.label}</span>
                        <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-indigo-400 shrink-0" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Actions Bar */}
      {selectedNode && activeTab === 'details' && !isEditing && (
        <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/90 flex items-center gap-2">
          <button
            className="flex-1 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors shadow-sm active:scale-[0.98] cursor-pointer"
            onClick={() => onDeepenTrail && onDeepenTrail(selectedNode)}
            title="Branch child question off this concept"
            aria-label="Deepen trail: Branch child question"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Deepen Trail</span>
          </button>

          <button
            onClick={handleStartEdit}
            title="Edit concept"
            aria-label="Edit concept details"
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onRequestDeleteNode(selectedNode)}
            title="Delete concept"
            aria-label="Delete this concept"
            className="p-2 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 border border-zinc-800 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsBookmarked((prev) => !prev)}
            title={isBookmarked ? 'Bookmarked' : 'Bookmark concept'}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark concept'}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              isBookmarked
                ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-zinc-800'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleShareClick}
            title={shareFeedback ? 'Copied to clipboard!' : 'Share concept'}
            aria-label="Share concept details"
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer relative"
          >
            {shareFeedback ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      )}
    </aside>
  )
}
