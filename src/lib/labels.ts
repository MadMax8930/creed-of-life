import { getTranslations } from 'next-intl/server';
import type { AppLocale } from '@/i18n/routing';

/**
 * Pillar and principle names come from MongoDB as English keys and are
 * translated through `pillarsJSON` / `branchesJSON` (same as before). Unknown
 * names fall back to the raw MongoDB value instead of a missing-key string.
 */
export async function getNameTranslators(locale: AppLocale) {
  const pT = await getTranslations({ locale, namespace: 'pillarsJSON' });
  const bT = await getTranslations({ locale, namespace: 'branchesJSON' });
  return {
    pillarName: (name: string) => (pT.has(name) ? pT(name) : name),
    principleName: (name: string) => (bT.has(name) ? bT(name) : name),
  };
}
