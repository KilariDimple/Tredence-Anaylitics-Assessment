'use client';

/**
 * WorkflowDesignerPage — root page component.
 * Assembles Sidebar + Canvas + NodePanel + SimulationPanel.
 */

import { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';

import Sidebar         from '@/components/Sidebar';
import WorkflowCanvas  from '@/components/WorkflowCanvas';
import NodePanel       from '@/components/NodePanel';
import Toolbar         from '@/components/Toolbar';
import SimulationPanel from '@/components/SimulationPanel';
import { useWorkflowStore } from '@/store/workflowStore';

import styles from './page.module.css';

export default function WorkflowDesignerPage() {
  const [showSimulation, setShowSimulation] = useState(false);
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);

  return (
    <ReactFlowProvider>
      <div className={styles.appShell}>
        {/* Top toolbar */}
        <Toolbar onSimulate={() => setShowSimulation(true)} />

        {/* Main area: sidebar + canvas + node panel */}
        <div className={styles.mainArea}>
          <Sidebar />
          <WorkflowCanvas />
          {selectedNodeId && <NodePanel />}
        </div>

        {/* Simulation modal */}
        {showSimulation && (
          <SimulationPanel onClose={() => setShowSimulation(false)} />
        )}
      </div>
    </ReactFlowProvider>
  );
}
