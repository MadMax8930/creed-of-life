import { defineRouting } from 'next-intl/routing';

export const locales = ['en', 'es', 'fr', 'ru', 'th'] as const;
export type AppLocale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  // Same URL shape as the previous Pages Router i18n setup:
  // English lives at "/", other languages at "/es", "/fr", "/ru", "/th".
  localePrefix: 'as-needed',
  // Matches the old Next.js i18n default: first visit to "/" may be
  // redirected to the visitor's browser language. Explicit URLs are never
  // redirected, so crawlers always get a stable page per locale.
  localeDetection: true,
  // hreflang is emitted in <head> by the metadata helpers instead of HTTP
  // Link headers, so there is exactly one source of truth.
  alternateLinks: false,
});

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}
