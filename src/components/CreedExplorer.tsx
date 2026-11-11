'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { Library, LibraryPillar, LibraryPrinciple } from '@/lib/content/library-types';
import { pillarVisual } from '@/lib/pillar-visuals';
import Passage from './Passage';

export interface ExplorerLabels {
  /** Name of the pillar switcher, e.g. "Pillars". */
  pillars: string;
  /** "Principles of {pillar}" */
  principlesOf: string;
  /** Link to the principle's own page. */
  openPage: string;
  previous: string;
  next: string;
  save: string;
  fallbackNotice: string;
  /** Shown when a principle has no passages. */
  empty: string;
}

interface Selection {
  pillar: string;
  principle: string;
}

const HASH_EVENT = 'creedoflife:hash';

function subscribeToHash(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  window.addEventListener(HASH_EVENT, onChange);
  return () => {
    window.removeEventListener('hashchange', onChange);
    window.removeEventListener(HASH_EVENT, onChange);
  };
}
const readHash = () => decodeURIComponent(window.location.hash.slice(1));
const noHash = () => '';

/** Arrow keys, Home and End move between tabs (WAI-ARIA tabs pattern). */
function tabKeyTarget(event: React.KeyboardEvent, index: number, count: number): number | null {
  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return (index + 1) % count;
    case 'ArrowLeft':
    case 'ArrowUp':
      return (index - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}

/**
 * The heart of the site: choose a pillar, choose one of its principles, read
 * its passages, without leaving the page. The selection is mirrored in the URL
 * hash ("/#resilience") so it can be linked, shared and restored.
 */
export default function CreedExplorer({ library, labels }: { library: Library; labels: ExplorerLabels }) {
  const { pillars, locale } = library;
  const order = useMemo(
    () => pillars.flatMap((pillar) => pillar.principles.map((principle) => ({ pillar, principle }))),
    [pillars],
  );

  const [chosen, setChosen] = useState<Selection>(() => ({
    pillar: pillars[0]?.slug ?? '',
    principle: pillars[0]?.principles[0]?.slug ?? '',
  }));
  /** Last principle read in each pillar, so coming back to a pillar restores it. */
  const lastRead = useRef<Record<string, string>>({});
  const root = useRef<HTMLDivElement>(null);
  const reading = useRef<HTMLHeadingElement>(null);
  const hash = useSyncExternalStore(subscribeToHash, readHash, noHash);

  // A hash naming a pillar or a principle wins; any other hash keeps the choice.
  const selection = useMemo<Selection>(() => {
    const viaPrinciple = order.find((entry) => entry.principle.slug === hash);
    if (viaPrinciple) return { pillar: viaPrinciple.pillar.slug, principle: viaPrinciple.principle.slug };
    const viaPillar = pillars.find((pillar) => pillar.slug === hash);
    if (viaPillar) {
      const remembered = chosen.pillar === viaPillar.slug ? chosen.principle : undefined;
      return { pillar: viaPillar.slug, principle: remembered ?? viaPillar.principles[0]?.slug ?? '' };
    }
    return chosen;
  }, [hash, order, pillars, chosen]);

  const pillarIndex = Math.max(
    0,
    pillars.findIndex((p) => p.slug === selection.pillar),
  );
  const pillar: LibraryPillar | undefined = pillars[pillarIndex];
  const principleIndex = Math.max(0, pillar?.principles.findIndex((p) => p.slug === selection.principle) ?? 0);
  const principle: LibraryPrinciple | undefined = pillar?.principles[principleIndex];
  const position = order.findIndex((entry) => entry.principle.slug === principle?.slug);
  const previous = position > 0 ? order[position - 1] : undefined;
  const next = position >= 0 && position < order.length - 1 ? order[position + 1] : undefined;

  // Opening "/#resilience" directly: bring the explorer into view once.
  useEffect(() => {
    const initial = readHash();
    if (initial && order.some((entry) => entry.principle.slug === initial)) {
      root.current?.scrollIntoView({ block: 'start' });
    }
  }, [order]);

  function select(target: Selection) {
    lastRead.current[target.pillar] = target.principle;
    setChosen(target);
    // `null` state is the form Next.js documents: its router stays in sync.
    window.history.replaceState(null, '', `#${target.principle}`);
    window.dispatchEvent(new Event(HASH_EVENT));
  }

  function selectPillar(target: LibraryPillar) {
    const principleSlug = lastRead.current[target.slug] ?? target.principles[0]?.slug ?? '';
    select({ pillar: target.slug, principle: principleSlug });
  }

  /** Previous / next at the end of a principle: move, then start at its top. */
  function turnTo(entry: { pillar: LibraryPillar; principle: LibraryPrinciple }) {
    select({ pillar: entry.pillar.slug, principle: entry.principle.slug });
    requestAnimationFrame(() => {
      document.getElementById('creed-principles')?.scrollIntoView({ block: 'start' });
      reading.current?.focus({ preventScroll: true });
    });
  }

  if (!pillar) return null;
  const visual = pillarVisual(pillar.slug, pillarIndex);

  return (
    <div
      ref={root}
      className="explorer"
      style={{ '--pillar': visual.color } as React.CSSProperties}
      data-content-source={library.source}
    >
      <div className="pillars" role="tablist" aria-label={labels.pillars}>
        {pillars.map((item, index) => {
          const itemVisual = pillarVisual(item.slug, index);
          const selected = item.slug === pillar.slug;
          return (
            <button
              key={item.slug}
              id={item.slug}
              type="button"
              role="tab"
              className="pillar-card"
              style={{ '--pillar': itemVisual.color } as React.CSSProperties}
              aria-selected={selected}
              aria-controls="creed-principles"
              tabIndex={selected ? 0 : -1}
              onClick={() => selectPillar(item)}
              onKeyDown={(event) => {
                const target = tabKeyTarget(event, index, pillars.length);
                if (target === null) return;
                event.preventDefault();
                const to = pillars[target]!;
                selectPillar(to);
                document.getElementById(to.slug)?.focus();
              }}
            >
              <Image
                src={itemVisual.image}
                alt=""
                fill
                quality={70}
                sizes="(min-width: 48rem) 30vw, 100vw"
                placeholder="blur"
              />
              <span className="pillar-card__numeral" aria-hidden="true">
                {item.numeral}
              </span>
              <span className="pillar-card__body">
                <span className="pillar-card__name">{item.name}</span>
                <span className="pillar-card__count">{item.countLabel}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div id="creed-principles" className="explorer__panel" role="tabpanel" aria-labelledby={pillar.slug}>
        <div className="ptabs" role="tablist" aria-label={labels.principlesOf.replace('{pillar}', pillar.name)}>
          {pillar.principles.map((item, index) => {
            const selected = item.slug === principle?.slug;
            return (
              <button
                key={item.slug}
                id={`tab-${item.slug}`}
                type="button"
                role="tab"
                className="ptab"
                aria-selected={selected}
                aria-controls="creed-reading"
                tabIndex={selected ? 0 : -1}
                onClick={() => select({ pillar: pillar.slug, principle: item.slug })}
                onKeyDown={(event) => {
                  const target = tabKeyTarget(event, index, pillar.principles.length);
                  if (target === null) return;
                  event.preventDefault();
                  const to = pillar.principles[target]!;
                  select({ pillar: pillar.slug, principle: to.slug });
                  document.getElementById(`tab-${to.slug}`)?.focus();
                }}
              >
                <span className="ptab__n" aria-hidden="true">
                  {item.number}
                </span>
                <span className="ptab__name">{item.name}</span>
              </button>
            );
          })}
        </div>

        {principle && (
          <div
            id="creed-reading"
            key={principle.slug}
            className="reading"
            role="tabpanel"
            aria-labelledby={`tab-${principle.slug}`}
          >
            <aside className="reading__context">
              <p className="reading__pillar">
                {pillar.label}: {pillar.name}
              </p>
              <h3 ref={reading} tabIndex={-1} className="reading__title">
                {principle.name}
              </h3>
              <ul className="reading__meta note">
                <li>{principle.positionLabel}</li>
                {principle.passages.length > 0 && <li>{principle.countLabel}</li>}
                {principle.passages.length > 0 && <li>{principle.minutesLabel}</li>}
              </ul>
              <Link className="link reading__open" href={principle.href}>
                {labels.openPage}
              </Link>
            </aside>

            <div className="reading__passages">
              {principle.passages.length === 0 && <p className="note">{labels.empty}</p>}
              {principle.passages.map((passage, index) => (
                <Passage
                  key={passage.id}
                  passage={passage}
                  index={`${principle.number}.${index + 1}`}
                  locale={locale}
                  headingLevel={4}
                  labels={labels}
                />
              ))}

              <nav className="turn" aria-label={`${labels.previous} / ${labels.next}`}>
                {previous ? (
                  <button type="button" className="turn__button" onClick={() => turnTo(previous)}>
                    <span className="note">{labels.previous}</span>
                    <span className="turn__name">{previous.principle.name}</span>
                  </button>
                ) : (
                  <span />
                )}
                {next && (
                  <button type="button" className="turn__button turn__button--next" onClick={() => turnTo(next)}>
                    <span className="note">{labels.next}</span>
                    <span className="turn__name">{next.principle.name}</span>
                  </button>
                )}
              </nav>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
