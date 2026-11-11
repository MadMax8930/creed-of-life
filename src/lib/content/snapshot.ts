import 'server-only';
import file from '../../../content/creed-snapshot.json';
import type { AggregatedPillar } from './mongo';

interface SnapshotFile {
  meta: { schemaVersion: number; generatedAt: string | null; source: string | null };
  pillars: AggregatedPillar[];
}

export interface Snapshot {
  pillars: AggregatedPillar[];
  generatedAt: string;
}

/**
 * The static fallback: a read-only export of the MongoDB records, written by
 * `npm run snapshot` (scripts/snapshot-content.mjs). Returns null while the
 * file is still the empty placeholder or if it is malformed, so the app never
 * renders anything that did not come from the database.
 */
export function readSnapshot(): Snapshot | null {
  const snapshot = file as unknown as SnapshotFile;
  const pillars = snapshot?.pillars;
  if (!Array.isArray(pillars) || pillars.length === 0) return null;
  if (typeof snapshot.meta?.generatedAt !== 'string') return null;
  const valid = pillars.every((p) => typeof p?.name === 'string' && Array.isArray(p.branches));
  if (!valid) return null;
  return { pillars, generatedAt: snapshot.meta.generatedAt };
}
