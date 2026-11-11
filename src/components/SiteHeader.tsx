import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { locales, type AppLocale } from '@/i18n/routing';
import { localePath } from '@/lib/site';
import LanguagePicker from './LanguagePicker';
import MobileMenu from './MobileMenu';
import SavedLink from './SavedLink';
import SearchDialog from './SearchDialog';

export default async function SiteHeader({ locale }: { locale: AppLocale }) {
  const t = await getTranslations({ locale, namespace: 'siteJSON' });
  const languages = await getTranslations({ locale, namespace: 'languagesJSON' });
  const home = localePath(locale, '/');
  // "/#creed" for English, "/fr#creed" for French (no trailing-slash redirect).
  const anchor = (id: string) => `${home}#${id}`;

  const links = [
    { href: anchor('creed'), label: t('nav.creed') },
    { href: anchor('manifesto'), label: t('nav.manifesto') },
    { href: '#contact', label: t('nav.contact') },
  ];
  const savedHref = localePath(locale, '/saved');

  const names = { en: 'English', es: 'Spanish', fr: 'French', ru: 'Russian', th: 'Thai' } as const;
  const spokenNames = Object.fromEntries(locales.map((l) => [l, languages(names[l])])) as Record<AppLocale, string>;

  return (
    <header className="site-header">
      <div className="wrap site-header__row">
        <Link href={home} className="wordmark">
          {t('brand')}
        </Link>
        <nav className="nav" aria-label={t('nav.primary')}>
          {links.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="header-tools">
          <SearchDialog
            locale={locale}
            labels={{
              open: t('search.open'),
              title: t('search.title'),
              placeholder: t('search.placeholder'),
              close: t('search.close'),
              hint: t('search.hint'),
              noResults: t.raw('search.noResults') as string,
              count: t.raw('search.count') as string,
              loading: t('search.loading'),
              error: t('search.error'),
              retry: t('search.retry'),
              unavailable: t('explorer.unavailableText'),
              indexTitle: t('explorer.indexTitle'),
            }}
          />
          <SavedLink href={savedHref} label={t('nav.saved')} />
          <LanguagePicker locale={locale} label={t('nav.languageLabel')} spokenNames={spokenNames} />
          <MobileMenu
            labels={{ menu: t('nav.menu'), close: t('nav.close'), primary: t('nav.primary') }}
            links={[...links, { href: savedHref, label: t('saved.title') }]}
          />
        </div>
      </div>
    </header>
  );
}
