import 'server-only';
import { cache } from 'react';
import { fetchPillarsFromMongo, idToDate, idToString, type AggregatedPillar } from './mongo';
import { pillarSlug, principleSlug } from './slugs';
import type { Creed, Pillar, Principle } from './types';

export type { Creed, Pillar, Principle, Reflection, LocalizedText } from './types';

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

let buildResult: Promise<Creed> | null = null;

async function loadCreed(): Promise<Creed> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('[creed] DATABASE_URL is not set: rendering without MongoDB content.');
    return { pillars: [], status: 'unavailable' };
  }
  try {
    return toCreed(await fetchPillarsFromMongo(databaseUrl), 'ok');
  } catch (error) {
    const err = error as Error;
    console.error('[creed] Error fetching data from MongoDB:', { message: err.message, name: err.name });
    if (isBuildPhase()) {
      // Same as the previous site: the build still succeeds and pages render
      // their shell. Hourly revalidation fills the content in once MongoDB is
      // reachable again.
      return { pillars: [], status: 'unavailable' };
    }
    // At runtime (revalidation), rethrow so Next keeps serving the last good
    // page instead of replacing it with an empty one.
    throw error;
  }
}

/**
 * One MongoDB round-trip per build worker (many pages share it), and one per
 * request at runtime. React `cache` dedupes calls within a single render.
 */
export const getCreed = cache(async (): Promise<Creed> => {
  if (isBuildPhase()) {
    buildResult ??= loadCreed();
    return buildResult;
  }
  return loadCreed();
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
