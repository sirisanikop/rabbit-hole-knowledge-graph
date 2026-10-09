import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import {
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from '@xyflow/react'
import {
  Toolbar,
  Sidebar,
  NodeDetailPanel,
  GraphCanvas,
  CreateNodeModal,
  DeleteConfirmModal,
  CategoryFilterBar,
  NotificationToast,
} from './components'
import {
  INITIAL_SAVED_GRAPHS,
  INITIAL_NODES,
  INITIAL_EDGES,
} from './data'
import {
  findShortestPath,
  saveGraphToStorage,
  loadGraphFromStorage,
  clearGraphStorage,
  exportGraphToFile,
  validateAndParseGraphJSON,
  buildDeepenTrailGraphElements,
  calculateAddNodePlacement,
} from './utils'

export default function App() {
  // Load persistent graph from browser localStorage if available
  const initialStorage = useMemo(() => loadGraphFromStorage(), [])

  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialStorage?.nodes?.length ? initialStorage.nodes : INITIAL_NODES
  )
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialStorage ? initialStorage.edges : INITIAL_EDGES
  )
  const [savedGraphs, setSavedGraphs] = useState(
    initialStorage?.savedGraphs?.length ? initialStorage.savedGraphs : INITIAL_SAVED_GRAPHS
  )
  const [activeGraphId, setActiveGraphId] = useState(
    initialStorage?.activeGraphId || 'graph-1'
  )

  const [selectedNodeId, setSelectedNodeId] = useState(() => {
    const list = initialStorage?.nodes?.length ? initialStorage.nodes : INITIAL_NODES
    return list.length > 0 ? list[0].id : null
  })
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  )
  const [rightSidebarOpen, setRightSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1280 : true
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [reactFlowInstance, setReactFlowInstance] = useState(null)

  // Floating notifications state (for storage, import, export feedback)
  const [notification, setNotification] = useState(null)

  // Hidden file input ref for JSON graph import
  const fileInputRef = useRef(null)

  // Curiosity Trail (BFS) state
  const [startNodeId, setStartNodeId] = useState(null)
  const [endNodeId, setEndNodeId] = useState(null)

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [nodeToDelete, setNodeToDelete] = useState(null)

  // Listen for Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        const input = document.getElementById('global-search-input')
        if (input) {
          input.focus()
          input.select()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Calculate dynamic connections count for each node
  const connectionCounts = useMemo(() => {
    const counts = {}
    edges.forEach((edge) => {
      counts[edge.source] = (counts[edge.source] || 0) + 1
      counts[edge.target] = (counts[edge.target] || 0) + 1
    })
    return counts
  }, [edges])

  // Helper matching evaluator across title, description/summary, tags, and category
  const isNodeMatching = useCallback((node, query, categoryKey) => {
    const data = node.data || {}
    const q = query.trim().toLowerCase()
    const titleMatch = !q || (data.title || '').toLowerCase().includes(q)
    const summaryMatch = !q || (data.summary || '').toLowerCase().includes(q)
    const tagsMatch =
      !q ||
      (Array.isArray(data.tags) &&
        data.tags.some((t) => (t || '').toLowerCase().includes(q)))
    const textMatch = titleMatch || summaryMatch || tagsMatch

    const catMatch =
      categoryKey === 'all' ||
      (data.categoryKey || '').toLowerCase() === categoryKey.toLowerCase()

    return textMatch && catMatch
  }, [])

  const hasActiveFilters = useMemo(
    () => selectedCategory !== 'all' || Boolean(searchQuery.trim()),
    [selectedCategory, searchQuery]
  )

  // Matching node IDs set for search/category
  const matchingNodeIds = useMemo(() => {
    const ids = new Set()
    nodes.forEach((node) => {
      if (isNodeMatching(node, searchQuery, selectedCategory)) {
        ids.add(node.id)
      }
    })
    return ids
  }, [nodes, searchQuery, selectedCategory, isNodeMatching])

  const matchCount = matchingNodeIds.size

  // Compute shortest path via BFS
  const trailResult = useMemo(() => {
    if (!startNodeId || !endNodeId) return null
    return findShortestPath(nodes, edges, startNodeId, endNodeId)
  }, [nodes, edges, startNodeId, endNodeId])

  const trailNodeIdSet = useMemo(() => {
    return new Set(trailResult ? trailResult.pathNodeIds : [])
  }, [trailResult])

  const trailEdgeIdSet = useMemo(() => {
    return new Set(trailResult ? trailResult.pathEdgeIds : [])
  }, [trailResult])

  // Center view on trail when path is found
  useEffect(() => {
    if (trailResult && reactFlowInstance && trailResult.nodes.length > 0) {
      const first = trailResult.nodes[0]
      const last = trailResult.nodes[trailResult.nodes.length - 1]
      if (first && last) {
        const midX = (first.position.x + last.position.x) / 2 + 140
        const midY = (first.position.y + last.position.y) / 2 + 70
        reactFlowInstance.setCenter(midX, midY, { zoom: 0.95, duration: 600 })
      }
    }
  }, [trailResult, reactFlowInstance])

  // Attach dynamic selection, connection counts, search/filter dimming, and visual match/trail flags
  const displayNodes = useMemo(() => {
    return nodes.map((node) => {
      const isMatch = matchingNodeIds.has(node.id)
      const isInTrail = trailNodeIdSet.has(node.id)
      const trailIndex = trailResult
        ? trailResult.pathNodeIds.indexOf(node.id)
        : -1

      let opacity = 1
      let filter = 'none'

      if (trailResult) {
        opacity = isInTrail ? 1 : 0.15
        filter = isInTrail ? 'none' : 'grayscale(80%)'
      } else if (hasActiveFilters) {
        opacity = isMatch ? 1 : 0.18
        filter = isMatch ? 'none' : 'grayscale(80%)'
      }

      return {
        ...node,
        selected: node.id === selectedNodeId,
        data: {
          ...node.data,
          connectionsCount: connectionCounts[node.id] || 0,
          isSearchMatch: isMatch,
          hasActiveFilter: hasActiveFilters,
          isInTrail,
          isTrailStart: node.id === startNodeId,
          isTrailEnd: node.id === endNodeId,
          trailStep: trailIndex >= 0 ? trailIndex + 1 : undefined,
        },
        style: {
          ...node.style,
          opacity,
          filter,
          transition: 'opacity 0.25s ease, filter 0.25s ease',
        },
      }
    })
  }, [
    nodes,
    selectedNodeId,
    connectionCounts,
    matchingNodeIds,
    hasActiveFilters,
    trailResult,
    trailNodeIdSet,
    startNodeId,
    endNodeId,
  ])

  // Visually highlight edges in the active Curiosity Trail or matching search subgraph
  const displayEdges = useMemo(() => {
    if (trailResult) {
      return edges.map((edge) => {
        const isInTrailEdge = trailEdgeIdSet.has(edge.id)
        return {
          ...edge,
          style: {
            ...edge.style,
            opacity: isInTrailEdge ? 1 : 0.1,
            stroke: isInTrailEdge ? '#10b981' : '#3f3f46',
            strokeWidth: isInTrailEdge ? 3.5 : 1.5,
            transition:
              'opacity 0.25s ease, stroke 0.25s ease, stroke-width 0.25s ease',
          },
          animated: isInTrailEdge ? true : edge.animated,
        }
      })
    }

    if (!hasActiveFilters) return edges

    return edges.map((edge) => {
      const bothMatch =
        matchingNodeIds.has(edge.source) && matchingNodeIds.has(edge.target)

      return {
        ...edge,
        style: {
          ...edge.style,
          opacity: bothMatch ? 1 : 0.15,
          stroke: bothMatch ? '#818cf8' : '#3f3f46',
          transition: 'opacity 0.25s ease, stroke 0.25s ease',
        },
      }
    })
  }, [edges, trailResult, trailEdgeIdSet, hasActiveFilters, matchingNodeIds])

  // Currently selected node object
  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  )

  // Connected nodes to selected node
  const connectedNodes = useMemo(() => {
    if (!selectedNodeId) return []
    const connectedIds = new Set()
    edges.forEach((edge) => {
      if (edge.source === selectedNodeId) connectedIds.add(edge.target)
      if (edge.target === selectedNodeId) connectedIds.add(edge.source)
    })
    return nodes.filter((n) => connectedIds.has(n.id))
  }, [selectedNodeId, edges, nodes])

  // Derived saved graphs with live node count for active graph
  const displaySavedGraphs = useMemo(() => {
    return savedGraphs.map((g) =>
      g.id === activeGraphId ? { ...g, nodeCount: nodes.length } : g
    )
  }, [savedGraphs, activeGraphId, nodes.length])

  // Active graph metadata
  const activeGraph = useMemo(
    () =>
      displaySavedGraphs.find((g) => g.id === activeGraphId) ||
      displaySavedGraphs[0],
    [displaySavedGraphs, activeGraphId]
  )

  // Auto-save graph to browser localStorage whenever nodes, edges, or settings change (debounced 350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      saveGraphToStorage({
        nodes,
        edges,
        activeGraphId,
        savedGraphs: displaySavedGraphs,
      })
    }, 350)
    return () => clearTimeout(timer)
  }, [nodes, edges, activeGraphId, displaySavedGraphs])

  // Synchronize on tab close or navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveGraphToStorage({
        nodes,
        edges,
        activeGraphId,
        savedGraphs: displaySavedGraphs,
      })
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [nodes, edges, activeGraphId, displaySavedGraphs])

  // Prevent self-connection and duplicate edges
  const isValidConnection = useCallback(
    (connection) => {
      // Disallow self-connection
      if (
        !connection.source ||
        !connection.target ||
        connection.source === connection.target
      ) {
        return false
      }

      // Disallow duplicate edge in either direction
      const isDuplicate = edges.some(
        (e) =>
          (e.source === connection.source && e.target === connection.target) ||
          (e.source === connection.target && e.target === connection.source)
      )

      return !isDuplicate
    },
    [edges]
  )

  // Edge connect handler with dark-themed styling
  const onConnect = useCallback(
    (params) => {
      if (!isValidConnection(params)) return

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'customEdge',
            animated: true,
            label: 'Inquiry Path',
            style: { stroke: '#818cf8', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#818cf8',
              width: 14,
              height: 14,
            },
          },
          eds
        )
      )
    },
    [isValidConnection, setEdges]
  )

  // Remove a specific edge by ID
  const handleDeleteEdge = useCallback(
    (edgeId) => {
      setEdges((eds) => eds.filter((e) => e.id !== edgeId))
    },
    [setEdges]
  )

  // Update a specific edge's label
  const handleUpdateEdgeLabel = useCallback(
    (edgeId, newLabel) => {
      const trimmed = (newLabel || '').trim()
      if (!trimmed) return

      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === edgeId) {
            return {
              ...edge,
              label: trimmed,
              data: {
                ...edge.data,
                label: trimmed,
              },
            }
          }
          return edge
        })
      )
    },
    [setEdges]
  )

  // Disconnect any edge connecting two nodes
  const handleDisconnectNodes = useCallback(
    (nodeA, nodeB) => {
      setEdges((eds) =>
        eds.filter(
          (e) =>
            !(
              (e.source === nodeA && e.target === nodeB) ||
              (e.source === nodeB && e.target === nodeA)
            )
        )
      )
    },
    [setEdges]
  )

  // Handle keyboard/canvas edge deletions
  const handleEdgesDelete = useCallback(
    (deletedEdges) => {
      const deletedIds = new Set(deletedEdges.map((e) => e.id))
      setEdges((eds) => eds.filter((e) => !deletedIds.has(e.id)))
    },
    [setEdges]
  )

  // Intercept node removals so a confirmation dialog is always displayed first
  const handleCustomNodesChange = useCallback(
    (changes) => {
      const nonRemoveChanges = changes.filter((c) => c.type !== 'remove')
      const removeChanges = changes.filter((c) => c.type === 'remove')

      if (removeChanges.length > 0) {
        const targetNode = nodes.find((n) => n.id === removeChanges[0].id)
        if (targetNode) {
          setNodeToDelete(targetNode)
        }
      }

      if (nonRemoveChanges.length > 0) {
        onNodesChange(nonRemoveChanges)
      }
    },
    [nodes, onNodesChange]
  )

  // Handle keyboard/canvas node deletions - prompt confirmation dialog
  const handleNodesDelete = useCallback(
    (deletedNodes) => {
      if (!deletedNodes || deletedNodes.length === 0) return
      setNodeToDelete(deletedNodes[0])
    },
    []
  )

  // Node selection from Canvas
  const onNodeClick = useCallback((_event, node) => {
    setSelectedNodeId(node.id)
    setRightSidebarOpen(true)
  }, [])

  // Canvas pane click
  const onPaneClick = useCallback(() => {
    // Keep selection intact so details panel stays visible
  }, [])

  // Node selection from Sidebar list or Connected nodes
  const handleSelectNode = useCallback(
    (id) => {
      setSelectedNodeId(id)
      setRightSidebarOpen(true)
      const targetNode = nodes.find((n) => n.id === id)
      if (targetNode && reactFlowInstance) {
        reactFlowInstance.setCenter(
          targetNode.position.x + 140,
          targetNode.position.y + 70,
          { zoom: 1.1, duration: 700 }
        )
      }
    },
    [nodes, reactFlowInstance]
  )

  // Select Saved Graph
  const handleSelectGraph = useCallback((id) => {
    setActiveGraphId(id)
    setStartNodeId(null)
    setEndNodeId(null)
  }, [])

  // Zoom to fit inside central panel
  const handleFitView = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.22, duration: 600 })
    }
  }, [reactFlowInstance])

  // Toggle left sidebar and re-fit view cleanly
  const handleToggleLeftSidebar = useCallback(() => {
    setLeftSidebarOpen((prev) => !prev)
    if (reactFlowInstance) {
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.22, duration: 400 })
      }, 60)
    }
  }, [reactFlowInstance])

  // Toggle right sidebar and re-fit view cleanly
  const handleToggleRightSidebar = useCallback(() => {
    setRightSidebarOpen((prev) => !prev)
    if (reactFlowInstance) {
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.22, duration: 400 })
      }, 60)
    }
  }, [reactFlowInstance])

  // Auto-layout placeholder
  const handleAutoLayout = useCallback(() => {
    setNodes((nds) =>
      nds.map((node, index) => {
        const row = Math.floor(index / 3)
        const col = index % 3
        return {
          ...node,
          position: {
            x: 80 + col * 340,
            y: 60 + row * 230,
          },
        }
      })
    )
    if (reactFlowInstance) {
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.22, duration: 600 })
      }, 60)
    }
  }, [setNodes, reactFlowInstance])

  // Open Create Node modal
  const handleOpenAddNode = useCallback(() => {
    setIsCreateModalOpen(true)
  }, [])

  // Handle Create Node submission from modal
  const handleCreateNodeSubmit = useCallback(
    ({
      title,
      summary,
      category,
      categoryKey,
      tags,
      isQuestion,
      connectToParent,
    }) => {
      const parentNode = connectToParent
        ? nodes.find((n) => n.id === connectToParent)
        : null

      const { position, sourceHandle, targetHandle, connectToParentId } =
        calculateAddNodePlacement({
          parentNode,
          nodes,
          edges,
          reactFlowInstance,
        })

      const newId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`

      const newNode = {
        id: newId,
        type: 'customNode',
        position,
        data: {
          title,
          summary,
          category,
          categoryKey,
          categoryColor: categoryKey,
          status: 'New Inquiry',
          depth: parentNode ? 'Connected Branch' : 'New Origin',
          tags: tags || [],
          isQuestion,
          notes: '',
          links: [],
        },
      }

      setNodes((nds) => [...nds, newNode])

      if (connectToParentId) {
        const newEdge = {
          id: `e-${connectToParentId}-${newId}`,
          source: connectToParentId,
          target: newId,
          type: 'customEdge',
          sourceHandle: sourceHandle || 'bottom',
          targetHandle: targetHandle || 'top',
          label: 'Inquiry Path',
          animated: true,
          style: { stroke: '#818cf8', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#818cf8',
            width: 14,
            height: 14,
          },
        }
        setEdges((eds) => [...eds, newEdge])
      }

      setSelectedNodeId(newId)
      setRightSidebarOpen(true)
      setIsCreateModalOpen(false)

      if (reactFlowInstance) {
        setTimeout(() => {
          reactFlowInstance.setCenter(position.x + 140, position.y + 70, {
            zoom: 1.05,
            duration: 700,
          })
        }, 80)
      }
    },
    [nodes, edges, reactFlowInstance, setNodes, setEdges]
  )

  // Handle Editing / Updating a Node
  const handleUpdateNode = useCallback(
    (nodeId, updatedFields) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...updatedFields,
              },
            }
          }
          return node
        })
      )
    },
    [setNodes]
  )

  // Handle Requesting Deletion of a Node
  const handleRequestDeleteNode = useCallback((node) => {
    setNodeToDelete(node)
  }, [])

  // Confirm Node Deletion (cascade removes connected edges)
  const handleConfirmDeleteNode = useCallback(() => {
    if (!nodeToDelete) return
    const targetId = nodeToDelete.id

    // Remove the node from nodes state
    setNodes((nds) => nds.filter((n) => n.id !== targetId))

    // Remove all edges connected to this node
    setEdges((eds) =>
      eds.filter((edge) => edge.source !== targetId && edge.target !== targetId)
    )

    // Clear selection if deleted node was selected
    if (selectedNodeId === targetId) {
      setSelectedNodeId(null)
    }
    if (startNodeId === targetId) {
      setStartNodeId(null)
    }
    if (endNodeId === targetId) {
      setEndNodeId(null)
    }

    setNodeToDelete(null)
  }, [nodeToDelete, selectedNodeId, startNodeId, endNodeId, setNodes, setEdges])

  // Deepen trail: branch 3-4 distinct child inquiry paths from the selected node
  const handleDeepenTrail = useCallback(
    (parentNode) => {
      if (!parentNode) return

      const { newNodes, newEdges, direction } = buildDeepenTrailGraphElements(
        parentNode,
        nodes,
        edges
      )

      if (newNodes.length === 0) return

      setNodes((nds) => [...nds, ...newNodes])
      setEdges((eds) => [...eds, ...newEdges])

      // Select the first new branch node
      const primaryNewNode = newNodes[0]
      setSelectedNodeId(primaryNewNode.id)
      setRightSidebarOpen(true)

      setNotification({
        type: 'success',
        title: 'Deepened Inquiry Trail',
        message: `Branched ${newNodes.length} distinct inquiry paths (${direction.toLowerCase()}) from "${(parentNode.data?.title || 'Concept').slice(0, 32)}...".`,
      })

      if (reactFlowInstance) {
        setTimeout(() => {
          reactFlowInstance.fitView({ padding: 0.22, duration: 600 })
        }, 100)
      }
    },
    [nodes, edges, setNodes, setEdges, reactFlowInstance]
  )

  // Clear search option
  const handleClearSearch = useCallback(() => {
    setSearchQuery('')
  }, [])

  // Reset all filters option
  const handleResetFilters = useCallback(() => {
    setSearchQuery('')
    setSelectedCategory('all')
  }, [])

  // Clear Curiosity Trail
  const handleClearTrail = useCallback(() => {
    setStartNodeId(null)
    setEndNodeId(null)
  }, [])

  // Export current graph as JSON file backup
  const handleExport = useCallback(() => {
    try {
      exportGraphToFile(nodes, edges, activeGraph)
      setNotification({
        type: 'success',
        title: 'Graph Exported',
        message: `"${activeGraph?.title || 'Curiosity Graph'}" (${nodes.length} concepts, ${edges.length} connections) exported successfully.`,
      })
    } catch (err) {
      setNotification({
        type: 'error',
        title: 'Export Failed',
        message:
          err.message || 'An error occurred while generating the JSON file.',
      })
    }
  }, [nodes, edges, activeGraph])

  // Trigger file selection for graph import
  const handleImportClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
      fileInputRef.current.click()
    }
  }, [])

  // Import graph from JSON file with validation and error reporting
  const handleImportFile = useCallback(
    (event) => {
      const file = event.target.files?.[0]
      if (!file) return

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setNotification({
          type: 'error',
          title: 'Import Failed',
          message: 'The selected JSON file exceeds the maximum 5MB size limit.',
        })
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target?.result
          const result = validateAndParseGraphJSON(content)

          if (!result.valid) {
            setNotification({
              type: 'error',
              title: 'Invalid Graph File',
              message: result.error,
            })
            return
          }

          const {
            nodes: importedNodes,
            edges: importedEdges,
            graphInfo,
          } = result.data

          setNodes(importedNodes)
          setEdges(importedEdges)
          setSelectedNodeId(
            importedNodes.length > 0 ? importedNodes[0].id : null
          )
          setStartNodeId(null)
          setEndNodeId(null)

          if (graphInfo?.title) {
            const importedGraphId = graphInfo.id || `graph-${Date.now()}`
            setSavedGraphs((prev) => {
              const exists = prev.find((g) => g.id === importedGraphId)
              if (exists) {
                return prev.map((g) =>
                  g.id === importedGraphId
                    ? {
                        ...g,
                        title: graphInfo.title,
                        subtitle: graphInfo.subtitle || g.subtitle,
                        nodeCount: importedNodes.length,
                      }
                    : g
                )
              }
              return [
                ...prev,
                {
                  id: importedGraphId,
                  title: graphInfo.title,
                  subtitle: graphInfo.subtitle || 'Imported graph backup',
                  nodeCount: importedNodes.length,
                  color: '#10b981',
                  tags: ['Imported'],
                },
              ]
            })
            setActiveGraphId(importedGraphId)
          }

          // Save immediately to persistent storage
          saveGraphToStorage({
            nodes: importedNodes,
            edges: importedEdges,
            activeGraphId: graphInfo?.id || activeGraphId,
            savedGraphs: displaySavedGraphs,
          })

          setNotification({
            type: 'success',
            title: 'Graph Restored',
            message: `Successfully imported ${importedNodes.length} concepts and ${importedEdges.length} connections.`,
          })

          if (reactFlowInstance) {
            setTimeout(() => {
              reactFlowInstance.fitView({ padding: 0.22, duration: 600 })
            }, 100)
          }
        } catch (err) {
          setNotification({
            type: 'error',
            title: 'Import Error',
            message: `An unexpected error occurred while processing the graph: ${err.message}`,
          })
        } finally {
          if (fileInputRef.current) fileInputRef.current.value = ''
        }
      }

      reader.onerror = () => {
        setNotification({
          type: 'error',
          title: 'File Read Error',
          message: 'Could not read the selected file from disk.',
        })
        if (fileInputRef.current) fileInputRef.current.value = ''
      }

      reader.readAsText(file)
    },
    [reactFlowInstance, activeGraphId, displaySavedGraphs, setNodes, setEdges]
  )

  // Reset back to initial sample curiosity graph
  const handleResetToSampleGraph = useCallback(() => {
    clearGraphStorage()
    setNodes(INITIAL_NODES)
    setEdges(INITIAL_EDGES)
    setSavedGraphs(INITIAL_SAVED_GRAPHS)
    setActiveGraphId('graph-1')
    setSelectedNodeId('node-1')
    setStartNodeId(null)
    setEndNodeId(null)
    setSearchQuery('')
    setSelectedCategory('all')
    setNotification({
      type: 'info',
      title: 'Sample Graph Restored',
      message: 'Reset to the original default curiosity graph.',
    })
    if (reactFlowInstance) {
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.22, duration: 600 })
      }, 100)
    }
  }, [setNodes, setEdges, reactFlowInstance])

  // Filtered nodes for the left sidebar
  const sidebarFilteredNodes = useMemo(() => {
    return nodes.filter((node) =>
      isNodeMatching(node, searchQuery, selectedCategory)
    )
  }, [nodes, searchQuery, selectedCategory, isNodeMatching])

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Top Application Toolbar */}
      <Toolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearSearch={handleClearSearch}
        onAddNode={handleOpenAddNode}
        onFitView={handleFitView}
        onAutoLayout={handleAutoLayout}
        onExport={handleExport}
        onImportClick={handleImportClick}
        toggleLeftSidebar={handleToggleLeftSidebar}
        toggleRightSidebar={handleToggleRightSidebar}
        leftSidebarOpen={leftSidebarOpen}
        rightSidebarOpen={rightSidebarOpen}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
        matchCount={matchCount}
        totalCount={nodes.length}
      />

      {/* Main 3-Column Workspace: strict flex bounds preventing any canvas bleed */}
      <div className="flex-1 flex min-h-0 min-w-0 relative overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          savedGraphs={displaySavedGraphs}
          activeGraphId={activeGraphId}
          onSelectGraph={handleSelectGraph}
          nodes={sidebarFilteredNodes}
          selectedNodeId={selectedNodeId}
          onSelectNode={handleSelectNode}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          trailResult={trailResult}
          onClearTrail={handleClearTrail}
          onResetToSampleGraph={handleResetToSampleGraph}
          onClose={() => setLeftSidebarOpen(false)}
          isOpen={leftSidebarOpen}
        />

        {/* Mobile Backdrop Overlay for sidebars */}
        {(leftSidebarOpen || rightSidebarOpen) && (
          <div
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-20"
            onClick={() => {
              setLeftSidebarOpen(false)
              setRightSidebarOpen(false)
            }}
            aria-hidden="true"
          />
        )}

        {/* Central Interactive Graph Canvas with Category Filter Bar */}
        <div className="flex-1 min-w-0 min-h-0 relative h-full w-full overflow-hidden flex flex-col">
          {/* Top Category Filter Bar */}
          <CategoryFilterBar
            nodes={nodes}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            onClearSearch={handleClearSearch}
            onResetFilters={handleResetFilters}
            matchCount={matchCount}
            totalCount={nodes.length}
          />

          {/* Graph Workspace */}
          <div className="flex-1 min-w-0 min-h-0 relative h-full w-full overflow-hidden">
            <GraphCanvas
              nodes={displayNodes}
              edges={displayEdges}
              onNodesChange={handleCustomNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              isValidConnection={isValidConnection}
              onEdgesDelete={handleEdgesDelete}
              onNodesDelete={handleNodesDelete}
              onDeleteEdge={handleDeleteEdge}
              onUpdateEdgeLabel={handleUpdateEdgeLabel}
              trailResult={trailResult}
              onClearTrail={handleClearTrail}
              setReactFlowInstance={setReactFlowInstance}
              activeGraphTitle={activeGraph?.title}
              onAddNode={handleOpenAddNode}
              onResetToSampleGraph={handleResetToSampleGraph}
            />
          </div>
        </div>

        {/* Right Details Panel with Curiosity Trail Explorer */}
        <NodeDetailPanel
          allNodes={nodes}
          selectedNode={selectedNode}
          connectedNodes={connectedNodes}
          edges={edges}
          onUpdateEdgeLabel={handleUpdateEdgeLabel}
          onClose={() => setRightSidebarOpen(false)}
          onSelectConnectedNode={handleSelectNode}
          onDeepenTrail={handleDeepenTrail}
          onUpdateNode={handleUpdateNode}
          onRequestDeleteNode={handleRequestDeleteNode}
          onDisconnectNodes={handleDisconnectNodes}
          startNodeId={startNodeId}
          endNodeId={endNodeId}
          onSelectStartNode={setStartNodeId}
          onSelectEndNode={setEndNodeId}
          trailResult={trailResult}
          onClearTrail={handleClearTrail}
          onOpenCreateNode={handleOpenAddNode}
          isOpen={rightSidebarOpen}
        />
      </div>

      {/* Modal: Create Concept Node */}
      {isCreateModalOpen && (
        <CreateNodeModal
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateNodeSubmit}
          selectedParentNode={selectedNode}
        />
      )}

      {/* Modal: Confirm Node Deletion */}
      <DeleteConfirmModal
        isOpen={Boolean(nodeToDelete)}
        onClose={() => setNodeToDelete(null)}
        onConfirm={handleConfirmDeleteNode}
        nodeTitle={nodeToDelete?.data?.title || 'Selected Concept'}
      />

      {/* Hidden file input for JSON graph backup import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleImportFile}
      />

      {/* Floating notification feedback banner */}
      <NotificationToast
        notification={notification}
        onDismiss={() => setNotification(null)}
      />
    </div>
  )
}
