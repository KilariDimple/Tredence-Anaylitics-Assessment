'use client';

/**
 * Toolbar — top bar with workflow title, run simulation, and JSON export/import.
 */

import { useState, useRef } from 'react';
import { useWorkflowStore } from '@/store/workflowStore';
import {
  Play, Download, Upload, AlertTriangle, CheckCircle, ChevronDown
} from 'lucide-react';
import type { ValidationError } from '@/types/workflow';
import styles from './Toolbar.module.css';

interface Props {
  onSimulate: () => void;
}

function validateWorkflow(
  nodes: ReturnType<typeof useWorkflowStore.getState>['nodes'],
  edges: ReturnType<typeof useWorkflowStore.getState>['edges']
): ValidationError[] {
  // Empty canvas or still placing initial nodes — don't nag
  if (nodes.length === 0) return [];

  const errors: ValidationError[] = [];
  const startNodes = nodes.filter((n) => n.type === 'start');
  const endNodes = nodes.filter((n) => n.type === 'end');

  // Only flag missing start/end when the user has a meaningful number of nodes
  if (nodes.length >= 2 && startNodes.length === 0) {
    errors.push({ message: 'Add a Start node to begin the workflow.', severity: 'warning' });
  }
  if (nodes.length >= 2 && endNodes.length === 0) {
    errors.push({ message: 'Add an End node to complete the workflow.', severity: 'warning' });
  }

  // Task title is required
  nodes.forEach((n) => {
    if (n.type === 'task' && !(n.data as { title?: string }).title) {
      errors.push({ nodeId: n.id, message: 'Task node missing required title.', severity: 'warning' });
    }
  });

  // NOTE: Disconnected-node checks are intentionally left to the Simulation panel.
  // Showing them in the toolbar while the user is still building creates too much noise.

  return errors;
}

export default function Toolbar({ onSimulate }: Props) {
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const loadWorkflow = useWorkflowStore((s) => s.loadWorkflow);

  const [workflowName, setWorkflowName] = useState('New HR Workflow');
  const [editingName, setEditingName] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validationErrors = validateWorkflow(nodes, edges);
  const hasErrors = validationErrors.some((e) => e.severity === 'error');
  const hasWarnings = validationErrors.some((e) => e.severity === 'warning');

  // Export
  const handleExport = () => {
    const payload = JSON.stringify({ name: workflowName, nodes, edges }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName.replace(/\s+/g, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.nodes && data.edges) {
          loadWorkflow(data.nodes, data.edges);
          if (data.name) setWorkflowName(data.name);
        }
      } catch {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className={styles.toolbar}>
      {/* Left: workflow name */}
      <div className={styles.left}>
        <div className={styles.nameWrapper}>
          {editingName ? (
            <input
              className={styles.nameInput}
              value={workflowName}
              autoFocus
              onChange={(e) => setWorkflowName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
            />
          ) : (
            <button
              className={styles.nameBtn}
              onClick={() => setEditingName(true)}
              title="Click to rename workflow"
            >
              {workflowName}
              <ChevronDown size={13} />
            </button>
          )}
          <div className={styles.nameSub}>
            {nodes.length} nodes · {edges.length} edges
          </div>
        </div>
      </div>

      {/* Center: validation status */}
      <div className={styles.center}>
        {validationErrors.length === 0 && nodes.length > 0 ? (
          <div className={styles.statusOk}>
            <CheckCircle size={13} />
            Workflow valid
          </div>
        ) : hasErrors ? (
          <button
            className={styles.statusError}
            onClick={() => setShowValidation(!showValidation)}
          >
            <AlertTriangle size={13} />
            {validationErrors.filter((e) => e.severity === 'error').length} errors
          </button>
        ) : hasWarnings ? (
          <button
            className={styles.statusWarn}
            onClick={() => setShowValidation(!showValidation)}
          >
            <AlertTriangle size={13} />
            {validationErrors.filter((e) => e.severity === 'warning').length} warnings
          </button>
        ) : null}

        {/* Validation dropdown */}
        {showValidation && validationErrors.length > 0 && (
          <div className={styles.validationDropdown}>
            {validationErrors.map((err, i) => (
              <div
                key={i}
                className={err.severity === 'error' ? styles.validationError : styles.validationWarning}
              >
                <AlertTriangle size={12} />
                {err.message}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: actions */}
      <div className={styles.right}>
        {/* Import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleImport}
          id="import-workflow-input"
        />
        <button
          className={styles.actionBtn}
          onClick={() => fileInputRef.current?.click()}
          title="Import workflow JSON"
        >
          <Upload size={14} />
          Import
        </button>

        {/* Export */}
        <button
          className={styles.actionBtn}
          onClick={handleExport}
          disabled={nodes.length === 0}
          title="Export workflow as JSON"
        >
          <Download size={14} />
          Export
        </button>

        {/* Simulate */}
        <button
          className={styles.simulateBtn}
          onClick={onSimulate}
          disabled={nodes.length === 0}
          id="run-simulation-btn"
          title="Run workflow simulation"
        >
          <Play size={14} fill="currentColor" />
          Run Simulation
        </button>
      </div>
    </header>
  );
}
