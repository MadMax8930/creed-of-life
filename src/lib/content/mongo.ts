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

/*
 * One MongoDB client per server process, reused by every read.
 *
 * Why: opening a connection to Atlas (DNS lookup, TLS, authentication) costs
 * far more than the query itself, and the site used to pay it on every render
 * and every /api/data call. The driver's client is a connection pool meant to
 * be shared; it is kept on `globalThis` so it also survives hot reloads in
 * `next dev`. During `next build` the connection is closed after use, as
 * before, so build workers never hold a socket open.
 */
interface Connection {
  url: string;
  /** Settles once `client` is set (or rejects if the connection failed). */
  ready: Promise<void>;
  client?: MongoClient;
}
const store = globalThis as typeof globalThis & { __creedMongo?: Connection };
const keepAlive = process.env.NEXT_PHASE !== 'phase-production-build';

function open(databaseUrl: string): Connection {
  const connection: Connection = { url: databaseUrl, ready: Promise.resolve() };
  connection.ready = MongoClient.connect(databaseUrl).then((client) => {
    connection.client = client;
  });
  return connection;
}

function forget(connection: Connection) {
  if (store.__creedMongo === connection) delete store.__creedMongo;
}

function getConnection(databaseUrl: string): Connection {
  if (!keepAlive) return open(databaseUrl);
  const current = store.__creedMongo;
  if (current && current.url === databaseUrl) return current;
  const connection = open(databaseUrl);
  store.__creedMongo = connection;
  // A failed connection is never kept: the next read starts a fresh one.
  connection.ready.catch(() => forget(connection));
  return connection;
}

/**
 * READ-ONLY. Uses the existing DATABASE_URL, the database name from its path,
 * the existing `pillars`, `branches` and `contents` collections, and the exact
 * aggregation pipeline the site already ran in production (`pipeline.json`,
 * shared with the snapshot export script), so ordering and shape stay identical.
 * Nothing in this project writes to MongoDB.
 */
export async function fetchPillarsFromMongo(databaseUrl: string): Promise<AggregatedPillar[]> {
  const connection = getConnection(databaseUrl);
  await connection.ready;
  const client = connection.client!;
  try {
    const dbName = new URL(databaseUrl).pathname.substring(1);
    const db = client.db(dbName);
    return await db.collection('pillars').aggregate<AggregatedPillar>(pipeline).toArray();
  } catch (error) {
    // Do not keep a client whose read just failed; reconnect on the next read.
    if (keepAlive) {
      forget(connection);
      client.close().catch(() => {});
    }
    throw error;
  } finally {
    if (!keepAlive) await client.close();
  }
}
