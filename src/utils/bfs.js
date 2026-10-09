/**
 * Breadth-First Search (BFS) to find the shortest curiosity trail
 * between two concepts in the graph.
 */
export function findShortestPath(nodes, edges, startNodeId, endNodeId) {
  if (!startNodeId || !endNodeId) return null

  // If start and destination are the exact same node
  if (startNodeId === endNodeId) {
    const node = nodes.find((n) => n.id === startNodeId)
    return {
      pathNodeIds: [startNodeId],
      pathEdgeIds: [],
      nodes: node ? [node] : [],
      hops: 0,
    }
  }

  // Build undirected adjacency graph
  const adjacency = new Map()
  nodes.forEach((n) => adjacency.set(n.id, []))

  edges.forEach((e) => {
    if (adjacency.has(e.source) && adjacency.has(e.target)) {
      adjacency.get(e.source).push({ neighborId: e.target, edgeId: e.id })
      adjacency.get(e.target).push({ neighborId: e.source, edgeId: e.id })
    }
  })

  // BFS Queue stores: { currentId, pathNodeIds, pathEdgeIds }
  const queue = [
    {
      currentId: startNodeId,
      pathNodeIds: [startNodeId],
      pathEdgeIds: [],
    },
  ]

  const visited = new Set([startNodeId])

  while (queue.length > 0) {
    const { currentId, pathNodeIds, pathEdgeIds } = queue.shift()

    const neighbors = adjacency.get(currentId) || []
    for (const { neighborId, edgeId } of neighbors) {
      if (neighborId === endNodeId) {
        const fullNodeIds = [...pathNodeIds, neighborId]
        const fullEdgeIds = [...pathEdgeIds, edgeId]
        const nodeMap = new Map(nodes.map((n) => [n.id, n]))

        return {
          pathNodeIds: fullNodeIds,
          pathEdgeIds: fullEdgeIds,
          nodes: fullNodeIds.map((id) => nodeMap.get(id)).filter(Boolean),
          hops: fullEdgeIds.length,
        }
      }

      if (!visited.has(neighborId)) {
        visited.add(neighborId)
        queue.push({
          currentId: neighborId,
          pathNodeIds: [...pathNodeIds, neighborId],
          pathEdgeIds: [...pathEdgeIds, edgeId],
        })
      }
    }
  }

  // No connecting path found between isolated clusters
  return null
}
