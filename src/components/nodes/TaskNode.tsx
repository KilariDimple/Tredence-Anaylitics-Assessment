'use client';

import { Handle, Position, NodeProps } from '@xyflow/react';
import { CheckSquare, Calendar, User } from 'lucide-react';
import type { TaskNodeData } from '@/types/workflow';
import styles from './Node.module.css';

export default function TaskNode({ data, selected }: NodeProps & { data: TaskNodeData }) {
  return (
    <div className={`${styles.node} ${styles.taskNode} ${selected ? styles.selected : ''}`}>
      <Handle type="target" position={Position.Top} className={styles.handle} />
      <div className={styles.nodeHeader}>
        <div className={styles.nodeIcon} style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
          <CheckSquare size={14} color="#fff" />
        </div>
        <div>
          <div className={styles.nodeLabel}>Task</div>
          <div className={styles.nodeTitle}>{data.title || 'Task'}</div>
        </div>
      </div>
      <div className={styles.nodeBody}>
        {data.description && (
          <div className={styles.nodeDescription}>{data.description}</div>
        )}
        <div className={styles.nodeStats}>
          {data.assignee && (
            <span className={styles.statItem}>
              <User size={11} />
              {data.assignee}
            </span>
          )}
          {data.dueDate && (
            <span className={styles.statItem}>
              <Calendar size={11} />
              {data.dueDate}
            </span>
          )}
        </div>
        {data.customFields && data.customFields.length > 0 && (
          <div className={styles.nodeMeta}>
            {data.customFields.slice(0, 3).map((f) => (
              <span key={f.id} className={styles.metaTag}>{f.key}</span>
            ))}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className={styles.handle} />
    </div>
  );
}
