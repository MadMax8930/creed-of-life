import Link from 'next/link';
import type { Library } from '@/lib/content/library-types';
import { pillarVisual } from '@/lib/pillar-visuals';
import PrincipleEmblem from './PrincipleEmblem';

interface CreedIndexProps {
  library: Library;
  title: string;
  /** Slug of the principle being read, if any. */
  current?: string;
  headingLevel?: 2 | 3;
  onNavigate?: () => void;
}

/**
 * The whole creed at a glance: three pillars, each with its principles.
 * Shown under every principle, in Saved Reflections and in the search dialog,
 * so the way back to the pillars is always one click away.
 */
export default function CreedIndex({ library, title, current, headingLevel = 2, onNavigate }: CreedIndexProps) {
  if (library.pillars.length === 0) return null;
  const Heading = `h${headingLevel}` as const;
  return (
    <section className="index" aria-labelledby="creed-index-title">
      <Heading id="creed-index-title" className="note index__title">
        {title}
      </Heading>
      <div className="index__grid">
        {library.pillars.map((pillar, i) => (
          <div
            key={pillar.slug}
            className="index__pillar"
            style={{ '--pillar': pillarVisual(pillar.slug, i).color } as React.CSSProperties}
          >
            <Link className="index__pillar-name" href={pillar.href} onClick={onNavigate}>
              <span aria-hidden="true">{pillar.numeral}</span> {pillar.name}
            </Link>
            <ol>
              {pillar.principles.map((principle) => (
                <li key={principle.slug}>
                  <Link
                    href={principle.href}
                    aria-current={principle.slug === current ? 'page' : undefined}
                    onClick={onNavigate}
                  >
                    <PrincipleEmblem slug={principle.slug} className="index__emblem" />
                    {principle.name}
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}
