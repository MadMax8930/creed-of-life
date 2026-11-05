import type { LocalizedText, Reflection } from './types';

export interface LocalizedReflection extends LocalizedText {
  /** Language actually used (differs from the page locale when falling back). */
  lang: string;
}

/** Same fallback rule as before: page locale, then English. */
export function localizeReflection(reflection: Reflection, locale: string): LocalizedReflection | null {
  const own = reflection.translations[locale];
  if (own?.title || own?.text) return { title: own.title ?? '', text: own.text ?? '', lang: locale };
  const en = reflection.translations.en;
  if (en?.title || en?.text) return { title: en.title ?? '', text: en.text ?? '', lang: 'en' };
  return null;
}

/** Splits stored text into paragraphs (blank-line separated). */
export function toParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function countWords(text: string, locale: string): number {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter(locale, { granularity: 'word' });
    let count = 0;
    for (const s of segmenter.segment(text)) if (s.isWordLike) count++;
    return count;
  }
  return text.split(/\s+/).filter(Boolean).length;
}

export function readingMinutes(texts: string[], locale: string): number {
  const words = texts.reduce((n, t) => n + countWords(t, locale), 0);
  return Math.max(1, Math.round(words / 220));
}

/** Plain-text excerpt cut on a word boundary, for meta descriptions. */
export function excerpt(text: string, locale: string, max = 155): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  let cut = 0;
  if ('Segmenter' in Intl) {
    for (const s of new Intl.Segmenter(locale, { granularity: 'word' }).segment(clean)) {
      if (s.index + s.segment.length > max - 1) break;
      cut = s.index + s.segment.length;
    }
  }
  if (cut === 0) cut = max - 1;
  return clean.slice(0, cut).replace(/[\s,.;:!?]+$/, '') + '…';
}
