'use client';

/**
 * StartNode — entry point of the workflow.
 * Shows a play icon with the Start title.
 */

import { Handle, Position, NodeProps } from '@xyflow/react';
import { Play } from 'lucide-react';
import type { StartNodeData } from '@/types/workflow';
import styles from './Node.module.css';

export default function StartNode({ data, selected }: NodeProps & { data: StartNodeData }) {
  return (
    <div className={`${styles.node} ${styles.startNode} ${selected ? styles.selected : ''}`}>
      <div className={styles.nodeHeader}>
        <div className={styles.nodeIcon} style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
          <Play size={14} color="#fff" fill="#fff" />
        </div>
        <div>
          <div className={styles.nodeLabel}>Start</div>
          <div className={styles.nodeTitle}>{data.title || 'Start'}</div>
        </div>
      </div>
      {data.metadata && data.metadata.length > 0 && (
        <div className={styles.nodeMeta}>
          {data.metadata.slice(0, 2).map((m) => (
            <span key={m.id} className={styles.metaTag}>
              {m.key}
            </span>
          ))}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className={styles.handle} />
    </div>
  );
}
