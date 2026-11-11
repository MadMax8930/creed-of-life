import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import CreedExplorer from '@/components/CreedExplorer';
import DailyReset from '@/components/DailyReset';
import JsonLd from '@/components/JsonLd';
import TornEdge from '@/components/TornEdge';
import statue from '@/assets/images/statue-torn.jpg';
import { isAppLocale, type AppLocale } from '@/i18n/routing';
import { pickDaily, utcDay } from '@/lib/content/daily';
import { getLibrary } from '@/lib/content/library';
import { leadExcerpt, toParagraphs } from '@/lib/content/localize';
import { pillarVisual } from '@/lib/pillar-visuals';
import { localizedAlternates, openGraphLocales } from '@/lib/seo';
import { absoluteUrl, AUTHOR, LINKTREE_URL, SITE_URL } from '@/lib/site';

// Content edited in MongoDB shows up within the hour, no redeploy needed.
export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) return {};
  const ui = await getTranslations({ locale, namespace: 'uiJSON' });
  const seo = await getTranslations({ locale, namespace: 'seoJSON' });
  const site = await getTranslations({ locale, namespace: 'siteJSON' });
  const title = `${ui('mainTitle')}: ${seo('descHead')}`;
  const description = site('home.metaDescription');
  return {
    title: { absolute: title },
    description,
    alternates: localizedAlternates(locale, '/'),
    openGraph: {
      type: 'website',
      siteName: site('brand'),
      title,
      description,
      url: absoluteUrl(locale, '/'),
      ...openGraphLocales(locale),
      images: [{ url: '/images/og-image.png', width: 1200, height: 630, alt: site('brand') }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: '/images/twitter-image.png', alt: site('brand') }],
    },
  };
}

function splitEdition(title: string): [string, string | null] {
  const match = title.match(/^(.*?)\s*(\d+)$/);
  return match ? [match[1]!, match[2]!] : [title, null];
}

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale: raw } = await params;
  const locale = raw as AppLocale;
  setRequestLocale(locale);

  const [ui, site, library] = await Promise.all([
    getTranslations({ locale, namespace: 'uiJSON' }),
    getTranslations({ locale, namespace: 'siteJSON' }),
    getLibrary(locale),
  ]);

  const [titleText, edition] = splitEdition(ui('mainTitle'));
  const hasContent = library.pillars.length > 0;

  // Daily Reset: today's existing passage (UTC day), chosen deterministically.
  const day = utcDay();
  const daily = pickDaily(library, day);

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: absoluteUrl(locale, '/'),
        name: site('brand'),
        description: site('home.metaDescription'),
        inLanguage: locale,
        publisher: { '@id': `${SITE_URL}/#author` },
      },
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/#author`,
        name: AUTHOR.name,
        url: AUTHOR.url,
        sameAs: [LINKTREE_URL],
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />

      <section className="wrap hero" aria-labelledby="hero-title">
        <div className="hero__grid">
          <h1 id="hero-title" className="hero__title">
            {titleText}
            {edition && <span className="hero__edition">{edition}</span>}
          </h1>

          {/* The torn statue shares the masthead with the title instead of
              sitting below it as a separate panel. */}
          <figure className="hero__figure">
            <Image
              src={statue}
              alt={site('home.heroImageAlt')}
              fill
              priority
              quality={70}
              sizes="(min-width: 60rem) 42vw, 100vw"
              placeholder="blur"
            />
            <TornEdge seed={3} fill="var(--color-plaster)" className="hero__tear hero__tear--top" />
            <TornEdge seed={7} fill="var(--color-plaster)" side="left" className="hero__tear hero__tear--left" />
            <TornEdge seed={11} fill="var(--color-plaster)" direction="up" className="hero__tear hero__tear--bottom" />
          </figure>

          <div className="hero__copy">
            <p className="hero__subtitle">{ui('mainSubtitle')}</p>
            <p className="hero__motto">
              <strong>{site('motto')}</strong>
              {site('coda')}
            </p>
            <a className="button" href="#creed">
              {site('home.heroCta')}
            </a>
          </div>
        </div>
      </section>

      {daily && (
        <DailyReset
          library={library}
          day={day}
          excerpt={leadExcerpt(daily.passage.text, locale)}
          labels={{
            label: site('daily.label'),
            title: site('daily.title'),
            cta: site('daily.cta'),
            save: site('saved.save'),
          }}
        />
      )}

      <section id="manifesto" className="wrap section" aria-labelledby="manifesto-title">
        <div className="split">
          <h2 id="manifesto-title" className="section-title">
            {site('home.manifestoLabel')}
          </h2>
          <div>
            <p className="manifesto__text">{ui('introBloc')}</p>
            {hasContent && (
              /* The three pillars the manifesto names, as a way into them. */
              <nav className="legend" aria-label={site('explorer.pillars')}>
                {library.pillars.map((pillar, i) => (
                  <a
                    key={pillar.slug}
                    href={`#${pillar.slug}`}
                    className="legend__item"
                    style={{ '--pillar': pillarVisual(pillar.slug, i).color } as React.CSSProperties}
                  >
                    <span className="legend__numeral" aria-hidden="true">
                      {pillar.numeral}
                    </span>
                    <span className="legend__name">{pillar.name}</span>
                    <span className="legend__count">{pillar.countLabel}</span>
                  </a>
                ))}
              </nav>
            )}
          </div>
        </div>
      </section>

      <section id="creed" className="wrap section creed" aria-labelledby="creed-title">
        <div className="creed__head">
          <div>
            <p className="note">{site('home.eyebrow')}</p>
            <h2 id="creed-title" className="section-title">
              {site('home.creedHeading')}
            </h2>
          </div>
          {hasContent && <p className="note creed__intro">{site('home.creedIntro')}</p>}
        </div>

        {hasContent ? (
          <CreedExplorer
            library={library}
            labels={{
              pillars: site('explorer.pillars'),
              principlesOf: site.raw('explorer.principlesOf') as string,
              openPage: site('explorer.openPage'),
              previous: site('principle.previous'),
              next: site('principle.next'),
              save: site('saved.save'),
              fallbackNotice: site('principle.fallbackNotice'),
              empty: site('explorer.empty'),
            }}
          />
        ) : (
          <div className="state" role="status">
            <h3 className="state__title">{site('explorer.unavailableTitle')}</h3>
            <p>{site('explorer.unavailableText')}</p>
          </div>
        )}
      </section>

      <section className="on-ink closing" aria-labelledby="closing-title">
        <TornEdge seed={19} fill="var(--color-plaster)" fiber="var(--color-marble)" />
        <div className="wrap section split">
          <div>
            <p className="note">{site('home.closingLabel')}</p>
            <h2 id="closing-title" className="section-title" style={{ marginTop: '0.5rem' }}>
              {ui('concTitle')}
            </h2>
          </div>
          <div className="closing__text">
            {toParagraphs(ui('concText')).map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
