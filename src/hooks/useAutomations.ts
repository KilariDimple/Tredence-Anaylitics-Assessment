'use client';

/**
 * useAutomations — fetches the mock automation actions once on mount.
 * Keeps API-layer knowledge out of components.
 */

import { useEffect, useState } from 'react';
import { getAutomations } from '@/lib/mockApi';
import type { AutomationAction } from '@/types/workflow';

export function useAutomations() {
  const [automations, setAutomations] = useState<AutomationAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAutomations()
      .then((data) => {
        if (!cancelled) setAutomations(data);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load automation actions');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { automations, loading, error };
}
