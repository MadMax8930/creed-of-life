import type { Metadata } from 'next';
import { locales, type AppLocale } from '@/i18n/routing';
import { absoluteUrl, OG_LOCALES } from './site';

/**
 * Canonical + hreflang for a path that exists in every locale.
 * x-default points to the English (unprefixed) URL.
 */
export function localizedAlternates(locale: AppLocale, path = '/'): Metadata['alternates'] {
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = absoluteUrl(l, path);
  languages['x-default'] = absoluteUrl('en', path);
  return { canonical: absoluteUrl(locale, path), languages };
}

export function openGraphLocales(locale: AppLocale) {
  return {
    locale: OG_LOCALES[locale],
    alternateLocale: locales.filter((l) => l !== locale).map((l) => OG_LOCALES[l]),
  };
}

/** Serializes JSON-LD safely for a <script> tag. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
