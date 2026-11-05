import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import JsonLd from '@/components/JsonLd';
import TornEdge from '@/components/TornEdge';
import statue from '@/assets/images/statue-torn.jpg';
import { isAppLocale, type AppLocale } from '@/i18n/routing';
import { getCreed } from '@/lib/content';
import { toParagraphs } from '@/lib/content/localize';
import { getNameTranslators } from '@/lib/labels';
import { pillarVisual } from '@/lib/pillar-visuals';
import { localizedAlternates, openGraphLocales } from '@/lib/seo';
import { absoluteUrl, AUTHOR, LINKTREE_URL, localePath, roman, SITE_URL } from '@/lib/site';

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

  const [ui, site, creed, names] = await Promise.all([
    getTranslations({ locale, namespace: 'uiJSON' }),
    getTranslations({ locale, namespace: 'siteJSON' }),
    getCreed(),
    getNameTranslators(locale),
  ]);

  const [titleText, edition] = splitEdition(ui('mainTitle'));
  const firstPrinciple = creed.pillars[0]?.principles[0];

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
        <h1 id="hero-title" className="hero__title">
          {titleText}
          {edition && <span className="hero__edition">{edition}</span>}
        </h1>
        <div className="hero__intro">
          <p className="hero__subtitle">{ui('mainSubtitle')}</p>
          <p className="hero__motto">
            <strong>{site('motto')}</strong>
            {site('coda')}
          </p>
        </div>
        <div className="hero__cta-row">
          <a className="button" href="#creed">
            {site('home.heroCta')}
          </a>
        </div>
        <figure className="hero__figure">
          <TornEdge seed={3} fill="var(--color-plaster)" className="absolute top-0 left-0 z-10" />
          <Image
            src={statue}
            alt={site('home.heroImageAlt')}
            priority
            quality={70}
            sizes="(min-width: 90rem) 84rem, 100vw"
            placeholder="blur"
          />
          <TornEdge seed={11} fill="var(--color-plaster)" direction="up" className="absolute bottom-0 left-0 z-10" />
        </figure>
      </section>

      <section id="manifesto" className="wrap section" aria-labelledby="manifesto-title">
        <div className="split">
          <h2 id="manifesto-title" className="section-title">
            {site('home.manifestoLabel')}
          </h2>
          <p className="manifesto__text">{ui('introBloc')}</p>
        </div>
      </section>

      {creed.pillars.length > 0 && (
        <section id="creed" className="wrap section" style={{ paddingTop: 0 }} aria-labelledby="creed-title">
          <div className="creed__head">
            <div>
              <p className="note">{site('home.eyebrow')}</p>
              <h2 id="creed-title" className="section-title" style={{ marginTop: '0.5rem' }}>
                {site('home.creedHeading')}
              </h2>
            </div>
            {firstPrinciple && (
              <div>
                <p className="note" style={{ marginBottom: '0.75rem', maxWidth: '30ch' }}>
                  {site('home.startHereText')}
                </p>
                <Link className="button button--ghost" href={localePath(locale, `/principles/${firstPrinciple.slug}`)}>
                  {site('home.startHere')}: {names.principleName(firstPrinciple.name)}
                </Link>
              </div>
            )}
          </div>

          {creed.pillars.map((pillar) => {
            const visual = pillarVisual(pillar.slug, pillar.position);
            const pillarName = names.pillarName(pillar.name);
            const headingId = `pillar-${pillar.slug}`;
            return (
              <article
                key={pillar.id}
                id={pillar.slug}
                className="pillar"
                style={{ '--pillar': visual.color } as React.CSSProperties}
                aria-labelledby={headingId}
              >
                <figure className="pillar__media">
                  <Image
                    src={visual.image}
                    alt=""
                    quality={70}
                    sizes="(min-width: 60rem) 36vw, 100vw"
                    placeholder="blur"
                  />
                  <span className="pillar__numeral" aria-hidden="true">
                    {roman(pillar.position)}
                  </span>
                </figure>
                <div>
                  <p className="note">{site('pillar.label', { numeral: roman(pillar.position) })}</p>
                  <h3 id={headingId} className="pillar__name">
                    {pillarName}
                  </h3>
                  <ol className="principles">
                    {pillar.principles.map((principle) => (
                      <li key={principle.id}>
                        <Link
                          className="principle-link"
                          href={localePath(locale, `/principles/${principle.slug}`)}
                        >
                          <span className="principle-link__n" aria-hidden="true">
                            {principle.number + 1}
                          </span>
                          <span className="principle-link__name">{names.principleName(principle.name)}</span>
                          <span className="principle-link__meta">
                            {site('principle.reflections', { count: principle.reflections.length })}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </div>
              </article>
            );
          })}
        </section>
      )}

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
