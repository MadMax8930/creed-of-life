import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/routing';
import { getAllPrinciples } from '@/lib/content';
import { absoluteUrl } from '@/lib/site';

export const revalidate = 3600;

function entry(path: string, priority: number, lastModified?: string): MetadataRoute.Sitemap {
  const languages = Object.fromEntries([
    ...locales.map((l) => [l, absoluteUrl(l, path)]),
    ['x-default', absoluteUrl('en', path)],
  ]);
  return locales.map((locale) => ({
    url: absoluteUrl(locale, path),
    ...(lastModified ? { lastModified } : {}),
    changeFrequency: 'monthly' as const,
    priority,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const principles = await getAllPrinciples().catch(() => []);
  return [
    ...entry('/', 1),
    ...principles.flatMap((p) => {
      const newest = p.reflections.map((r) => r.createdAt).filter(Boolean).sort().at(-1) ?? undefined;
      return entry(`/principles/${p.slug}`, 0.8, newest);
    }),
  ];
}
