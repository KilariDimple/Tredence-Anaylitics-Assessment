# HR Workflow Designer

This is a visual workflow builder I built for designing HR processes like employee onboarding, leave approval chains, and document verification flows. The idea is that an HR admin can open this app, drag nodes onto a canvas, connect them together, configure each step, and then run a simulation to see if the whole flow makes sense before deploying it.

I built it with Next.js, React Flow, TypeScript, and Zustand. The whole thing runs in the browser with no backend — the API layer is mocked with async functions that simulate real network behavior.

## How to run it

```bash
npm install
npm run dev
```

That's it. Opens at `http://localhost:3000`. No environment variables, no database setup, nothing else to configure.

## What the app actually does

When you open the app, you see three main areas:

1. A sidebar on the left with a palette of node types you can add to the canvas
2. The main canvas in the center where you build your workflow visually
3. A configuration panel on the right that appears when you select any node

The workflow building process is pretty intuitive — you pick a node type (Start, Task, Approval, Automated, or End), either drag it onto the canvas or click the + button, and then wire nodes together by dragging from one node's output handle to another node's input handle. Each connection creates an animated edge so you can clearly see the flow direction.

I also added three pre-built templates (Onboarding, Leave Approval, and Document Verification) because I figured it would be useful for someone evaluating the project to immediately see a complete workflow without having to build one from scratch. You just click a template name in the sidebar and the whole thing loads up with proper connections.

Once you have a workflow ready, you can hit "Run Simulation" in the toolbar. This opens a modal that walks through every node in execution order, validates the structure, and produces a detailed log with timestamps showing what would happen at each step. It even catches things like cycles in the graph and missing start/end nodes.

## What I'm most proud of in this project

### The architecture is genuinely modular

This isn't a monolithic component where everything is tangled together. I split the project into clear layers:

- **Types** (`src/types/workflow.ts`) — every interface lives in one file. WorkflowNode, edge types, simulation results, form data shapes, all of it. If you want to understand the data model, you only need to read one file.

- **State** (`src/store/workflowStore.ts`) — I used Zustand as the single source of truth for everything on the canvas. Nodes, edges, which node is currently selected, add/delete/update operations — it's all in one store. The nice thing is that any component anywhere in the tree can subscribe to exactly the slice of state it needs without prop drilling.

- **Mock API** (`src/lib/mockApi.ts`) — this is the part I designed to be swappable. Right now `getAutomations()` and `simulateWorkflow()` are local functions with fake delays. But because every component talks to them through hooks (`useAutomations`, `useSimulation`), swapping them for real `fetch()` calls to a backend would be a change in one file and nothing else would break.

- **Components** — each node type has its own component, each form has its own component, the canvas/sidebar/toolbar/panel are all separate. Adding a sixth node type would mean writing one node component, one form component, adding a case to the switch statement in NodePanel, and that's it.

### The form system is dynamic, not hardcoded

This is probably the most interesting technical piece. Each node type has its own configuration form, which is straightforward enough. But the Automated node form does something more sophisticated — when you pick a different automation action from the dropdown (Send Email, Update HRIS, Generate Document, etc.), the parameter fields below it change dynamically. 

The available actions and their parameter schemas come from the mock API, not from hardcoded JSX. So if tomorrow I needed to add a "Create Slack Channel" automation, I'd just add an entry to the API response with its parameters, and the form would automatically render the right fields. No new React code needed.

I also built a reusable `KeyValueEditor` component that I use in two places — the Start node's metadata section and the Task node's custom fields section. It lets you add/remove arbitrary key-value pairs, which is the kind of flexibility HR workflows actually need in practice.

### The simulation engine is more than a toy

I didn't just loop through nodes in array order. The simulation actually runs Kahn's algorithm to topologically sort the graph. This matters because:

- It gives you the correct execution order even when the visual layout on screen doesn't match the logical flow
- It catches cycles for free — if the topological sort produces fewer nodes than exist in the graph, there's a cycle, and the simulation reports exactly which nodes are involved
- It validates structural integrity — missing start nodes, missing end nodes, disconnected nodes

Each step in the simulation produces a realistic log message. Task nodes show the assignee and deadline. Approval nodes show who needs to approve and whether auto-approval kicked in. Automated nodes show which action was executed. End nodes show the completion message. The whole thing runs with simulated network latency so you can see the processing happen step by step.

### The state management approach actually works at scale

I initially tried using React Context for state management but ran into the classic React 18 problem — when you have a selector that returns an object literal, React's `getServerSnapshot` check creates an infinite re-render loop because the object reference is new on every call. 

Switching to Zustand fixed this completely. Each component subscribes to exactly the state it needs with atomic selectors like `useWorkflowStore(s => s.nodes)`. This means:

- The sidebar only re-renders when the node list changes
- The toolbar only re-renders when nodes/edges change
- The config panel only re-renders when the selected node's data changes
- The canvas doesn't re-render when you type in a form field

For a canvas-heavy app where performance matters, this granular subscription model is a big deal.

## Project structure

