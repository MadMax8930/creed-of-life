import 'server-only';
import { cache } from 'react';
import { fetchPillarsFromMongo, idToDate, idToString, type AggregatedPillar } from './mongo';
import { pillarSlug, principleSlug } from './slugs';
import { readSnapshot } from './snapshot';
import type { Creed, Pillar, Principle } from './types';

export type { ContentSource, Creed, Pillar, Principle, Reflection, LocalizedText } from './types';

/**
 * Normalizes the aggregation result into the view model. Order is kept exactly
 * as MongoDB returns it (same as the previous site). Branches without a name
 * (produced by $unwind on a pillar with no branches) are skipped.
 */
export function toCreed(aggregated: AggregatedPillar[], status: Creed['status']): Creed {
  let number = 0;
  const pillars: Pillar[] = aggregated.map((raw, position) => {
    const slug = pillarSlug(raw.name);
    const principles: Principle[] = (raw.branches ?? [])
      .filter((branch) => typeof branch?.name === 'string' && branch.name.length > 0)
      .map((branch, index) => ({
        id: idToString(branch._id),
        name: branch.name!,
        slug: principleSlug(branch.name!),
        position: index,
        number: number++,
        pillarSlug: slug,
        pillarName: raw.name,
        reflections: (branch.contentItems ?? []).map((content) => ({
          id: idToString(content._id),
          translations: content.translations ?? {},
          createdAt: idToDate(content._id),
        })),
      }));
    return { id: idToString(raw._id), name: raw.name, slug, position, principles };
  });
  return { pillars, status };
}

const isBuildPhase = () => process.env.NEXT_PHASE === 'phase-production-build';

function hasContent(creed: Creed): boolean {
  return creed.pillars.some((pillar) => pillar.principles.length > 0);
}

/**
 * Content source order:
 *   1. MongoDB (the single source of truth), read-only.
 *   2. The static snapshot exported from MongoDB (`content/creed-snapshot.json`)
 *      when MongoDB is unreachable, errors, or returns nothing.
 *   3. Neither: pages render an informative state. Nothing is ever invented.
 * This never throws, so builds and revalidations always succeed.
 */
async function loadCreed(): Promise<Creed> {
  const databaseUrl = process.env.DATABASE_URL;
  let reason: string;

  if (!databaseUrl) {
    reason = 'DATABASE_URL is not set';
  } else {
    try {
      const creed = toCreed(await fetchPillarsFromMongo(databaseUrl), 'mongodb');
      if (hasContent(creed)) return creed;
      reason = 'MongoDB answered but returned no pillars or principles';
    } catch (error) {
      const err = error as Error;
      reason = `MongoDB request failed (${err.name}: ${err.message})`;
    }
  }

  const snapshot = readSnapshot();
  if (snapshot) {
    const creed = toCreed(snapshot.pillars, 'snapshot');
    if (hasContent(creed)) {
      console.warn(
        `[creed] FALLBACK ACTIVE: ${reason}. Serving the static snapshot exported on ${snapshot.generatedAt}.`,
      );
      return creed;
    }
  }

  console.error(
    `[creed] CONTENT UNAVAILABLE: ${reason}, and no static snapshot has been generated yet ` +
      '(run "npm run snapshot"). Pages render without the reflections.',
  );
  return { pillars: [], status: 'unavailable' };
}

let buildResult: Promise<Creed> | null = null;

/*
 * At runtime the result is kept in memory for one minute. Regenerating the
 * pages after the hourly revalidation renders about fifty routes (home and
 * principle pages in five languages, plus the search data); they now share one
 * MongoDB read instead of making one each, and `next dev`, which renders every
 * request from scratch, stops querying the database on every click.
 * One minute is small next to the one hour revalidation, so content edited in
 * MongoDB still appears on the same schedule. A fallback result is kept for the
 * same minute, then MongoDB is tried again.
 */
const FRESH_MS = 60_000;
let recent: { at: number; creed: Promise<Creed> } | null = null;

/**
 * One MongoDB round-trip per build worker (many pages share it), and at most
 * one per minute per server process at runtime. React `cache` dedupes calls
 * within a single render.
 */
export const getCreed = cache(async (): Promise<Creed> => {
  if (isBuildPhase()) {
    buildResult ??= loadCreed();
    return buildResult;
  }
  const now = Date.now();
  if (!recent || now - recent.at > FRESH_MS) recent = { at: now, creed: loadCreed() };
  return recent.creed;
});

export async function getAllPrinciples(): Promise<Principle[]> {
  const creed = await getCreed();
  return creed.pillars.flatMap((p) => p.principles);
}

export async function getPrinciple(slug: string) {
  const creed = await getCreed();
  const all = creed.pillars.flatMap((p) => p.principles);
  const index = all.findIndex((p) => p.slug === slug);
  if (index === -1) return null;
  const principle = all[index]!;
  const pillar = creed.pillars.find((p) => p.slug === principle.pillarSlug)!;
  return {
    principle,
    pillar,
    total: all.length,
    previous: index > 0 ? all[index - 1]! : null,
    next: index < all.length - 1 ? all[index + 1]! : null,
  };
}
