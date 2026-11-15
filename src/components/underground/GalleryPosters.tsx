import type { PosterArt } from "@/data/underground";

const M = "#ff245e";
const Y = "#fcee0a";
const W = "#f1f1f1";
const K = "#08090d";

const type = { fontFamily: "var(--font-monument)", fontWeight: 800, textTransform: "uppercase" as const };

/** Six original posters, drawn in SVG (400×500). */
const ART: Record<PosterArt, React.ReactNode> = {
  transit: (
    <>
      <rect width="400" height="500" fill="#0d0a10" />
      <g fill="none" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M40 90 H250 L330 170 V440" stroke={W} opacity="0.85" />
        <path d="M70 440 V260 L170 160 H360" stroke={M} />
        <path d="M40 330 H200 L280 410 H370" stroke="#7a1030" />
      </g>
      {[[40, 90], [150, 90], [250, 90], [330, 250], [330, 440], [70, 440], [70, 330], [170, 160], [280, 160], [200, 330], [280, 410]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="9" fill={i % 3 === 1 ? M : K} stroke={W} strokeWidth="3" />
      ))}
      <text x="40" y="52" fill={W} fontSize="26" style={type}>Meridian line</text>
      <text x="360" y="482" fill={M} fontSize="15" textAnchor="end" style={{ fontFamily: "var(--font-mono)" }}>9 STATIONS RESTORED</text>
    </>
  ),
  static: (
    <>
      <rect width="400" height="500" fill={M} />
      {Array.from({ length: 11 }, (_, i) => (
        <circle key={i} cx="200" cy="215" r={18 + i * 19} fill="none" stroke={K} strokeWidth={i % 2 ? 2 : 6} />
      ))}
      <rect x="0" y="330" width="400" height="170" fill={K} />
      <text x="200" y="455" fill={M} fontSize="150" textAnchor="middle" style={{ ...type, letterSpacing: "-4px" }}>88.7</text>
    </>
  ),
  lantern: (
    <>
      <rect width="400" height="500" fill="#0b090d" />
      {Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2;
        return <line key={i} x1={200 + Math.cos(a) * 78} y1={210 + Math.sin(a) * 78} x2={200 + Math.cos(a) * (150 + (i % 2) * 40)} y2={210 + Math.sin(a) * (150 + (i % 2) * 40)} stroke={Y} strokeWidth="3" opacity="0.8" />;
      })}
      <path d="M160 150 H240 L256 260 H144 Z" fill={Y} />
      <rect x="150" y="132" width="100" height="18" fill={W} />
      <rect x="140" y="260" width="120" height="16" fill={W} />
      <path d="M176 132 Q200 86 224 132" fill="none" stroke={W} strokeWidth="6" />
      <text x="200" y="420" fill={W} fontSize="44" textAnchor="middle" style={type}>Someone left</text>
      <text x="200" y="466" fill={Y} fontSize="44" textAnchor="middle" style={type}>the light on</text>
    </>
  ),
  sunrise: (
    <>
      <rect width="400" height="500" fill="#110810" />
      <circle cx="200" cy="230" r="130" fill={M} />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x="50" y={236 + i * 16} width="300" height={3 + i * 1.6} fill="#110810" />
      ))}
      <circle cx="200" cy="230" r="96" fill="#110810" />
      <text x="200" y="244" fill={W} fontSize="30" textAnchor="middle" style={type}>Cancelled</text>
      <text x="200" y="440" fill={W} fontSize="46" textAnchor="middle" style={type}>No sunrise</text>
      <text x="200" y="478" fill={M} fontSize="24" textAnchor="middle" style={type}>scheduled</text>
    </>
  ),
  lowend: (
    <>
      <rect width="400" height="500" fill={K} />
      {["The", "Low", "End"].map((word, i) => (
        <text
          key={word}
          x="200"
          y={150 + i * 138}
          fill={i === 1 ? M : "none"}
          stroke={i === 1 ? "none" : W}
          strokeWidth="2"
          fontSize="170"
          textAnchor="middle"
          transform={`skewX(${[-8, 6, -4][i]})`}
          style={{ ...type, letterSpacing: "-6px" }}
        >
          {word}
        </text>
      ))}
      <rect x="30" y="462" width="340" height="2" fill={M} />
      <text x="30" y="486" fill={W} fontSize="14" style={{ fontFamily: "var(--font-mono)" }}>SUBLEVEL 9 — DOORS: NEVER</text>
    </>
  ),
  breaker: (
    <>
      <rect width="400" height="500" fill={Y} />
      <rect x="120" y="70" width="160" height="280" fill={K} />
      <rect x="150" y="100" width="100" height="220" fill="#1c1c20" />
      <rect x="165" y="110" width="70" height="110" fill={M} />
      <text x="200" y="176" fill={K} fontSize="34" textAnchor="middle" style={type}>On</text>
      <text x="200" y="290" fill="#55555c" fontSize="34" textAnchor="middle" style={type}>Off</text>
      <text x="200" y="418" fill={K} fontSize="52" textAnchor="middle" style={type}>We kept</text>
      <text x="200" y="468" fill={K} fontSize="52" textAnchor="middle" style={type}>the power</text>
    </>
  ),
};

export function Poster({ art, title }: { art: PosterArt; title: string }) {
  return (
    <svg viewBox="0 0 400 500" className="block size-full" role="img" aria-label={`Poster: ${title}`}>
      {ART[art]}
    </svg>
  );
}
