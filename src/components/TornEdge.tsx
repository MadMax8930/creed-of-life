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
  /** "left" / "right": a vertical tear along that side instead. */
  side?: 'left' | 'right';
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

function edgePath(seed: number, base: number, amplitude: number, vertical = false): string {
  const rand = rng(seed);
  const points: string[] = [];
  const at = (along: number, depth: number) =>
    vertical ? `${depth.toFixed(1)},${along.toFixed(1)}` : `${along.toFixed(1)},${depth.toFixed(1)}`;
  let x = 0;
  while (x < W) {
    const y = base + (rand() - 0.5) * amplitude + (rand() < 0.12 ? (rand() - 0.5) * amplitude * 1.6 : 0);
    points.push(at(x, Math.max(0, Math.min(H, y))));
    x += 6 + rand() * 22;
  }
  points.push(at(W, base));
  return `M0,0 L${points.join(' L')} L${at(W, 0)} Z`;
}

export default function TornEdge({ seed = 7, fill, fiber, direction = 'down', side, className }: TornEdgeProps) {
  const vertical = side !== undefined;
  const main = edgePath(seed, 18, 18, vertical);
  const core = fiber ? edgePath(seed + 101, 24, 16, vertical) : null;
  const flip = vertical ? (side === 'right' ? 'scaleX(-1)' : undefined) : direction === 'up' ? 'scaleY(-1)' : undefined;
  return (
    <svg
      className={['torn', vertical && 'torn--side', className].filter(Boolean).join(' ')}
      viewBox={vertical ? `0 0 ${H} ${W}` : `0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      style={flip ? { transform: flip } : undefined}
    >
      {core && <path d={core} fill={fiber} />}
      <path d={main} fill={fill} />
    </svg>
  );
}
