"use client";

import { useEffect, useRef } from "react";
import { travelToScene } from "@/animations/transitions";
import { AudioController } from "@/components/ui/AudioController";
import { Logo } from "@/components/ui/Logo";
import { SCENES } from "@/data/scenes";
import { useExperienceStore } from "@/store/experienceStore";
import { NavigationOverlay } from "./NavigationOverlay";

/** Real local time, written imperatively once a second (no re-renders). */
function Clock() {
  const ref = useRef<HTMLTimeElement>(null);
  useEffect(() => {
    const write = () => {
      if (ref.current) ref.current.textContent = new Date().toLocaleTimeString("en-GB");
    };
    write();
    const id = window.setInterval(write, 1000);
    return () => window.clearInterval(id);
  }, []);
  return <time ref={ref} className="tabular-nums text-ns-gray" aria-label="Local time" />;
}

/** Top HUD (logo, system status, sound, menu) and the navigation overlay. */
export function GlobalNavigation() {
  const menuOpen = useExperienceStore((s) => s.menuOpen);
  const setMenuOpen = useExperienceStore((s) => s.setMenuOpen);
  const currentScene = useExperienceStore((s) => s.currentScene);
  const scene = SCENES.find((item) => item.id === currentScene) ?? SCENES[0];
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  // Return focus to the trigger when the menu closes.
  useEffect(() => {
    if (wasOpen.current && !menuOpen) menuButtonRef.current?.focus({ preventScroll: true });
    wasOpen.current = menuOpen;
  }, [menuOpen]);

  return (
    <>
      <header className="ns-hud pointer-events-none fixed inset-x-0 top-0 z-[60] flex items-center justify-between gap-3 p-[var(--hud-pad)]">
        <button
          type="button"
          onClick={() => travelToScene("city", { onCovered: () => setMenuOpen(false) })}
          aria-label="NIGHT//SHIFT — back to Night City"
          data-cursor="ACT 01"
          className="pointer-events-auto flex h-11 items-center text-sm text-ns-white sm:text-base"
        >
          <Logo />
        </button>

        <div className="pointer-events-auto flex items-center gap-2">
          <p className="ns-label mr-3 hidden items-center gap-3 md:flex" aria-live="polite">
            <span className="flex items-center gap-2 text-ns-white">
              <span className="size-1.5 animate-pulse bg-accent" aria-hidden />
              {scene.status}
            </span>
            <Clock />
          </p>
          <AudioController />
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="ns-menu"
            data-cursor={menuOpen ? "CLOSE" : "MENU"}
            className="ns-label ns-tick relative inline-flex h-11 items-center gap-3 border border-ns-line px-4 text-ns-white transition-colors duration-200 hover:border-accent hover:text-accent"
          >
            <span>{menuOpen ? "Close" : "Menu"}</span>
            <span className="relative block h-2.5 w-4" aria-hidden>
              <span
                className={`absolute inset-x-0 top-0 h-px bg-current transition-transform duration-300 ${menuOpen ? "translate-y-[5px] rotate-45" : ""}`}
              />
              <span
                className={`absolute inset-x-0 bottom-0 h-px bg-current transition-transform duration-300 ${menuOpen ? "-translate-y-[4px] -rotate-45" : ""}`}
              />
            </span>
          </button>
        </div>
      </header>

      <NavigationOverlay />
    </>
  );
}
