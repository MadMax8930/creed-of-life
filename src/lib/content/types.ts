/** A single translated reflection, as stored in MongoDB (`contents.translations`). */
export interface LocalizedText {
  title: string;
  text: string;
}

export type Translations = Record<string, LocalizedText | undefined>;

/** One reflection inside a principle (MongoDB `contents` document). */
export interface Reflection {
  id: string;
  translations: Translations;
  /** Derived from the MongoDB ObjectId timestamp when available. */
  createdAt: string | null;
}

/** A principle (MongoDB `branches` document), e.g. "Self-Awareness". */
export interface Principle {
  id: string;
  /** English key, also the lookup key in `branchesJSON`. */
  name: string;
  slug: string;
  /** 0-based position inside its pillar. */
  position: number;
  /** 0-based position across the whole creed (0-8). */
  number: number;
  pillarSlug: string;
  pillarName: string;
  reflections: Reflection[];
}

/** A pillar (MongoDB `pillars` document), e.g. "Discipline". */
export interface Pillar {
  id: string;
  /** English key, also the lookup key in `pillarsJSON`. */
  name: string;
  slug: string;
  /** 0-based position (drives numerals I, II, III). */
  position: number;
  principles: Principle[];
}

export interface Creed {
  pillars: Pillar[];
  /** 'unavailable' when MongoDB could not be reached (pages still render). */
  status: 'ok' | 'unavailable';
}
