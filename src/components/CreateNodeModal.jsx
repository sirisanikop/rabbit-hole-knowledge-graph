import { useState, useEffect, useRef, useCallback } from 'react'
import {
  X,
  Plus,
  Sparkles,
  Link2,
  ChevronDown,
} from 'lucide-react'
import { CONCEPT_CATEGORIES } from '../data'

export default function CreateNodeModal({
  onClose,
  onSubmit,
  selectedParentNode,
}) {
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [category, setCategory] = useState('Open Inquiry')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [tags, setTags] = useState('')
  const [connectToParent, setConnectToParent] = useState(false)

  const titleInputRef = useRef(null)
  const categoryContainerRef = useRef(null)

  // Auto focus title input on mount
  useEffect(() => {
    titleInputRef.current?.focus()
  }, [])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        categoryContainerRef.current &&
        !categoryContainerRef.current.contains(e.target)
      ) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const submitForm = useCallback(() => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return

    const enteredCategory = category.trim() || 'General'

    // Match existing category if applicable for color theming
    const matchedCategory = CONCEPT_CATEGORIES.find(
      (c) =>
        c.label.toLowerCase() === enteredCategory.toLowerCase() ||
        c.key.toLowerCase() === enteredCategory.toLowerCase()
    )

    const categoryKey = matchedCategory
      ? matchedCategory.key
      : enteredCategory.toLowerCase().replace(/[^a-z0-9_-]/g, '-') || 'custom'

    const parsedTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    onSubmit({
      title: trimmedTitle,
      summary: summary.trim(),
      category: enteredCategory,
      categoryKey: categoryKey,
      tags: parsedTags,
      isQuestion: trimmedTitle.endsWith('?'),
      connectToParent:
        connectToParent && selectedParentNode ? selectedParentNode.id : null,
    })
  }, [
    title,
    summary,
    category,
    tags,
    connectToParent,
    selectedParentNode,
    onSubmit,
  ])

  // Close suggestions or modal on Escape, Submit on ⌘+Enter / Ctrl+Enter
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showSuggestions) {
          setShowSuggestions(false)
        } else {
          onClose()
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        submitForm()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, submitForm, showSuggestions])

  const handleSubmit = (e) => {
    e.preventDefault()
    submitForm()
  }

  // Find match among predefined categories for dot color indicator
  const matchedCategory = CONCEPT_CATEGORIES.find(
    (c) =>
      c.label.toLowerCase() === category.trim().toLowerCase() ||
      c.key.toLowerCase() === category.trim().toLowerCase()
  )

  const filteredSuggestions = CONCEPT_CATEGORIES.filter((cat) => {
    const query = category.trim().toLowerCase()
    if (!query) return true
    return (
      cat.label.toLowerCase().includes(query) ||
      cat.description.toLowerCase().includes(query) ||
      cat.key.toLowerCase().includes(query)
    )
  })

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-node-modal-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800/90 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 id="create-node-modal-title" className="text-sm font-semibold text-zinc-100">
                Add Concept Node
              </h2>
              <p className="text-xs text-zinc-400">
                Branch a new question, hypothesis, or paradigm
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Concept Title */}
          <div>
            <label htmlFor="concept-title" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Concept Title or Question <span className="text-indigo-400">*</span>
            </label>
            <input
              id="concept-title"
              ref={titleInputRef}
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. When should a circular linked list be preferred over a linear array?"
              className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Flexible Category Input with Autocomplete & Suggestions */}
          <div ref={categoryContainerRef} className="relative">
            <label htmlFor="concept-category" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Category <span className="text-zinc-500 font-normal">(type custom or choose suggestion)</span>
            </label>
            <div className="relative">
              <input
                id="concept-category"
                type="text"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Type any custom category or choose from list..."
                autoComplete="off"
                className="w-full pl-3 pr-14 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />

              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0"
                  style={{ backgroundColor: matchedCategory?.color || '#a855f7' }}
                  title={matchedCategory ? `Matched: ${matchedCategory.label}` : 'Custom Category'}
                />
                <button
                  type="button"
                  onClick={() => setShowSuggestions((prev) => !prev)}
                  className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors cursor-pointer"
                  title="Toggle category suggestions"
                  tabIndex={-1}
                >
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-150 ${
                      showSuggestions ? 'rotate-180 text-indigo-400' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 border-b border-zinc-800/80 bg-zinc-950/70 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Predefined Categories</span>
                    {category.trim() && !matchedCategory && (
                      <span className="text-indigo-400 font-normal capitalize">Custom: "{category.trim()}"</span>
                    )}
                  </div>

                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map((cat) => {
                      const isSelected =
                        category.trim().toLowerCase() === cat.label.toLowerCase() ||
                        category.trim().toLowerCase() === cat.key.toLowerCase()

                      return (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => {
                            setCategory(cat.label)
                            setShowSuggestions(false)
                          }}
                          className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between border-b border-zinc-800/40 last:border-0 cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600/20 text-indigo-200'
                              : 'hover:bg-zinc-800/70 text-zinc-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: cat.color }}
                            />
                            <span className="font-medium truncate">{cat.label}</span>
                          </div>
                          <span className="text-[10px] text-zinc-400 truncate ml-2 max-w-[170px] hidden sm:inline">
                            {cat.description}
                          </span>
                        </button>
                      )
                    })
                  ) : (
                    <div className="p-3 text-center space-y-1">
                      <p className="text-xs text-zinc-300">
                        Using custom category: <span className="font-semibold text-indigo-300">"{category.trim()}"</span>
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        This custom category will be stored and assigned to the concept.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Suggestion Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              <span className="text-[10px] text-zinc-500 font-medium">Suggestions:</span>
              {CONCEPT_CATEGORIES.map((cat) => {
                const isSelected =
                  category.trim().toLowerCase() === cat.label.toLowerCase()

                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => {
                      setCategory(cat.label)
                      setShowSuggestions(false)
                    }}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-medium border transition-colors flex items-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/25 text-indigo-200 border-indigo-500/60 shadow-sm'
                        : 'bg-zinc-950/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border-zinc-800'
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

          {/* Description / Summary */}
          <div>
            <label htmlFor="concept-summary" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Core Thesis / Description
            </label>
            <textarea
              id="concept-summary"
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Outline the core mechanism, time complexity guarantees, or trade-offs..."
              className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="concept-tags" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Curiosity Tags (comma separated)
            </label>
            <input
              id="concept-tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. Data Structures, Pointers, Traversal"
              className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Connect to Parent Checkbox */}
          {selectedParentNode && (
            <div className="pt-2 border-t border-zinc-800/80">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={connectToParent}
                  onChange={(e) => setConnectToParent(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-zinc-900 cursor-pointer"
                />
                <span className="text-xs text-zinc-300 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-indigo-400" />
                  Connect as branch from{' '}
                  <span className="font-semibold text-zinc-100 truncate max-w-xs">
                    "{selectedParentNode.data?.title}"
                  </span>
                </span>
              </label>
            </div>
          )}

          {/* Form Actions with Keyboard Hint */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
              ⌘+Enter to submit
            </span>
            <div className="flex items-center gap-2.5 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-600 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-sm shadow-indigo-500/25 flex items-center gap-1.5 transition-all cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Node</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
