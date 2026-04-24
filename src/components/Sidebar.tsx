'use client';

/**
 * Sidebar — left panel with draggable node type tiles.
 * Also shows a mini overview of workflow stats and template shortcuts.
 */

import { useWorkflowStore } from '@/store/workflowStore';
import type { NodeType } from '@/types/workflow';
import {
  Play, CheckSquare, ShieldCheck, Zap, Flag,
  GitBranch, Users, FileText, Plus
} from 'lucide-react';
import styles from './Sidebar.module.css';

const NODE_TYPES: { type: NodeType; label: string; description: string; color: string; icon: React.ReactNode }[] = [
  { type: 'start',     label: 'Start',       description: 'Workflow entry point',       color: '#10b981', icon: <Play size={16} /> },
  { type: 'task',      label: 'Task',         description: 'Human task or action',       color: '#3b82f6', icon: <CheckSquare size={16} /> },
  { type: 'approval',  label: 'Approval',     description: 'Manager/HR approval step',   color: '#f59e0b', icon: <ShieldCheck size={16} /> },
  { type: 'automated', label: 'Automated',    description: 'System-triggered action',    color: '#8b5cf6', icon: <Zap size={16} /> },
  { type: 'end',       label: 'End',          description: 'Workflow completion',         color: '#ef4444', icon: <Flag size={16} /> },
];

const TEMPLATES = [
  { id: 'onboarding', label: 'Onboarding', icon: <Users size={14} /> },
  { id: 'leave',      label: 'Leave Approval', icon: <GitBranch size={14} /> },
  { id: 'docverify',  label: 'Doc Verification', icon: <FileText size={14} /> },
];

const ONBOARDING_TEMPLATE = {
  nodes: [
    { id: 'n1', type: 'start' as NodeType, position: { x: 280, y: 80 }, data: { type: 'start' as const, title: 'Employee Joins', metadata: [{ id: 'k1', key: 'department', value: '' }] } },
    { id: 'n2', type: 'task' as NodeType, position: { x: 280, y: 200 }, data: { type: 'task' as const, title: 'Collect Documents', description: 'Gather ID proof, offer letter, and bank details.', assignee: 'HR Team', dueDate: '', customFields: [] } },
    { id: 'n3', type: 'approval' as NodeType, position: { x: 280, y: 340 }, data: { type: 'approval' as const, title: 'Manager Approval', approverRole: 'Manager', autoApproveThreshold: 0 } },
    { id: 'n4', type: 'automated' as NodeType, position: { x: 280, y: 480 }, data: { type: 'automated' as const, title: 'Send Welcome Email', actionId: 'send_email', actionParams: { to: '{{employee.email}}', subject: 'Welcome aboard!', body: '' } } },
    { id: 'n5', type: 'end' as NodeType, position: { x: 280, y: 620 }, data: { type: 'end' as const, endMessage: 'Onboarding complete. Employee is set up!', showSummary: true } },
  ],
  edges: [
    { id: 'e1', source: 'n1', target: 'n2', animated: true },
    { id: 'e2', source: 'n2', target: 'n3', animated: true },
    { id: 'e3', source: 'n3', target: 'n4', animated: true },
    { id: 'e4', source: 'n4', target: 'n5', animated: true },
  ],
};

const LEAVE_TEMPLATE = {
  nodes: [
    { id: 'n1', type: 'start' as NodeType, position: { x: 280, y: 80 }, data: { type: 'start' as const, title: 'Leave Request Filed', metadata: [] } },
    { id: 'n2', type: 'approval' as NodeType, position: { x: 280, y: 220 }, data: { type: 'approval' as const, title: 'Manager Approval', approverRole: 'Manager', autoApproveThreshold: 0 } },
    { id: 'n3', type: 'approval' as NodeType, position: { x: 280, y: 360 }, data: { type: 'approval' as const, title: 'HRBP Review', approverRole: 'HRBP', autoApproveThreshold: 5 } },
    { id: 'n4', type: 'automated' as NodeType, position: { x: 280, y: 500 }, data: { type: 'automated' as const, title: 'Update HRIS System', actionId: 'update_hris', actionParams: { employeeId: '', field: 'leaveBalance', value: '' } } },
    { id: 'n5', type: 'end' as NodeType, position: { x: 280, y: 640 }, data: { type: 'end' as const, endMessage: 'Leave approved and recorded.', showSummary: false } },
  ],
  edges: [
    { id: 'e1', source: 'n1', target: 'n2', animated: true },
    { id: 'e2', source: 'n2', target: 'n3', animated: true },
    { id: 'e3', source: 'n3', target: 'n4', animated: true },
    { id: 'e4', source: 'n4', target: 'n5', animated: true },
  ],
};

