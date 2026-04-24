'use client';

import { useWorkflowStore } from '@/store/workflowStore';
import type { StartNodeData } from '@/types/workflow';
import KeyValueEditor from './KeyValueEditor';
import styles from './Forms.module.css';

interface Props { nodeId: string; data: StartNodeData; }

export default function StartForm({ nodeId, data }: Props) {
  const updateNode = useWorkflowStore((s) => s.updateNode);
  const upd = (partial: Partial<StartNodeData>) => updateNode(nodeId, { ...data, ...partial });

  return (
    <div className={styles.formSection}>
      <div className={styles.field}>
        <label className={styles.label}>Start Title <span className={styles.required}>*</span></label>
        <input
          id={`start-title-${nodeId}`}
          className={styles.input}
          value={data.title}
          onChange={(e) => upd({ title: e.target.value })}
          placeholder="e.g. Onboarding Start"
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Metadata</label>
        <p className={styles.hint}>Optional key-value pairs attached to the workflow trigger.</p>
        <KeyValueEditor
          pairs={data.metadata}
          onChange={(metadata) => upd({ metadata })}
          keyPlaceholder="e.g. department"
          valuePlaceholder="e.g. Engineering"
        />
      </div>
    </div>
  );
}
