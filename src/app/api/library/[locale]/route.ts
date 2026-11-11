import { NextResponse } from 'next/server';
import { isAppLocale, locales } from '@/i18n/routing';
import { getLibrary } from '@/lib/content/library';

// The localized library as JSON, for the search dialog and the Saved
// Reflections page. Same data and same source order as the pages
// (MongoDB, then the static snapshot). Read-only.
export const revalidate = 3600;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isAppLocale(locale)) {
    return NextResponse.json({ error: 'Unknown locale' }, { status: 404 });
  }
  return NextResponse.json(await getLibrary(locale));
}
