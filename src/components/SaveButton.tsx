'use client';

import { toggleSaved, useSavedIds } from '@/lib/saved';

/** Bookmark toggle for one passage. The pressed state carries the meaning. */
export default function SaveButton({ id, label }: { id: string; label: string }) {
  const saved = useSavedIds().includes(id);
  return (
    <button
      type="button"
      className="save"
      aria-pressed={saved}
      aria-label={label}
      title={label}
      onClick={() => toggleSaved(id)}
    >
      <svg width="16" height="20" viewBox="0 0 16 20" aria-hidden="true">
        <path
          d="M2 1.5h12v16.2l-6-4.4-6 4.4z"
          fill={saved ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
