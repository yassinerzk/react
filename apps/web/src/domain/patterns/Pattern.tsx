import type { PatternId } from '@barakah/core';

interface PatternProps {
  id: PatternId;
  color: string;
  opacity: number;
  /** Unique suffix so multiple cards on one page do not share <pattern> ids. */
  uid: string;
}

/** Points of an 8-pointed star (two overlapping squares) centred at (cx, cy). */
function star8Points(cx: number, cy: number, outer: number): string {
  const inner = outer * 0.765;
  const pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / 8) * i;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(' ');
}

/**
 * Full-bleed tiled Islamic geometric patterns rendered as SVG so they stay
 * crisp at 1080x1920 export size. Each pattern is a pure function of a tile.
 */
export function Pattern({ id, color, opacity, uid }: PatternProps) {
  if (id === 'none' || opacity <= 0) return null;
  const pid = `pat-${id}-${uid}`;
  const T = 180;

  let tile: React.ReactNode;
  switch (id) {
    case 'star8': {
      const R = T * 0.33;
      tile = (
        <g fill="none" stroke={color} strokeWidth={2.5}>
          <polygon points={star8Points(T / 2, T / 2, R)} />
          <polygon points={star8Points(0, 0, R)} />
          <polygon points={star8Points(T, 0, R)} />
          <polygon points={star8Points(0, T, R)} />
          <polygon points={star8Points(T, T, R)} />
          <circle cx={T / 2} cy={T / 2} r={R * 0.28} />
        </g>
      );
      break;
    }
    case 'zellige': {
      // Ogee / quatrefoil lattice.
      const h = T / 2;
      const d = `M ${h} 0 C ${h + 40} 25, ${T} ${h - 40}, ${T} ${h} C ${T} ${h + 40}, ${h + 40} ${T - 25}, ${h} ${T} C ${h - 40} ${T - 25}, 0 ${h + 40}, 0 ${h} C 0 ${h - 40}, ${h - 40} 25, ${h} 0 Z`;
      tile = (
        <g fill="none" stroke={color} strokeWidth={2.5}>
          <path d={d} />
          <circle cx={h} cy={h} r={12} />
        </g>
      );
      break;
    }
    case 'lattice': {
      // Diagonal interlaced lattice (mashrabiya).
      tile = (
        <g fill="none" stroke={color} strokeWidth={2}>
          <path d={`M 0 ${T / 2} L ${T / 2} 0 L ${T} ${T / 2} L ${T / 2} ${T} Z`} />
          <path d={`M 0 0 L ${T} ${T} M ${T} 0 L 0 ${T}`} strokeOpacity={0.5} />
        </g>
      );
      break;
    }
    case 'dots': {
      tile = (
        <g fill={color}>
          <circle cx={T / 4} cy={T / 4} r={3} />
          <circle cx={(3 * T) / 4} cy={(3 * T) / 4} r={3} />
          <circle cx={(3 * T) / 4} cy={T / 4} r={1.5} />
          <circle cx={T / 4} cy={(3 * T) / 4} r={1.5} />
        </g>
      );
      break;
    }
  }

  return (
    <svg className="story-layer" viewBox="0 0 1080 1920" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <pattern id={pid} width={T} height={T} patternUnits="userSpaceOnUse">
          {tile}
        </pattern>
      </defs>
      <rect width="1080" height="1920" fill={`url(#${pid})`} opacity={opacity} />
    </svg>
  );
}
