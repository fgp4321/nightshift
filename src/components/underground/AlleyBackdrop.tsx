/**
 * The alley into Sublevel 9, drawn procedurally as one-point-perspective SVG.
 * 1600×900, vanishing point at (800, 430) — where the club door is.
 */
const VP = { x: 800, y: 430 };
const WALL = { near: 0, far: 690, top: 330, bottom: 560 };

/** Y of the wall's top and bottom edges at a given x on the left wall. */
const edge = (x: number) => ({
  top: (x / WALL.far) * WALL.top,
  bottom: 900 - (x / WALL.far) * (900 - WALL.bottom),
});

// Perspective-spaced vertical seams along a wall.
const SEAMS = [70, 215, 340, 445, 530, 598, 650];
// Lit window slits: [seam index, vertical position 0–1, colour]
const WINDOWS: [number, number, string][] = [
  [0, 0.22, "#ff245e"], [1, 0.4, "#ff245e"], [1, 0.16, "#7a1030"], [2, 0.3, "#ff245e"],
  [3, 0.48, "#7a1030"], [3, 0.2, "#ff245e"], [4, 0.34, "#ff245e"], [5, 0.26, "#7a1030"],
];

function Wall({ mirrored }: { mirrored?: boolean }) {
  return (
    <g transform={mirrored ? "translate(1600 0) scale(-1 1)" : undefined}>
      <polygon points={`0,0 ${WALL.far},${WALL.top} ${WALL.far},${WALL.bottom} 0,900`} fill="#0a080d" />
      {/* Courses converging on the vanishing point. */}
      {[0.12, 0.3, 0.5, 0.7, 0.88].map((t) => (
        <line key={t} x1={0} y1={t * 900} x2={WALL.far} y2={WALL.top + t * (WALL.bottom - WALL.top)} stroke="#1a141f" strokeWidth={1.5} />
      ))}
      {SEAMS.map((x) => (
        <line key={x} x1={x} y1={edge(x).top} x2={x} y2={edge(x).bottom} stroke="#17121c" strokeWidth={2} />
      ))}
      {WINDOWS.map(([seam, v, color], i) => {
        const x0 = SEAMS[seam] + 14;
        const x1 = SEAMS[seam + 1] - 14;
        const y = (x: number) => edge(x).top + v * (edge(x).bottom - edge(x).top);
        const h = (x: number) => (edge(x).bottom - edge(x).top) * 0.09;
        return (
          <polygon
            key={i}
            points={`${x0},${y(x0)} ${x1},${y(x1)} ${x1},${y(x1) + h(x1)} ${x0},${y(x0) + h(x0)}`}
            fill={color}
            opacity={mirrored ? 0.5 : 0.7}
          />
        );
      })}
      {/* Pipes running the length of the wall, and two risers. */}
      {[0.62, 0.68].map((t, i) => (
        <g key={t}>
          <line x1={0} y1={t * 900} x2={WALL.far} y2={WALL.top + t * (WALL.bottom - WALL.top)} stroke="#211a26" strokeWidth={i ? 9 : 16} />
          <line x1={0} y1={t * 900 - 3} x2={WALL.far} y2={WALL.top + t * (WALL.bottom - WALL.top) - 1} stroke="#3a2a3c" strokeWidth={1.5} />
        </g>
      ))}
      {[150, 400].map((x) => (
        <g key={x}>
          <line x1={x} y1={edge(x).top} x2={x} y2={edge(x).bottom} stroke="#1c1621" strokeWidth={x < 200 ? 22 : 12} />
          <rect x={x - (x < 200 ? 15 : 9)} y={edge(x).top + 120 - x * 0.1} width={x < 200 ? 30 : 18} height={10} fill="#2c2231" />
        </g>
      ))}
    </g>
  );
}

export function AlleyBackdrop() {
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden>
      <defs>
        <radialGradient id="ug-glow" cx="50%" cy="47.8%" r="42%">
          <stop offset="0" stopColor="#ff245e" stopOpacity="0.55" />
          <stop offset="0.45" stopColor="#8a1034" stopOpacity="0.22" />
          <stop offset="1" stopColor="#050408" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ug-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b0a16" />
          <stop offset="1" stopColor="#060408" />
        </linearGradient>
        <linearGradient id="ug-wet" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff245e" stopOpacity="0.75" />
          <stop offset="1" stopColor="#ff245e" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="1600" height="900" fill="#050408" />
      <rect width="1600" height="900" fill="url(#ug-glow)" />

      {/* Ceiling and its cables. */}
      <polygon points={`0,0 1600,0 ${1600 - WALL.far},${WALL.top} ${WALL.far},${WALL.top}`} fill="#060509" />
      {[[120, 1480, 130], [300, 1300, 190], [470, 1130, 245], [585, 1015, 285]].map(([a, b, sag]) => (
        <path key={a} d={`M${a} ${edge(a).top} Q800 ${edge(a).top + sag} ${b} ${edge(a).top}`} stroke="#1d1622" strokeWidth={a < 200 ? 4 : 2.5} fill="none" />
      ))}

      {/* Floor: wet concrete with the door's light dragged across it. */}
      <polygon points={`0,900 ${WALL.far},${WALL.bottom} ${1600 - WALL.far},${WALL.bottom} 1600,900`} fill="url(#ug-floor)" />
      <polygon points={`${VP.x - 60},${WALL.bottom} ${VP.x + 60},${WALL.bottom} ${VP.x + 300},900 ${VP.x - 300},900`} fill="url(#ug-wet)" opacity="0.5" />
      {[0.25, 0.5, 0.78].map((t) => (
        <line key={t} x1={WALL.far - t * WALL.far} y1={WALL.bottom + t * (900 - WALL.bottom)} x2={1600 - WALL.far + t * WALL.far} y2={WALL.bottom + t * (900 - WALL.bottom)} stroke="#2a1424" strokeWidth={1 + t * 2} />
      ))}

      <Wall />
      <Wall mirrored />

      {/* End wall and the door of The Low End. */}
      <rect x={WALL.far} y={WALL.top} width={1600 - WALL.far * 2} height={WALL.bottom - WALL.top} fill="#09070c" />
      <rect x={VP.x - 52} y={372} width={104} height={188} fill="#ff245e" />
      <rect x={VP.x - 52} y={372} width={104} height={188} fill="none" stroke="#ffd0dc" strokeWidth={2} />
      <rect x={VP.x - 70} y={356} width={140} height={8} fill="#ff245e" opacity="0.8" />
    </svg>
  );
}
