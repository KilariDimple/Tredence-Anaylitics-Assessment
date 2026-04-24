'use client';

/**
 * KeyValueEditor — reusable dynamic key-value pair editor
 * used in Start Node metadata and Task Node custom fields.
 */

import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { KeyValuePair } from '@/types/workflow';
import styles from './Forms.module.css';

interface Props {
  pairs: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}

export default function KeyValueEditor({
  pairs,
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
}: Props) {
  const add = () =>
    onChange([...pairs, { id: uuidv4(), key: '', value: '' }]);

  const remove = (id: string) =>
    onChange(pairs.filter((p) => p.id !== id));

  const update = (id: string, field: 'key' | 'value', val: string) =>
    onChange(pairs.map((p) => (p.id === id ? { ...p, [field]: val } : p)));

  return (
    <div className={styles.kvEditor}>
      {pairs.length > 0 && (
        <div className={styles.kvList}>
          {pairs.map((pair) => (
            <div key={pair.id} className={styles.kvRow}>
              <input
                className={styles.kvInput}
                value={pair.key}
                placeholder={keyPlaceholder}
                onChange={(e) => update(pair.id, 'key', e.target.value)}
              />
              <input
                className={styles.kvInput}
                value={pair.value}
                placeholder={valuePlaceholder}
                onChange={(e) => update(pair.id, 'value', e.target.value)}
              />
              <button
                type="button"
                className={styles.kvDelete}
                onClick={() => remove(pair.id)}
                aria-label="Remove"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
      <button type="button" className={styles.addBtn} onClick={add}>
        <Plus size={13} />
        Add pair
      </button>
    </div>
  );
}
