import type { LocalizedText, Reflection } from './types';

export interface LocalizedReflection extends LocalizedText {
  /** Language of the title actually shown ('en' when falling back). */
  titleLang: string;
  /** Language of the text actually shown ('en' when falling back). */
  textLang: string;
}

/**
 * Same rule as the original site, field by field: the page locale first, then
 * English. Returns null when the passage has neither, so nothing is invented.
 */
export function localizeReflection(reflection: Reflection, locale: string): LocalizedReflection | null {
  const own = reflection.translations[locale];
  const en = reflection.translations.en;
  const title = own?.title || en?.title || '';
  const text = own?.text || en?.text || '';
  if (!title && !text) return null;
  return {
    title,
    text,
    titleLang: own?.title ? locale : 'en',
    textLang: own?.text ? locale : 'en',
  };
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

/**
 * A verbatim lead-in: whole sentences from the start of the text, up to about
 * `max` characters. Falls back to a word-boundary cut for scripts without
 * sentence punctuation. Never rewrites the text.
 */
export function leadExcerpt(text: string, locale: string, max = 300): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  let out = '';
  if ('Segmenter' in Intl) {
    for (const s of new Intl.Segmenter(locale, { granularity: 'sentence' }).segment(clean)) {
      if (out && out.length + s.segment.length > max) break;
      out += s.segment;
      if (out.length > max) break;
    }
  }
  out = out.trim();
  if (!out || out.length > max * 1.35) return excerpt(clean, locale, max);
  return out;
}
