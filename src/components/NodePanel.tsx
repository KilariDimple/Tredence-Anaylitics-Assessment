'use client';

/**
 * NodePanel — right-side drawer that shows the configuration form
 * for the currently selected node.
 */

import { useWorkflowStore } from '@/store/workflowStore';
import type { WorkflowNodeData } from '@/types/workflow';
import StartForm from './forms/StartForm';
import TaskForm from './forms/TaskForm';
import ApprovalForm from './forms/ApprovalForm';
import AutomatedForm from './forms/AutomatedForm';
import EndForm from './forms/EndForm';
import { Trash2, X, Play, CheckSquare, ShieldCheck, Zap, Flag } from 'lucide-react';
import styles from './NodePanel.module.css';

const NODE_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  start: { label: 'Start Node', color: '#10b981', icon: <Play size={15} /> },
  task: { label: 'Task Node', color: '#3b82f6', icon: <CheckSquare size={15} /> },
  approval: { label: 'Approval Node', color: '#f59e0b', icon: <ShieldCheck size={15} /> },
  automated: { label: 'Automated Step', color: '#8b5cf6', icon: <Zap size={15} /> },
  end: { label: 'End Node', color: '#ef4444', icon: <Flag size={15} /> },
};

export default function NodePanel() {
  const nodes = useWorkflowStore((s) => s.nodes);
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const selectNode = useWorkflowStore((s) => s.selectNode);
  const deleteNode = useWorkflowStore((s) => s.deleteNode);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) return null;

  const meta = NODE_META[selectedNode.type];
  const data = selectedNode.data as WorkflowNodeData;

  const renderForm = () => {
    switch (selectedNode.type) {
      case 'start':
        return <StartForm nodeId={selectedNode.id} data={data as Parameters<typeof StartForm>[0]['data']} />;
      case 'task':
        return <TaskForm nodeId={selectedNode.id} data={data as Parameters<typeof TaskForm>[0]['data']} />;
      case 'approval':
        return <ApprovalForm nodeId={selectedNode.id} data={data as Parameters<typeof ApprovalForm>[0]['data']} />;
      case 'automated':
        return <AutomatedForm nodeId={selectedNode.id} data={data as Parameters<typeof AutomatedForm>[0]['data']} />;
      case 'end':
        return <EndForm nodeId={selectedNode.id} data={data as Parameters<typeof EndForm>[0]['data']} />;
      default:
        return null;
    }
  };

  return (
    <aside className={styles.panel} role="complementary" aria-label="Node configuration">
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.typeIcon} style={{ background: meta.color + '1a', color: meta.color }}>
            {meta.icon}
          </div>
          <div>
            <div className={styles.typeLabel}>{meta.label}</div>
            <div className={styles.nodeId} title={selectedNode.id}>
              {selectedNode.id.slice(0, 8)}…
            </div>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.deleteBtn}
            onClick={() => deleteNode(selectedNode.id)}
            title="Delete node"
            aria-label="Delete node"
          >
            <Trash2 size={14} />
          </button>
          <button
            className={styles.closeBtn}
            onClick={() => selectNode(null)}
            title="Close panel"
            aria-label="Close panel"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className={styles.divider} />

      {/* Form */}
      <div className={styles.body}>
        {renderForm()}
      </div>
    </aside>
  );
}
