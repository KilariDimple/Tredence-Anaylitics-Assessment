'use client';

import { Handle, Position, NodeProps } from '@xyflow/react';
import { Flag } from 'lucide-react';
import type { EndNodeData } from '@/types/workflow';
import styles from './Node.module.css';

export default function EndNode({ data, selected }: NodeProps & { data: EndNodeData }) {
  return (
    <div className={`${styles.node} ${styles.endNode} ${selected ? styles.selected : ''}`}>
      <Handle type="target" position={Position.Top} className={styles.handle} />
      <div className={styles.nodeHeader}>
        <div className={styles.nodeIcon} style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
          <Flag size={14} color="#fff" />
        </div>
        <div>
          <div className={styles.nodeLabel}>End</div>
          <div className={styles.nodeTitle}>{data.endMessage || 'Workflow Complete'}</div>
        </div>
      </div>
      {data.showSummary && (
        <div className={styles.nodeBody}>
          <span className={`${styles.metaTag} ${styles.summaryTag}`}>Summary Enabled</span>
        </div>
      )}
    </div>
  );
}
