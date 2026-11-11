import type { AppLocale } from '@/i18n/routing';
import type { ContentSource } from './types';

/*
 * The localized, display-ready view of the creed. This is what the browser
 * receives: one language, labels already formatted. It is built on the server
 * by `getLibrary()` from whichever source answered (MongoDB or the snapshot).
 */
export interface LibraryPassage {
  /** Stable identifier (the MongoDB `contents._id`). Used for bookmarks and anchors. */
  id: string;
  title: string;
  text: string;
  /** Language actually shown; 'en' when no translation exists for the locale. */
  titleLang: string;
  textLang: string;
}

export interface LibraryPrinciple {
  slug: string;
  name: string;
  /** 1-based position across the whole creed. */
  number: number;
  /** Dedicated page, e.g. "/fr/principles/resilience". */
  href: string;
  /** "Principle 2 of 9" */
  positionLabel: string;
  /** "3 reflections" */
  countLabel: string;
  /** "2 min read" */
  minutesLabel: string;
  passages: LibraryPassage[];
}

export interface LibraryPillar {
  slug: string;
  name: string;
  numeral: string;
  /** "Pillar II" */
  label: string;
  /** "3 principles" */
  countLabel: string;
  /** Home page with this pillar open, e.g. "/fr#discipline". */
  href: string;
  principles: LibraryPrinciple[];
}

export interface Library {
  locale: AppLocale;
  source: ContentSource;
  pillars: LibraryPillar[];
}

export interface PassageRef {
  pillar: LibraryPillar;
  principle: LibraryPrinciple;
  passage: LibraryPassage;
  /** 0-based position of the passage inside its principle. */
  index: number;
}

export function flattenLibrary(library: Library): PassageRef[] {
  return library.pillars.flatMap((pillar) =>
    pillar.principles.flatMap((principle) =>
      principle.passages.map((passage, index) => ({ pillar, principle, passage, index })),
    ),
  );
}

/** Anchor of a passage on its principle page. */
export function passageHref(ref: Pick<PassageRef, 'principle' | 'passage'>): string {
  return `${ref.principle.href}#p-${ref.passage.id}`;
}
