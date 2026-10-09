const STORAGE_KEY_GRAPH = 'rabbit_hole_graph_v1'

/**
 * Save graph state (nodes, edges, activeGraphId) to localStorage
 */
export function saveGraphToStorage(graphData) {
  try {
    const payload = {
      nodes: graphData.nodes || [],
      edges: graphData.edges || [],
      activeGraphId: graphData.activeGraphId || 'graph-1',
      savedGraphs: graphData.savedGraphs || [],
      updatedAt: new Date().toISOString(),
      version: '1.0',
    }
    localStorage.setItem(STORAGE_KEY_GRAPH, JSON.stringify(payload))
    return true
  } catch (error) {
    console.error('Failed to save graph to localStorage:', error)
    return false
  }
}

/**
 * Load graph state from localStorage if available
 */
export function loadGraphFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GRAPH)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.nodes) || parsed.nodes.length === 0) {
      return null
    }

    // Cleanly invalidate legacy consciousness mock data if present
    const isLegacyDataset = parsed.nodes.some((n) => {
      const title = (n?.data?.title || '').toLowerCase()
      return (
        title.includes('consciousness') ||
        title.includes('integrated information') ||
        title.includes('qualia') ||
        title.includes('chalmers') ||
        title.includes('quantum decoherence')
      )
    })

    if (isLegacyDataset) {
      console.info('Legacy consciousness graph detected in localStorage. Resetting to new DSA Roadmap.')
      localStorage.removeItem(STORAGE_KEY_GRAPH)
      return null
    }

    return {
      nodes: parsed.nodes,
      edges: Array.isArray(parsed.edges) ? parsed.edges : [],
      activeGraphId: parsed.activeGraphId || 'graph-1',
      savedGraphs: Array.isArray(parsed.savedGraphs) ? parsed.savedGraphs : null,
    }
  } catch (error) {
    console.error('Failed to parse graph from localStorage:', error)
    return null
  }
}

/**
 * Clear graph state from localStorage
 */
export function clearGraphStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY_GRAPH)
    return true
  } catch (error) {
    console.error('Failed to clear localStorage:', error)
    return false
  }
}

/**
 * Export current graph as a downloadable JSON file
 */
export function exportGraphToFile(nodes, edges, activeGraph) {
  const exportData = {
    app: 'Rabbit Hole',
    subtitle: 'The Curiosity Graph',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    graph: {
      id: activeGraph?.id || 'graph-1',
      title: activeGraph?.title || 'Curiosity Graph',
      subtitle: activeGraph?.subtitle || 'Exported Graph',
    },
    nodes,
    edges,
  }

  const jsonString = JSON.stringify(exportData, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const safeTitle = (activeGraph?.title || 'curiosity-graph')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  const link = document.createElement('a')
  link.href = url
  link.download = `rabbit-hole-${safeTitle}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Validate and parse uploaded JSON file content
 */
export function validateAndParseGraphJSON(jsonText) {
  if (!jsonText || typeof jsonText !== 'string' || !jsonText.trim()) {
    return {
      valid: false,
      error: 'The uploaded file is empty.',
    }
  }

  let parsed
  try {
    parsed = JSON.parse(jsonText)
  } catch (e) {
    return {
      valid: false,
      error: `Invalid JSON syntax: ${e.message}`,
    }
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return {
      valid: false,
      error: 'File content must be a valid JSON object.',
    }
  }

  // Check for nodes array
  if (!Array.isArray(parsed.nodes)) {
    return {
      valid: false,
      error: "Missing required 'nodes' array in the file structure.",
    }
  }

  if (parsed.nodes.length === 0) {
    return {
      valid: false,
      error: 'The graph does not contain any concept nodes to import.',
    }
  }

  // Validate nodes
  const nodeIds = new Set()
  for (let i = 0; i < parsed.nodes.length; i++) {
    const node = parsed.nodes[i]
    if (!node || typeof node !== 'object') {
      return {
        valid: false,
        error: `Node at index ${i} is corrupted or not a valid object.`,
      }
    }

    if (!node.id || (typeof node.id !== 'string' && typeof node.id !== 'number')) {
      return {
        valid: false,
        error: `Node at index ${i} is missing a valid 'id' property.`,
      }
    }

    const idStr = String(node.id)
    if (nodeIds.has(idStr)) {
      return {
        valid: false,
        error: `Duplicate node ID '${idStr}' detected in imported graph.`,
      }
    }
    nodeIds.add(idStr)

    // Ensure position exists with numbers
    if (
      !node.position ||
      typeof node.position.x !== 'number' ||
      typeof node.position.y !== 'number'
    ) {
      return {
        valid: false,
        error: `Node '${node.id}' is missing valid coordinates (position.x and position.y must be numbers).`,
      }
    }

    // Ensure data object exists
    if (!node.data || typeof node.data !== 'object') {
      return {
        valid: false,
        error: `Node '${node.id}' is missing its 'data' properties object.`,
      }
    }

    if (!node.data.title || typeof node.data.title !== 'string') {
      return {
        valid: false,
        error: `Node '${node.id}' is missing a valid concept 'title'.`,
      }
    }
  }

  // Check edges array
  const rawEdges = Array.isArray(parsed.edges) ? parsed.edges : []
  const validatedEdges = []

  for (let i = 0; i < rawEdges.length; i++) {
    const edge = rawEdges[i]
    if (!edge || typeof edge !== 'object') {
      continue
    }

    if (!edge.id || !edge.source || !edge.target) {
      continue
    }

    // Verify edge endpoints exist in the node set
    if (!nodeIds.has(String(edge.source)) || !nodeIds.has(String(edge.target))) {
      // Skip edge referencing missing node rather than crashing
      console.warn(
        `Skipping edge '${edge.id}': references nonexistent nodes '${edge.source}' -> '${edge.target}'`
      )
      continue
    }

    validatedEdges.push({
      ...edge,
      id: String(edge.id),
      source: String(edge.source),
      target: String(edge.target),
      type: edge.type || 'customEdge',
      label:
        typeof edge.label === 'string' && edge.label.trim()
          ? edge.label.trim()
          : (typeof edge.data?.label === 'string' && edge.data.label.trim())
          ? edge.data.label.trim()
          : 'Inquiry Path',
    })
  }

  const validatedNodes = parsed.nodes.map((node) => ({
    ...node,
    id: String(node.id),
    type: node.type || 'customNode',
    position: {
      x: Number(node.position.x),
      y: Number(node.position.y),
    },
    data: {
      ...node.data,
      category: node.data.category || 'Concept',
      categoryKey: (
        node.data.categoryKey ||
        node.data.categoryColor ||
        'paradox'
      ).toLowerCase(),
    },
  }))

  return {
    valid: true,
    data: {
      nodes: validatedNodes,
      edges: validatedEdges,
      graphInfo: parsed.graph || null,
    },
  }
}
