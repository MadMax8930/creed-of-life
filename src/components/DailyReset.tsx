'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { pickDaily, utcDay } from '@/lib/content/daily';
import { passageHref, type Library } from '@/lib/content/library-types';
import { leadExcerpt } from '@/lib/content/localize';
import { pillarVisual } from '@/lib/pillar-visuals';
import TornEdge from './TornEdge';

export interface DailyLabels {
  label: string;
  title: string;
  cta: string;
}

interface DailyResetProps {
  library: Library;
  /** The UTC day the server rendered for, and that day's lead-in. */
  day: number;
  excerpt: string;
  labels: DailyLabels;
}

const subscribe = () => () => {};

/**
 * One existing passage per day (see `pickDaily`). The server renders today's
 * pick; if a cached page is from an earlier day, the browser swaps in the right
 * one after hydration. Nothing here is generated or reworded.
 */
export default function DailyReset({ library, day, excerpt, labels }: DailyResetProps) {
  const today = useSyncExternalStore(
    subscribe,
    () => utcDay(),
    () => day,
  );
  const pick = pickDaily(library, today);
  if (!pick) return null;

  const { pillar, principle, passage } = pick;
  const color = pillarVisual(pillar.slug, library.pillars.indexOf(pillar)).color;
  const lead = today === day ? excerpt : leadExcerpt(passage.text, library.locale);
  const date = new Intl.DateTimeFormat(library.locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(today * 86_400_000);
  const foreign = passage.textLang !== library.locale ? passage.textLang : undefined;

  return (
    <section className="daily" aria-labelledby="daily-label" style={{ '--pillar': color } as React.CSSProperties}>
      <TornEdge seed={23} fill="var(--color-plaster)" />
      <div className="wrap daily__grid">
        <div>
          <h2 id="daily-label" className="daily__label">
            {labels.label}
          </h2>
          <p className="note">{labels.title}</p>
          <p className="daily__date">
            <time dateTime={new Date(today * 86_400_000).toISOString().slice(0, 10)} suppressHydrationWarning>
              {date}
            </time>
          </p>
        </div>
        <div className="daily__thought">
          <p className="daily__source">
            {principle.name}, {pillar.name}
          </p>
          <h3 className="daily__heading" lang={passage.titleLang !== library.locale ? passage.titleLang : undefined}>
            {passage.title}
          </h3>
          <p className="daily__excerpt" lang={foreign}>
            {lead}
          </p>
          <Link className="button" href={passageHref(pick)}>
            {labels.cta}
          </Link>
        </div>
      </div>
      <TornEdge seed={29} fill="var(--color-plaster)" direction="up" />
    </section>
  );
}
