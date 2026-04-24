'use client';

/**
 * SimulationPanel — modal/drawer that runs the workflow through the mock
 * /simulate API and displays a step-by-step execution timeline.
 */

import { useEffect } from 'react';
import { useWorkflowStore } from '@/store/workflowStore';
import { useSimulation } from '@/hooks/useSimulation';
import {
  X, Play, AlertTriangle, CheckCircle, XCircle, Info,
  Clock, Loader2
} from 'lucide-react';
import type { SimulationStep } from '@/types/workflow';
import styles from './SimulationPanel.module.css';

interface Props {
  onClose: () => void;
}

const STATUS_CONFIG: Record<SimulationStep['status'], { icon: React.ReactNode; className: string }> = {
  success: { icon: <CheckCircle size={14} />,   className: styles.stepSuccess },
  warning: { icon: <AlertTriangle size={14} />,  className: styles.stepWarning },
  error:   { icon: <XCircle size={14} />,        className: styles.stepError },
  info:    { icon: <Info size={14} />,            className: styles.stepInfo },
};

const NODE_TYPE_COLORS: Record<string, string> = {
  start:     '#10b981',
  task:      '#3b82f6',
  approval:  '#f59e0b',
  automated: '#8b5cf6',
  end:       '#ef4444',
};

export default function SimulationPanel({ onClose }: Props) {
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const { status, result, run, reset } = useSimulation();

  useEffect(() => {
    run(nodes, edges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.panel} role="dialog" aria-modal="true" aria-label="Workflow simulation">
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <Play size={16} color="#6366f1" />
            </div>
            <div>
              <div className={styles.headerTitle}>Workflow Simulation</div>
              <div className={styles.headerSub}>
                {nodes.length} nodes · {edges.length} connections
              </div>
            </div>
          </div>
          <div className={styles.headerRight}>
            <button
              className={styles.rerunBtn}
              onClick={() => { reset(); setTimeout(() => run(nodes, edges), 100); }}
              disabled={status === 'running'}
            >
              <Play size={12} />
              Re-run
            </button>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close simulation">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={styles.body}>
          {/* Running state */}
          {status === 'running' && (
            <div className={styles.loadingState}>
              <Loader2 size={28} className={styles.spinner} color="#6366f1" />
              <div className={styles.loadingText}>Simulating workflow execution…</div>
              <div className={styles.loadingHint}>Validating structure and running each node</div>
            </div>
          )}

          {/* Error state */}
          {status === 'error' && (
            <div className={styles.errorState}>
              <XCircle size={28} color="#ef4444" />
              <div>Simulation failed. Please try again.</div>
            </div>
          )}

          {/* Done state */}
          {status === 'done' && result && (
            <>
              {/* Summary bar */}
              <div className={`${styles.summaryBar} ${result.success ? styles.summarySuccess : styles.summaryError}`}>
                <div className={styles.summaryLeft}>
                  {result.success
                    ? <><CheckCircle size={16} /> Simulation passed</>
                    : <><XCircle size={16} /> Simulation failed</>
                  }
                </div>
                <div className={styles.summaryStats}>
                  <span><Clock size={12} /> {result.totalDuration}ms</span>
                  <span>{result.steps.length} steps</span>
                  {result.warnings.length > 0 && (
                    <span className={styles.warnBadge}>
                      <AlertTriangle size={11} /> {result.warnings.length} warnings
                    </span>
                  )}
                </div>
              </div>

              {/* Errors */}
              {result.errors.length > 0 && (
                <div className={styles.errorList}>
                  <div className={styles.errorListTitle}>Errors</div>
                  {result.errors.map((e, i) => (
                    <div key={i} className={styles.errorItem}>
                      <XCircle size={13} />
                      {e}
                    </div>
                  ))}
                </div>
              )}

              {/* Warnings */}
              {result.warnings.length > 0 && (
                <div className={styles.warnList}>
                  <div className={styles.warnListTitle}>Warnings</div>
                  {result.warnings.map((w, i) => (
                    <div key={i} className={styles.warnItem}>
                      <AlertTriangle size={13} />
                      {w}
                    </div>
                  ))}
                </div>
              )}

              {/* Step timeline */}
              <div className={styles.timelineLabel}>Execution Log</div>
              <div className={styles.timeline}>
                {result.steps.map((step, idx) => {
                  const cfg = STATUS_CONFIG[step.status];
                  return (
                    <div key={step.nodeId + idx} className={`${styles.step} ${cfg.className}`}>
                      <div className={styles.stepLeft}>
                        <div
                          className={styles.stepDot}
                          style={{ background: NODE_TYPE_COLORS[step.nodeType] }}
                        />
                        {idx < result.steps.length - 1 && (
                          <div className={styles.stepLine} />
                        )}
                      </div>
                      <div className={styles.stepContent}>
                        <div className={styles.stepHeader}>
                          <span className={styles.stepTitle}>{step.nodeTitle}</span>
                          <span className={styles.stepType}>{step.nodeType}</span>
                          <span className={styles.stepDuration}>{step.duration}ms</span>
                        </div>
                        <div className={styles.stepMessage}>
                          {cfg.icon}
                          {step.message}
                        </div>
                        <div className={styles.stepTime}>
                          {new Date(step.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
