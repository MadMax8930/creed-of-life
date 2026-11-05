import { getRequestConfig } from 'next-intl/server';
import { locale as rootLocale } from 'next/root-params';
import { isAppLocale, routing } from './routing';

export default getRequestConfig(async ({ locale: explicitLocale }) => {
  // An explicit locale (e.g. getTranslations({ locale })) wins; otherwise read
  // the [locale] root segment. Unknown values fall back to the default locale.
  const candidate = explicitLocale ?? (await rootLocale());
  const locale = isAppLocale(candidate) ? candidate : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../locales/${locale}.json`)).default,
    timeZone: 'Asia/Bangkok',
  };
});
