import { flattenLibrary, type Library, type PassageRef } from './library-types';

const DAY_MS = 86_400_000;

/** Days since 1970-01-01 in UTC: the same number for every visitor. */
export function utcDay(now: number = Date.now()): number {
  return Math.floor(now / DAY_MS);
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * One existing passage per day, the same for everyone, never random.
 * Walks the passages with a stride that is coprime to their count, so every
 * passage comes up exactly once per cycle and consecutive days move between
 * pillars (with 27 passages: stride 10, a 27-day cycle).
 */
export function pickDaily(library: Library, day: number): PassageRef | null {
  const all = flattenLibrary(library).filter((ref) => ref.passage.text);
  const count = all.length;
  if (count === 0) return null;
  let stride = Math.max(1, Math.round(count * 0.382));
  while (gcd(stride, count) !== 1) stride++;
  return all[(((day % count) + count) % count * stride) % count] ?? null;
}
