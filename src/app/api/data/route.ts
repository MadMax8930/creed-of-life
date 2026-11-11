import { NextResponse, type NextRequest } from 'next/server';
import { fetchPillarsFromMongo } from '@/lib/content/mongo';
import { readSnapshot } from '@/lib/content/snapshot';
import type { DbData, Pillar } from '@/types/mongo';

// Same contract as the original `src/pages/api/data.ts`:
// GET /api/data?locale=xx -> { pillars } with every translation. Read-only.
// MongoDB answers when it can; if it cannot, the static snapshot (the same
// shape, exported from this very endpoint) is served instead of an error.
export const dynamic = 'force-dynamic';

function respond(pillars: Pillar[], source: 'mongodb' | 'snapshot') {
  const body: DbData = { pillars };
  return NextResponse.json(body, { headers: { 'X-Content-Source': source } });
}

function fallback(reason: string) {
  const snapshot = readSnapshot();
  if (!snapshot) {
    console.error(`[creed] /api/data: ${reason}, and no static snapshot is available.`);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
  console.warn(
    `[creed] FALLBACK ACTIVE on /api/data: ${reason}. Serving the static snapshot exported on ${snapshot.generatedAt}.`,
  );
  return respond(snapshot.pillars as unknown as Pillar[], 'snapshot');
}

export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get('locale') ?? 'en';
  if (!locale) {
    return NextResponse.json({ error: 'Locale is required and must be a string' }, { status: 400 });
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return fallback('DATABASE_URL is not set');

  try {
    const pillars = (await fetchPillarsFromMongo(databaseUrl)) as unknown as Pillar[];
    if (pillars.length === 0) return fallback('MongoDB answered but returned no pillars');
    return respond(pillars, 'mongodb');
  } catch (error) {
    const err = error as Error;
    return fallback(`MongoDB request failed (${err.name}: ${err.message})`);
  }
}
