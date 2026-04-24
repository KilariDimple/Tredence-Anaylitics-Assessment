'use client';

import { useWorkflowStore } from '@/store/workflowStore';
import { useAutomations } from '@/hooks/useAutomations';
import type { AutomatedNodeData } from '@/types/workflow';
import styles from './Forms.module.css';

interface Props { nodeId: string; data: AutomatedNodeData; }

export default function AutomatedForm({ nodeId, data }: Props) {
  const updateNode = useWorkflowStore((s) => s.updateNode);
  const { automations, loading } = useAutomations();

  const upd = (partial: Partial<AutomatedNodeData>) =>
    updateNode(nodeId, { ...data, ...partial });

  const selectedAction = automations.find((a) => a.id === data.actionId);

  const handleActionChange = (actionId: string) => {
    const action = automations.find((a) => a.id === actionId);
    const actionParams: Record<string, string> = {};
    action?.params.forEach((p) => { actionParams[p] = data.actionParams[p] ?? ''; });
    upd({ actionId, actionParams });
  };

  const handleParamChange = (param: string, value: string) =>
    upd({ actionParams: { ...data.actionParams, [param]: value } });

  return (
    <div className={styles.formSection}>
      <div className={styles.field}>
        <label className={styles.label}>Title <span className={styles.required}>*</span></label>
        <input
          id={`auto-title-${nodeId}`}
          className={styles.input}
          value={data.title}
          onChange={(e) => upd({ title: e.target.value })}
          placeholder="e.g. Send Welcome Email"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Automation Action</label>
        {loading ? (
          <div className={styles.loadingPill}>Loading actions…</div>
        ) : (
          <select
            id={`auto-action-${nodeId}`}
            className={styles.select}
            value={data.actionId}
            onChange={(e) => handleActionChange(e.target.value)}
          >
            <option value="">— Select an action —</option>
            {automations.map((a) => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
        )}
      </div>

      {selectedAction && selectedAction.params.length > 0 && (
        <div className={styles.paramBlock}>
          <div className={styles.paramBlockLabel}>Action Parameters</div>
          {selectedAction.params.map((param) => (
            <div key={param} className={styles.field}>
              <label className={styles.label}>{param}</label>
              <input
                id={`auto-param-${nodeId}-${param}`}
                className={styles.input}
                value={data.actionParams[param] ?? ''}
                onChange={(e) => handleParamChange(param, e.target.value)}
                placeholder={`Enter ${param}`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
