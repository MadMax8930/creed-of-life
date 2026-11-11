/*
 * The nine principle emblems: one hand-drawn set, not stock icons.
 *
 * Shared grammar, so they read as a collection:
 *   - a 64 x 64 grid, 2.5 stroke, round caps and joins (echoing the display type)
 *   - outline forms, plus one dominant solid shape that carries the idea
 *   - `currentColor` only, so each emblem takes its pillar's colour
 *
 * Purely decorative: the principle's name is always printed next to it.
 */
const EMBLEMS: Record<string, React.ReactNode> = {
  // Pillar I - Confidence in Oneself
  // An eye that looks inward: the solid pupil is the self being observed.
  'self-awareness': (
    <>
      <path d="M5 32C15 17 49 17 59 32C49 47 15 47 5 32Z" />
      <circle cx="32" cy="32" r="10" />
      <circle cx="32" cy="32" r="4.5" className="emblem__solid" />
    </>
  ),
  // Two peaks that stay put; the sun comes back over them.
  resilience: (
    <>
      <path d="M4 53L23 19L33 36L41 26L60 53Z" />
      <path d="M16.5 30.5L23 36L28.5 29" />
      <circle cx="50" cy="13" r="5" className="emblem__solid" />
    </>
  ),
  // A committed step forward: the solid head is the decision.
  action: (
    <>
      <path d="M6 32H42" />
      <path d="M6 19H20" />
      <path d="M6 45H20" />
      <path d="M40 19L59 32L40 45Z" className="emblem__solid" />
    </>
  ),
  // Pillar II - Discipline
  // A compass: conduct that keeps its bearing.
  behavior: (
    <>
      <circle cx="32" cy="32" r="25" />
      <path d="M32 3V9M32 55V61M3 32H9M55 32H61" />
      <g transform="rotate(38 32 32)">
        <path d="M32 14L39 32L32 50L25 32Z" />
        <path d="M32 14L39 32H25Z" className="emblem__solid" />
      </g>
    </>
  ),
  // Thoughts held together: connected points around one clear centre.
  mind: (
    <>
      <path d="M32 31L14 17M32 31L47 12M32 31L53 40M32 31L21 51M14 17L47 12M53 40L21 51" />
      <circle cx="14" cy="17" r="3.5" className="emblem__solid" />
      <circle cx="47" cy="12" r="3.5" className="emblem__solid" />
      <circle cx="53" cy="40" r="3.5" className="emblem__solid" />
      <circle cx="21" cy="51" r="3.5" className="emblem__solid" />
      <circle cx="32" cy="31" r="7" className="emblem__solid" />
    </>
  ),
  // Steps that only go up.
  upgrade: (
    <>
      <path d="M5 55H19V43H33V31H47V19H59" />
      <circle cx="53" cy="9" r="5" className="emblem__solid" />
    </>
  ),
  // Pillar III - Adaptability
  // Moving with the water rather than against it.
  flexibility: (
    <>
      <path d="M4 29C13 15 23 15 32 29S51 43 60 29" />
      <path d="M4 45C13 31 23 31 32 45S51 59 60 45" />
      <circle cx="18" cy="9" r="5" className="emblem__solid" />
    </>
  ),
  // An open book, and what grows out of it.
  'learning-mindset': (
    <>
      <path d="M32 24C26 18 14 18 5 22V52C14 48 26 48 32 54C38 48 50 48 59 52V22C50 18 38 18 32 24Z" />
      <path d="M32 24V54" />
      <path d="M32 3L37 10.5L32 18L27 10.5Z" className="emblem__solid" />
    </>
  ),
  // Two weights, level, on one steady point.
  'emotional-balance': (
    <>
      <path d="M6 31H58" />
      <circle cx="15" cy="20" r="8" />
      <circle cx="49" cy="20" r="8" />
      <path d="M32 33L43 55H21Z" className="emblem__solid" />
    </>
  ),
};

/** Used if a principle is ever added in MongoDB before it gets its own emblem. */
const FALLBACK = (
  <>
    <circle cx="32" cy="32" r="24" />
    <circle cx="32" cy="32" r="6" className="emblem__solid" />
  </>
);

export const EMBLEM_SLUGS = Object.keys(EMBLEMS);

export default function PrincipleEmblem({ slug, className }: { slug: string; className?: string }) {
  return (
    <svg
      className={['emblem', className].filter(Boolean).join(' ')}
      data-emblem={slug in EMBLEMS ? slug : 'fallback'}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {EMBLEMS[slug] ?? FALLBACK}
    </svg>
  );
}
