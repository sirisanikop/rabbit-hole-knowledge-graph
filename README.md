# Rabbit Hole — The Curiosity Graph

**Rabbit Hole** is a modern dark-themed web application designed for exploring, mapping, and connecting deep questions, paradoxes, and intellectual inquiries. Built with React 19, Vite, Tailwind CSS, and React Flow, it provides an interactive canvas where complex concepts can be connected, filtered, and traversed.

---

## Features

- **Interactive Curiosity Canvas**:
  - Multi-directional custom concept nodes with 4 connection ports (Top, Bottom, Left, Right).
  - Smooth custom step edges with animated directional markers and one-click disconnection controls.
  - Dragging, zooming, panning, auto-organizing layout, and minimap navigation.

- **Curiosity Trail (Breadth-First Search)**:
  - Finds the shortest inquiry trail bridging any two concepts in the graph using BFS.
  - Visually illuminates the path on the canvas with laser-green edge animations.
  - Step-by-step sequence explorer in the details panel with instant hop navigation.
  - Helpful diagnostic guidance if concepts belong to disconnected inquiry clusters.

- **Concept Node Lifecycle**:
  - **Create**: Modal form for formulating concepts with title, core thesis, categories, curiosity tags, and optional parent branching.
  - **Edit**: In-place editing of title, category, summary, field notes, and tags in the inspector panel.
  - **Delete**: Safe cascade deletion removing connected edges with a confirmation dialog.
  - **Deepen Trail**: One-click action to branch a follow-up inquiry directly off any selected concept.

- **Search & Category Filtering**:
  - Global search querying concept titles, thesis descriptions, and curiosity tags in real time.
  - Instant `⌘K` / `Ctrl+K` keyboard shortcut for focusing search.
  - Dynamic category filter bar with live node counts and color-coded badges (`Data Structure`, `Algorithmic Pattern`, `Complexity & Big O`, `Algorithmic Trade-off`, `Open Inquiry`, `Design Paradigm`, `Advanced Frontier`).
  - Graph dimming highlighting matching concepts and subgraph connections.

- **Persistent Local Storage**:
  - Automatically saves nodes, edges, active graph metadata, and settings to browser `localStorage`.
  - Debounced background saving ensures 60fps canvas performance with synchronous flush on tab close.
  - Default sample curiosity graph is loaded only when no prior saved graph exists.
  - Quick "Reset Demo" action to revert to the initial sample graph anytime.

- **JSON Backup Export & Import**:
  - Export the full graph as a timestamped JSON file backup.
  - Import existing JSON graphs with strict schema validation (checks node IDs, numeric coordinates, required fields, and safe pruning of dangling edge references).
  - Floating toast notifications providing feedback for successful operations and detailed validation error messages.

- **Polished Dark Theme & Responsive Layout**:
  - Sleek glassmorphic dark design with subtle glow effects and custom dark scrollbars.
  - 3-column layout on desktop: Left Sidebar (saved graphs & outline), Central Canvas, and Right Inspector Panel.
  - Responsive drawer navigation on tablet and mobile viewports with backdrop dismissal.
  - Full keyboard accessibility (`⌘K`, `⌘+Enter`, `Escape`), instant tooltips, and screen-reader labels.

---

## Prerequisites

Before running the application, make sure you have the following installed:

- **Node.js**: `v18.0.0` or higher (Node 20+ recommended)
- **npm**: `v9.0.0` or higher (or `pnpm` / `yarn`)

---

## Installation

1. **Clone the repository** (or navigate to the project directory):
   ```bash
   git clone <repository-url>
   cd "Rabbit Hole"
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

---

## Running the Application Locally

### Development Server
Start the local Vite development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:5173
```

### Production Build
To create an optimized production build:
```bash
npm run build
```
The compiled assets will be output to the `dist/` directory.

### Preview Production Build
To preview the production build locally:
```bash
npm run preview
```

### Linting
To check the code for syntax or lint issues using Oxlint:
```bash
npm run lint
```

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `⌘K` / `Ctrl+K` | Focus global search input |
| `⌘+Enter` / `Ctrl+Enter` | Submit Add Node modal or save concept edits |
| `Escape` | Close active modal, cancel edits, or dismiss drawer |
| `Delete` / `Backspace` | Delete selected node or edge on canvas |

---

## Project Structure

```
├── public/                 # Static assets
├── src/
│   ├── components/         # UI components
│   │   ├── CategoryFilterBar.jsx   # Category filter pills & match counts
│   │   ├── CreateNodeModal.jsx     # Node formulation modal
│   │   ├── CuriosityTrailPanel.jsx # BFS pathfinder selector & sequence
│   │   ├── CustomEdge.jsx          # Interactive smooth step edge
│   │   ├── CustomNode.jsx          # 4-handle custom node card
│   │   ├── DeleteConfirmModal.jsx  # Deletion confirmation dialog
│   │   ├── GraphCanvas.jsx         # React Flow canvas wrapper & empty state
│   │   ├── NodeDetailPanel.jsx     # Inspector & live edit panel
│   │   ├── NotificationToast.jsx   # Floating feedback alerts
│   │   ├── Sidebar.jsx             # Left saved graphs & outline sidebar
│   │   └── Toolbar.jsx             # Top branding, search & controls
│   ├── data/               # Default categories and sample curiosity graph
│   │   ├── categories.js
│   │   ├── mockGraph.js
│   │   └── index.js
│   ├── utils/              # Algorithms & storage helpers
│   │   ├── bfs.js                  # Shortest pathfinder (BFS)
│   │   ├── cn.js                   # Class merging helper
│   │   ├── storage.js              # LocalStorage & JSON backup validation
│   │   └── index.js
│   ├── App.jsx             # Main application orchestrator & state
│   ├── index.css           # Tailwind CSS & theme styling
│   └── main.jsx            # Application entry point
├── package.json
└── vite.config.js
```

---

## License

MIT
