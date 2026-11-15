"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { createUndergroundTimeline, playUndergroundIntro } from "@/animations/undergroundAnimations";
import { MARQUEE } from "@/data/underground";
import { progress, subscribeProgress } from "@/lib/progress";
import { useExperienceStore } from "@/store/experienceStore";
import { AlleyBackdrop } from "./AlleyBackdrop";
import { ClubInterior } from "./ClubInterior";
import { Hotspot, HotspotCounter, HotspotPanel, HotspotProvider } from "./NeonHotspots";
import { TunnelRun } from "./TunnelRun";
import { UndergroundGallery } from "./UndergroundGallery";

const TITLE = ["Neon", "Underground"];
const frame = "absolute inset-x-[var(--hud-pad)]";
const bottom = "bottom-[calc(var(--hud-h)+var(--hud-pad)*2.5)]";

/**
 * ACT 03 — Sublevel 9. Alley → club → the wall (horizontal) → service
 * tunnel → dark. Built from SVG, CSS and type; one scrubbed GSAP timeline.
 */
export function UndergroundScene({ active }: { active: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useExperienceStore((s) => s.capabilities.reducedMotion);
  // The displacement filter is the one costly effect of the act: top tier only.
  const lightweight = useExperienceStore((s) => s.capabilities.tier !== "high");

  useEffect(() => {
    const root = rootRef.current;
    if (!active || !root) return;
    const ctx = gsap.context(() => playUndergroundIntro(root, reducedMotion), root);
    return () => ctx.revert();
  }, [active, reducedMotion]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let timeline: gsap.core.Timeline | undefined;
    let ctx: gsap.Context | undefined;
    let resizeTimer: number | undefined;

    const build = () => {
      ctx?.revert();
      ctx = gsap.context(() => {
        timeline = createUndergroundTimeline(root, { reducedMotion, lightweight });
      }, root);
      timeline?.progress(progress.scenes.underground);
    };
    build();

    const unsubscribe = subscribeProgress(({ scenes }) => timeline?.progress(scenes.underground));
    // The horizontal distance is measured, so rebuild when the layout changes.
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(build, 200);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(resizeTimer);
      unsubscribe();
      ctx?.revert();
    };
  }, [reducedMotion, lightweight]);

  return (
    <HotspotProvider>
      <div ref={rootRef} className="relative h-full overflow-hidden bg-[#050408] text-ns-white">
        <svg className="absolute size-0" aria-hidden>
          <filter id="ug-distort" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.006 0.09" numOctaves="1" seed="7" result="noise" />
            <feDisplacementMap data-ug="displace" in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>

        <div data-ug="world" className="absolute inset-0">
          {/* 1 — the alley */}
          <div data-ug="alley" className="absolute inset-0">
            <div data-ug="alley-art" className="absolute inset-0 origin-[50%_47.8%] will-change-transform">
              <AlleyBackdrop />
            </div>
            <div data-ug="alley-signs" className="absolute inset-0 origin-[50%_47.8%]">
              <Hotspot id="noodle" className="absolute left-[5%] top-[20%] [transform:perspective(40rem)_rotateY(34deg)] max-sm:left-[2%] max-sm:top-[14%]">
                <span className="ns-neon-box block px-4 py-3 text-left">
                  <span className="ns-monument ns-neon block text-[clamp(2rem,5vw,4.5rem)]">Orbit</span>
                  <span className="ns-monument block text-[clamp(2rem,5vw,4.5rem)] text-ns-white">Noodle</span>
                  <span className="ns-label mt-1 block text-ns-magenta">Level −9 ↓</span>
                </span>
              </Hotspot>
              <Hotspot id="notice" className="absolute right-[7%] top-[47%] [transform:perspective(40rem)_rotateY(-30deg)] max-sm:right-[3%] max-sm:top-[40%]">
                <span className="ns-scanned block w-[9.5rem] border border-ns-white/40 bg-ns-black/80 p-3 text-left">
                  <span className="ns-label block text-ns-magenta">Notice 2069</span>
                  <span className="mt-1 block h-1 w-full bg-ns-white/50" />
                  <span className="mt-1 block h-1 w-4/5 bg-ns-white/30" />
                  <span className="mt-1 block h-1 w-3/5 bg-ns-white/30" />
                  <span className="ns-label mt-2 block text-ns-white">Read ▸</span>
                </span>
              </Hotspot>
              <p className="ns-label ns-neon ns-flicker absolute left-1/2 top-[33%] -translate-x-1/2 whitespace-nowrap [animation-delay:-2s]" aria-hidden>
                ↓ The Low End ↓
              </p>
              <p className="ns-monument absolute bottom-[30%] left-[19%] text-[clamp(1rem,2.2vw,2rem)] leading-none text-ns-white/70 [transform:perspective(40rem)_rotateY(38deg)] max-md:hidden" aria-hidden>
                No signal
                <br />
                <span className="text-ns-magenta">no masters</span>
              </p>
              <p className="ns-monument ns-neon ns-flicker absolute right-[9%] top-[17%] text-[clamp(2.5rem,6vw,5.5rem)] [transform:perspective(40rem)_rotateY(-34deg)]" aria-hidden>
                88.7
              </p>
            </div>
            <div className="ns-fog pointer-events-none absolute inset-0" aria-hidden />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#050408] via-[#050408]/50 to-transparent" aria-hidden />

            <div className={`pointer-events-none ${frame} ${bottom}`}>
              <p data-ug="alley-copy" className="ns-label mb-3 text-accent">
                Act 03 — sublevel 9
              </p>
              <h2 data-ug="title" aria-label="Neon Underground" className="ns-monument text-[clamp(3rem,11.5vw,12.5rem)]">
                {TITLE.map((word, w) => (
                  <span key={word} className="block overflow-hidden pb-[0.06em]" aria-hidden>
                    <span data-ug="title-line" className={`ns-chroma inline-block ${w === 0 ? "text-accent" : "text-ns-white"}`}>
                      {word.split("").map((letter, i) => (
                        <span key={i} data-ug="letter" className="inline-block will-change-transform">
                          {letter}
                        </span>
                      ))}
                    </span>
                  </span>
                ))}
              </h2>
              <p data-ug="alley-copy" className="mt-4 max-w-[34ch] text-base leading-snug text-ns-white/85 sm:text-lg">
                Below map depth. Signals are hidden down here — look for the <span className="text-accent">◆</span> marks.
              </p>
            </div>
          </div>

          {/* 2 — the club */}
          <div data-ug="club" className="invisible absolute inset-0">
            <div data-ug="club-inner" className="absolute inset-0 will-change-transform">
              <ClubInterior />
            </div>
            <div data-ug="club-copy" className={`pointer-events-none invisible ${frame} ${bottom}`}>
              <div className="max-w-md border-l border-accent pl-5">
                <p className="ns-label text-accent">Forty-seven floors under the Spire</p>
                <p className="mt-2 text-lg leading-snug text-ns-white sm:text-xl">
                  When the surface clocks out, the night shift clocks in.
                </p>
              </div>
            </div>
          </div>

          {/* Type crossing between club and wall */}
          <div data-ug="marquee" className="pointer-events-none invisible absolute inset-0 flex flex-col justify-center gap-[2vh] overflow-hidden" aria-hidden>
            {["marquee-a", "marquee-b"].map((row, r) => (
              <p key={row} data-ug={row} className={`ns-monument w-max whitespace-nowrap text-[clamp(4rem,16vw,15rem)] ${r ? "ns-outline" : "ns-chroma text-ns-magenta"}`} style={r ? undefined : { ["--ca" as string]: "0.035em" }}>
                {[...MARQUEE, ...MARQUEE].slice(r * 2, r * 2 + 4).join(" — ")} —
              </p>
            ))}
          </div>

          {/* 3 — the wall */}
          <div data-ug="gallery" className="invisible absolute inset-0">
            <UndergroundGallery />
          </div>

          {/* 4 — the service tunnel */}
          <div data-ug="tunnel" className="invisible absolute inset-0">
            <TunnelRun />
            <div data-ug="tunnel-copy" className="pointer-events-none invisible absolute inset-0 grid place-items-center px-[var(--hud-pad)]">
              <p className="ns-monument ns-chroma text-center text-[length:var(--text-monument)] text-ns-white" style={{ ["--ca" as string]: "0.03em" }}>
                Reality is <span className="text-accent">optional.</span>
              </p>
            </div>
            <div data-ug="hatch" className="invisible absolute left-[var(--hud-pad)] top-[30%]">
              <Hotspot id="hatch">
                <span className="ns-scanned block border border-ns-magenta bg-ns-black/85 px-3 py-2 text-left">
                  <span className="ns-label block text-ns-magenta">Hatch 88.7</span>
                  <span className="ns-label block text-ns-white">Open ▸</span>
                </span>
              </Hotspot>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute left-[var(--hud-pad)] top-[calc(var(--hud-h)+var(--hud-pad)*1.75)] z-20">
          <HotspotCounter />
        </div>
        <HotspotPanel />

        <div data-ug="cover" className="pointer-events-none invisible absolute inset-0 z-40 grid place-items-center bg-ns-black">
          <p data-ug="lost" className="ns-label invisible text-ns-magenta">
            Signal lost
          </p>
        </div>
      </div>
    </HotspotProvider>
  );
}
