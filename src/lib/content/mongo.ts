import 'server-only';
import { MongoClient, ObjectId } from 'mongodb';
import type { Translations } from './types';

/**
 * Shape returned by the aggregation below (same pipeline as the previous
 * `src/pages/index.tsx` and `src/pages/api/data.ts`).
 */
export interface AggregatedPillar {
  _id: unknown;
  name: string;
  order?: number;
  branches: Array<{
    _id?: unknown;
    name?: string;
    order?: number;
    pillar?: unknown;
    contentItems?: Array<{ _id: unknown; branch?: unknown; translations?: Translations }>;
  }>;
}

export function idToString(id: unknown): string {
  if (id instanceof ObjectId) return id.toHexString();
  return String(id);
}

/** ObjectIds embed their creation time (also when stored as 24-hex strings). */
export function idToDate(id: unknown): string | null {
  try {
    if (id instanceof ObjectId) return id.getTimestamp().toISOString();
    if (typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id)) {
      return new ObjectId(id).getTimestamp().toISOString();
    }
  } catch {
    // Not an ObjectId: no reliable date.
  }
  return null;
}

/**
 * Read-only. Uses the existing DATABASE_URL, the database name from its path,
 * the existing `pillars`, `branches` and `contents` collections, and the exact
 * aggregation pipeline the site already ran in production, so ordering and
 * shape stay identical.
 */
export async function fetchPillarsFromMongo(databaseUrl: string): Promise<AggregatedPillar[]> {
  const client = await MongoClient.connect(databaseUrl);
  try {
    const dbName = new URL(databaseUrl).pathname.substring(1);
    const db = client.db(dbName);

    return await db
      .collection('pillars')
      .aggregate<AggregatedPillar>([
        {
          $lookup: {
            from: 'branches',
            localField: 'branches',
            foreignField: '_id',
            as: 'branches',
          },
        },
        {
          $unwind: {
            path: '$branches',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'contents',
            localField: 'branches.contentItems',
            foreignField: '_id',
            as: 'branches.contentItems',
          },
        },
        {
          $group: {
            _id: '$_id',
            name: { $first: '$name' },
            order: { $first: '$order' },
            branches: { $push: '$branches' },
          },
        },
        { $sort: { order: 1 } },
      ])
      .toArray();
  } finally {
    await client.close();
  }
}
