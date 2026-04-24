'use client';

import { useWorkflowStore } from '@/store/workflowStore';
import type { EndNodeData } from '@/types/workflow';
import styles from './Forms.module.css';

interface Props { nodeId: string; data: EndNodeData; }

export default function EndForm({ nodeId, data }: Props) {
  const updateNode = useWorkflowStore((s) => s.updateNode);
  const upd = (partial: Partial<EndNodeData>) => updateNode(nodeId, { ...data, ...partial });

  return (
    <div className={styles.formSection}>
      <div className={styles.field}>
        <label className={styles.label}>Completion Message</label>
        <textarea
          id={`end-message-${nodeId}`}
          className={styles.textarea}
          value={data.endMessage}
          rows={3}
          onChange={(e) => upd({ endMessage: e.target.value })}
          placeholder="e.g. Onboarding process completed successfully."
        />
      </div>

      <div className={styles.field}>
        <div className={styles.toggleRow}>
          <div>
            <label className={styles.label} htmlFor={`end-summary-${nodeId}`}>
              Generate Summary Report
            </label>
            <p className={styles.hint}>Attach a PDF summary of all completed steps.</p>
          </div>
          <label className={styles.toggle} htmlFor={`end-summary-${nodeId}`}>
            <input
              id={`end-summary-${nodeId}`}
              type="checkbox"
              checked={data.showSummary}
              onChange={(e) => upd({ showSummary: e.target.checked })}
            />
            <span className={styles.toggleSlider} />
          </label>
        </div>
      </div>
    </div>
  );
}
