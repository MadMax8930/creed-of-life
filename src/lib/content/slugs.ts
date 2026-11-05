/**
 * Stable URL slugs. Pillar and principle names in MongoDB are the English
 * keys used by `pillarsJSON` / `branchesJSON`, so slugs derive from them.
 */
const PILLAR_SLUGS: Record<string, string> = {
  'Confidence in Oneself': 'confidence',
  Discipline: 'discipline',
  Adaptability: 'adaptability',
};

export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function pillarSlug(name: string): string {
  return PILLAR_SLUGS[name] ?? slugify(name);
}

export function principleSlug(name: string): string {
  return slugify(name);
}
