import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import SavedReflections from '@/components/SavedReflections';
import { isAppLocale, type AppLocale } from '@/i18n/routing';
import { localePath } from '@/lib/site';

export async function generateMetadata({ params }: PageProps<'/[locale]/saved'>): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: 'siteJSON.saved' });
  return {
    title: t('title'),
    description: t('intro'),
    // Personal to each browser: nothing here for a search engine.
    robots: { index: false, follow: true },
  };
}

export default async function SavedPage({ params }: PageProps<'/[locale]/saved'>) {
  const { locale: raw } = await params;
  const locale = raw as AppLocale;
  setRequestLocale(locale);
  const [t, site] = await Promise.all([
    getTranslations({ locale, namespace: 'siteJSON.saved' }),
    getTranslations({ locale, namespace: 'siteJSON' }),
  ]);

  return (
    <section className="wrap section saved-page" aria-labelledby="saved-title">
      <header className="saved-page__head">
        <h1 id="saved-title" className="section-title">
          {t('title')}
        </h1>
        <p className="note">{t('intro')}</p>
      </header>
      <SavedReflections
        locale={locale}
        homeHref={localePath(locale, '/')}
        labels={{
          loading: t('loading'),
          empty: t('empty'),
          browse: t('browse'),
          error: t('error'),
          retry: site('search.retry'),
          unavailable: site('explorer.unavailableText'),
          missing: t.raw('missing') as string,
          clearMissing: t('clearMissing'),
          remove: t('remove'),
          readInContext: t('readInContext'),
          save: t('save'),
          fallbackNotice: site('principle.fallbackNotice'),
        }}
      />
    </section>
  );
}
