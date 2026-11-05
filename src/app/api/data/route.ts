import { NextResponse, type NextRequest } from 'next/server';
import { fetchPillarsFromMongo } from '@/lib/content/mongo';
import type { DbData, Pillar } from '@/types/mongo';

// Same contract as the previous `src/pages/api/data.ts`:
// GET /api/data?locale=xx -> { pillars } (all translations included), 500 on error.
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get('locale') ?? 'en';
  if (!locale) {
    return NextResponse.json({ error: 'Locale is required and must be a string' }, { status: 400 });
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('Error fetching data: DATABASE_URL is not set');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  try {
    const pillars = (await fetchPillarsFromMongo(databaseUrl)) as unknown as Pillar[];
    const body: DbData = { pillars };
    return NextResponse.json(body);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
