'use client';

import { useWorkflowStore } from '@/store/workflowStore';
import type { ApprovalNodeData } from '@/types/workflow';
import styles from './Forms.module.css';

const APPROVER_ROLES = ['Manager', 'HRBP', 'Director', 'VP', 'C-Suite', 'Legal'];

interface Props { nodeId: string; data: ApprovalNodeData; }

export default function ApprovalForm({ nodeId, data }: Props) {
  const updateNode = useWorkflowStore((s) => s.updateNode);
  const upd = (partial: Partial<ApprovalNodeData>) => updateNode(nodeId, { ...data, ...partial });

  return (
    <div className={styles.formSection}>
      <div className={styles.field}>
        <label className={styles.label}>Title <span className={styles.required}>*</span></label>
        <input
          id={`approval-title-${nodeId}`}
          className={styles.input}
          value={data.title}
          onChange={(e) => upd({ title: e.target.value })}
          placeholder="e.g. Manager Approval"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Approver Role</label>
        <select
          id={`approval-role-${nodeId}`}
          className={styles.select}
          value={data.approverRole}
          onChange={(e) => upd({ approverRole: e.target.value })}
        >
          {APPROVER_ROLES.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
          <option value="custom">Custom…</option>
        </select>
        {data.approverRole === 'custom' && (
          <input
            className={`${styles.input} ${styles.mt8}`}
            placeholder="Enter custom role"
            onChange={(e) => upd({ approverRole: e.target.value })}
          />
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Auto-Approve Threshold</label>
        <p className={styles.hint}>
          Automatically approve if score / days exceed this value. Set 0 to disable.
        </p>
        <input
          id={`approval-threshold-${nodeId}`}
          className={styles.input}
          type="number"
          min={0}
          value={data.autoApproveThreshold}
          onChange={(e) => upd({ autoApproveThreshold: Number(e.target.value) })}
        />
      </div>
    </div>
  );
}
