'use client';

import { useWorkflowStore } from '@/store/workflowStore';
import type { TaskNodeData } from '@/types/workflow';
import KeyValueEditor from './KeyValueEditor';
import styles from './Forms.module.css';

interface Props { nodeId: string; data: TaskNodeData; }

export default function TaskForm({ nodeId, data }: Props) {
  const updateNode = useWorkflowStore((s) => s.updateNode);
  const upd = (partial: Partial<TaskNodeData>) => updateNode(nodeId, { ...data, ...partial });

  return (
    <div className={styles.formSection}>
      <div className={styles.field}>
        <label className={styles.label}>Title <span className={styles.required}>*</span></label>
        <input
          id={`task-title-${nodeId}`}
          className={styles.input}
          value={data.title}
          onChange={(e) => upd({ title: e.target.value })}
          placeholder="e.g. Collect Documents"
        />
        {!data.title && <span className={styles.error}>Title is required</span>}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Description</label>
        <textarea
          id={`task-desc-${nodeId}`}
          className={styles.textarea}
          value={data.description}
          rows={3}
          onChange={(e) => upd({ description: e.target.value })}
          placeholder="Describe what needs to be done..."
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Assignee</label>
          <input
            id={`task-assignee-${nodeId}`}
            className={styles.input}
            value={data.assignee}
            onChange={(e) => upd({ assignee: e.target.value })}
            placeholder="e.g. John Doe"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Due Date</label>
          <input
            id={`task-due-${nodeId}`}
            className={styles.input}
            type="date"
            value={data.dueDate}
            onChange={(e) => upd({ dueDate: e.target.value })}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Custom Fields</label>
        <KeyValueEditor
          pairs={data.customFields}
          onChange={(customFields) => upd({ customFields })}
          keyPlaceholder="Field name"
          valuePlaceholder="Default value"
        />
      </div>
    </div>
  );
}
