import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import JsonLd from '@/components/JsonLd';
import TornEdge from '@/components/TornEdge';
import { isAppLocale, type AppLocale } from '@/i18n/routing';
import CreedIndex from '@/components/CreedIndex';
import Passage from '@/components/Passage';
import PrincipleEmblem from '@/components/PrincipleEmblem';
import { getAllPrinciples, getPrinciple } from '@/lib/content';
import { getLibrary } from '@/lib/content/library';
import { excerpt, localizeReflection } from '@/lib/content/localize';
import { getNameTranslators } from '@/lib/labels';
import { pillarVisual } from '@/lib/pillar-visuals';
import { localizedAlternates, openGraphLocales } from '@/lib/seo';
import { absoluteUrl, AUTHOR, localePath, SITE_URL } from '@/lib/site';

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
    first && first.textLang === locale
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
  const { slug } = data;
  const locale = data.locale as AppLocale;
  setRequestLocale(locale);

  const [site, library] = await Promise.all([getTranslations({ locale, namespace: 'siteJSON' }), getLibrary(locale)]);

  // The same localized view the home explorer uses, so both read identically.
  const pillarIndex = library.pillars.findIndex((p) => p.principles.some((x) => x.slug === slug));
  const pillar = library.pillars[pillarIndex];
  const principle = pillar?.principles.find((x) => x.slug === slug);
  if (!pillar || !principle) notFound();

  const order = library.pillars.flatMap((p) => p.principles);
  const at = order.indexOf(principle);
  const previous = at > 0 ? order[at - 1] : undefined;
  const next = at < order.length - 1 ? order[at + 1] : undefined;

  const visual = pillarVisual(pillar.slug, pillarIndex);
  const homeHref = localePath(locale, '/');
  const published = data.principle.reflections.map((r) => r.createdAt).filter(Boolean).sort()[0];
  const url = absoluteUrl(locale, `/principles/${slug}`);
  const passageLabels = { save: site('saved.save'), fallbackNotice: site('principle.fallbackNotice') };

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: principle.name,
        articleSection: pillar.name,
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
          { '@type': 'ListItem', position: 2, name: pillar.name, item: `${absoluteUrl(locale, '/')}#${pillar.slug}` },
          { '@type': 'ListItem', position: 3, name: principle.name, item: url },
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
              <Link className="link" href={pillar.href}>
                {pillar.name}
              </Link>
            </li>
            <li aria-current="page">{principle.name}</li>
          </ol>
        </nav>
        <PrincipleEmblem slug={principle.slug} className="article-emblem" />
        <Link className="kicker" href={pillar.href}>
          {pillar.label}: {pillar.name}
        </Link>
        <h1 className="article-title">{principle.name}</h1>
        <ul className="article-meta note">
          <li>{principle.positionLabel}</li>
          {principle.passages.length > 0 && <li>{principle.countLabel}</li>}
          {principle.passages.length > 0 && <li>{principle.minutesLabel}</li>}
        </ul>
      </header>

      <figure className="wrap" style={{ margin: 0 }}>
        <div className="article-figure">
          <TornEdge seed={principle.number + 40} fill="var(--color-plaster)" className="absolute top-0 left-0 z-10" />
          <Image src={visual.image} alt="" priority quality={70} sizes="(min-width: 90rem) 84rem, 100vw" placeholder="blur" />
          <TornEdge
            seed={principle.number + 52}
            fill="var(--color-plaster)"
            direction="up"
            className="absolute bottom-0 left-0 z-10"
          />
        </div>
      </figure>

      <div className="wrap">
        {/* The same principle switcher as the home explorer, as real links. */}
        <nav
          className="pcards pcards--page"
          aria-label={site('explorer.principlesOf', { pillar: pillar.name })}
        >
          {pillar.principles.map((item) => (
            <Link
              key={item.slug}
              className="pcard"
              href={item.href}
              aria-current={item.slug === slug ? 'page' : undefined}
            >
              <PrincipleEmblem slug={item.slug} className="pcard__emblem" />
              <span className="pcard__text">
                <span className="pcard__n" aria-hidden="true">
                  {item.number}
                </span>
                <span className="pcard__name">{item.name}</span>
              </span>
            </Link>
          ))}
        </nav>

        <div className="reading reading--page">
          {principle.passages.length > 1 ? (
            <nav className="toc" aria-labelledby="toc-title">
              <p id="toc-title" className="note">
                {site('principle.contents')}
              </p>
              <ol>
                {principle.passages.map((passage) => (
                  <li key={passage.id}>
                    <a
                      href={`#p-${passage.id}`}
                      lang={passage.titleLang !== locale ? passage.titleLang : undefined}
                    >
                      {passage.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : (
            <div />
          )}

          <div className="reading__passages">
            {principle.passages.length === 0 && <p className="note">{site('explorer.empty')}</p>}
            {principle.passages.map((passage, i) => (
              <Passage
                key={passage.id}
                passage={passage}
                index={`${principle.number}.${i + 1}`}
                locale={locale}
                headingLevel={2}
                labels={passageLabels}
              />
            ))}
          </div>
        </div>

        <nav className="pager" aria-label={`${site('principle.previous')} / ${site('principle.next')}`}>
          {previous ? (
            <Link href={previous.href} rel="prev">
              <span className="note">{site('principle.previous')}</span>
              <span className="pager__name">{previous.name}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={next.href} rel="next">
              <span className="note">{site('principle.next')}</span>
              <span className="pager__name">{next.name}</span>
            </Link>
          ) : (
            <Link href={`${homeHref}#creed`}>
              <span className="note">{site('principle.next')}</span>
              <span className="pager__name">{site('principle.all')}</span>
            </Link>
          )}
        </nav>

        <CreedIndex library={library} current={slug} title={site('explorer.indexTitle')} />
      </div>
    </article>
  );
}
