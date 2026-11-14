"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { travelToScene } from "@/animations/transitions";
import { GlitchText } from "@/components/ui/GlitchText";
import { SCENES } from "@/data/scenes";
import { lockScroll, unlockScroll } from "@/lib/scroll";
import { useExperienceStore } from "@/store/experienceStore";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Full-screen act index. Motion owns its open/close; GSAP owns the travel. */
export function NavigationOverlay() {
  const open = useExperienceStore((s) => s.menuOpen);
  const currentScene = useExperienceStore((s) => s.currentScene);
  const reduced = useReducedMotion();
  const firstRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    lockScroll("menu");
    firstRef.current?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") useExperienceStore.getState().setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      unlockScroll("menu");
    };
  }, [open]);

  const closed = reduced ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" };
  const shown = reduced ? { opacity: 1 } : { clipPath: "inset(0 0 0% 0)" };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="ns-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          className="fixed inset-0 z-50 flex flex-col bg-ns-black px-[var(--hud-pad)] pb-[var(--hud-pad)] pt-[calc(var(--hud-h)+var(--hud-pad)*2)]"
          initial={closed}
          animate={shown}
          exit={closed}
          transition={{ duration: reduced ? 0.15 : 0.6, ease: EASE }}
        >
          <div className="ns-grid pointer-events-none absolute inset-0" aria-hidden />

          <nav aria-label="Worlds" className="relative flex flex-1 flex-col justify-center">
            <ol>
              {SCENES.map((scene, index) => (
                <motion.li
                  key={scene.id}
                  data-scene={scene.id}
                  className="border-t border-ns-line last:border-b"
                  initial={{ opacity: 0, y: reduced ? 0 : 36 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE, delay: reduced ? 0 : 0.18 + index * 0.07 }}
                >
                  <button
                    ref={index === 0 ? firstRef : undefined}
                    type="button"
                    data-cursor="ENTER"
                    aria-current={scene.id === currentScene ? "page" : undefined}
                    onClick={() =>
                      travelToScene(scene.id, {
                        onCovered: () => useExperienceStore.getState().setMenuOpen(false),
                      })
                    }
                    className="group flex w-full items-baseline gap-4 py-3 text-left text-ns-white transition-colors duration-200 hover:text-accent focus-visible:text-accent aria-[current]:text-accent sm:gap-8 sm:py-4"
                  >
                    <span className="ns-label w-10 shrink-0 text-ns-gray group-hover:text-accent">{scene.act} /</span>
                    <span className="ns-monument text-[clamp(2.5rem,min(11vw,13vh),8.5rem)] transition-transform duration-500 ease-[var(--ease-cine)] group-hover:translate-x-3">
                      <GlitchText>{scene.title}</GlitchText>
                    </span>
                    <span className="ns-label ml-auto hidden text-right text-ns-gray lg:block">
                      {scene.district}
                      <br />
                      {scene.status}
                    </span>
                  </button>
                </motion.li>
              ))}
            </ol>
          </nav>

          <div className="relative mt-6 flex items-end justify-between gap-4">
            <p className="ns-label text-ns-gray">Welcome to the city that never sleeps.</p>
            <p className="ns-label hidden text-ns-gray sm:block">Esc — close</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