const DOC_TEMPLATE = {
  nodes: [
    { id: 'n1', type: 'start' as NodeType, position: { x: 280, y: 80 }, data: { type: 'start' as const, title: 'Document Submitted', metadata: [] } },
    { id: 'n2', type: 'task' as NodeType, position: { x: 280, y: 210 }, data: { type: 'task' as const, title: 'Initial Review', description: 'Verify document format and completeness.', assignee: 'HR Coordinator', dueDate: '', customFields: [] } },
    { id: 'n3', type: 'approval' as NodeType, position: { x: 280, y: 350 }, data: { type: 'approval' as const, title: 'Legal Sign-off', approverRole: 'Legal', autoApproveThreshold: 0 } },
    { id: 'n4', type: 'automated' as NodeType, position: { x: 280, y: 490 }, data: { type: 'automated' as const, title: 'Archive Document', actionId: 'generate_doc', actionParams: { template: 'archive', recipient: '{{hr.email}}', format: 'PDF' } } },
    { id: 'n5', type: 'end' as NodeType, position: { x: 280, y: 630 }, data: { type: 'end' as const, endMessage: 'Document verified and archived.', showSummary: true } },
  ],
  edges: [
    { id: 'e1', source: 'n1', target: 'n2', animated: true },
    { id: 'e2', source: 'n2', target: 'n3', animated: true },
    { id: 'e3', source: 'n3', target: 'n4', animated: true },
    { id: 'e4', source: 'n4', target: 'n5', animated: true },
  ],
};

const TEMPLATE_DATA: Record<string, typeof ONBOARDING_TEMPLATE> = {
  onboarding: ONBOARDING_TEMPLATE,
  leave: LEAVE_TEMPLATE,
  docverify: DOC_TEMPLATE,
};

export default function Sidebar() {
  const nodes = useWorkflowStore((s) => s.nodes);
  const loadWorkflow = useWorkflowStore((s) => s.loadWorkflow);
  const clearCanvas = useWorkflowStore((s) => s.clearCanvas);
  const addNode = useWorkflowStore((s) => s.addNode);

  const handleDragStart = (e: React.DragEvent, type: NodeType) => {
    e.dataTransfer.setData('application/reactflow', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Click-to-add: places node in a staggered grid so nodes don't overlap
  const handleClickAdd = (type: NodeType) => {
    const base = { x: 320, y: 100 };
    const offset = nodes.length * 30;
    const typeOffsets: Record<NodeType, { x: number; y: number }> = {
      start:     { x: base.x,       y: base.y + offset },
      task:      { x: base.x,       y: base.y + 140 + offset },
      approval:  { x: base.x,       y: base.y + 280 + offset },
      automated: { x: base.x,       y: base.y + 420 + offset },
      end:       { x: base.x,       y: base.y + 560 + offset },
    };
    addNode(type, typeOffsets[type]);
  };

  const loadTemplate = (id: string) => {
    const tpl = TEMPLATE_DATA[id];
    if (tpl) loadWorkflow(tpl.nodes as Parameters<typeof loadWorkflow>[0], tpl.edges);
  };

  const nodeCount = {
    start: nodes.filter((n) => n.type === 'start').length,
    task: nodes.filter((n) => n.type === 'task').length,
    approval: nodes.filter((n) => n.type === 'approval').length,
    automated: nodes.filter((n) => n.type === 'automated').length,
    end: nodes.filter((n) => n.type === 'end').length,
  };

  return (
    <aside className={styles.sidebar} role="navigation" aria-label="Workflow nodes">
      {/* Branding */}
      <div className={styles.brand}>
        <div className={styles.brandIcon}>
          <GitBranch size={18} color="#fff" />
        </div>
        <div>
          <div className={styles.brandName}>FlowDesigner</div>
          <div className={styles.brandSub}>HR Workflow Studio</div>
        </div>
      </div>

      <div className={styles.divider} />

      {/* Node palette */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Node Palette</div>
        <p className={styles.sectionHint}>Drag onto canvas, or click <strong>+</strong> to add.</p>
        <div className={styles.nodeList}>
          {NODE_TYPES.map((n) => (
            <div
              key={n.type}
              className={styles.nodeItem}
              draggable
              onDragStart={(e) => handleDragStart(e, n.type)}
              title={`Drag to add ${n.label} node`}
            >
              <div
                className={styles.nodeItemIcon}
                style={{ background: n.color + '18', color: n.color }}
              >
                {n.icon}
              </div>
              <div className={styles.nodeItemText}>
                <div className={styles.nodeItemLabel}>{n.label}</div>
                <div className={styles.nodeItemDesc}>{n.description}</div>
              </div>
              <div className={styles.nodeItemRight}>
                <div className={styles.nodeCount} style={{ color: n.color, background: n.color + '14' }}>
                  {nodeCount[n.type]}
                </div>
                <button
                  className={styles.addNodeBtn}
                  style={{ color: n.color }}
                  onClick={() => handleClickAdd(n.type)}
                  title={`Add ${n.label} node to canvas`}
                  aria-label={`Add ${n.label} node`}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.divider} />

      {/* Templates */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Templates</div>
        <p className={styles.sectionHint}>Load a pre-built workflow to get started quickly.</p>
        <div className={styles.templateList}>
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              className={styles.templateBtn}
              onClick={() => loadTemplate(t.id)}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.divider} />

      {/* Canvas stats */}
      {nodes.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Canvas Summary</div>
          <div className={styles.statGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNum}>{nodes.length}</div>
              <div className={styles.statLbl}>Nodes</div>
            </div>
          </div>
          <button className={styles.clearBtn} onClick={clearCanvas}>
            Clear canvas
          </button>
        </div>
      )}
    </aside>
  );
}
