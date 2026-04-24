'use client';

import { Handle, Position, NodeProps } from '@xyflow/react';
import { Zap } from 'lucide-react';
import type { AutomatedNodeData } from '@/types/workflow';
import styles from './Node.module.css';

export default function AutomatedNode({ data, selected }: NodeProps & { data: AutomatedNodeData }) {
  return (
    <div className={`${styles.node} ${styles.automatedNode} ${selected ? styles.selected : ''}`}>
      <Handle type="target" position={Position.Top} className={styles.handle} />
      <div className={styles.nodeHeader}>
        <div className={styles.nodeIcon} style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
          <Zap size={14} color="#fff" />
        </div>
        <div>
          <div className={styles.nodeLabel}>Automated</div>
          <div className={styles.nodeTitle}>{data.title || 'Auto Step'}</div>
        </div>
      </div>
      {data.actionId && (
        <div className={styles.nodeBody}>
          <span className={`${styles.metaTag} ${styles.actionTag}`}>{data.actionId}</span>
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className={styles.handle} />
    </div>
  );
}
