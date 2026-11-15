import { Hotspot } from "./NeonHotspots";

// Deterministic crowd: [x %, head radius, height]
const CROWD = Array.from({ length: 26 }, (_, i) => {
  const wave = Math.sin(i * 12.9898) * 43758.5453;
  const r = wave - Math.floor(wave);
  return { x: (i / 25) * 104 - 2, size: 3.2 + r * 2.2, lift: r * 5 + (i % 3) * 1.5 };
});

function Speaker({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 80 200" className={className} aria-hidden>
      <rect width="80" height="200" fill="#0a070c" stroke="#3a1426" />
      {[36, 100, 164].map((cy, i) => (
        <g key={cy} className="ns-cone" style={{ transformOrigin: `40px ${cy}px` }}>
          <circle cx="40" cy={cy} r={i === 0 ? 14 : 26} fill="#120a12" stroke="#ff245e" strokeWidth="1.5" />
          <circle cx="40" cy={cy} r={i === 0 ? 5 : 9} fill="#ff245e" opacity="0.75" />
        </g>
      ))}
    </svg>
  );
}

/** Inside The Low End: sign, beams, speaker stacks, crowd, hacked adverts. */
export function ClubInterior() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[radial-gradient(ellipse_at_50%_30%,#4a0a22_0%,#1a0510_45%,#060308_100%)]">
      {/* LED strips on the back wall */}
      <div className="absolute inset-x-0 top-[18%] h-px bg-ns-magenta/60 shadow-[0_0_30px_6px_rgb(255_36_94/0.45)]" aria-hidden />
      <div className="absolute inset-x-0 top-[58%] h-px bg-ns-magenta/30" aria-hidden />

      {/* Light beams */}
      <div className="absolute inset-0" aria-hidden>
        {[-34, -16, 0, 17, 33].map((angle, i) => (
          <div key={angle} className="ns-beam" style={{ ["--angle" as string]: `${angle}deg`, animationDelay: `${i * -1.3}s` }} />
        ))}
      </div>

      {/* The sign is a hotspot. */}
      {/* Soft halo behind the sign: one gradient instead of a huge text blur. */}
      <div className="absolute inset-x-[8%] top-[12%] h-[38%] bg-[radial-gradient(ellipse_at_center,rgb(255_36_94/0.38),transparent_68%)]" aria-hidden />
      <div data-ug="club-sign" className="absolute inset-x-0 top-[21%] flex justify-center px-4">
        <Hotspot id="lowend" className="block">
          <span className="ns-neon ns-monument block text-center text-[clamp(3.5rem,13vw,13rem)]">The Low End</span>
        </Hotspot>
      </div>

      {/* Hacked adverts */}
      <div className="absolute left-[16%] top-[47%] hidden w-[17rem] -rotate-2 border border-ns-gray/40 bg-ns-black/70 p-4 lg:block" aria-hidden>
        <p className="ns-label text-ns-cyan/70">Neural Lease</p>
        <p className="ns-monument mt-1 text-3xl text-ns-white/60 line-through decoration-ns-magenta decoration-4">Forget responsibly</p>
        <p className="ns-monument -mt-1 rotate-[-4deg] text-4xl text-ns-magenta">Remember for free</p>
      </div>
      <div className="absolute right-[16%] top-[46%] hidden w-[15rem] rotate-2 border border-ns-magenta/60 bg-ns-black/70 p-4 text-right lg:block" aria-hidden>
        <p className="ns-label text-ns-magenta">Tonight</p>
        <p className="ns-monument mt-1 text-5xl text-ns-white">Static</p>
        <p className="ns-label mt-2 text-ns-gray">88.7 live — doors: never</p>
      </div>

      {/* Speaker stacks; one carries a hotspot. */}
      <Speaker className="absolute bottom-[12%] left-[2%] h-[46%] max-md:left-[-6%] max-md:h-[34%]" />
      <Speaker className="absolute bottom-[12%] right-[2%] h-[46%] max-md:right-[-6%] max-md:h-[34%]" />
      <Hotspot id="complaint" className="absolute bottom-[40%] right-[calc(2%+2.5rem)] max-md:bottom-[36%] max-md:right-6" />

      {/* Equaliser wall and crowd */}
      <div className="absolute inset-x-[14%] bottom-[20%] flex h-[16%] items-end gap-[1.2%] opacity-60" aria-hidden>
        {Array.from({ length: 22 }, (_, i) => (
          <span key={i} className="ns-eqbar flex-1 bg-ns-magenta" style={{ animationDelay: `${(i * 137) % 900}ms` }} />
        ))}
      </div>
      <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[34%] w-full" aria-hidden>
        {CROWD.map((p, i) => (
          <g key={i} fill="#040306" stroke="#ff245e" strokeWidth="0.12" strokeOpacity="0.55">
            <rect x={p.x - p.size * 0.9} y={16 - p.lift + p.size * 0.6} width={p.size * 1.8} height={30} rx={p.size * 0.5} />
            <ellipse cx={p.x} cy={14 - p.lift} rx={p.size * 0.42} ry={p.size * 0.9} />
          </g>
        ))}
      </svg>
      <div className="absolute inset-0 bg-[linear-gradient(to_top,#060308_4%,transparent_40%)]" aria-hidden />
    </div>
  );
}
