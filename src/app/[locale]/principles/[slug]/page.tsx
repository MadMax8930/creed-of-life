import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import JsonLd from '@/components/JsonLd';
import TornEdge from '@/components/TornEdge';
import { isAppLocale, type AppLocale } from '@/i18n/routing';
import { getAllPrinciples, getPrinciple } from '@/lib/content';
import { excerpt, localizeReflection, readingMinutes, toParagraphs } from '@/lib/content/localize';
import { getNameTranslators } from '@/lib/labels';
import { pillarVisual } from '@/lib/pillar-visuals';
import { localizedAlternates, openGraphLocales } from '@/lib/seo';
import { absoluteUrl, AUTHOR, localePath, roman, SITE_URL } from '@/lib/site';

export const revalidate = 3600;

export async function generateStaticParams() {
  const principles = await getAllPrinciples();
  return principles.map((p) => ({ slug: p.slug }));
}

async function load(params: PageProps<'/[locale]/principles/[slug]'>['params']) {
  const { locale, slug } = await params;
  if (!isAppLocale(locale)) return null;
  const data = await getPrinciple(slug);
  return data ? { locale, slug, ...data } : null;
}

export async function generateMetadata({ params }: PageProps<'/[locale]/principles/[slug]'>): Promise<Metadata> {
  const data = await load(params);
  if (!data) return {};
  const { locale, slug, principle, pillar } = data;
  const [site, names] = await Promise.all([
    getTranslations({ locale, namespace: 'siteJSON' }),
    getNameTranslators(locale),
  ]);
  const principleName = names.principleName(principle.name);
  const pillarName = names.pillarName(pillar.name);
  const title = site('principle.metaTitle', { principle: principleName, pillar: pillarName });

  const first = principle.reflections.map((r) => localizeReflection(r, locale)).find((r) => r?.text);
  const description =
    first && first.lang === locale
      ? excerpt(first.text, locale)
      : site('principle.metaDescriptionFallback', { principle: principleName, pillar: pillarName });

  const published = principle.reflections.map((r) => r.createdAt).filter(Boolean).sort()[0] ?? undefined;
  const path = `/principles/${slug}`;

  return {
    title,
    description,
    alternates: localizedAlternates(locale, path),
    openGraph: {
      type: 'article',
      siteName: site('brand'),
      title,
      description,
      url: absoluteUrl(locale, path),
      ...openGraphLocales(locale),
      authors: [AUTHOR.url],
      section: pillarName,
      publishedTime: published,
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

export default async function PrinciplePage({ params }: PageProps<'/[locale]/principles/[slug]'>) {
  const data = await load(params);
  if (!data) notFound();
  const { slug, principle, pillar, previous, next, total } = data;
  const locale = data.locale as AppLocale;
  setRequestLocale(locale);

  const [site, names] = await Promise.all([
    getTranslations({ locale, namespace: 'siteJSON' }),
    getNameTranslators(locale),
  ]);

  const visual = pillarVisual(pillar.slug, pillar.position);
  const principleName = names.principleName(principle.name);
  const pillarName = names.pillarName(pillar.name);
  const homeHref = localePath(locale, '/');
  const pillarHref = `${homeHref}#${pillar.slug}`;
  const reflections = principle.reflections
    .map((r) => ({ id: r.id, content: localizeReflection(r, locale) }))
    .filter((r): r is { id: string; content: NonNullable<typeof r.content> } => r.content !== null);
  const minutes = readingMinutes(
    reflections.map((r) => `${r.content.title} ${r.content.text}`),
    locale,
  );
  const siblings = pillar.principles.filter((p) => p.id !== principle.id);
  const published = principle.reflections.map((r) => r.createdAt).filter(Boolean).sort()[0];
  const url = absoluteUrl(locale, `/principles/${slug}`);

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: principleName,
        articleSection: pillarName,
        inLanguage: locale,
        url,
        mainEntityOfPage: url,
        image: `${SITE_URL}/images/og-image.png`,
        author: { '@type': 'Person', '@id': `${SITE_URL}/#author`, name: AUTHOR.name, url: AUTHOR.url },
        publisher: { '@id': `${SITE_URL}/#author` },
        isPartOf: { '@id': `${SITE_URL}/#website` },
        ...(published ? { datePublished: published } : {}),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: site('principle.home'), item: absoluteUrl(locale, '/') },
          { '@type': 'ListItem', position: 2, name: pillarName, item: `${absoluteUrl(locale, '/')}#${pillar.slug}` },
          { '@type': 'ListItem', position: 3, name: principleName, item: url },
        ],
      },
    ],
  };

  return (
    <article style={{ '--pillar': visual.color } as React.CSSProperties}>
      <JsonLd data={structuredData} />
      <div className="progress" aria-hidden="true" />

      <header className="wrap article-head">
        <nav className="crumbs" aria-label={site('principle.breadcrumb')}>
          <ol>
            <li>
              <Link className="link" href={homeHref}>
                {site('principle.home')}
              </Link>
            </li>
            <li>
              <Link className="link" href={pillarHref}>
                {pillarName}
              </Link>
            </li>
            <li aria-current="page">{principleName}</li>
          </ol>
        </nav>
        <Link className="kicker" href={pillarHref}>
          {site('principle.kicker', { numeral: roman(pillar.position) })}: {pillarName}
        </Link>
        <h1 className="article-title">{principleName}</h1>
        <ul className="article-meta note">
          <li>{site('principle.number', { number: principle.number + 1, total })}</li>
          {reflections.length > 0 && <li>{site('principle.reflections', { count: reflections.length })}</li>}
          {reflections.length > 0 && <li>{site('principle.readingTime', { minutes })}</li>}
        </ul>
      </header>

      <figure className="wrap" style={{ margin: 0 }}>
        <div className="article-figure">
          <TornEdge seed={principle.number + 41} fill="var(--color-plaster)" className="absolute top-0 left-0 z-10" />
          <Image src={visual.image} alt="" priority quality={70} sizes="(min-width: 90rem) 84rem, 100vw" placeholder="blur" />
          <TornEdge
            seed={principle.number + 53}
            fill="var(--color-plaster)"
            direction="up"
            className="absolute bottom-0 left-0 z-10"
          />
        </div>
      </figure>

      <div className="wrap article-body">
        {reflections.length > 1 ? (
          <nav className="toc" aria-labelledby="toc-title">
            <p id="toc-title" className="note">
              {site('principle.contents')}
            </p>
            <ol>
              {reflections.map((r, i) => (
                <li key={r.id}>
                  <a href={`#r${i + 1}`} lang={r.content.lang}>
                    {r.content.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        ) : (
          <div />
        )}

        <div className="prose">
          {reflections.map((r, i) => (
            <section
              key={r.id}
              id={`r${i + 1}`}
              className="reflection"
              lang={r.content.lang !== locale ? r.content.lang : undefined}
              aria-labelledby={`r${i + 1}-title`}
            >
              {r.content.lang !== locale && (
                <p className="note" lang={locale}>
                  {site('principle.fallbackNotice')}
                </p>
              )}
              <h2 id={`r${i + 1}-title`} className="reflection__title">
                <span className="reflection__index" aria-hidden="true">
                  {principle.number + 1}.{i + 1}
                </span>
                {r.content.title}
              </h2>
              {toParagraphs(r.content.text).map((paragraph, j) => (
                <p key={j}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
      </div>

      <div className="wrap">
        <nav className="pager" aria-label={`${site('principle.previous')} / ${site('principle.next')}`}>
          {previous ? (
            <Link href={localePath(locale, `/principles/${previous.slug}`)} rel="prev">
              <span className="note">{site('principle.previous')}</span>
              <span className="pager__name">{names.principleName(previous.name)}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={localePath(locale, `/principles/${next.slug}`)} rel="next">
              <span className="note">{site('principle.next')}</span>
              <span className="pager__name">{names.principleName(next.name)}</span>
            </Link>
          ) : (
            <Link href={`${homeHref}#creed`}>
              <span className="note">{site('principle.next')}</span>
              <span className="pager__name">{site('principle.all')}</span>
            </Link>
          )}
        </nav>

        {siblings.length > 0 && (
          <section className="siblings" aria-labelledby="siblings-title">
            <h2 id="siblings-title" className="note" style={{ margin: 0 }}>
              {site('principle.alsoIn', { pillar: pillarName })}
            </h2>
            <ul>
              {siblings.map((s) => (
                <li key={s.id}>
                  <Link className="chip" href={localePath(locale, `/principles/${s.slug}`)}>
                    {names.principleName(s.name)}
                  </Link>
                </li>
              ))}
              <li>
                <Link className="chip" style={{ borderColor: 'var(--color-ink)', color: 'var(--color-ink)' }} href={`${homeHref}#creed`}>
                  {site('principle.all')}
                </Link>
              </li>
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}
