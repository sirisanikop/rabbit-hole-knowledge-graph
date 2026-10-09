/**
 * Deepen Trail Generator
 * Handles intelligent subject extraction, follow-up inquiry formulation,
 * and spatial non-overlapping layout for branching curiosity trails.
 */
import { MarkerType } from '@xyflow/react'
import { CONCEPT_CATEGORIES } from '../data/categories.js'

/**
 * Extracts a clean concept subject from any concept node title or question.
 * Strips repeated prefixes, question patterns, and extracts the core noun phrase.
 * Prevents recursive prefixing bugs (e.g. "What are the limits of What are the limits of...").
 *
 * @param {string} rawTitle - Raw title of the node
 * @returns {string} Clean concept subject
 */
export function extractConceptSubject(rawTitle) {
  if (!rawTitle || typeof rawTitle !== 'string') return 'Concept'

  let s = rawTitle.trim()

  // Remove wrapping quotes
  s = s.replace(/^["'“‘]+|["'”’]+$/g, '').trim()

  // Remove trailing question marks and punctuation
  s = s.replace(/[?!.]+$/g, '').trim()

  // Repeatedly strip question prefixes to solve recursive prefixing
  const prefixRegexes = [
    /^(?:what|which)\s+(?:are|is)\s+the\s+(?:limits|boundaries|advantages|disadvantages|mechanisms|implications|foundations|origins|trade-offs|aspects)\s+(?:of|in)\s+/i,
    /^(?:what|which)\s+(?:are|is)\s+the\s+(?:core|key|primary|main)\s+(?:challenges|benefits|principles|trade-offs|aspects|advantages)\s+(?:of|in)\s+/i,
    /^(?:what|which)\s+(?:are|is)\s+/i,
    /^(?:how|why)\s+(?:does|do|can|could|is|are|will|would)\s+/i,
    /^(?:can|could|is|are|will|would|should)\s+/i,
    /^(?:when|where)\s+(?:should|can|does|do|is|are)\s+/i,
    /^(?:an?\s+)?(?:exploration|investigation|overview|introduction|analysis|deep\s+dive)\s+(?:into|of)\s+/i,
    /^(?:limits|boundaries|foundations|mechanisms|principles|advantages)\s+of\s+/i,
  ]

  let changed = true
  let maxPasses = 10
  while (changed && maxPasses > 0) {
    changed = false
    maxPasses--
    s = s.trim()
    for (const rx of prefixRegexes) {
      if (rx.test(s)) {
        s = s.replace(rx, '').trim()
        changed = true
      }
    }
  }

  // Handle prepositional object phrases (e.g. "traversal terminate in a circular linked list" -> "circular linked list")
  const prepMatch = s.match(/(?:in|for|of|around|regarding)\s+(?:a|an|the)?\s*([a-zA-Z0-9\s-_()]+)$/i)
  if (prepMatch && prepMatch[1] && prepMatch[1].trim().length >= 3) {
    const candidate = prepMatch[1].trim()
    const wordCount = candidate.split(/\s+/).length
    if (wordCount <= 6) {
      s = candidate
    }
  } else {
    // If phrase has a verb like "be preferred over..." or "explain classical realism"
    // Extract subject before the verb
    const verbMatch = s.match(/^([a-zA-Z0-9\s-_()]+?)\s+(?:be|work|operate|terminate|arise|explain|differ|underlie|interact|solve|lead to)\b/i)
    if (verbMatch && verbMatch[1] && verbMatch[1].trim().length >= 3) {
      s = verbMatch[1].trim()
    }
  }

  // Clean leading articles
  s = s.replace(/^(?:a|an|the)\s+/i, '').trim()
  s = s.replace(/[?!.,;:]+$/g, '').trim()

  // Fallback if stripped to nothing
  if (!s || s.length < 2) {
    s = rawTitle.replace(/[?!.]+$/g, '').trim()
  }

  return s
}

/**
 * Capitalizes string to title case
 */
function toTitleCase(str) {
  if (!str) return ''
  return str
    .split(' ')
    .map((word) => {
      if (!word) return ''
      if (['a', 'an', 'the', 'and', 'or', 'in', 'of', 'for', 'with', 'on'].includes(word.toLowerCase())) {
        return word.toLowerCase()
      }
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

/**
 * Generates 3-4 distinct follow-up inquiries exploring different aspects of a concept.
 *
 * @param {Object} parentNode - The selected parent node
 * @param {Array} existingNodes - All current nodes in the graph
 * @returns {Array} Array of 3-4 node template specifications
 */
export function generateDeepenQuestions(parentNode, existingNodes = []) {
  const rawTitle = parentNode?.data?.title || 'Concept'
  const subject = extractConceptSubject(rawTitle)
  const lowerSubject = subject.toLowerCase()
  const titleSubject = toTitleCase(subject)

  const existingTitles = new Set(
    existingNodes.map((n) => n.data?.title?.toLowerCase().trim())
  )

  let generatedInquiries = []

  // Check if subject relates to circular linked lists or linked lists
  if (lowerSubject.includes('circular linked')) {
    generatedInquiries = [
      {
        title: `How does traversal terminate in a circular linked list?`,
        summary: `Examines termination conditions, loop detection mechanisms, and boundary pointers preventing infinite traversal.`,
        category: 'Open Inquiry',
        categoryKey: 'question',
        edgeLabel: 'Traversal',
        tags: ['Data Structures', 'Traversal', 'Algorithms'],
      },
      {
        title: `What are the advantages of circular linked lists?`,
        summary: `Analyzes throughput benefits, circular buffer applications, and memory efficiency compared to standard linear variants.`,
        category: 'Complexity & Big O',
        categoryKey: 'theory',
        edgeLabel: 'Advantages',
        tags: ['Performance', 'Efficiency', 'Optimization'],
      },
      {
        title: `How does insertion work in a circular linked list?`,
        summary: `Investigates pointer manipulation, time complexity guarantees, and pointer updates for head and tail operations.`,
        category: 'Data Structure',
        categoryKey: 'architecture',
        edgeLabel: 'Insertion',
        tags: ['Implementation', 'Pointers', 'Mechanisms'],
      },
      {
        title: `When should a circular linked list be preferred over a linear linked list?`,
        summary: `Compares memory overhead, pointer complexity, and cache locality trade-offs against alternative data structures.`,
        category: 'Algorithmic Trade-off',
        categoryKey: 'paradox',
        edgeLabel: 'Trade-offs',
        tags: ['Trade-offs', 'Data Structures', 'System Design'],
      },
    ]
  } else if (
    lowerSubject.includes('linked list') ||
    lowerSubject.includes('singly linked') ||
    lowerSubject.includes('doubly linked')
  ) {
    const isDoubly = lowerSubject.includes('doubly')
    generatedInquiries = [
      {
        title: isDoubly
          ? `How does a doubly linked list differ from a singly linked list?`
          : `How does a linked list work in dynamic heap memory?`,
        summary: isDoubly
          ? `Analyzes bidirectional prev/next pointers, bidirectional traversal capabilities, and increased memory overhead per node.`
          : `Examines discontinuous memory allocation, pointer dereferencing, and dynamic runtime resizing characteristics.`,
        category: 'Data Structure',
        categoryKey: 'architecture',
        edgeLabel: 'Mechanism',
        tags: ['Linked Lists', 'Pointers', 'Memory'],
      },
      {
        title: isDoubly
          ? `What is the complexity of insertion and deletion in a doubly linked list?`
          : `What is the time complexity of insertion in a linked list?`,
        summary: `Compares O(1) pointer rewriting with known references versus O(n) traversal search overhead across linear structures.`,
        category: 'Complexity & Big O',
        categoryKey: 'theory',
        edgeLabel: 'Complexity',
        tags: ['Big O', 'Complexity', 'Operations'],
      },
      {
        title: isDoubly
          ? `When should I use a doubly linked list over an array or singly linked list?`
          : `When should I use a linked list instead of an array?`,
        summary: `Evaluates cache locality vs constant-time head insertion/deletion trade-offs and absence of memory relocation overhead.`,
        category: 'Algorithmic Trade-off',
        categoryKey: 'paradox',
        edgeLabel: 'Trade-offs',
        tags: ['Arrays vs Lists', 'Cache Locality', 'Trade-offs'],
      },
      {
        title: isDoubly
          ? `How are edge cases handled at the head and tail in a doubly linked list?`
          : `How does a doubly linked list differ from a singly linked list?`,
        summary: `Investigates sentinel / dummy nodes, null pointer boundaries, and bidirectional traversal invariants.`,
        category: 'Open Inquiry',
        categoryKey: 'question',
        edgeLabel: 'Design Inquiry',
        tags: ['Sentinel Nodes', 'Invariants', 'Pointers'],
      },
    ]
  } else if (lowerSubject.includes('bfs') || lowerSubject.includes('breadth-first')) {
    generatedInquiries = [
      {
        title: `How does BFS work using a queue for level-order traversal?`,
        summary: `Investigates FIFO queue operations, visited sets for cycle suppression, and layer-by-layer frontier expansion.`,
        category: 'Algorithmic Pattern',
        categoryKey: 'model',
        edgeLabel: 'Level Traversal',
        tags: ['BFS', 'Queue', 'Traversal'],
      },
      {
        title: `When should I use BFS instead of DFS?`,
        summary: `Compares unweighted shortest path guarantees and memory scaling against recursive call depth and stack limits.`,
        category: 'Algorithmic Trade-off',
        categoryKey: 'paradox',
        edgeLabel: 'Comparison',
        tags: ['BFS vs DFS', 'Shortest Path', 'Trade-offs'],
      },
      {
        title: `How does shortest path search build on graph traversal?`,
        summary: `Analyzes how BFS edge counting generalizes into Dijkstra's weighted relaxation and bidirectional search frontiers.`,
        category: 'Advanced Frontier',
        categoryKey: 'frontier',
        edgeLabel: 'Shortest Path',
        tags: ['Shortest Path', 'Dijkstra', 'Frontiers'],
      },
      {
        title: `What is the space complexity of BFS on dense graph frontiers?`,
        summary: `Examines O(V) queue footprint when branching factor causes geometric growth in frontier layers.`,
        category: 'Complexity & Big O',
        categoryKey: 'theory',
        edgeLabel: 'Space Bound',
        tags: ['Space Complexity', 'Memory Footprint', 'Big O'],
      },
    ]
  } else if (lowerSubject.includes('dfs') || lowerSubject.includes('depth-first')) {
    generatedInquiries = [
      {
        title: `How does DFS work using the call stack or an explicit stack?`,
        summary: `Analyzes recursive backtracking frames, LIFO explicit stack simulation, and node discovery/finish timestamps.`,
        category: 'Algorithmic Pattern',
        categoryKey: 'model',
        edgeLabel: 'Stack Traversal',
        tags: ['DFS', 'Recursion', 'Call Stack'],
      },
      {
        title: `When should I use BFS instead of DFS?`,
        summary: `Contrasts complete path enumeration and topological ordering with level-order shortest path guarantees.`,
        category: 'Algorithmic Trade-off',
        categoryKey: 'paradox',
        edgeLabel: 'Selection',
        tags: ['Search Strategy', 'BFS vs DFS', 'Trade-offs'],
      },
      {
        title: `How does cycle detection in directed graphs rely on DFS colors?`,
        summary: `Investigates white-gray-black node states and back edges in depth-first forests to identify directed cycles.`,
        category: 'Data Structure',
        categoryKey: 'architecture',
        edgeLabel: 'Cycle Detection',
        tags: ['Cycles', 'Directed Graphs', 'Invariants'],
      },
      {
        title: `How does shortest path search build on graph traversal?`,
        summary: `Evaluates why DFS cannot guarantee unweighted shortest paths and how traversal state feeds into DAG pathfinding.`,
        category: 'Open Inquiry',
        categoryKey: 'question',
        edgeLabel: 'Pathfinding',
        tags: ['Shortest Path', 'DAG', 'Pathfinding'],
      },
    ]
  } else if (lowerSubject.includes('shortest path') || lowerSubject.includes('dijkstra')) {
    generatedInquiries = [
      {
        title: `How does shortest path search build on graph traversal?`,
        summary: `Explores how priority queue relaxation generalizes unweighted BFS layer exploration into optimal edge weighting.`,
        category: 'Advanced Frontier',
        categoryKey: 'frontier',
        edgeLabel: 'Traversal Basis',
        tags: ['Shortest Path', 'Relaxation', 'Algorithms'],
      },
      {
        title: `When should I use BFS instead of DFS for finding paths?`,
        summary: `Contrasts guaranteed minimum edge hop discovery in unweighted graphs against arbitrary depth exploration.`,
        category: 'Algorithmic Trade-off',
        categoryKey: 'paradox',
        edgeLabel: 'Path Guarantees',
        tags: ['Pathfinding', 'BFS', 'Optimality'],
      },
      {
        title: `How does Dijkstra's algorithm guarantee optimal shortest paths?`,
        summary: `Examines greedy edge relaxation, non-negative weight preconditions, and min-heap decrease-key complexity.`,
        category: 'Complexity & Big O',
        categoryKey: 'theory',
        edgeLabel: 'Dijkstra Proof',
        tags: ['Dijkstra', 'Greedy', 'Proofs'],
      },
      {
        title: `When does Bellman-Ford handle negative edge weights where Dijkstra fails?`,
        summary: `Analyzes V-1 relaxation passes, negative cycle detection, and dynamic programming formulations for shortest paths.`,
        category: 'Design Paradigm',
        categoryKey: 'philosophy',
        edgeLabel: 'Negative Weights',
        tags: ['Bellman-Ford', 'Negative Cycles', 'DP'],
      },
    ]
  } else if (lowerSubject.includes('graph')) {
    generatedInquiries = [
      {
        title: `How does BFS work for exploring connected graph components?`,
        summary: `Explores queue-based layer-by-layer traversal, visited tracking, and unweighted shortest path guarantees.`,
        category: 'Algorithmic Pattern',
        categoryKey: 'model',
        edgeLabel: 'BFS Traversal',
        tags: ['BFS', 'Level Order', 'Queue'],
      },
      {
        title: `How does DFS work for topological sorting and cycle detection?`,
        summary: `Investigates recursive depth traversal, back edges in directed graphs, and post-order topological linearization.`,
        category: 'Algorithmic Pattern',
        categoryKey: 'model',
        edgeLabel: 'DFS Traversal',
        tags: ['DFS', 'Topological Sort', 'Recursion'],
      },
      {
        title: `When should I use BFS instead of DFS?`,
        summary: `Compares level-order shortest path requirements vs deep path search, memory footprints, and recursion stack limits.`,
        category: 'Algorithmic Trade-off',
        categoryKey: 'paradox',
        edgeLabel: 'BFS vs DFS',
        tags: ['Search Strategy', 'BFS vs DFS', 'Trade-offs'],
      },
      {
        title: `How does shortest path search build on graph traversal?`,
        summary: `Demonstrates how edge relaxation with priority queues evolves BFS into Dijkstra's and A* pathfinding.`,
        category: 'Advanced Frontier',
        categoryKey: 'frontier',
        edgeLabel: 'Shortest Path',
        tags: ['Shortest Path', 'Dijkstra', 'Heuristics'],
      },
    ]
  } else if (
    lowerSubject.includes('tree') ||
    lowerSubject.includes('bst') ||
    lowerSubject.includes('heap')
  ) {
    generatedInquiries = [
      {
        title: `How do tree traversals (In-order, Pre-order, Post-order) differ in application?`,
        summary: `Examines recursive orderings: sorted extraction in BSTs, tree serialization, and bottom-up subtree evaluation.`,
        category: 'Algorithmic Pattern',
        categoryKey: 'model',
        edgeLabel: 'Traversals',
        tags: ['Binary Trees', 'Traversals', 'Recursion'],
      },
      {
        title: `How does binary search tree ordering maintain logarithmic operations?`,
        summary: `Analyzes left-smaller, right-greater invariants, skew degradation to O(n), and self-balancing rotations.`,
        category: 'Data Structure',
        categoryKey: 'architecture',
        edgeLabel: 'BST Invariant',
        tags: ['BST', 'Logarithmic Time', 'Search Trees'],
      },
      {
        title: `When should a Heap / Priority Queue be preferred over a sorted tree?`,
        summary: `Compares array-based cache efficiency, O(1) peek, and O(n) heapify construction against full sorted traversal.`,
        category: 'Algorithmic Trade-off',
        categoryKey: 'paradox',
        edgeLabel: 'Heap vs BST',
        tags: ['Heaps', 'Priority Queue', 'Trade-offs'],
      },
      {
        title: `What is the time complexity of building a heap in O(n) vs sorting?`,
        summary: `Explores mathematical bounding of Floyd's heap construction using the convergent series sum of node heights.`,
        category: 'Complexity & Big O',
        categoryKey: 'theory',
        edgeLabel: 'Complexity Proof',
        tags: ['Heapify', 'Time Complexity', 'Mathematics'],
      },
    ]
  } else if (
    lowerSubject.includes('dynamic programming') ||
    lowerSubject === 'dp' ||
    lowerSubject.includes('memoization')
  ) {
    generatedInquiries = [
      {
        title: `How do optimal substructure and overlapping subproblems define Dynamic Programming?`,
        summary: `Establishes the two essential preconditions for DP and differentiates it from Divide & Conquer and Greedy.`,
        category: 'Design Paradigm',
        categoryKey: 'philosophy',
        edgeLabel: 'Foundations',
        tags: ['Dynamic Programming', 'Optimal Substructure', 'Subproblems'],
      },
      {
        title: `When should top-down memoization be preferred over bottom-up tabulation?`,
        summary: `Contrasts intuitive recursive call state caching with iterative cache-friendly array transitions without recursion overhead.`,
        category: 'Algorithmic Trade-off',
        categoryKey: 'paradox',
        edgeLabel: 'Top-down vs Bottom-up',
        tags: ['Memoization', 'Tabulation', 'Optimization'],
      },
      {
        title: `How can space complexity be reduced from O(n) to O(1) in DP state transitions?`,
        summary: `Demonstrates rolling variable techniques when current state depends strictly on a fixed sliding window of prior results.`,
        category: 'Complexity & Big O',
        categoryKey: 'theory',
        edgeLabel: 'Space Optimization',
        tags: ['Space Optimization', 'Rolling Array', 'Big O'],
      },
      {
        title: `What are the canonical state transition patterns in classical DP problems?`,
        summary: `Surveys 0/1 Knapsack, Longest Common Subsequence, Interval DP, and Bitmask DP formulations.`,
        category: 'Advanced Frontier',
        categoryKey: 'frontier',
        edgeLabel: 'State Patterns',
        tags: ['Knapsack', 'LCS', 'DP Patterns'],
      },
    ]
  } else if (
    lowerSubject.includes('array') ||
    lowerSubject.includes('hash') ||
    lowerSubject.includes('two pointer') ||
    lowerSubject.includes('sliding window')
  ) {
    generatedInquiries = [
      {
        title: `How does hash collision resolution impact worst-case lookup performance?`,
        summary: `Evaluates separate chaining vs open addressing, load factor thresholds, and Robin Hood hashing under heavy collisions.`,
        category: 'Data Structure',
        categoryKey: 'architecture',
        edgeLabel: 'Collision Handling',
        tags: ['Hashing', 'Collisions', 'Load Factor'],
      },
      {
        title: `When should Two Pointers be preferred over Sliding Window?`,
        summary: `Contrasts opposite-end bidirectional narrowing on sorted inputs against contiguous window expansion/contraction.`,
        category: 'Algorithmic Pattern',
        categoryKey: 'model',
        edgeLabel: 'Pattern Selection',
        tags: ['Two Pointers', 'Sliding Window', 'Patterns'],
      },
      {
        title: `How does CPU cache locality give contiguous arrays a performance advantage?`,
        summary: `Explores spatial locality, prefetching lines, and cache hit ratios compared to pointer-chasing structures.`,
        category: 'Algorithmic Trade-off',
        categoryKey: 'paradox',
        edgeLabel: 'Cache Locality',
        tags: ['Hardware Cache', 'Memory Layout', 'Performance'],
      },
      {
        title: `What is the amortized cost of dynamic array resizing?`,
        summary: `Proves why geometric 2x capacity doubling guarantees O(1) amortized append time despite periodic O(n) copies.`,
        category: 'Complexity & Big O',
        categoryKey: 'theory',
        edgeLabel: 'Amortized Analysis',
        tags: ['Amortization', 'Dynamic Array', 'Big O'],
      },
    ]
  } else if (lowerSubject.includes('sort') || lowerSubject.includes('binary search')) {
    generatedInquiries = [
      {
        title: `Why is comparison-based sorting theoretically bounded by O(n log n)?`,
        summary: `Explains the decision tree lower bound: any permutation of n elements requires at least log2(n!) comparisons.`,
        category: 'Complexity & Big O',
        categoryKey: 'theory',
        edgeLabel: 'Lower Bound',
        tags: ['Sorting Bounds', 'Decision Trees', 'Complexity'],
      },
      {
        title: `How does binary search adapt to rotated arrays or monotonic search spaces?`,
        summary: `Extends traditional index search into binary search on the answer and boundary predicate functions.`,
        category: 'Algorithmic Pattern',
        categoryKey: 'model',
        edgeLabel: 'Search Variants',
        tags: ['Binary Search', 'Monotonicity', 'Rotated Arrays'],
      },
      {
        title: `When does Quicksort degrade to O(n²) worst-case and how is it mitigated?`,
        summary: `Analyzes bad pivot selection on sorted arrays and examines randomized pivots and median-of-three mitigations.`,
        category: 'Algorithmic Trade-off',
        categoryKey: 'paradox',
        edgeLabel: 'Pivot Degradation',
        tags: ['Quicksort', 'Pivots', 'Worst Case'],
      },
      {
        title: `What makes Merge Sort stable and suitable for external memory sorting?`,
        summary: `Investigates relative order preservation for equal keys and sequential disk access patterns in external merge sort.`,
        category: 'Design Paradigm',
        categoryKey: 'philosophy',
        edgeLabel: 'Stability',
        tags: ['Merge Sort', 'Stability', 'External Sorting'],
      },
    ]
  } else if (lowerSubject.includes('recursion') || lowerSubject.includes('backtracking')) {
    generatedInquiries = [
      {
        title: `How does state pruning prevent exponential explosion in backtracking?`,
        summary: `Examines bounding functions, early constraint checking, and pruning unviable branches in search trees.`,
        category: 'Design Paradigm',
        categoryKey: 'philosophy',
        edgeLabel: 'Branch Pruning',
        tags: ['Backtracking', 'Pruning', 'Search Space'],
      },
      {
        title: `What is the relationship between recursion stack depth and call overhead?`,
        summary: `Analyzes activation records, memory limits, and conversion to iterative loops or tail-call optimization.`,
        category: 'Complexity & Big O',
        categoryKey: 'theory',
        edgeLabel: 'Stack Depth',
        tags: ['Call Stack', 'Memory', 'Recursion'],
      },
      {
        title: `How does backtracking differ from standard depth-first search?`,
        summary: `Highlights mutable state rollback and solution space construction versus graph topology traversal.`,
        category: 'Algorithmic Trade-off',
        categoryKey: 'paradox',
        edgeLabel: 'State Rollback',
        tags: ['Backtracking vs DFS', 'State Reversal', 'Comparison'],
      },
      {
        title: `When should recursive algorithms be converted into dynamic programming?`,
        summary: `Identifies when overlapping subproblems indicate that recursion without memoization recomputes redundant states.`,
        category: 'Open Inquiry',
        categoryKey: 'question',
        edgeLabel: 'Memoization Trigger',
        tags: ['Recursion to DP', 'Redundancy', 'Optimization'],
      },
    ]
  } else if (lowerSubject.includes('stack') || lowerSubject.includes('queue')) {
    generatedInquiries = [
      {
        title: `How does a monotonic stack optimize nearest smaller/greater element lookups?`,
        summary: `Investigates maintaining strictly increasing or decreasing elements to resolve span and histogram problems in O(n).`,
        category: 'Data Structure',
        categoryKey: 'architecture',
        edgeLabel: 'Monotonic Stack',
        tags: ['Monotonic Stack', 'LIFO', 'Optimization'],
      },
      {
        title: `How can a FIFO queue be implemented using two LIFO stacks with amortized O(1)?`,
        summary: `Analyzes push and pop stack separation, lazy element reversal, and aggregate cost per operation.`,
        category: 'Algorithmic Pattern',
        categoryKey: 'model',
        edgeLabel: 'Two-Stack Queue',
        tags: ['Queues', 'Stacks', 'Amortized Analysis'],
      },
      {
        title: `When should a circular buffer or deque be used over a linear queue?`,
        summary: `Examines fixed-size circular indexing, ring buffer wrap-around, and bidirectional operations without array shifting.`,
        category: 'Algorithmic Trade-off',
        categoryKey: 'paradox',
        edgeLabel: 'Circular Queue',
        tags: ['Deque', 'Circular Buffer', 'Trade-offs'],
      },
      {
        title: `What are the core differences between LIFO and FIFO execution models?`,
        summary: `Compares depth-first call stack unwinding with breadth-first queue buffer management across systems.`,
        category: 'Open Inquiry',
        categoryKey: 'question',
        edgeLabel: 'Execution Models',
        tags: ['LIFO', 'FIFO', 'System Design'],
      },
    ]
  } else if (lowerSubject.includes('complexity') || lowerSubject.includes('big o')) {
    generatedInquiries = [
      {
        title: `What is the mathematical difference between Big O, Big Omega, and Big Theta?`,
        summary: `Examines upper asymptotic bounds, lower asymptotic bounds, and asymptotically tight bounds in algorithm analysis.`,
        category: 'Complexity & Big O',
        categoryKey: 'theory',
        edgeLabel: 'Asymptotic Bounds',
        tags: ['Big O', 'Big Omega', 'Big Theta'],
      },
      {
        title: `How does amortized analysis differ from average-case time complexity?`,
        summary: `Contrasts guaranteed average cost across worst-case sequences (accounting/aggregate) with probabilistic input assumptions.`,
        category: 'Complexity & Big O',
        categoryKey: 'theory',
        edgeLabel: 'Amortization',
        tags: ['Amortized Analysis', 'Aggregate', 'Worst Case'],
      },
      {
        title: `Why do logarithmic and linearithmic complexities scale favorably with large datasets?`,
        summary: `Analyzes recursive halving, divide-and-conquer recurrence relations, and input scaling limits.`,
        category: 'Algorithmic Trade-off',
        categoryKey: 'paradox',
        edgeLabel: 'Growth Rates',
        tags: ['Growth Rates', 'Logarithmic', 'Scalability'],
      },
      {
        title: `What are the common space-time trade-offs across algorithmic optimizations?`,
        summary: `Explores precomputation, memoization tables, lookup hash sets, and auxiliary space consumption to buy lower runtime.`,
        category: 'Open Inquiry',
        categoryKey: 'question',
        edgeLabel: 'Space-Time',
        tags: ['Space vs Time', 'Trade-offs', 'Optimization'],
      },
    ]
  } else {
    // General / Domain-agnostic DSA concepts:
    // Generate 4 distinct, complementary perspectives (Mechanisms, Advantages, Boundaries, Trade-offs)
    generatedInquiries = [
      {
        title: `How does the core mechanism of ${titleSubject} operate under edge conditions?`,
        summary: `Investigates step-by-step internal execution, pointer/index updates, and boundary conditions for ${titleSubject}.`,
        category: 'Data Structure',
        categoryKey: 'architecture',
        edgeLabel: 'Mechanics',
        tags: ['Data Structures', 'Mechanics', 'Algorithms'],
      },
      {
        title: `What is the asymptotic time and space complexity profile of ${titleSubject}?`,
        summary: `Evaluates best, worst, and average-case time complexities along with auxiliary memory overhead of ${titleSubject}.`,
        category: 'Complexity & Big O',
        categoryKey: 'theory',
        edgeLabel: 'Complexity',
        tags: ['Big O', 'Complexity', 'Analysis'],
      },
      {
        title: `What are the critical boundary conditions and failure modes in ${titleSubject}?`,
        summary: `Examines null pointers, empty collections, off-by-one indices, and overflow limits in ${titleSubject}.`,
        category: 'Open Inquiry',
        categoryKey: 'question',
        edgeLabel: 'Edge Cases',
        tags: ['Edge Cases', 'Boundaries', 'Robustness'],
      },
      {
        title: `When should ${titleSubject} be preferred over alternative data structures or patterns?`,
        summary: `Compares practical trade-offs, cache locality, and situational advantages of ${titleSubject} against alternatives.`,
        category: 'Algorithmic Trade-off',
        categoryKey: 'paradox',
        edgeLabel: 'Trade-offs',
        tags: ['Trade-offs', 'Comparative', 'Optimization'],
      },
    ]
  }

  // Ensure no generated question repeats the parent title or an existing node in the graph
  const filtered = generatedInquiries.map((item, idx) => {
    let finalTitle = item.title

    if (
      finalTitle.toLowerCase().trim() === rawTitle.toLowerCase().trim() ||
      existingTitles.has(finalTitle.toLowerCase().trim())
    ) {
      // Alternate inquiry angle to maintain strictly unique nodes
      const alternatives = [
        `What empirical benchmarks evaluate the runtime of ${titleSubject}?`,
        `How does ${titleSubject} handle scale and large input sizes?`,
        `What structural invariants must be preserved in ${titleSubject}?`,
        `How does error handling and edge case management function in ${titleSubject}?`,
      ]
      finalTitle = alternatives[idx % alternatives.length]
    }

    return {
      ...item,
      title: finalTitle,
    }
  })

  return filtered
}

/**
 * Determines the best unoccupied direction around the parent node for placing a new branch.
 *
 * Rules:
 * 1. Inspect existing connected edges of the parent node and the positions of nearby nodes.
 * 2. Check four cardinal directions: DOWN, RIGHT, LEFT, ABOVE.
 * 3. Prefer an unoccupied direction.
 * 4. If DOWN is occupied (has downward branch or obstacle), prefer RIGHT or LEFT.
 * 5. If RIGHT is occupied, try LEFT or ABOVE.
 * 6. Avoid crossings and overlaps.
 *
 * @param {Object} parentNode - The selected parent node
 * @param {Array} existingNodes - All existing graph nodes
 * @param {Array} existingEdges - All existing graph edges
 * @returns {string} Best direction: 'DOWN' | 'RIGHT' | 'LEFT' | 'ABOVE'
 */
export function determineBestBranchDirection(
  parentNode,
  existingNodes = [],
  existingEdges = []
) {
  if (!parentNode) return 'DOWN'

  const px = parentNode.position?.x ?? 0
  const py = parentNode.position?.y ?? 0

  // 1. Check existing connected edges from/to parent node
  const connectedEdgeTargets = []
  existingEdges.forEach((edge) => {
    if (edge.source === parentNode.id) {
      const targetNode = existingNodes.find((n) => n.id === edge.target)
      if (targetNode) connectedEdgeTargets.push(targetNode)
    } else if (edge.target === parentNode.id) {
      const sourceNode = existingNodes.find((n) => n.id === edge.source)
      if (sourceNode) connectedEdgeTargets.push(sourceNode)
    }
  })

  // Detect whether each cardinal direction already has an edge connection:
  // DOWN: neighbor is significantly lower (y > py + 80) and horizontally close (|dx| < 400)
  const hasDownEdge = connectedEdgeTargets.some(
    (n) => n.position.y > py + 80 && Math.abs(n.position.x - px) < 400
  )
  // RIGHT: neighbor is to the right (x > px + 100) and vertically close (|dy| < 300)
  const hasRightEdge = connectedEdgeTargets.some(
    (n) => n.position.x > px + 100 && Math.abs(n.position.y - py) < 300
  )
  // LEFT: neighbor is to the left (x < px - 100) and vertically close (|dy| < 300)
  const hasLeftEdge = connectedEdgeTargets.some(
    (n) => n.position.x < px - 100 && Math.abs(n.position.y - py) < 300
  )
  // ABOVE: neighbor is above (y < py - 80) and horizontally close (|dx| < 400)
  const hasAboveEdge = connectedEdgeTargets.some(
    (n) => n.position.y < py - 80 && Math.abs(n.position.x - px) < 400
  )

  // 2. Count obstacles (other nodes) in each placement zone
  const otherNodes = existingNodes.filter((n) => n.id !== parentNode.id)

  const countObstaclesInZone = (minX, maxX, minY, maxY) => {
    return otherNodes.filter((n) => {
      const nx = n.position?.x ?? 0
      const ny = n.position?.y ?? 0
      return nx >= minX && nx <= maxX && ny >= minY && ny <= maxY
    }).length
  }

  // Zones corresponding to where the fan would spread (with margin)
  const downObstacles = countObstaclesInZone(px - 550, px + 550, py + 80, py + 550)
  const rightObstacles = countObstaclesInZone(px + 100, px + 850, py - 320, py + 320)
  const leftObstacles = countObstaclesInZone(px - 850, px - 100, py - 320, py + 320)
  const aboveObstacles = countObstaclesInZone(px - 550, px + 550, py - 550, py - 80)

  // Evaluate candidate directions according to user preference hierarchy:
  // Rule 4: If DOWN is already occupied, prefer RIGHT or LEFT.
  // Rule 5: If RIGHT is occupied, try LEFT or ABOVE.

  const isDownOccupied = hasDownEdge || downObstacles > 0
  const isRightOccupied = hasRightEdge || rightObstacles > 0
  const isLeftOccupied = hasLeftEdge || leftObstacles > 0
  const isAboveOccupied = hasAboveEdge || aboveObstacles > 0

  // 1. If DOWN is completely unoccupied, use DOWN
  if (!isDownOccupied) {
    return 'DOWN'
  }

  // 2. If DOWN is occupied, prefer RIGHT
  if (!isRightOccupied) {
    return 'RIGHT'
  }

  // 3. If RIGHT is occupied, prefer LEFT
  if (!isLeftOccupied) {
    return 'LEFT'
  }

  // 4. If LEFT is occupied, prefer ABOVE
  if (!isAboveOccupied) {
    return 'ABOVE'
  }

  // Fallback: If all directions have some occupancy, calculate penalty score
  const directions = [
    {
      dir: 'RIGHT',
      hasEdge: hasRightEdge,
      obstacles: rightObstacles,
      priorityWeight: 1,
    },
    {
      dir: 'LEFT',
      hasEdge: hasLeftEdge,
      obstacles: leftObstacles,
      priorityWeight: 2,
    },
    {
      dir: 'ABOVE',
      hasEdge: hasAboveEdge,
      obstacles: aboveObstacles,
      priorityWeight: 3,
    },
    {
      dir: 'DOWN',
      hasEdge: hasDownEdge,
      obstacles: downObstacles,
      priorityWeight: 4,
    },
  ]

  directions.sort((a, b) => {
    // Strongly avoid directions with existing connected edges
    const edgeDiff = (a.hasEdge ? 1000 : 0) - (b.hasEdge ? 1000 : 0)
    if (edgeDiff !== 0) return edgeDiff

    // Avoid higher obstacle counts
    const obsDiff = a.obstacles - b.obstacles
    if (obsDiff !== 0) return obsDiff

    // Priority tie-breaker (RIGHT > LEFT > ABOVE > DOWN)
    return a.priorityWeight - b.priorityWeight
  })

  return directions[0].dir
}

/**
 * Calculates collision-free positions and edge routing for new branched nodes.
 * Arranges nodes as an elegant branch/fan in the chosen open direction around parent.
 *
 * @param {Object} parentNode - The parent node object
 * @param {number} count - Number of nodes in the branch
 * @param {Array} existingNodes - All current graph nodes
 * @param {Array} existingEdges - All current graph edges
 * @returns {{ positions: Array<{x: number, y: number}>, direction: string, sourceHandle: string, targetHandle: string }}
 */
export function calculateBranchPositions(
  parentNode,
  count,
  existingNodes = [],
  existingEdges = []
) {
  const parentX = parentNode?.position?.x || 300
  const parentY = parentNode?.position?.y || 200

  const direction = determineBestBranchDirection(
    parentNode,
    existingNodes,
    existingEdges
  )

  const NODE_WIDTH = 290
  const NODE_HEIGHT = 195
  const MIN_GAP_X = 50
  const MIN_GAP_Y = 45

  const initialPositions = []
  let sourceHandle = 'bottom'
  let targetHandle = 'top'

  if (direction === 'RIGHT') {
    sourceHandle = 'right'
    targetHandle = 'left'

    // Fan to the RIGHT:
    // Arrange in a vertical arc fan with subtle horizontal curve
    const SPACING_Y = 225
    const totalHeight = (count - 1) * SPACING_Y
    const startY = parentY - totalHeight / 2
    const baseX = parentX + 370

    for (let i = 0; i < count; i++) {
      const isMid = i === 1 || i === 2
      const candX = Math.round(baseX + (isMid ? 50 : 0))
      const candY = Math.round(startY + i * SPACING_Y)
      initialPositions.push({ x: candX, y: candY })
    }
  } else if (direction === 'LEFT') {
    sourceHandle = 'left-source'
    targetHandle = 'right-target'

    // Fan to the LEFT:
    // Arrange in a vertical arc fan to the left
    const SPACING_Y = 225
    const totalHeight = (count - 1) * SPACING_Y
    const startY = parentY - totalHeight / 2
    const baseX = parentX - 370

    for (let i = 0; i < count; i++) {
      const isMid = i === 1 || i === 2
      const candX = Math.round(baseX - (isMid ? 50 : 0))
      const candY = Math.round(startY + i * SPACING_Y)
      initialPositions.push({ x: candX, y: candY })
    }
  } else if (direction === 'ABOVE') {
    sourceHandle = 'top-source'
    targetHandle = 'bottom-target'

    // Fan ABOVE:
    // Arrange horizontally centered above parent
    const SPACING_X = 340
    const totalWidth = (count - 1) * SPACING_X
    const startX = parentX - totalWidth / 2
    const baseY = parentY - 260

    for (let i = 0; i < count; i++) {
      const candX = Math.round(startX + i * SPACING_X)
      const candY = Math.round(baseY)
      initialPositions.push({ x: candX, y: candY })
    }
  } else {
    // Default: Fan DOWN
    sourceHandle = 'bottom'
    targetHandle = 'top'

    const SPACING_X = 340
    const totalWidth = (count - 1) * SPACING_X
    const startX = parentX - totalWidth / 2
    const baseY = parentY + 260

    for (let i = 0; i < count; i++) {
      const candX = Math.round(startX + i * SPACING_X)
      const candY = Math.round(baseY)
      initialPositions.push({ x: candX, y: candY })
    }
  }

  // Collision detection and resolution:
  // Move candidate positions to nearest available space if occupied by existing nodes
  const resolvedPositions = []
  const allObstacles = [...existingNodes]

  for (let i = 0; i < count; i++) {
    let candX = initialPositions[i].x
    let candY = initialPositions[i].y

    const isColliding = (x, y) => {
      return allObstacles.some((obs) => {
        const ox = obs.position?.x ?? obs.x
        const oy = obs.position?.y ?? obs.y
        const xOverlap = Math.abs(x - ox) < (NODE_WIDTH + MIN_GAP_X)
        const yOverlap = Math.abs(y - oy) < (NODE_HEIGHT + MIN_GAP_Y)
        return xOverlap && yOverlap
      })
    }

    let attempts = 0
    while (isColliding(candX, candY) && attempts < 16) {
      attempts++
      if (direction === 'RIGHT') {
        if (attempts % 2 === 1) {
          candX += 340
        } else {
          candY += attempts % 4 === 0 ? 220 : -220
        }
      } else if (direction === 'LEFT') {
        if (attempts % 2 === 1) {
          candX -= 340
        } else {
          candY += attempts % 4 === 0 ? 220 : -220
        }
      } else if (direction === 'ABOVE') {
        if (attempts % 2 === 1) {
          candY -= 240
        } else {
          candX += attempts % 4 === 0 ? 340 : -340
        }
      } else {
        // DOWN
        if (attempts % 2 === 1) {
          candY += 240
        } else {
          candX += attempts % 4 === 0 ? 340 : -340
        }
      }
    }

    const finalPos = { x: candX, y: candY }
    resolvedPositions.push(finalPos)
    allObstacles.push({ position: finalPos })
  }

  return {
    positions: resolvedPositions,
    direction,
    sourceHandle,
    targetHandle,
  }
}

/**
 * Constructs 3-4 new graph node objects and connecting edges for Deepen Trail.
 *
 * @param {Object} parentNode - The selected node
 * @param {Array} existingNodes - Current graph nodes
 * @param {Array} existingEdges - Current graph edges
 * @returns {{ newNodes: Array, newEdges: Array, direction: string }} Generated nodes, edges, and chosen direction
 */
export function buildDeepenTrailGraphElements(
  parentNode,
  existingNodes = [],
  existingEdges = []
) {
  if (!parentNode) return { newNodes: [], newEdges: [], direction: 'DOWN' }

  const inquiries = generateDeepenQuestions(parentNode, existingNodes)
  const { positions, direction, sourceHandle, targetHandle } =
    calculateBranchPositions(
      parentNode,
      inquiries.length,
      existingNodes,
      existingEdges
    )

  const parentDepthNumber =
    parseInt(parentNode.data?.depth?.replace(/\D/g, ''), 10) || 1

  const newNodes = []
  const newEdges = []
  const timestamp = Date.now()

  inquiries.forEach((inquiry, index) => {
    const newId = `node-${timestamp}-${index + 1}-${Math.floor(Math.random() * 1000)}`
    const pos = positions[index]

    const matchedCategory = CONCEPT_CATEGORIES.find(
      (c) => c.key === inquiry.categoryKey
    )

    const categoryLabel = matchedCategory
      ? matchedCategory.label
      : inquiry.category
    const categoryKey = matchedCategory
      ? matchedCategory.key
      : inquiry.categoryKey

    const newNode = {
      id: newId,
      type: 'customNode',
      position: pos,
      data: {
        title: inquiry.title,
        summary: inquiry.summary,
        category: categoryLabel,
        categoryKey: categoryKey,
        categoryColor: categoryKey,
        status: 'Exploring',
        depth: `Branch Level ${parentDepthNumber + 1}`,
        tags: inquiry.tags || ['Deep Dive', 'Follow-up'],
        isQuestion: true,
        notes: `Formulated while deepening inquiry from "${parentNode.data?.title || 'Parent'}".`,
        links: [],
      },
    }

    const newEdge = {
      id: `e-${parentNode.id}-${newId}`,
      source: parentNode.id,
      target: newId,
      type: 'customEdge',
      sourceHandle,
      targetHandle,
      label: inquiry.edgeLabel || 'Deepens Inquiry',
      animated: true,
      style: { stroke: '#818cf8', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#818cf8',
        width: 14,
        height: 14,
      },
    }

    newNodes.push(newNode)
    newEdges.push(newEdge)
  })

  return { newNodes, newEdges, direction }
}

/**
 * Calculates an intelligent, collision-free placement for newly added concept nodes.
 *
 * Rules:
 * 1. If connected to a parent node:
 *    - Determine best direction (DOWN, RIGHT, LEFT, ABOVE).
 *    - If DOWN contains existing Deepen Trail branches or is occupied, route to RIGHT, LEFT, or ABOVE.
 *    - Set appropriate sourceHandle and targetHandle to avoid crossing edges.
 * 2. If independent (no parent connection):
 *    - Find an open region around the current graph (right, left, below, above, or open canvas).
 *    - Avoid crowded regions where Deepen Trail branches exist.
 *    - Collision detection checks with a minimum safety envelope (340px x 240px).
 *    - If first candidate is occupied, search progressively farther outward until open space is found.
 *    - Do not move existing nodes.
 *
 * @param {Object} options
 * @param {Object|null} options.parentNode - Selected parent node if user checked connection, or null
 * @param {Array} options.nodes - Current graph nodes
 * @param {Array} options.edges - Current graph edges
 * @param {Object|null} options.reactFlowInstance - React Flow instance for screen-to-flow mapping
 * @returns {{ position: {x: number, y: number}, sourceHandle: string|null, targetHandle: string|null, connectToParentId: string|null }}
 */
export function calculateAddNodePlacement({
  parentNode = null,
  nodes = [],
  edges = [],
  reactFlowInstance = null,
} = {}) {
  const NODE_WIDTH = 290
  const NODE_HEIGHT = 195
  const MIN_GAP_X = 50
  const MIN_GAP_Y = 45

  const isCollisionFree = (x, y, obstaclesList = nodes) => {
    return !obstaclesList.some((obs) => {
      const ox = obs.position?.x ?? obs.x ?? 0
      const oy = obs.position?.y ?? obs.y ?? 0
      const xOverlap = Math.abs(x - ox) < NODE_WIDTH + MIN_GAP_X
      const yOverlap = Math.abs(y - oy) < NODE_HEIGHT + MIN_GAP_Y
      return xOverlap && yOverlap
    })
  }

  // CASE 1: User explicitly chose to connect to a parent node
  if (parentNode) {
    const parentX = parentNode.position?.x ?? 300
    const parentY = parentNode.position?.y ?? 200

    // Determine best open direction (prefers RIGHT, LEFT, or ABOVE if DOWN has branches)
    const direction = determineBestBranchDirection(parentNode, nodes, edges)

    let candX = parentX
    let candY = parentY
    let sourceHandle = 'bottom'
    let targetHandle = 'top'

    if (direction === 'RIGHT') {
      candX = parentX + 370
      candY = parentY
      sourceHandle = 'right'
      targetHandle = 'left'
    } else if (direction === 'LEFT') {
      candX = parentX - 370
      candY = parentY
      sourceHandle = 'left-source'
      targetHandle = 'right-target'
    } else if (direction === 'ABOVE') {
      candX = parentX
      candY = parentY - 260
      sourceHandle = 'top-source'
      targetHandle = 'bottom-target'
    } else {
      // DOWN
      candX = parentX
      candY = parentY + 260
      sourceHandle = 'bottom'
      targetHandle = 'top'
    }

    // Collision avoidance: step progressively outward if candidate is occupied
    let attempts = 0
    while (!isCollisionFree(candX, candY, nodes) && attempts < 20) {
      attempts++
      if (direction === 'RIGHT') {
        candX += 340
        if (attempts % 2 === 0) candY += attempts % 4 === 0 ? 120 : -120
      } else if (direction === 'LEFT') {
        candX -= 340
        if (attempts % 2 === 0) candY += attempts % 4 === 0 ? 120 : -120
      } else if (direction === 'ABOVE') {
        candY -= 240
        if (attempts % 2 === 0) candX += attempts % 4 === 0 ? 180 : -180
      } else {
        // DOWN
        candY += 240
        if (attempts % 2 === 0) candX += attempts % 4 === 0 ? 180 : -180
      }
    }

    return {
      position: { x: Math.round(candX), y: Math.round(candY) },
      sourceHandle,
      targetHandle,
      connectToParentId: parentNode.id,
      direction,
    }
  }

  // CASE 2: Independent node (no parent connection)
  if (!nodes || nodes.length === 0) {
    let startX = 380
    let startY = 150
    if (reactFlowInstance) {
      try {
        const flowPos = reactFlowInstance.screenToFlowPosition({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        })
        startX = Math.round(flowPos.x - 144)
        startY = Math.round(flowPos.y - 95)
      } catch {
        // Fallback to default coordinates
      }
    }
    return {
      position: { x: startX, y: startY },
      sourceHandle: null,
      targetHandle: null,
      connectToParentId: null,
      direction: null,
    }
  }

  // Calculate current graph bounding box
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  nodes.forEach((n) => {
    const nx = n.position?.x ?? 0
    const ny = n.position?.y ?? 0
    if (nx < minX) minX = nx
    if (nx + NODE_WIDTH > maxX) maxX = nx + NODE_WIDTH
    if (ny < minY) minY = ny
    if (ny + NODE_HEIGHT > maxY) maxY = ny + NODE_HEIGHT
  })

  const graphCenterX = (minX + maxX) / 2
  const graphCenterY = (minY + maxY) / 2

  // Determine viewport center if available
  let viewCenter = null
  if (reactFlowInstance && typeof window !== 'undefined') {
    try {
      const flowPos = reactFlowInstance.screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      })
      viewCenter = {
        x: Math.round(flowPos.x - 144),
        y: Math.round(flowPos.y - 95),
      }
    } catch {
      // Ignore
    }
  }

  // Generate candidate regions around the graph in priority order:
  // 1. Right of the graph (open expansion zone)
  // 2. Viewport center (if completely open and not colliding)
  // 3. Left of the graph
  // 4. Below the graph
  // 5. Above the graph
  const candidates = [
    { x: Math.round(maxX + 90), y: Math.round(graphCenterY - 95) },
    viewCenter,
    { x: Math.round(minX - 380), y: Math.round(graphCenterY - 95) },
    { x: Math.round(graphCenterX - 144), y: Math.round(maxY + 90) },
    { x: Math.round(graphCenterX - 144), y: Math.round(minY - 260) },
    // Staggered right quadrants
    { x: Math.round(maxX + 90), y: Math.round(minY) },
    { x: Math.round(maxX + 90), y: Math.round(maxY - 195) },
    // Staggered left quadrants
    { x: Math.round(minX - 380), y: Math.round(minY) },
    { x: Math.round(minX - 380), y: Math.round(maxY - 195) },
  ].filter(Boolean)

  // Find the first completely collision-free candidate
  for (const cand of candidates) {
    if (isCollisionFree(cand.x, cand.y, nodes)) {
      return {
        position: { x: cand.x, y: cand.y },
        sourceHandle: null,
        targetHandle: null,
        connectToParentId: null,
        direction: null,
      }
    }
  }

  // Progressive outward spiral search from the right perimeter if initial candidates collide
  const baseOriginX = Math.round(maxX + 90)
  const baseOriginY = Math.round(graphCenterY - 95)
  const STEP_X = 340
  const STEP_Y = 240

  let ring = 1
  while (ring <= 15) {
    const spiralCandidates = [
      { x: baseOriginX + ring * STEP_X, y: baseOriginY },
      { x: baseOriginX + ring * STEP_X, y: baseOriginY + ring * 120 },
      { x: baseOriginX + ring * STEP_X, y: baseOriginY - ring * 120 },
      { x: baseOriginX, y: baseOriginY + ring * STEP_Y },
      { x: baseOriginX, y: baseOriginY - ring * STEP_Y },
      { x: Math.round(minX - 380 - ring * STEP_X), y: baseOriginY },
    ]

    for (const cand of spiralCandidates) {
      if (isCollisionFree(cand.x, cand.y, nodes)) {
        return {
          position: { x: cand.x, y: cand.y },
          sourceHandle: null,
          targetHandle: null,
          connectToParentId: null,
          direction: null,
        }
      }
    }
    ring++
  }

  // Ultimate fallback far to the right
  return {
    position: { x: Math.round(maxX + 400), y: Math.round(graphCenterY) },
    sourceHandle: null,
    targetHandle: null,
    connectToParentId: null,
    direction: null,
  }
}

