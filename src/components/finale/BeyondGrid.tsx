"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { createFinaleTimeline, playFinaleIntro } from "@/animations/finaleAnimations";
import { restartExperience, travelToScene } from "@/animations/transitions";
import { CyberButton } from "@/components/ui/CyberButton";
import { SCENES } from "@/data/scenes";
import { subscribeProgress } from "@/lib/progress";
import { useExperienceStore } from "@/store/experienceStore";
import { FinaleSkyline } from "./FinaleSkyline";

const STATEMENT = ["The future", "is not", "waiting."];

const CREDITS: [role: string, credit: string][] = [
  ["World, design & code", "NIGHT//SHIFT — original work"],
  ["3D", "Procedural geometry and GLSL, React Three Fiber"],
  ["Motion", "GSAP, Lenis, Motion"],
  ["Sound", "Synthesised live with Web Audio"],
  ["Type", "Orbitron, Space Grotesk, JetBrains Mono, Barlow Condensed (SIL OFL)"],
];

/** ACT 04 — the last scene: the city goes dark and the statement is made. */
export function BeyondGrid({ active }: { active: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useExperienceStore((s) => s.capabilities.reducedMotion);
  const worlds = SCENES.filter((scene) => scene.id !== "beyond");

  useEffect(() => {
    const root = rootRef.current;
    if (!active || !root) return;
    const ctx = gsap.context(() => playFinaleIntro(root), root);
    return () => ctx.revert();
  }, [active]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let timeline: gsap.core.Timeline | undefined;
    const ctx = gsap.context(() => {
      timeline = createFinaleTimeline(root, reducedMotion);
    }, root);
    const unsubscribe = subscribeProgress(({ scenes }) => timeline?.progress(scenes.beyond));
    return () => {
      unsubscribe();
      ctx.revert();
    };
  }, [reducedMotion]);

  return (
    <div ref={rootRef} className="relative h-full overflow-hidden bg-ns-black text-ns-white">
      <div data-fin="world" className="absolute inset-0">
        <FinaleSkyline reducedMotion={reducedMotion} />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,transparent_20%,#08090d_78%)]" aria-hidden />

        {/* The statement */}
        <h2
          data-fin="statement"
          aria-label="The future is not waiting."
          className="ns-monument pointer-events-none absolute inset-0 flex flex-col justify-center px-[var(--hud-pad)] text-[clamp(3.5rem,min(19vw,27vh),21rem)]"
        >
          {STATEMENT.map((line, i) => (
            <span key={line} className="block overflow-hidden pb-[0.05em]" aria-hidden>
              <span data-fin="line" className={`block will-change-transform ${i === 2 ? "text-ns-yellow" : ""}`}>
                {line}
              </span>
            </span>
          ))}
        </h2>

        {/* The wordmark */}
        <div data-fin="brand" className="pointer-events-none invisible absolute inset-0 grid place-items-center px-[var(--hud-pad)]">
          <div data-fin="brand-inner" className="w-full text-center will-change-transform">
            <p className="ns-label mb-4 text-ns-gray">End of transmission</p>
            <p data-fin="wordmark" className="ns-monument ns-chroma text-[clamp(3rem,15.5vw,17rem)]">
              NIGHT<span className="text-ns-yellow">{"//"}</span>SHIFT
            </p>
            <div data-fin="rule" className="mx-auto mt-6 h-px w-[min(40rem,70%)] origin-center bg-ns-yellow" />
            <p data-fin="welcome" className="mt-6 font-display text-[clamp(0.7rem,1.6vw,1.15rem)] font-semibold uppercase tracking-[0.42em]">
              Welcome to tomorrow.
            </p>
          </div>
        </div>

        {/* Credits and the way back */}
        <div
          data-fin="end"
          className="invisible absolute inset-x-[var(--hud-pad)] bottom-[calc(var(--hud-h)+var(--hud-pad)*2.25)] grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-12"
        >
          <nav aria-label="Return to a world">
            <p className="ns-label mb-2 text-ns-gray">Go back in</p>
            <ul className="border-t border-ns-line">
              {worlds.map((scene) => (
                <li key={scene.id} data-scene={scene.id} className="border-b border-ns-line">
                  <button
                    type="button"
                    onClick={() => travelToScene(scene.id)}
                    data-cursor="ENTER"
                    className="group flex w-full items-baseline gap-4 py-2 text-left transition-colors hover:text-accent focus-visible:text-accent"
                  >
                    <span className="ns-label w-8 text-ns-gray group-hover:text-accent">{scene.act}</span>
                    <span className="ns-monument text-[clamp(1.5rem,3.2vw,2.75rem)] transition-transform duration-500 ease-[var(--ease-cine)] group-hover:translate-x-2">
                      {scene.title}
                    </span>
                    <span className="ns-label ml-auto hidden text-ns-gray sm:block" aria-hidden>
                      →
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <CyberButton variant="solid" onClick={restartExperience} cursorLabel="RESTART" className="mt-5 bg-ns-yellow">
              Restart experience <span aria-hidden>↺</span>
            </CyberButton>
          </nav>

          <section aria-label="Credits" className="max-lg:hidden">
            <h3 className="ns-label mb-2 text-ns-gray">Credits</h3>
            <dl className="ns-label grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 border-t border-ns-line pt-3 normal-case tracking-normal">
              {CREDITS.map(([role, credit]) => (
                <div key={role} className="contents">
                  <dt className="text-ns-gray">{role}</dt>
                  <dd className="text-ns-white">{credit}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-ns-gray">
              An original work of fiction. Inspired by the cyberpunk genre; not affiliated with or endorsed by any game,
              studio or publisher.
            </p>
          </section>
          <p className="text-xs leading-relaxed text-ns-gray lg:hidden">
            NIGHT//SHIFT is an original work of fiction: procedural 3D, live-synthesised sound, open-licensed type. Not
            affiliated with any game, studio or publisher.
          </p>
        </div>
      </div>
    </div>
  );
}
