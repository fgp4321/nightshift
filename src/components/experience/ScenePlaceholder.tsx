"use client";

import { useRef } from "react";
import type { SceneDefinition } from "@/data/scenes";
import { useExperienceProgress } from "@/hooks/useExperienceProgress";

/**
 * Phase 1 stand-in for a scene. It is wired to real scroll progress so the
 * scroll architecture can be verified before the scenes exist.
 */
export function ScenePlaceholder({ scene, index }: { scene: SceneDefinition; index: number }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);

  useExperienceProgress((snapshot) => {
    const p = snapshot.scenes[scene.id];
    if (titleRef.current) titleRef.current.style.transform = `translate3d(${(-p * 12).toFixed(2)}%, 0, 0)`;
    if (readoutRef.current) readoutRef.current.textContent = p.toFixed(3);
  });

  const Heading = index === 0 ? "h1" : "h2";

  return (
    <div className="relative flex h-full flex-col justify-end bg-ns-black px-[var(--hud-pad)] pb-[calc(var(--hud-h)+var(--hud-pad)*2)] pt-[var(--hud-pad)]">
      <div className="ns-grid pointer-events-none absolute inset-0" aria-hidden />

      <p className="ns-label absolute left-[var(--hud-pad)] top-[var(--hud-pad)] text-ns-gray">
        NIGHT//SHIFT <span className="text-accent">/ foundation build</span>
      </p>

      <p className="ns-label relative mb-4 text-accent">
        Act {scene.act} — {scene.district}
      </p>
      <Heading
        ref={titleRef}
        className="ns-monument relative whitespace-nowrap text-[length:var(--text-monument)] text-ns-white will-change-transform"
      >
        {scene.title}
      </Heading>
      <div className="relative mt-6 flex flex-wrap items-end justify-between gap-4">
        <p className="max-w-[28ch] text-lg text-ns-white/80 sm:text-xl">{scene.tagline}</p>
        <p className="ns-label text-ns-gray">
          Scene progress <span ref={readoutRef} className="text-accent">0.000</span>
        </p>
      </div>
    </div>
  );
}
