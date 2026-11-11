import 'server-only';
import { getTranslations } from 'next-intl/server';
import type { AppLocale } from '@/i18n/routing';
import { getNameTranslators } from '@/lib/labels';
import { localePath, roman } from '@/lib/site';
import { getCreed } from './index';
import type { Library } from './library-types';
import { localizeReflection, readingMinutes } from './localize';

/** Builds the localized library from whichever source answered. */
export async function getLibrary(locale: AppLocale): Promise<Library> {
  const [creed, names, site] = await Promise.all([
    getCreed(),
    getNameTranslators(locale),
    getTranslations({ locale, namespace: 'siteJSON' }),
  ]);
  const total = creed.pillars.reduce((n, pillar) => n + pillar.principles.length, 0);
  const home = localePath(locale, '/');

  return {
    locale,
    source: creed.status,
    pillars: creed.pillars.map((pillar) => {
      const numeral = roman(pillar.position);
      return {
        slug: pillar.slug,
        name: names.pillarName(pillar.name),
        numeral,
        label: site('pillar.label', { numeral }),
        countLabel: site('pillar.principles', { count: pillar.principles.length }),
        href: `${home}#${pillar.slug}`,
        principles: pillar.principles.map((principle) => {
          const passages = principle.reflections.flatMap((reflection) => {
            const localized = localizeReflection(reflection, locale);
            return localized ? [{ id: reflection.id, ...localized }] : [];
          });
          const minutes = readingMinutes(
            passages.map((p) => `${p.title} ${p.text}`),
            locale,
          );
          return {
            slug: principle.slug,
            name: names.principleName(principle.name),
            number: principle.number + 1,
            href: localePath(locale, `/principles/${principle.slug}`),
            positionLabel: site('principle.number', { number: principle.number + 1, total }),
            countLabel: site('principle.reflections', { count: passages.length }),
            minutesLabel: site('principle.readingTime', { minutes }),
            passages,
          };
        }),
      };
    }),
  };
}
