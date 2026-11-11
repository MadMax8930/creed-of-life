import 'server-only';
import { MongoClient, ObjectId } from 'mongodb';
import pipeline from './pipeline.json';
import type { Translations } from './types';

/**
 * Shape returned by the aggregation (same pipeline as the original
 * `src/pages/index.tsx` and `src/pages/api/data.ts`). The static snapshot in
 * `content/creed-snapshot.json` stores exactly this shape, with ids as strings.
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
 * READ-ONLY. Uses the existing DATABASE_URL, the database name from its path,
 * the existing `pillars`, `branches` and `contents` collections, and the exact
 * aggregation pipeline the site already ran in production (`pipeline.json`,
 * shared with the snapshot export script), so ordering and shape stay identical.
 * Nothing in this project writes to MongoDB.
 */
export async function fetchPillarsFromMongo(databaseUrl: string): Promise<AggregatedPillar[]> {
  const client = await MongoClient.connect(databaseUrl);
  try {
    const dbName = new URL(databaseUrl).pathname.substring(1);
    const db = client.db(dbName);
    return await db.collection('pillars').aggregate<AggregatedPillar>(pipeline).toArray();
  } finally {
    await client.close();
  }
}
