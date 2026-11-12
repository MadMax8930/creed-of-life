import { getTranslations } from 'next-intl/server';
import { locales, type AppLocale } from '@/i18n/routing';
import { AUTHOR, COFFEE_URL, CONTACT_HREF, LANGUAGE_NAMES, LINKTREE_URL, localePath } from '@/lib/site';
import TornEdge from './TornEdge';

export default async function SiteFooter({ locale }: { locale: AppLocale }) {
  const t = await getTranslations({ locale, namespace: 'siteJSON.footer' });
  const brand = (await getTranslations({ locale, namespace: 'siteJSON' }))('brand');
  const year = new Date().getFullYear();
  const newTab = t('newTab');

  return (
    <footer className="on-ink" id="contact">
      <TornEdge seed={31} fill="var(--color-plaster)" fiber="var(--color-marble)" />
      <div className="wrap footer">
        <div className="footer__grid">
          <section aria-labelledby="footer-contact">
            <p className="note">{t('contactLabel')}</p>
            <h2 id="footer-contact" className="footer__small-heading">
              {t('contactHeading')}
            </h2>
            <p className="footer__text">{t('contactText')}</p>
            <a className="button" href={CONTACT_HREF}>
              <svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true">
                <path d="M1 1h16v12H1z M1 1l8 6.5L17 1" fill="none" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              {t('contactCta')}
            </a>
          </section>

          {COFFEE_URL && (
            <section aria-labelledby="footer-support">
              <p className="note">{t('supportLabel')}</p>
              <h2 id="footer-support" className="footer__small-heading">
                {t('supportText')}
              </h2>
              <a
                className="button button--ghost"
                href={COFFEE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t('coffeeCta')} (${newTab})`}
              >
                {t('coffeeCta')}
              </a>
              <p className="footer__aside">{t('coffeeNote')}</p>
            </section>
          )}

          <section aria-labelledby="footer-follow">
            <p className="note">{t('followLabel')}</p>
            <h2 id="footer-follow" className="footer__small-heading">
              {t('followText')}
            </h2>
            <a
              className="button button--ghost"
              href={LINKTREE_URL}
              target="_blank"
              rel="noopener noreferrer me"
              aria-label={`${t('followCta')} (${newTab})`}
            >
              {t('followCta')}
            </a>
          </section>
        </div>

        <div className="footer__base">
          <nav aria-label={t('readIn')}>
            <ul className="footer__langs">
              {locales.map((code) => (
                <li key={code}>
                  <a
                    href={localePath(code, '/')}
                    hrefLang={code}
                    lang={code}
                    className={code === locale ? 'link' : undefined}
                    aria-current={code === locale ? 'true' : undefined}
                  >
                    {LANGUAGE_NAMES[code]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <p style={{ margin: 0 }}>
            &copy; {year} {brand}. {t('byline')}{' '}
            <a className="link" href={AUTHOR.url} target="_blank" rel="noopener noreferrer author">
              {AUTHOR.name}
            </a>
            . {t('rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
