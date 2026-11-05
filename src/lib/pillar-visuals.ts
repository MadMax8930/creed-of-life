import type { StaticImageData } from 'next/image';
import adaptability from '@/assets/images/adaptability.jpg';
import confidence from '@/assets/images/confidence.jpg';
import discipline from '@/assets/images/discipline.jpg';

export interface PillarVisual {
  image: StaticImageData;
  /** Ink color sampled from the pillar's own landscape photograph. */
  color: string;
}

/*
 * Each pillar keeps the landscape photograph it already had on the site.
 * Its color comes from that photo, so color always tells you which pillar
 * you are reading.
 */
const VISUALS: Record<string, PillarVisual> = {
  confidence: { image: confidence, color: '#3b6326' }, // mountain moss
  discipline: { image: discipline, color: '#26357f' }, // city at night
  adaptability: { image: adaptability, color: '#a8431a' }, // canyon rock
};

const ORDERED = [VISUALS.confidence!, VISUALS.discipline!, VISUALS.adaptability!];

export function pillarVisual(slug: string, position: number): PillarVisual {
  return VISUALS[slug] ?? ORDERED[position % ORDERED.length]!;
}
