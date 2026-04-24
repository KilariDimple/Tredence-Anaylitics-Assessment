// ─── Node Types ────────────────────────────────────────────────────────────────

export type NodeType = 'start' | 'task' | 'approval' | 'automated' | 'end';

export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
}

export interface StartNodeData {
  type: 'start';
  title: string;
  metadata: KeyValuePair[];
}

export interface TaskNodeData {
  type: 'task';
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  customFields: KeyValuePair[];
}

export interface ApprovalNodeData {
  type: 'approval';
  title: string;
  approverRole: string;
  autoApproveThreshold: number;
}

export interface AutomatedNodeData {
  type: 'automated';
  title: string;
  actionId: string;
  actionParams: Record<string, string>;
}

export interface EndNodeData {
  type: 'end';
  endMessage: string;
  showSummary: boolean;
}

export type WorkflowNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedNodeData
  | EndNodeData;

// ─── React Flow Node ────────────────────────────────────────────────────────────
export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: WorkflowNodeData;
  selected?: boolean;
}

// ─── React Flow Edge ────────────────────────────────────────────────────────────
export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
}

// ─── Automation API Types ───────────────────────────────────────────────────────
export interface AutomationAction {
  id: string;
  label: string;
  params: string[];
}

// ─── Simulation Types ───────────────────────────────────────────────────────────
export type SimulationStepStatus = 'success' | 'warning' | 'error' | 'info';

export interface SimulationStep {
  nodeId: string;
  nodeType: NodeType;
  nodeTitle: string;
  status: SimulationStepStatus;
  message: string;
  timestamp: string;
  duration: number; // ms
}

export interface SimulationResult {
  success: boolean;
  totalDuration: number;
  steps: SimulationStep[];
  errors: string[];
  warnings: string[];
}

// ─── Validation ─────────────────────────────────────────────────────────────────
export interface ValidationError {
  nodeId?: string;
  message: string;
  severity: 'error' | 'warning';
}
