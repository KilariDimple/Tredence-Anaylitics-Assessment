/**
 * Mock API Layer
 * Simulates REST endpoints with artificial delays to mimic real network calls.
 * Swap this out for real fetch() calls against a real backend with zero changes
 * to the callers — just update the functions below.
 */

import type {
  AutomationAction,
  SimulationResult,
  SimulationStep,
  WorkflowEdge,
  WorkflowNode,
} from '@/types/workflow';

// ─── Helpers ────────────────────────────────────────────────────────────────────
const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const now = () => new Date().toISOString();

// ─── Mock Data ──────────────────────────────────────────────────────────────────
const AUTOMATION_ACTIONS: AutomationAction[] = [
  {
    id: 'send_email',
    label: 'Send Email',
    params: ['to', 'subject', 'body'],
  },
  {
    id: 'generate_doc',
    label: 'Generate Document',
    params: ['template', 'recipient', 'format'],
  },
  {
    id: 'create_ticket',
    label: 'Create JIRA Ticket',
    params: ['project', 'summary', 'priority'],
  },
  {
    id: 'slack_notify',
    label: 'Slack Notification',
    params: ['channel', 'message'],
  },
  {
    id: 'update_hris',
    label: 'Update HRIS Record',
    params: ['employeeId', 'field', 'value'],
  },
  {
    id: 'schedule_meeting',
    label: 'Schedule Meeting',
    params: ['attendees', 'title', 'duration'],
  },
];

// ─── GET /automations ───────────────────────────────────────────────────────────
export async function getAutomations(): Promise<AutomationAction[]> {
  await delay(randomBetween(200, 500));
  return [...AUTOMATION_ACTIONS];
}

// ─── POST /simulate ─────────────────────────────────────────────────────────────
export async function simulateWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): Promise<SimulationResult> {
  await delay(randomBetween(800, 1400));

  const errors: string[] = [];
  const warnings: string[] = [];
  const steps: SimulationStep[] = [];

  // ── 1. Topological sort (Kahn's algorithm) ───────────────────────────────
  const inDegree: Record<string, number> = {};
  const adjacency: Record<string, string[]> = {};

  nodes.forEach((n) => {
    inDegree[n.id] = 0;
    adjacency[n.id] = [];
  });

  edges.forEach((e) => {
    adjacency[e.source].push(e.target);
    inDegree[e.target] = (inDegree[e.target] || 0) + 1;
  });

  const queue: string[] = Object.entries(inDegree)
    .filter(([, deg]) => deg === 0)
    .map(([id]) => id);

  const ordered: string[] = [];
  while (queue.length) {
    const id = queue.shift()!;
    ordered.push(id);
    adjacency[id].forEach((neighbor) => {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    });
  }

  // ── 2. Cycle detection ───────────────────────────────────────────────────
  if (ordered.length !== nodes.length) {
    errors.push('Workflow contains a cycle. Please remove circular connections.');
  }

  // ── 3. Structural validations ────────────────────────────────────────────
  const startNodes = nodes.filter((n) => n.type === 'start');
  const endNodes = nodes.filter((n) => n.type === 'end');

  if (startNodes.length === 0) errors.push('Workflow must have at least one Start node.');
  if (startNodes.length > 1) warnings.push('Multiple Start nodes detected. Only one is recommended.');
  if (endNodes.length === 0) errors.push('Workflow must have at least one End node.');

  nodes.forEach((n) => {
    const hasIncoming = edges.some((e) => e.target === n.id);
    const hasOutgoing = edges.some((e) => e.source === n.id);
    if (n.type !== 'start' && !hasIncoming) {
      warnings.push(`Node "${(n.data as { title?: string }).title ?? n.id}" has no incoming connections.`);
    }
    if (n.type !== 'end' && !hasOutgoing) {
      warnings.push(`Node "${(n.data as { title?: string }).title ?? n.id}" has no outgoing connections.`);
    }
  });

  // ── 4. Step-by-step simulation ───────────────────────────────────────────
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const simulationOrder = errors.length === 0 ? ordered : nodes.map((n) => n.id);

  simulationOrder.forEach((id) => {
    const node = nodeMap.get(id);
    if (!node) return;

    const data = node.data as Record<string, unknown>;
    const title = (data.title as string) ?? (data.endMessage as string) ?? node.type;
    const duration = randomBetween(50, 400);

    let status: SimulationStep['status'] = 'success';
    let message = '';

    switch (node.type) {
      case 'start':
        message = `Workflow initiated: "${title}"`;
        break;
      case 'task':
        message = `Task "${title}" assigned to ${data.assignee || 'Unassigned'}. Due: ${data.dueDate || 'No deadline'}.`;
        if (!data.assignee) {
          status = 'warning';
          message += ' ⚠ No assignee specified.';
        }
        break;
      case 'approval':
        message = `Approval request sent to ${data.approverRole || 'Unknown Role'}. Auto-approve threshold: ${data.autoApproveThreshold ?? 'N/A'}.`;
        // Randomly simulate approval result
        if (Math.random() > 0.2) {
          message += ' ✓ Approved.';
        } else {
          status = 'warning';
          message += ' ⏳ Pending approval.';
        }
        break;
      case 'automated': {
        const actionId = data.actionId as string;
        const action = AUTOMATION_ACTIONS.find((a) => a.id === actionId);
        message = action
          ? `Executed automation: "${action.label}"`
          : `Executed automation action: ${actionId || 'None selected'}`;
        if (!actionId) {
          status = 'warning';
          message = 'Automated step has no action configured.';
        }
        break;
      }
      case 'end':
        message = `Workflow completed. ${data.showSummary ? 'Summary report generated.' : ''} Message: "${data.endMessage || 'Done'}"`;
        break;
    }

    steps.push({
      nodeId: id,
      nodeType: node.type,
      nodeTitle: title,
      status,
      message,
      timestamp: now(),
      duration,
    });
  });

  return {
    success: errors.length === 0,
    totalDuration: steps.reduce((acc, s) => acc + s.duration, 0),
    steps,
    errors,
    warnings,
  };
}
