"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { navigateRelative, travelToScene } from "@/animations/transitions";
import { SCENES } from "@/data/scenes";
import { useExperienceProgress } from "@/hooks/useExperienceProgress";
import { useExperienceStore } from "@/store/experienceStore";

/** Bottom HUD: current act, district, scroll progress and act navigation. */
export function ProgressIndicator() {
  const currentScene = useExperienceStore((s) => s.currentScene);
  const barRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);

  useExperienceProgress(({ total }) => {
    if (barRef.current) {
      barRef.current.style.transform = `scaleX(${total.toFixed(4)})`;
      barRef.current.parentElement?.setAttribute("aria-valuenow", String(Math.round(total * 100)));
    }
    if (percentRef.current) percentRef.current.textContent = String(Math.round(total * 100)).padStart(3, "0");
  });

  const index = SCENES.findIndex((scene) => scene.id === currentScene);
  const scene = SCENES[index];
  const arrow =
    "ns-label grid size-11 place-items-center border border-ns-line text-ns-white transition-colors hover:border-accent hover:text-accent disabled:opacity-30 disabled:hover:border-ns-line disabled:hover:text-ns-white";

  return (
    <footer className="ns-hud pointer-events-none fixed inset-x-0 bottom-0 z-40 px-[var(--hud-pad)] pb-[var(--hud-pad)]">
      <div className="pointer-events-auto flex items-end justify-between gap-4">
        <div className="min-w-0 overflow-hidden" aria-live="polite">
          {/* The caption rolls over when the act changes. */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={scene.id}
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -14, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="ns-label text-accent">Act {scene.act}</p>
              <p className="ns-label truncate text-ns-white">{scene.district}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <nav aria-label="Acts" className="flex items-center gap-2">
          <ol className="mr-2 hidden items-center gap-1 sm:flex">
            {SCENES.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => travelToScene(item.id)}
                  data-cursor={item.title.toUpperCase()}
                  aria-current={item.id === currentScene ? "step" : undefined}
                  aria-label={`Go to act ${item.act}, ${item.title}`}
                  className="ns-label grid h-11 w-9 place-items-center text-ns-gray transition-colors hover:text-ns-white aria-[current]:text-accent"
                >
                  {item.act}
                </button>
              </li>
            ))}
          </ol>
          <button type="button" className={arrow} onClick={() => navigateRelative(-1)} disabled={index === 0} aria-label="Previous act">
            ↑
          </button>
          <button
            type="button"
            className={arrow}
            onClick={() => navigateRelative(1)}
            disabled={index === SCENES.length - 1}
            aria-label="Next act"
          >
            ↓
          </button>
        </nav>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div
          className="h-px flex-1 bg-ns-line"
          role="progressbar"
          aria-label="Experience progress"
          aria-valuenow={0}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div ref={barRef} className="h-full origin-left scale-x-0 bg-accent" />
        </div>
        <p className="ns-label text-ns-gray">
          <span ref={percentRef}>000</span>%
        </p>
      </div>
    </footer>
  );
}
