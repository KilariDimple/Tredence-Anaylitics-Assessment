'use client';

import { Handle, Position, NodeProps } from '@xyflow/react';
import { ShieldCheck, Users } from 'lucide-react';
import type { ApprovalNodeData } from '@/types/workflow';
import styles from './Node.module.css';

export default function ApprovalNode({ data, selected }: NodeProps & { data: ApprovalNodeData }) {
  return (
    <div className={`${styles.node} ${styles.approvalNode} ${selected ? styles.selected : ''}`}>
      <Handle type="target" position={Position.Top} className={styles.handle} />
      <div className={styles.nodeHeader}>
        <div className={styles.nodeIcon} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
          <ShieldCheck size={14} color="#fff" />
        </div>
        <div>
          <div className={styles.nodeLabel}>Approval</div>
          <div className={styles.nodeTitle}>{data.title || 'Approval'}</div>
        </div>
      </div>
      <div className={styles.nodeBody}>
        <div className={styles.nodeStats}>
          {data.approverRole && (
            <span className={styles.statItem}>
              <Users size={11} />
              {data.approverRole}
            </span>
          )}
          {data.autoApproveThreshold > 0 && (
            <span className={`${styles.statItem} ${styles.badge}`}>
              Auto ≥ {data.autoApproveThreshold}
            </span>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className={styles.handle} />
    </div>
  );
}
