import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Analytics from '@/components/Analytics';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { isAppLocale, locales } from '@/i18n/routing';
import { fontVariables } from '@/lib/fonts';
import { AUTHOR, SITE_URL } from '@/lib/site';
import '../globals.css';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// Unknown first segments (e.g. "/de") are not locales: 404 instead of rendering.
export const dynamicParams = false;

export const viewport: Viewport = {
  themeColor: '#e7e5e0',
  colorScheme: 'light',
};

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: 'siteJSON' });
  return {
    metadataBase: new URL(SITE_URL),
    applicationName: t('brand'),
    authors: [{ name: AUTHOR.name, url: AUTHOR.url }],
    creator: AUTHOR.name,
    title: { default: t('brand'), template: `%s | ${t('brand')}` },
    formatDetection: { email: false, address: false, telephone: false },
    icons: { icon: '/favicon.ico' },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'siteJSON' });

  return (
    <html lang={locale} className={fontVariables} data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#main">
          {t('skip')}
        </a>
        {/* Translations resolve on the server: no i18n runtime ships to the browser. */}
        <SiteHeader locale={locale} />
        <main id="main" tabIndex={-1} style={{ flex: 1, outline: 'none' }}>
          {children}
        </main>
        <SiteFooter locale={locale} />
        <Analytics />
      </body>
    </html>
  );
}
