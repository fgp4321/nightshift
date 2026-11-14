"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { createCityOverlayTimeline } from "@/animations/cityAnimations";
import { cityTelemetry } from "@/lib/city/uniforms";
import { subscribeProgress } from "@/lib/progress";

const pad = (value: number) => {
  const rounded = Math.round(value);
  return `${rounded < 0 ? "-" : "+"}${String(Math.abs(rounded)).padStart(3, "0")}`;
};

/**
 * Captions over the city and the hand-off to NIGHT//OS. All timing lives in
 * `createCityOverlayTimeline`, scrubbed by the act's scroll progress.
 * District data is in-world fiction; the position readout is the real camera.
 */
export function CityOverlays({ reducedMotion, telemetry }: { reducedMotion: boolean; telemetry: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let timeline: gsap.core.Timeline | undefined;
    const ctx = gsap.context(() => {
      timeline = createCityOverlayTimeline(root, reducedMotion);
    }, root);

    const unsubscribe = subscribeProgress(({ scenes }) => {
      timeline?.progress(scenes.city);
      if (readoutRef.current) {
        readoutRef.current.textContent = `X ${pad(cityTelemetry.x)}  ALT ${pad(cityTelemetry.y)}  Z ${pad(cityTelemetry.z)}`;
      }
    });

    return () => {
      unsubscribe();
      ctx.revert();
    };
  }, [reducedMotion]);

  const frame = "absolute inset-x-[var(--hud-pad)]";
  const bottom = "bottom-[calc(var(--hud-h)+var(--hud-pad)*2.5)]";

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0">
      {/* Legibility: darken the lower third behind captions. */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ns-black/85 via-ns-black/30 to-transparent" />

      {/* 01 — title */}
      <div data-city="title" className={`${frame} ${bottom}`}>
        <p className="ns-label mb-3 text-accent">Act 01 — year 2077</p>
        <h1 className="ns-monument text-[length:var(--text-monument)] text-ns-white">
          Night <span className="text-accent">City</span>
        </h1>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <p className="max-w-[26ch] text-lg leading-snug text-ns-white/85 sm:text-xl">
            Welcome to the city that never sleeps.
          </p>
          <p className="ns-label flex items-center gap-3 text-ns-white">
            <span className="inline-block h-8 w-px animate-pulse bg-accent" aria-hidden />
            Scroll to descend
          </p>
        </div>
      </div>

      {/* 02 — district data */}
      <div data-city="district" className={`${frame} ${bottom} invisible`}>
        <div className="max-w-md border-l border-accent pl-5">
          <h2 className="ns-label text-accent">District 01 — Corporate Sector</h2>
          <dl className="ns-label mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-ns-white">
            <dt className="text-ns-gray">Population</dt>
            <dd>8,420,000</dd>
            <dt className="text-ns-gray">Network status</dt>
            <dd className="text-ns-cyan">Online</dd>
            <dt className="text-ns-gray">Security level</dt>
            <dd>High</dd>
            {telemetry && (
              <>
                <dt className="text-ns-gray">Position</dt>
                <dd>
                  <span ref={readoutRef} className="whitespace-pre text-ns-cyan" />
                </dd>
              </>
            )}
          </dl>
        </div>
      </div>

      {/* 03 — between the buildings */}
      <div data-city="watching" className={`${frame} ${bottom} invisible`}>
        <p className="ns-label mb-3 text-accent">Meridian Boulevard — street level</p>
        <p className="ns-monument max-w-[9ch] text-[length:var(--text-hero)] text-ns-white">
          The city is always watching.
        </p>
      </div>

      {/* 04 — the spire */}
      <div data-city="spire" className={`${frame} ${bottom} invisible`}>
        <div className="ml-auto max-w-sm border-r border-accent pr-5 text-right">
          <h2 className="ns-monument text-[length:var(--text-title)] text-ns-white">Kestrel-Vance Spire</h2>
          <p className="ns-label mt-3 text-ns-white">236 m — private airspace above level 40</p>
          <p className="ns-label mt-1 text-ns-gray">Owner of record: Kestrel-Vance Conglomerate</p>
        </div>
      </div>

      {/* 05 — access terminal → NIGHT//OS */}
      <div data-city="terminal" className="invisible absolute inset-0 grid place-items-center">
        <div data-city="brackets" className="ns-brackets relative h-[min(58vh,34rem)] w-[min(86vw,56rem)]">
          <div className="ns-scanline absolute inset-x-0 h-px bg-ns-cyan shadow-[0_0_24px_4px_rgb(0_229_255/0.6)]" />
          <p className="ns-label absolute -top-7 left-0 text-ns-cyan">Access terminal 01</p>
          <p data-city="scanning" className="ns-label absolute -bottom-7 left-0 text-ns-white">
            Scanning visitor…
          </p>
          <p data-city="granted" className="ns-label invisible absolute -bottom-7 left-0 text-ns-cyan">
            Access granted — opening NIGHT//OS
          </p>
        </div>
      </div>
      <div data-city="cover" className="invisible absolute inset-0 bg-ns-black" />
    </div>
  );
}
