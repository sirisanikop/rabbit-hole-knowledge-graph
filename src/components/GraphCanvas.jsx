import { useState, useMemo, useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react'
import { X, Sparkles, Plus, RotateCcw } from 'lucide-react'
import CustomNode from './CustomNode'
import CustomEdge from './CustomEdge'

export default function GraphCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onPaneClick,
  isValidConnection,
  onEdgesDelete,
  onNodesDelete,
  onDeleteEdge,
  onUpdateEdgeLabel,
  trailResult,
  onClearTrail,
  setReactFlowInstance,
  activeGraphTitle = 'Data Structures & Algorithms',
  onAddNode,
  onResetToSampleGraph,
}) {
  const nodeTypes = useMemo(() => ({ customNode: CustomNode }), [])
  const edgeTypes = useMemo(() => ({ customEdge: CustomEdge }), [])
  const [editingEdgeId, setEditingEdgeId] = useState(null)

  const handleInit = useCallback(
    (instance) => {
      if (setReactFlowInstance) {
        setReactFlowInstance(instance)
      }
    },
    [setReactFlowInstance]
  )

  const handleEdgeDoubleClick = useCallback((_event, edge) => {
    setEditingEdgeId(edge.id)
  }, [])

  const handlePaneClick = useCallback(
    (event) => {
      setEditingEdgeId(null)
      if (onPaneClick) onPaneClick(event)
    },
    [onPaneClick]
  )

  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'customEdge',
      animated: true,
      style: { strokeWidth: 1.75, stroke: '#6366f1' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#6366f1',
        width: 14,
        height: 14,
      },
    }),
    []
  )

  // Inject onDeleteEdge, onUpdateLabel, and editing state into edges data
  const renderEdges = useMemo(() => {
    return edges.map((edge) => ({
      ...edge,
      type: edge.type || 'customEdge',
      data: {
        ...edge.data,
        onDelete: onDeleteEdge,
        onUpdateLabel: (edgeId, newLabel) => {
          setEditingEdgeId(null)
          if (onUpdateEdgeLabel) {
            onUpdateEdgeLabel(edgeId, newLabel)
          }
        },
        isEditing: editingEdgeId === edge.id,
        onStartEdit: (edgeId) => setEditingEdgeId(edgeId),
        onStopEdit: () => setEditingEdgeId(null),
      },
    }))
  }, [edges, onDeleteEdge, onUpdateEdgeLabel, editingEdgeId])

  return (
    <div className="flex-1 min-w-0 min-h-0 relative h-full w-full bg-zinc-950 overflow-hidden select-none">
      {/* Floating Active Curiosity Trail Header Badge */}
      {trailResult && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/95 border border-emerald-500/50 shadow-2xl backdrop-blur-md max-w-[92vw] overflow-x-auto no-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-xs font-semibold text-emerald-300 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            Curiosity Trail ({trailResult.hops} {trailResult.hops === 1 ? 'hop' : 'hops'}):
          </span>

          <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto no-scrollbar">
            {trailResult.nodes.map((node, i) => (
              <div key={node.id} className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onNodeClick && onNodeClick(null, node)}
                  className="text-xs font-medium text-zinc-200 hover:text-white px-2 py-0.5 rounded bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700/60 truncate max-w-[130px] cursor-pointer"
                  title={node.data?.title}
                >
                  {node.data?.title}
                </button>
                {i < trailResult.nodes.length - 1 && (
                  <span className="text-emerald-400 font-bold text-xs">→</span>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={onClearTrail}
            className="ml-2 p-1 rounded-full text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
            title="Clear trail"
            aria-label="Clear active curiosity trail"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Empty State Overlay when no nodes are on canvas */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none p-4">
          <div className="pointer-events-auto max-w-sm w-full p-6 rounded-2xl bg-zinc-900/95 border border-zinc-800/90 shadow-2xl backdrop-blur-xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Canvas is Empty
              </h3>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                Add your first inquiry node to begin branching questions, or load the sample curiosity graph.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
              {onAddNode && (
                <button
                  type="button"
                  onClick={onAddNode}
                  className="w-full sm:w-auto px-3.5 py-2 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Concept</span>
                </button>
              )}
              {onResetToSampleGraph && (
                <button
                  type="button"
                  onClick={onResetToSampleGraph}
                  className="w-full sm:w-auto px-3.5 py-2 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3 h-3 text-zinc-400" />
                  <span>Load Sample</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={renderEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={handlePaneClick}
        onEdgeDoubleClick={handleEdgeDoubleClick}
        isValidConnection={isValidConnection}
        onEdgesDelete={onEdgesDelete}
        onNodesDelete={onNodesDelete}
        deleteKeyCode={['Backspace', 'Delete']}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onInit={handleInit}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        panOnDrag={true}
        panOnScroll={false}
        connectionLineStyle={{
          stroke: '#818cf8',
          strokeWidth: 2,
          strokeDasharray: '4 4',
        }}
        fitView
        fitViewOptions={{ padding: 0.22 }}
        minZoom={0.25}
        maxZoom={2.2}
        defaultEdgeOptions={defaultEdgeOptions}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color="#27272a"
          gap={22}
          size={1.25}
          variant={BackgroundVariant.Dots}
        />

        <Controls
          showInteractive={false}
          className="!bg-zinc-900/90 !border !border-zinc-800/90 !rounded-xl !shadow-xl !overflow-hidden [&>button]:!bg-transparent [&>button]:!border-b [&>button]:!border-zinc-800/80 [&>button]:!text-zinc-400 [&>button:hover]:!text-zinc-100 [&>button:hover]:!bg-zinc-800/80"
        />

        <MiniMap
          nodeColor={(n) => {
            if (n.data?.isInTrail) return '#10b981'
            if (n.selected) return '#818cf8'
            const key = (n.data?.categoryKey || '').toLowerCase()
            if (key === 'paradox') return '#c084fc'
            if (key === 'theory') return '#38bdf8'
            if (key === 'architecture') return '#818cf8'
            if (key === 'philosophy') return '#fb7185'
            if (key === 'model') return '#22d3ee'
            if (key === 'question') return '#fbbf24'
            if (key === 'frontier') return '#34d399'
            return '#3f3f46'
          }}
          maskColor="rgba(9, 9, 11, 0.85)"
          className="!bg-zinc-900/95 !border !border-zinc-800/90 !rounded-xl !overflow-hidden !shadow-xl hidden md:block"
          zoomable
          pannable
        />
      </ReactFlow>

      {/* Subtle Floating Canvas Status Badge */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800/90 backdrop-blur-md text-[11px] text-zinc-400 shadow-lg">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
        <span className="font-medium text-zinc-200">{activeGraphTitle}</span>
        <span className="text-zinc-600">•</span>
        <span>{nodes.length} concepts</span>
        <span className="text-zinc-600">•</span>
        <span>{edges.length} connections</span>
      </div>
    </div>
  )
}