```
src/
  types/
    workflow.ts              -- all TypeScript interfaces in one place

  store/
    workflowStore.ts         -- Zustand store with all canvas state and mutations

  lib/
    mockApi.ts               -- fake API layer (getAutomations, simulateWorkflow)

  hooks/
    useAutomations.ts        -- fetches the list of available automation actions
    useSimulation.ts         -- manages the simulation lifecycle (idle/running/done)

  components/
    nodes/
      StartNode.tsx          -- green accent, play icon, shows metadata tags
      TaskNode.tsx           -- blue accent, shows description + assignee badge
      ApprovalNode.tsx       -- orange accent, shows approver role badge
      AutomatedNode.tsx      -- purple accent, shows action ID tag
      EndNode.tsx            -- red accent, shows summary toggle badge
      Node.module.css        -- shared styles for all node types

    forms/
      StartForm.tsx          -- title + key-value metadata editor
      TaskForm.tsx           -- title, description, assignee, due date, custom fields
      ApprovalForm.tsx       -- title, approver role dropdown, auto-approve threshold
      AutomatedForm.tsx      -- title, action picker, dynamic parameter inputs
      EndForm.tsx            -- completion message, summary report toggle
      KeyValueEditor.tsx     -- reusable add/remove key-value pair component
      Forms.module.css       -- shared form styles

    WorkflowCanvas.tsx       -- React Flow canvas with drag-drop and connections
    Sidebar.tsx              -- node palette, templates, canvas stats
    NodePanel.tsx            -- right-side config panel with form switching
    Toolbar.tsx              -- workflow name, validation status, import/export
    SimulationPanel.tsx      -- simulation results modal with execution timeline
```

## The five node types explained

**Start** — every workflow begins here. You give it a title and optionally add metadata as key-value pairs (like which department triggers it, or what event kicks it off). On the canvas it has a green accent bar and a play icon.

**Task** — represents a human action that someone needs to do. Has a title, description, who it's assigned to, an optional deadline, and custom fields for anything else you need to track. Shows up with a blue accent and displays the assignee as a badge.

**Approval** — a decision point where someone reviews and approves or rejects. You configure which role does the approving (Manager, HRBP, Director, VP, Legal) and an optional auto-approve threshold. Orange accent on the canvas.

**Automated** — a system action that happens without human intervention. You pick from a list of available automations (Send Email, Update HRIS, Generate Document, API Webhook, Create Calendar Event, Assign Training) and each one has its own set of parameter fields. Purple accent.

**End** — marks workflow completion. You write a completion message and toggle whether to generate a summary report of the entire execution. Red accent.

## What makes this project stand out

**It's not just a UI** — there's real logic behind it. The simulation engine, the topological sorting, the cycle detection, the dynamic form generation — these show that I understand how to build systems, not just screens.

**The code is actually maintainable** — I deliberately avoided putting everything in one giant component. The separation between state (Zustand), data fetching (hooks), business logic (mockApi), and presentation (components) means any developer could pick this up and extend it without having to understand the whole codebase first.

**It handles edge cases** — empty canvas state, single node without connections, cycles in the graph, nodes with missing required fields, keyboard shortcuts for deletion that don't fire when you're typing in an input field. These are the details that separate a prototype from something that actually works.

**The mock API is designed for replacement** — this isn't throwaway code. The API layer is structured so that connecting a real backend would take maybe an hour. The hooks abstract away the data source, the components don't know or care where data comes from.

**It looks professional without a UI library** — I used plain CSS Modules instead of reaching for a component library like Material UI or Chakra. Everything is hand-styled with a clean, light theme that looks like a real product, not a tutorial project. The node types are visually distinct through color coding, the forms are properly spaced and labeled, and the simulation panel is designed to be scannable at a glance.

## Tech stack

- **Next.js 15** with App Router — chose this because it's the current standard and gives good defaults for routing and SSR, even though this particular app is client-heavy
- **React Flow** (`@xyflow/react`) — handles all canvas interactions (zoom, pan, connect, snap) so I could focus on the node logic and forms
- **Zustand** — lightweight state management that solves the React 18 selector issues cleanly
- **TypeScript** — full type coverage across every component, hook, and store action
- **CSS Modules** — scoped styles without the overhead of Tailwind or a CSS-in-JS library
- **Lucide React** — clean icon set that matches the light, professional aesthetic
- **uuid** — for generating unique node and edge IDs

## Things I'd improve with more time

If I had another week, the first thing I'd add is undo/redo — Zustand has a `temporal` middleware that makes this pretty easy by keeping a history stack of state snapshots. 

After that, auto-layout using dagre or elkjs so that loading a template automatically arranges nodes in a clean vertical or horizontal flow instead of requiring manual positioning.

I'd also want conditional branching — an approval node should be able to have a "Yes" edge and a "No" edge going to different paths. Right now edges are just edges, there's no conditional logic on them.

Real persistence would be next — saving workflows to a database (probably Supabase or a simple Postgres setup) so they survive page refreshes and can be shared between users.

And finally, I'd add some form of real-time collaboration using Yjs and WebSockets, so multiple HR admins could work on the same workflow at the same time.

## Assumptions I made

- This is a client-only prototype, so there's no authentication or server-side persistence. State resets on page refresh, which is fine for a demo.
- The mock API uses `setTimeout` to simulate network latency (200-1400ms). It's not an actual HTTP server.
- Edge deletion is double-click, which is the convention in most graph editors I've used.
- The simulation runs every node even if an earlier step fails, because showing a complete execution log is more useful for debugging than stopping at the first error.
- Workflow validation in the toolbar is intentionally lightweight — it only flags structural issues like missing Start/End nodes. The heavy validation (cycles, disconnected nodes) happens in the simulation, because showing all those warnings while someone is still mid-build is annoying.
