import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { isAppLocale, routing } from '@/i18n/routing';
import { localePath } from '@/lib/site';

export default async function NotFound() {
  const current = await getLocale();
  const locale = isAppLocale(current) ? current : routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: 'siteJSON.notFound' });
  return (
    <section className="wrap section">
      <p className="note">404</p>
      <h1 className="article-title" style={{ marginBottom: '1.5rem' }}>
        {t('title')}
      </h1>
      <p style={{ maxWidth: '40ch', marginBottom: '2rem' }}>{t('text')}</p>
      <Link className="button" href={localePath(locale, '/')}>
        {t('cta')}
      </Link>
    </section>
  );
}
