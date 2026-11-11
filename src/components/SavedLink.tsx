'use client';

import Link from 'next/link';
import { useSavedIds } from '@/lib/saved';

/** Header link to Saved Reflections, with the number saved on this device. */
export default function SavedLink({ href, label }: { href: string; label: string }) {
  const count = useSavedIds().length;
  return (
    <Link className="tool tool--saved" href={href} aria-label={count > 0 ? `${label} (${count})` : label}>
      <svg width="15" height="18" viewBox="0 0 16 20" aria-hidden="true">
        <path
          d="M2 1.5h12v16.2l-6-4.4-6 4.4z"
          fill={count > 0 ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
      <span className="tool__text">{label}</span>
      {count > 0 && (
        <span className="tool__count" aria-hidden="true">
          {count}
        </span>
      )}
    </Link>
  );
}
