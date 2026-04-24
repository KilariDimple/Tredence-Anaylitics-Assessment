'use client';

/**
 * WorkflowCanvas — the React Flow canvas.
 * Split into two components:
 *   - WorkflowCanvasInner  uses useReactFlow() (must be inside ReactFlowProvider)
 *   - WorkflowCanvas       re-exports WorkflowCanvasInner (provider is in page.tsx)
 *
 * This pattern gives us access to screenToFlowPosition inside the drop handler.
 */

import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useWorkflowStore } from '@/store/workflowStore';
import type { NodeType } from '@/types/workflow';

import StartNode     from './nodes/StartNode';
import TaskNode      from './nodes/TaskNode';
import ApprovalNode  from './nodes/ApprovalNode';
import AutomatedNode from './nodes/AutomatedNode';
import EndNode       from './nodes/EndNode';

import styles from './WorkflowCanvas.module.css';

// ── Node type map — defined outside component so it's never recreated ─────────
const nodeTypes = {
  start:     StartNode,
  task:      TaskNode,
  approval:  ApprovalNode,
  automated: AutomatedNode,
  end:       EndNode,
};

// ── Inner component (has access to useReactFlow) ──────────────────────────────
function WorkflowCanvasInner() {
  const {
    nodes,
    edges,
    selectedNodeId,
    addNode,
    addEdge,
    deleteNode,
    deleteEdge,
    selectNode,
    setNodes,
    setEdges,
  } = useWorkflowStore();

  // screenToFlowPosition requires being inside ReactFlowProvider — works here ✓
  const { screenToFlowPosition } = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // ── Node/Edge change handlers ─────────────────────────────────────────────
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setNodes(applyNodeChanges(changes, nodes as any) as any);
    },
    [nodes, setNodes]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setEdges(applyEdgeChanges(changes, edges as any) as any);
    },
    [edges, setEdges]
  );

  // ── Connection ────────────────────────────────────────────────────────────
  const onConnect: OnConnect = useCallback(
    (connection) => addEdge(connection),
    [addEdge]
  );

  // ── Selection ─────────────────────────────────────────────────────────────
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => selectNode(node.id),
    [selectNode]
  );

  const onPaneClick = useCallback(() => selectNode(null), [selectNode]);

  // ── Keyboard delete ───────────────────────────────────────────────────────
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
        // Don't delete while typing in an input / textarea
        const tag = (e.target as HTMLElement).tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        deleteNode(selectedNodeId);
      }
    },
    [selectedNodeId, deleteNode]
  );

  // ── Drag over ─────────────────────────────────────────────────────────────
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  // ── Drop — uses screenToFlowPosition from useReactFlow ───────────────────
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      const type = e.dataTransfer.getData('application/reactflow') as NodeType;
      if (!type) return;

      // Convert screen coordinates → flow coordinates (accounts for zoom/pan)
      const position = screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });

      addNode(type, position);
    },
    [addNode, screenToFlowPosition]
  );

  // ── Edge double-click to delete ───────────────────────────────────────────
  const onEdgeDoubleClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => deleteEdge(edge.id),
    [deleteEdge]
  );

  return (
    <div
      className={styles.canvasWrapper}
      ref={reactFlowWrapper}
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      <ReactFlow
        nodes={nodes.map((n) => ({
          ...n,
          selected: n.id === selectedNodeId,
        }))}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onEdgeDoubleClick={onEdgeDoubleClick}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        deleteKeyCode={null}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#6366f1', strokeWidth: 2 },
        }}
        connectionLineStyle={{ stroke: '#6366f1', strokeWidth: 2 }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.25}
        maxZoom={2.5}
        snapToGrid
        snapGrid={[16, 16]}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.2}
          color="#e2e8f0"
        />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(n) => {
            const colors: Record<string, string> = {
              start: '#10b981',
              task: '#3b82f6',
              approval: '#f59e0b',
              automated: '#8b5cf6',
              end: '#ef4444',
            };
            return colors[n.type ?? ''] ?? '#9ca3af';
          }}
          maskColor="rgba(249,250,251,0.85)"
          pannable
          zoomable
        />
      </ReactFlow>

      {/* Empty canvas hint */}
      {nodes.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="6" y="6" width="36" height="36" rx="8" stroke="#d1d5db" strokeWidth="2" strokeDasharray="4 3"/>
              <path d="M24 16v16M16 24h16" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className={styles.emptyTitle}>Start building your workflow</div>
          <div className={styles.emptyHint}>
            Drag a node from the left panel and drop it here,<br/>
            or load a template to get started instantly.
          </div>
        </div>
      )}
    </div>
  );
}

// ── Public export ─────────────────────────────────────────────────────────────
export default function WorkflowCanvas() {
  return <WorkflowCanvasInner />;
}
