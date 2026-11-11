'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { flattenLibrary, passageHref } from '@/lib/content/library-types';
import { pillarVisual } from '@/lib/pillar-visuals';
import { removeSaved, useSavedIds } from '@/lib/saved';
import { useLibrary } from '@/lib/useLibrary';
import Passage from './Passage';

export interface SavedLabels {
  loading: string;
  empty: string;
  browse: string;
  error: string;
  retry: string;
  unavailable: string;
  /** "{count} saved reflections are no longer part of the creed." */
  missing: string;
  clearMissing: string;
  remove: string;
  readInContext: string;
  save: string;
  fallbackNotice: string;
}

const subscribe = () => () => {};

/**
 * Passages bookmarked on this device. Only their ids are stored; the text
 * always comes from the live content (MongoDB or the snapshot).
 */
export default function SavedReflections({
  locale,
  homeHref,
  labels,
}: {
  locale: string;
  homeHref: string;
  labels: SavedLabels;
}) {
  const ids = useSavedIds();
  // False on the server and during hydration, so "nothing saved" never flashes.
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const { status, library, retry } = useLibrary(locale, ready && ids.length > 0);

  const browse = (
    <Link className="button" href={`${homeHref}#creed`}>
      {labels.browse}
    </Link>
  );

  if (!ready) return <p className="note">{labels.loading}</p>;
  if (ids.length === 0) {
    return (
      <div className="state">
        <p>{labels.empty}</p>
        {browse}
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="state">
        <p>{labels.error}</p>
        <button type="button" className="button button--ghost" onClick={retry}>
          {labels.retry}
        </button>
      </div>
    );
  }
  if (!library) return <p className="note">{labels.loading}</p>;
  if (library.pillars.length === 0) {
    return (
      <div className="state">
        <p>{labels.unavailable}</p>
      </div>
    );
  }

  const byId = new Map(flattenLibrary(library).map((ref) => [ref.passage.id, ref]));
  const missing = ids.filter((id) => !byId.has(id));

  return (
    <div className="saved">
      {ids.map((id) => {
        const ref = byId.get(id);
        if (!ref) return null;
        const color = pillarVisual(ref.pillar.slug, library.pillars.indexOf(ref.pillar)).color;
        return (
          <div key={id} className="saved__item" style={{ '--pillar': color } as React.CSSProperties}>
            <p className="saved__context">
              {ref.principle.name}, {ref.pillar.name}
            </p>
            <Passage
              passage={ref.passage}
              index={`${ref.principle.number}.${ref.index + 1}`}
              locale={locale}
              headingLevel={2}
              labels={labels}
            />
            <p className="saved__actions">
              <Link className="link" href={passageHref(ref)}>
                {labels.readInContext}
              </Link>
              <button type="button" className="link saved__remove" onClick={() => removeSaved([id])}>
                {labels.remove}
              </button>
            </p>
          </div>
        );
      })}

      {missing.length > 0 && (
        <div className="state">
          <p>{labels.missing.replace('{count}', String(missing.length))}</p>
          <button type="button" className="button button--ghost" onClick={() => removeSaved(missing)}>
            {labels.clearMissing}
          </button>
        </div>
      )}
    </div>
  );
}
