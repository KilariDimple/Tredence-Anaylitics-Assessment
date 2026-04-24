/**
 * Zustand store for workflow state management.
 * Centralises nodes, edges, and selected node — keeps canvas and panel in sync.
 */
'use client';

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  WorkflowNode,
  WorkflowEdge,
  WorkflowNodeData,
  NodeType,
} from '@/types/workflow';

type Connection = { source: string; target: string; sourceHandle?: string | null; targetHandle?: string | null };

interface WorkflowStore {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;

  // Node CRUD
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  updateNode: (id: string, data: Partial<WorkflowNodeData>) => void;
  deleteNode: (id: string) => void;
  setNodes: (nodes: WorkflowNode[]) => void;

  // Edge CRUD
  addEdge: (connection: Connection) => void;
  deleteEdge: (id: string) => void;
  setEdges: (edges: WorkflowEdge[]) => void;

  // Selection
  selectNode: (id: string | null) => void;

  // Bulk
  clearCanvas: () => void;
  loadWorkflow: (nodes: WorkflowNode[], edges: WorkflowEdge[]) => void;
}

const defaultDataForType = (type: NodeType): WorkflowNodeData => {
  switch (type) {
    case 'start':
      return { type: 'start', title: 'Start', metadata: [] };
    case 'task':
      return {
        type: 'task',
        title: 'New Task',
        description: '',
        assignee: '',
        dueDate: '',
        customFields: [],
      };
    case 'approval':
      return {
        type: 'approval',
        title: 'Approval Step',
        approverRole: 'Manager',
        autoApproveThreshold: 0,
      };
    case 'automated':
      return {
        type: 'automated',
        title: 'Automated Action',
        actionId: '',
        actionParams: {},
      };
    case 'end':
      return { type: 'end', endMessage: 'Workflow complete', showSummary: true };
  }
};

export const useWorkflowStore = create<WorkflowStore>((set) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,

  addNode: (type, position) =>
    set((state) => ({
      nodes: [
        ...state.nodes,
        {
          id: uuidv4(),
          type,
          position,
          data: defaultDataForType(type),
        },
      ],
    })),

  updateNode: (id, data) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } as WorkflowNodeData } : n
      ),
    })),

  deleteNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    })),

  setNodes: (nodes) => set({ nodes }),

  addEdge: (connection) =>
    set((state) => {
      const exists = state.edges.some(
        (e) => e.source === connection.source && e.target === connection.target
      );
      if (exists) return state;
      return {
        edges: [
          ...state.edges,
          { id: uuidv4(), source: connection.source, target: connection.target, animated: true },
        ],
      };
    }),

  deleteEdge: (id) =>
    set((state) => ({ edges: state.edges.filter((e) => e.id !== id) })),

  setEdges: (edges) => set({ edges }),

  selectNode: (id) => set({ selectedNodeId: id }),

  clearCanvas: () => set({ nodes: [], edges: [], selectedNodeId: null }),

  loadWorkflow: (nodes, edges) => set({ nodes, edges, selectedNodeId: null }),
}));
