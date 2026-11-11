import type { Library } from './library-types';

/*
 * Client-side search over the content the page already has (MongoDB or the
 * snapshot, it makes no difference here). Case- and accent-insensitive
 * substring matching, which also works for Thai (no spaces between words).
 */
export interface Segment {
  text: string;
  hit: boolean;
}

export interface SearchHit {
  kind: 'pillar' | 'principle' | 'passage';
  key: string;
  href: string;
  title: Segment[];
  snippet: Segment[] | null;
  context: string;
  pillarSlug: string;
  pillarIndex: number;
}

interface Folded {
  folded: string;
  /** folded index -> index in the original string (plus one end sentinel). */
  map: number[];
}

interface Entry {
  hit: Omit<SearchHit, 'title' | 'snippet'>;
  title: string;
  text: string;
  foldedTitle: Folded;
  foldedText: Folded;
  base: number;
}

export type SearchIndex = Entry[];

function fold(text: string): Folded {
  let folded = '';
  const map: number[] = [];
  for (let i = 0; i < text.length; ) {
    const char = String.fromCodePoint(text.codePointAt(i)!);
    const plain = char
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase();
    for (let k = 0; k < plain.length; k++) {
      folded += plain[k];
      map.push(i);
    }
    i += char.length;
  }
  map.push(text.length);
  return { folded, map };
}

export function buildIndex(library: Library): SearchIndex {
  const entries: Entry[] = [];
  const add = (hit: Entry['hit'], title: string, text: string, base: number) =>
    entries.push({ hit, title, text, foldedTitle: fold(title), foldedText: fold(text), base });

  library.pillars.forEach((pillar, pillarIndex) => {
    const shared = { pillarSlug: pillar.slug, pillarIndex };
    add({ kind: 'pillar', key: `pillar-${pillar.slug}`, href: pillar.href, context: pillar.label, ...shared }, pillar.name, '', 300);
    for (const principle of pillar.principles) {
      add(
        { kind: 'principle', key: `principle-${principle.slug}`, href: principle.href, context: `${principle.positionLabel}, ${pillar.name}`, ...shared },
        principle.name,
        '',
        200,
      );
      for (const passage of principle.passages) {
        add(
          { kind: 'passage', key: passage.id, href: `${principle.href}#p-${passage.id}`, context: `${principle.name}, ${pillar.name}`, ...shared },
          passage.title,
          passage.text,
          0,
        );
      }
    }
  });
  return entries;
}

function ranges(source: Folded, terms: string[]): Array<[number, number]> {
  const found: Array<[number, number]> = [];
  for (const term of terms) {
    let from = 0;
    for (;;) {
      const at = source.folded.indexOf(term, from);
      if (at === -1) break;
      found.push([source.map[at]!, source.map[at + term.length]!]);
      from = at + term.length;
    }
  }
  found.sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [];
  for (const range of found) {
    const last = merged[merged.length - 1];
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
    else merged.push([...range]);
  }
  return merged;
}

function segments(text: string, hits: Array<[number, number]>, from = 0, to = text.length): Segment[] {
  const out: Segment[] = [];
  let cursor = from;
  for (const [start, end] of hits) {
    if (end <= from || start >= to) continue;
    const s = Math.max(start, from);
    const e = Math.min(end, to);
    if (s > cursor) out.push({ text: text.slice(cursor, s), hit: false });
    out.push({ text: text.slice(s, e), hit: true });
    cursor = e;
  }
  if (cursor < to) out.push({ text: text.slice(cursor, to), hit: false });
  return out;
}

const BEFORE = 70;
const LENGTH = 230;

/** A verbatim window of the text around the first match. */
function snippet(text: string, hits: Array<[number, number]>): Segment[] {
  let from = Math.max(0, (hits[0]?.[0] ?? 0) - BEFORE);
  if (from > 0) {
    const space = text.indexOf(' ', from);
    if (space !== -1 && space < from + 25) from = space + 1;
  }
  let to = Math.min(text.length, from + LENGTH);
  if (to < text.length) {
    const space = text.lastIndexOf(' ', to);
    if (space > to - 25) to = space;
  }
  const out = segments(text, hits, from, to);
  if (from > 0) out.unshift({ text: '… ', hit: false });
  if (to < text.length) out.push({ text: ' …', hit: false });
  return out;
}

export const MIN_QUERY = 2;

export function search(index: SearchIndex, query: string, limit = 30): SearchHit[] {
  const whole = fold(query).folded.trim().replace(/\s+/g, ' ');
  if (whole.length < MIN_QUERY) return [];
  const terms = [...new Set(whole.split(' '))].slice(0, 6);

  const scored: Array<{ score: number; order: number; hit: SearchHit }> = [];
  index.forEach((entry, order) => {
    const inTitle = terms.filter((term) => entry.foldedTitle.folded.includes(term)).length;
    const everywhere = terms.every(
      (term) => entry.foldedTitle.folded.includes(term) || entry.foldedText.folded.includes(term),
    );
    if (!everywhere) return;

    const titleHits = ranges(entry.foldedTitle, terms);
    const textHits = ranges(entry.foldedText, terms);
    let score = entry.base + inTitle * 40 + Math.min(textHits.length, 5) * 4;
    if (entry.foldedTitle.folded.includes(whole)) score += 30;
    else if (entry.foldedText.folded.includes(whole)) score += 15;

    scored.push({
      score,
      order,
      hit: {
        ...entry.hit,
        title: segments(entry.title, titleHits),
        snippet: entry.text ? snippet(entry.text, textHits) : null,
      },
    });
  });

  return scored
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, limit)
    .map((entry) => entry.hit);
}
