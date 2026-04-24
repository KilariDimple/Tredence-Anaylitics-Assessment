# HR Workflow Designer

A visual workflow builder for HR processes — think onboarding checklists, leave approval chains, document verification flows. Built as a functional prototype to demonstrate React + React Flow architecture.

## Getting started

```bash
npm install
npm run dev
```

Opens at `http://localhost:3000`. No env vars, no database, nothing else needed.

## What this does

The app lets you design HR workflows on a drag-and-drop canvas. You pick node types from a sidebar (Start, Task, Approval, Automated, End), drop them on the canvas, wire them together, and configure each one through a form panel on the right.

There are three pre-built templates you can load instantly — an employee onboarding flow, a leave approval chain, and a document verification process. These are useful for quickly seeing how things connect.

Once your workflow is ready, you can run a simulation that walks through each step in order, validates the structure, checks for cycles, and produces a timestamped execution log showing what would happen at each stage.

You can also export the whole thing as JSON and import it back later.

## How it's structured

```
src/
  types/workflow.ts        -- all the TS interfaces live here
  store/workflowStore.ts   -- zustand store, single source of truth for canvas state
  lib/mockApi.ts           -- fake API layer (swap this for real fetch calls later)
  hooks/                   -- useAutomations, useSimulation
  components/
    nodes/                 -- one component per node type (StartNode, TaskNode, etc.)
    forms/                 -- one form per node type + a shared KeyValueEditor
    WorkflowCanvas.tsx     -- the React Flow canvas itself
    Sidebar.tsx            -- left panel with node palette and templates
    NodePanel.tsx          -- right panel that shows the config form
    Toolbar.tsx            -- top bar with workflow name, validation, export/import
    SimulationPanel.tsx    -- the modal that shows simulation results
```

## Why these choices

**Zustand over Context API** — I originally started with Context but ran into the classic React 18 issue where selectors returning object literals trigger infinite re-renders (`getServerSnapshot` mismatch). Zustand handles this cleanly with individual selectors like `useWorkflowStore(s => s.nodes)`. It also means zero provider wrapper boilerplate.

**React Flow** — it handles all the canvas interactions I'd otherwise spend days building: zooming, panning, snapping, minimap, connection handles, edge routing. I just had to write the custom node components and wire up the store.

**CSS Modules instead of Tailwind** — for a project this size, scoped CSS modules keep things readable without adding a build dependency. Each component has its own `.module.css` file so styles don't leak.

**Mock API as plain functions** — `src/lib/mockApi.ts` exports `getAutomations()` and `simulateWorkflow()`. They use `setTimeout` to fake network latency. When you're ready to hook up a real backend, you just replace the function bodies with `fetch()` calls and nothing else changes.

**Simulation logic** — the simulate function runs Kahn's algorithm to topologically sort the nodes, which also handles cycle detection for free (if the sorted output has fewer nodes than the input, there's a cycle). Then it walks each node in order and generates a log entry.

## Node types and their forms

Each node type opens a different configuration form when you click it:

- **Start** — title + key-value metadata pairs (e.g. department, trigger type)
- **Task** — title, description, assignee, due date, custom key-value fields
- **Approval** — title, approver role (dropdown: Manager, HRBP, Director, etc.), auto-approve threshold
- **Automated** — title, action picker (Send Email, Update HRIS, etc.), and dynamic parameter fields that change depending on which action you select
- **End** — completion message, toggle for whether to generate a summary report

The Automated form is probably the most interesting one — the parameter inputs are driven by the mock API data, not hardcoded, so adding a new automation action is just a data change.

## Things I'd add with more time

Undo/redo using zustand's `temporal` middleware. Auto-layout with dagre so you don't have to manually position everything. Conditional branching edges (yes/no paths from approval nodes). Persisting workflows to a database instead of just exporting JSON. And probably some kind of node search so you can jump to a specific step on large workflows.

## Tech stack

- Next.js 15 (App Router)
- React Flow (`@xyflow/react`)
- Zustand for state
- TypeScript throughout
- CSS Modules for styling
- Lucide React for icons
- uuid for node/edge IDs

## Assumptions

This is a client-only prototype — no auth, no persistence, state resets on page refresh. The mock API is just async functions with fake delays, not an HTTP server. Edge deletion is double-click (standard for graph editors). The simulation runs every node regardless of individual failures so you get a complete picture of what happened.
