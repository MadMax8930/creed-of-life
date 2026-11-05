import { routing, type AppLocale } from '@/i18n/routing';

/** Canonical origin. Override with NEXT_PUBLIC_SITE_URL if the primary domain changes. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://creedoflife.com').replace(/\/+$/, '');

export const AUTHOR = {
  name: 'Max Surnin',
  url: 'https://maxsurnin.com',
} as const;

export const LINKTREE_URL = 'https://linktr.ee/maxsurnin';

export const CONTACT = {
  to: 'maximesurnin@gmail.com',
  cc: 'enjoyoway@gmail.com',
} as const;

/** Buy Me a Coffee stays driven by the existing Vercel env var; hidden if unset. */
export const COFFEE_URL = process.env.NEXT_PUBLIC_BUYMEACOFFEE_USERNAME
  ? `https://www.buymeacoffee.com/${process.env.NEXT_PUBLIC_BUYMEACOFFEE_USERNAME}`
  : null;

/** Native language names: what a reader looks for in a language switcher. */
export const LANGUAGE_NAMES: Record<AppLocale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  ru: 'Русский',
  th: 'ไทย',
};

/** Open Graph locale codes. */
export const OG_LOCALES: Record<AppLocale, string> = {
  en: 'en_US',
  es: 'es_ES',
  fr: 'fr_FR',
  ru: 'ru_RU',
  th: 'th_TH',
};

/** "/" + locale prefix, matching `localePrefix: 'as-needed'`. */
export function localePath(locale: AppLocale, path = '/'): string {
  const clean = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  if (locale === routing.defaultLocale) return clean || '/';
  return `/${locale}${clean}`;
}

export function absoluteUrl(locale: AppLocale, path = '/'): string {
  return `${SITE_URL}${localePath(locale, path)}`;
}

/** RFC 6068 mailto with a CC, subject and body. */
export function mailtoHref(subject: string, body: string): string {
  const enc = (value: string) => encodeURIComponent(value.replace(/\r?\n/g, '\r\n'));
  return `mailto:${CONTACT.to}?cc=${enc(CONTACT.cc)}&subject=${enc(subject)}&body=${enc(body)}`;
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
export function roman(position: number): string {
  return ROMAN[position] ?? String(position + 1);
}

export function twoDigits(n: number): string {
  return String(n).padStart(2, '0');
}
