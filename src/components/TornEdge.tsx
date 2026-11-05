/**
 * A torn-paper edge, echoing the torn statue artwork that already defines the
 * CreedOfLife brand. Rendered as static SVG on the server: no client JS.
 *
 * `fill` is the colour of the shape being torn; `fiber` is the lighter paper
 * core that shows along a real tear.
 */
interface TornEdgeProps {
  seed?: number;
  fill: string;
  fiber?: string;
  /** "down": the torn shape hangs from the top. "up": rises from the bottom. */
  direction?: 'down' | 'up';
  className?: string;
}

function rng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const W = 1200;
const H = 40;

function edgePath(seed: number, base: number, amplitude: number): string {
  const rand = rng(seed);
  const points: string[] = [];
  let x = 0;
  while (x < W) {
    const y = base + (rand() - 0.5) * amplitude + (rand() < 0.12 ? (rand() - 0.5) * amplitude * 1.6 : 0);
    points.push(`${x.toFixed(1)},${Math.max(0, Math.min(H, y)).toFixed(1)}`);
    x += 6 + rand() * 22;
  }
  points.push(`${W},${base.toFixed(1)}`);
  return `M0,0 L${points.join(' L')} L${W},0 Z`;
}

export default function TornEdge({ seed = 7, fill, fiber, direction = 'down', className }: TornEdgeProps) {
  const main = edgePath(seed, 18, 18);
  const core = fiber ? edgePath(seed + 101, 24, 16) : null;
  return (
    <svg
      className={['torn', className].filter(Boolean).join(' ')}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      style={direction === 'up' ? { transform: 'scaleY(-1)' } : undefined}
    >
      {core && <path d={core} fill={fiber} />}
      <path d={main} fill={fill} />
    </svg>
  );
}
