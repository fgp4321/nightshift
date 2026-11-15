"use client";

import { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { createOsOutroTimeline, playOsIntro } from "@/animations/osAnimations";
import type { OsAppId } from "@/data/terminalCommands";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { subscribeProgress } from "@/lib/progress";
import { useExperienceStore } from "@/store/experienceStore";
import { CityMapApp } from "./CityMapApp";
import { DatabaseApp } from "./DatabaseApp";
import { NightRadioApp } from "./NightRadioApp";
import { OsWidgets } from "./OsWidgets";
import { TerminalApp } from "./TerminalApp";
import { useWindowManager, WindowLayer, type OsAppDefinition } from "./WindowManager";

const icon = (path: string) => (
  <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <path d={path} />
  </svg>
);

const APPS: OsAppDefinition[] = [
  { id: "netrunner", title: "Netrunner", caption: "Simulated terminal", width: 600, height: 380, left: 8, top: 8, icon: icon("M4 6l6 6-6 6M12 18h8") },
  { id: "database", title: "Database", caption: "City archive", width: 660, height: 440, left: 96, top: 56, icon: icon("M4 6h16M4 12h16M4 18h10M18 16v4M16 18h4") },
  { id: "map", title: "City Map", caption: "District schematic", width: 680, height: 430, left: 180, top: 24, icon: icon("M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 3v18M4 7.5l16 9") },
  { id: "radio", title: "Night Radio", caption: "Ambient sound", width: 400, height: 500, left: 300, top: 8, icon: icon("M4 10v4M8 6v12M12 9v6M16 4v16M20 10v4") },
];

/**
 * ACT 02 — NIGHT//OS: a desktop with four working applications.
 * GSAP owns the scene-level intro and the scroll-scrubbed interference;
 * Motion owns the windows.
 */
export function CyberpunkOS({ active }: { active: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const launcherRefs = useRef<Partial<Record<OsAppId, HTMLButtonElement | null>>>({});
  const reducedMotion = useExperienceStore((s) => s.capabilities.reducedMotion);
  const wide = useMediaQuery("(min-width: 768px)");
  const { stack, open, close } = useWindowManager();
  const top = stack[stack.length - 1];

  // Intro: every time the act is entered.
  useEffect(() => {
    const root = rootRef.current;
    if (!active || !root) return;
    const ctx = gsap.context(() => playOsIntro(root, reducedMotion), root);
    return () => ctx.revert();
  }, [active, reducedMotion]);

  // Outro: scrubbed by scroll.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let timeline: gsap.core.Timeline | undefined;
    const ctx = gsap.context(() => {
      timeline = createOsOutroTimeline(root, reducedMotion);
    }, root);
    const unsubscribe = subscribeProgress(({ scenes }) => timeline?.progress(scenes.os));
    return () => {
      unsubscribe();
      ctx.revert();
    };
  }, [reducedMotion]);

  const closeApp = useCallback(
    (id: OsAppId) => {
      close(id);
      launcherRefs.current[id]?.focus({ preventScroll: true });
    },
    [close],
  );

  const renderApp = (id: OsAppId) => {
    if (id === "netrunner") return <TerminalApp openApp={open} reducedMotion={reducedMotion} />;
    if (id === "database") return <DatabaseApp />;
    if (id === "map") return <CityMapApp />;
    return <NightRadioApp reducedMotion={reducedMotion} />;
  };

  return (
    <div ref={rootRef} className="relative h-full overflow-hidden bg-ns-black text-ns-white">
      <div data-os="backdrop" className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="ns-os-floor absolute inset-x-0 bottom-0 h-[55%]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgb(0_229_255/0.1),transparent_60%)]" />
        <p className="ns-monument absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[21vw] text-ns-cyan/[0.045]">
          NIGHT{"//"}OS
        </p>
      </div>

      <div
        data-os="desktop"
        className="absolute inset-0 flex flex-col gap-3 px-[var(--hud-pad)] pb-[calc(var(--hud-h)+var(--hud-pad)*2+0.75rem)] pt-[calc(var(--hud-h)+var(--hud-pad)*1.5)] lg:grid lg:grid-cols-[10rem_minmax(0,1fr)_17rem] lg:gap-5"
      >
        <h2 className="sr-only">NIGHT//OS desktop</h2>

        <nav aria-label="Applications" className="grid shrink-0 grid-cols-4 content-start gap-2 max-sm:grid-cols-2 lg:grid-cols-1">
          {APPS.map((app) => {
            const isOpen = stack.includes(app.id);
            return (
              <button
                key={app.id}
                ref={(el) => {
                  launcherRefs.current[app.id] = el;
                }}
                type="button"
                data-os-in
                data-cursor={isOpen && app.id === top ? "CLOSE" : "OPEN"}
                aria-pressed={isOpen}
                onClick={() => (isOpen && app.id === top ? closeApp(app.id) : open(app.id))}
                className="ns-holo group flex items-center gap-3 p-3 text-left text-ns-white transition-colors hover:text-ns-cyan aria-pressed:text-ns-cyan max-lg:flex-col max-lg:items-start max-lg:gap-2 lg:h-16"
              >
                {app.icon}
                <span className="min-w-0">
                  <span className="ns-label block truncate">{app.title}</span>
                  <span className="hidden truncate text-xs text-ns-gray lg:block">{isOpen ? "Running" : app.caption}</span>
                </span>
              </button>
            );
          })}
          <p data-os="hint" data-os-in className="ns-label col-span-full mt-1 text-ns-gray lg:mt-2">
            Keep scrolling to follow the signal <span aria-hidden>↓</span>
          </p>
        </nav>

        <div
          ref={areaRef}
          className="relative min-h-0 flex-1 max-md:pointer-events-none max-md:absolute max-md:inset-x-[var(--hud-pad)] max-md:bottom-[calc(var(--hud-h)+var(--hud-pad)*2+0.75rem)] max-md:top-[calc(var(--hud-h)+var(--hud-pad)*1.5)] max-md:z-20"
        >
          {stack.length === 0 && (
            <div data-os-in className="absolute inset-0 hidden place-items-center md:grid" aria-hidden>
              <p className="ns-label max-w-[30ch] text-center text-ns-gray">
                Handshake complete. Guest session open.
                <br />
                Select an application to begin.
              </p>
            </div>
          )}
          <WindowLayer
            apps={APPS}
            stack={stack}
            draggable={wide}
            bounds={areaRef}
            onFocus={open}
            onClose={closeApp}
            render={renderApp}
          />
        </div>

        <div className={stack.length > 0 ? "max-md:hidden" : undefined}>
          <OsWidgets active={active} reducedMotion={reducedMotion} />
        </div>
      </div>

      {/* Interference → ACT 03 */}
      <div data-os="slices" className="pointer-events-none invisible absolute inset-0 flex flex-col" aria-hidden>
        {[18, 7, 22, 5, 14, 9, 25].map((height, i) => (
          <div key={i} style={{ flexGrow: height }} className={i % 2 ? "bg-ns-magenta/25 mix-blend-screen" : "bg-ns-cyan/10 mix-blend-screen"} />
        ))}
      </div>
      <div data-os="warning" role="alert" className="pointer-events-none invisible absolute inset-0 grid place-items-center px-[var(--hud-pad)]">
        <div className="w-full max-w-4xl border-y-2 border-ns-magenta bg-ns-black/90 px-6 py-8 text-center">
          <p className="ns-label text-ns-magenta">Warning — carrier 88.7 on maintenance band</p>
          <p className="ns-monument mt-3 text-[clamp(2.25rem,7.5vw,6.5rem)] text-ns-magenta">Unauthorized signal detected.</p>
          <p className="ns-label mt-4 text-ns-white">Trace failed — origin below map depth</p>
        </div>
      </div>
      <div data-os="cover" className="pointer-events-none invisible absolute inset-0 bg-ns-black" />
    </div>
  );
}
