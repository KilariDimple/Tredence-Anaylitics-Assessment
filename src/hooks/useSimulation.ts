'use client';

/**
 * useSimulation — manages the simulation lifecycle.
 * Decouples simulation state from the UI components.
 */

import { useState } from 'react';
import { simulateWorkflow } from '@/lib/mockApi';
import type { SimulationResult, WorkflowEdge, WorkflowNode } from '@/types/workflow';

export type SimulationStatus = 'idle' | 'running' | 'done' | 'error';

export function useSimulation() {
  const [status, setStatus] = useState<SimulationStatus>('idle');
  const [result, setResult] = useState<SimulationResult | null>(null);

  const run = async (nodes: WorkflowNode[], edges: WorkflowEdge[]) => {
    setStatus('running');
    setResult(null);
    try {
      const res = await simulateWorkflow(nodes, edges);
      setResult(res);
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  const reset = () => {
    setStatus('idle');
    setResult(null);
  };

  return { status, result, run, reset };
}
