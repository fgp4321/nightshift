"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ALL_FOUND_MESSAGE, HOTSPOTS } from "@/data/underground";
import { progress, subscribeProgress } from "@/lib/progress";

interface HotspotState {
  found: ReadonlySet<string>;
  openId: string | null;
  open: (id: string) => void;
  close: () => void;
}

const HotspotContext = createContext<HotspotState | null>(null);

function useHotspots(): HotspotState {
  const context = useContext(HotspotContext);
  if (!context) throw new Error("Hotspot components must be inside <HotspotProvider>");
  return context;
}

/** Tracks which hidden messages of the underground have been found. */
export function HotspotProvider({ children }: { children: ReactNode }) {
  const [found, setFound] = useState<ReadonlySet<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(null);

  const open = useCallback((id: string) => {
    setOpenId(id);
    setFound((current) => (current.has(id) ? current : new Set(current).add(id)));
  }, []);
  const close = useCallback(() => setOpenId(null), []);

  const value = useMemo(() => ({ found, openId, open, close }), [found, openId, open, close]);
  return <HotspotContext.Provider value={value}>{children}</HotspotContext.Provider>;
}

interface HotspotProps {
  id: string;
  className?: string;
  /** Custom content (e.g. a neon sign). Defaults to a pulsing marker. */
  children?: ReactNode;
}

/** A clickable piece of the environment that reveals a hidden message. */
export function Hotspot({ id, className = "", children }: HotspotProps) {
  const { found, openId, open } = useHotspots();
  const hotspot = HOTSPOTS.find((item) => item.id === id);
  if (!hotspot) return null;
  const seen = found.has(id);

  return (
    <button
      type="button"
      onClick={() => open(id)}
      aria-label={`Inspect: ${hotspot.label}${seen ? " (found)" : ""}`}
      aria-expanded={openId === id}
      data-cursor="INSPECT"
      data-found={seen || undefined}
      className={`ns-hotspot pointer-events-auto ${className}`}
    >
      {children ?? (
        <span className="ns-hotspot-marker" aria-hidden>
          <span />
        </span>
      )}
    </button>
  );
}

/** "Signals 2/6" — shown for the whole act. */
export function HotspotCounter() {
  const { found } = useHotspots();
  return (
    <p className="ns-label flex items-center gap-2 text-ns-white" aria-live="polite">
      <span className="ns-hotspot-marker scale-75" data-static aria-hidden>
        <span />
      </span>
      Signals found <span className="text-accent">{found.size}/{HOTSPOTS.length}</span>
    </p>
  );
}

/** The message panel for the open hotspot. Non-modal; Esc closes it. */
export function HotspotPanel() {
  const { openId, found, close } = useHotspots();
  const hotspot = HOTSPOTS.find((item) => item.id === openId) ?? null;
  const complete = found.size === HOTSPOTS.length;

  useEffect(() => {
    if (!openId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    // A message belongs to the place it was found: walking on closes it.
    const openedAt = progress.scenes.underground;
    const unsubscribe = subscribeProgress(({ scenes }) => {
      if (Math.abs(scenes.underground - openedAt) > 0.035) close();
    });
    return () => {
      window.removeEventListener("keydown", onKey);
      unsubscribe();
    };
  }, [openId, close]);

  return (
    <AnimatePresence>
      {hotspot && (
        <motion.aside
          key={hotspot.id}
          role="status"
          aria-label={`Intercepted: ${hotspot.label}`}
          className="pointer-events-auto absolute bottom-[calc(var(--hud-h)+var(--hud-pad)*2.5)] left-[var(--hud-pad)] right-[var(--hud-pad)] z-30 border border-ns-magenta bg-ns-black/95 p-5 sm:right-auto sm:w-[26rem]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-start justify-between gap-4">
            <p className="ns-label text-ns-magenta">Intercepted — {hotspot.source}</p>
            <button
              type="button"
              onClick={close}
              aria-label="Close message"
              data-cursor="CLOSE"
              className="-mr-2 -mt-2 grid size-9 shrink-0 place-items-center text-ns-gray transition-colors hover:text-ns-white"
            >
              <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
                <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
            </button>
          </div>
          <h3 className="ns-monument mt-2 text-3xl text-ns-white">{hotspot.label}</h3>
          <div className="mt-3 space-y-2 text-sm leading-relaxed text-ns-white/85">
            {hotspot.message.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          {complete && <p className="mt-4 border-t border-ns-magenta/50 pt-3 text-sm leading-relaxed text-ns-yellow">{ALL_FOUND_MESSAGE}</p>}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
