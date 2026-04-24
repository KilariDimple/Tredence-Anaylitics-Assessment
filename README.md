# HR Workflow Designer — FlowDesigner Studio

A visual, drag-and-drop HR workflow builder built with **Next.js 15 + React Flow + TypeScript + Zustand**.

---

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:3000
```

No environment variables or backend required. Everything runs in the browser.

---

## What's Built

### Functional Requirements — Implemented

| Feature | Status |
|---|---|
| Drag-and-drop canvas | ✅ |
| 5 custom node types (Start, Task, Approval, Automated, End) | ✅ |
| Node configuration forms with all required fields | ✅ |
| Dynamic AutomatedStep form (params change per action) | ✅ |
| Key-value metadata / custom fields editor | ✅ |
| Connect nodes with animated edges | ✅ |
| Select / deselect nodes with form panel | ✅ |
| Delete nodes (button + keyboard Delete/Backspace) | ✅ |
| Double-click edge to delete | ✅ |
| Workflow validation (errors + warnings) | ✅ |
| GET /automations mock API | ✅ |
| POST /simulate mock API with topological sort | ✅ |
| Simulation panel with step-by-step timeline | ✅ |
| Cycle detection in workflow | ✅ |
| Export workflow as JSON | ✅ |
| Import workflow from JSON | ✅ |
| 3 pre-built templates (Onboarding, Leave Approval, Doc Verification) | ✅ |
| MiniMap + zoom controls | ✅ |
| Workflow rename | ✅ |
| Canvas clear | ✅ |

---

## Architecture

```
src/
├── app/
│   ├── layout.tsx          ← Root layout with metadata/SEO
│   ├── page.tsx            ← App shell (Sidebar + Canvas + NodePanel)
│   ├── globals.css         ← Global reset + Inter font
│   └── page.module.css     ← App shell layout
│
├── types/
│   └── workflow.ts         ← All TypeScript interfaces (WorkflowNode, edges, forms, simulation)
│
├── lib/
│   └── mockApi.ts          ← Mock API functions (getAutomations, simulateWorkflow)
│                             Swap for real fetch() with zero component changes.
│
├── store/
│   └── workflowStore.ts    ← Zustand store: nodes, edges, selectedNodeId + all mutations
│
├── hooks/
│   ├── useAutomations.ts   ← Fetches automation list from mock API
│   └── useSimulation.ts    ← Manages simulation lifecycle (idle→running→done)
│
└── components/
    ├── nodes/              ← 5 custom React Flow node components
    │   ├── StartNode.tsx
    │   ├── TaskNode.tsx
    │   ├── ApprovalNode.tsx
    │   ├── AutomatedNode.tsx
    │   ├── EndNode.tsx
    │   └── Node.module.css     ← Shared node styles
    │
    ├── forms/              ← One form component per node type
    │   ├── StartForm.tsx
    │   ├── TaskForm.tsx
    │   ├── ApprovalForm.tsx
    │   ├── AutomatedForm.tsx
    │   ├── EndForm.tsx
    │   ├── KeyValueEditor.tsx  ← Reusable dynamic key-value pairs
    │   └── Forms.module.css
    │
    ├── WorkflowCanvas.tsx  ← React Flow canvas, drag-drop, connections
    ├── NodePanel.tsx       ← Right-side config drawer
    ├── Sidebar.tsx         ← Left panel: palette + templates + stats
    ├── Toolbar.tsx         ← Top bar: name, validation, export/import, simulate
    └── SimulationPanel.tsx ← Modal with execution timeline
```

---

## Design Decisions

### State Management — Zustand
Chose Zustand over Context API because:
- No provider boilerplate
- Individual atomic selectors avoid infinite-render loop with React 18's `getServerSnapshot`
- `useWorkflowStore((s) => s.nodes)` is the canonical pattern (not destructuring from `() => ({})`)

### React Flow Integration
- `ReactFlowProvider` wraps the entire page to make `useReactFlow()` available deep in the tree
- Custom node types registered at module level (important — must not be recreated on every render)
- Nodes/edges in Zustand are the source of truth; React Flow `onNodesChange`/`onEdgesChange` apply changes back to the store
- `fitView` on load to auto-center pre-built templates

### Mock API Layer (`src/lib/mockApi.ts`)
- Functions: `getAutomations()` and `simulateWorkflow(nodes, edges)`
- Simulated network delay (200–1400ms) for realism
- `simulateWorkflow` runs:
  1. Kahn's algorithm for topological sort
  2. Cycle detection (if ordered.length ≠ nodes.length → cycle)
  3. Structural validation (missing start/end, disconnected nodes)
  4. Per-node simulation messages with random approval outcomes
- To swap for a real backend: replace `delay()` + local logic with `fetch('/api/simulate', { body: JSON.stringify({nodes, edges}) })`

### Form Architecture
- Each node type has a dedicated `*Form.tsx` component that reads/writes via `useWorkflowStore`
- `NodePanel.tsx` renders the correct form using a `switch` on `node.type` — adding a new node type only requires one new case and one new form component
- `KeyValueEditor` is fully reusable for both metadata (Start) and custom fields (Task)
- `AutomatedForm` dynamically renders param inputs that change when the user selects a different action — driven by the mock API data, not hardcoded

### Validation
- Toolbar runs validation on every render (cheap, in-memory)
- Shows: errors (red) → warnings (amber) → "Workflow valid" (green)
- Validates: empty canvas, missing start/end, untitled tasks
- Simulation runs a deeper structural validation incl. cycle detection

---

## What I Would Add With More Time

| Feature | Approach |
|---|---|
| Undo/Redo | `temporal` middleware from `zustand/middleware` |
| Auto-layout | `dagre` or `elkjs` for automatic node positioning |
| Conditional edges (Yes/No branches) | Edge type = `conditional`, custom edge component |
| Node version history | Per-node changelog in store, displayed in panel |
| Real backend persistence | Replace mockApi with REST/GraphQL, add auth layer |
| Real-time collaboration | Yjs + WebSocket for multi-user canvas sync |
| Workflow versioning | Snapshot store state to IndexedDB on every change |
| Visual cycle indicators | Edge highlighted red when cycle is detected |
| Node search / jump | Ctrl+F opens node search, canvas pans to result |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Canvas | React Flow (`@xyflow/react`) |
| State | Zustand |
| Language | TypeScript |
| Styling | CSS Modules (no Tailwind) |
| Icons | Lucide React |
| Unique IDs | `uuid` v4 |
| Mock API | Local async functions (no MSW/json-server needed) |

---

## Assumptions

1. No auth or backend required — all state is in-memory, not persisted across reloads
2. "Mock API" is implemented as async functions with simulated delays, not an actual HTTP server
3. Edge deletion is double-click (common in graph editors), not click
4. The workflow name is editable by clicking it in the toolbar
5. Topological sort → no cycle = valid execution order; cycles are detected and reported, not fixed automatically
6. The simulation runs all nodes regardless of errors to produce a complete log (errors are shown separately)
