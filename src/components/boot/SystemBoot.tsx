"use client";

import { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { CyberButton } from "@/components/ui/CyberButton";
import { lockScroll, unlockScroll } from "@/lib/scroll";
import { useExperienceStore } from "@/store/experienceStore";

const LINES = [
  "INITIALIZING NIGHT//SHIFT...",
  "CONNECTING TO CITY NETWORK...",
  "ACCESSING CENTRAL GRID...",
  "SECURITY PROTOCOL: ACTIVE",
  "WELCOME TO NIGHT CITY.",
];

/**
 * ACT 00. A ~4s terminal sequence, a burst of interference, the logo, then
 * the screen splits open onto the city. Skippable at any moment (button,
 * Esc). Completion is stored for the session by the experience store.
 */
export function SystemBoot() {
  const rootRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const sequenceRef = useRef<gsap.core.Timeline | null>(null);
  const leaving = useRef(false);

  const exit = useCallback((fast: boolean) => {
    const root = rootRef.current;
    if (leaving.current || !root) return;
    leaving.current = true;
    sequenceRef.current?.kill();
    // What is behind the overlay is about to be seen: let it start animating.
    useExperienceStore.getState().setIntroLeaving(true);

    const q = gsap.utils.selector(root);
    const done = () => {
      unlockScroll("boot");
      useExperienceStore.getState().completeIntro();
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.to(root, { autoAlpha: 0, duration: 0.3, onComplete: done });
      return;
    }

    gsap
      .timeline({ onComplete: done })
      .to(q("[data-boot-content]"), { autoAlpha: 0, duration: fast ? 0.2 : 0.45, ease: "power2.in" })
      .to(q("[data-boot-seam]"), { scaleX: 1, duration: 0.4, ease: "power3.out" }, "<")
      .to(q("[data-boot-top]"), { yPercent: -100, duration: 1, ease: "power4.inOut" })
      .to(q("[data-boot-bottom]"), { yPercent: 100, duration: 1, ease: "power4.inOut" }, "<")
      .to(q("[data-boot-seam]"), { autoAlpha: 0, duration: 0.5 }, "<0.1");
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    lockScroll("boot");
    skipRef.current?.focus({ preventScroll: true });

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      const rows = q<HTMLElement>("[data-boot-row]");
      const texts = q<HTMLElement>("[data-boot-line]");
      const segments = q<HTMLElement>("[data-boot-seg]");
      const logo = q("[data-boot-logo]");

      if (reduced) {
        // Simplified: final frame, short hold, fade.
        texts.forEach((el, i) => (el.textContent = LINES[i]));
        gsap.set(rows, { autoAlpha: 1 });
        gsap.set(segments, { scaleX: 1 });
        gsap.set(logo, { clipPath: "inset(0 0% 0 0)" });
        gsap.delayedCall(1.6, () => exit(false));
        return;
      }

      const tl = gsap.timeline({ delay: 0.25, onComplete: () => exit(false) });
      sequenceRef.current = tl;

      LINES.forEach((line, i) => {
        const cursor = { chars: 0 };
        tl.set(rows[i], { autoAlpha: 1 })
          .to(cursor, {
            chars: line.length,
            duration: 0.34,
            ease: "none",
            onUpdate: () => (texts[i].textContent = line.slice(0, Math.round(cursor.chars))),
          })
          .to(segments[i], { scaleX: 1, duration: 0.14, ease: "power2.out" })
          .to({}, { duration: 0.06 });
      });

      tl.call(() => root.setAttribute("data-interference", "true"))
        .to({}, { duration: 0.3 })
        .call(() => root.removeAttribute("data-interference"))
        .to(rows, { opacity: 0.6, duration: 0.4 })
        .to(logo, { clipPath: "inset(0 0% 0 0)", duration: 0.7, ease: "power4.out" }, "<")
        .to({}, { duration: 0.55 });
    }, root);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") exit(true);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      ctx.revert();
      unlockScroll("boot");
    };
  }, [exit]);

  return (
    <div ref={rootRef} className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="NIGHT//SHIFT system boot">
      <p className="sr-only" role="status">
        NIGHT//SHIFT is starting. Press Escape or the skip button to enter immediately.
      </p>

      {/* The two halves that part to reveal the city. */}
      <div data-boot-top className="absolute inset-x-0 top-0 h-1/2 bg-ns-black" />
      <div data-boot-bottom className="absolute inset-x-0 bottom-0 h-1/2 bg-ns-black" />
      <div data-boot-seam className="absolute inset-x-0 top-1/2 h-px origin-center scale-x-0 bg-accent" />

      <div data-boot-content className="absolute inset-0 flex flex-col justify-between p-[var(--hud-pad)]">
        <div className="flex items-start justify-between gap-4">
          <p className="ns-label text-ns-gray">
            NS-BOOT <span className="text-accent">{"//"}</span> cold start
          </p>
          <CyberButton ref={skipRef} onClick={() => exit(true)} cursorLabel="SKIP">
            Skip intro <span aria-hidden>→</span>
          </CyberButton>
        </div>

        <p
          data-boot-logo
          className="ns-monument self-center text-center text-[clamp(3rem,15vw,16rem)] text-ns-white [clip-path:inset(0_100%_0_0)]"
          aria-hidden
        >
          NIGHT<span className="text-accent">{"//"}</span>SHIFT
        </p>

        <div aria-hidden>
          <ol className="mb-5 min-h-[7.5rem] space-y-1.5">
            {LINES.map((line, i) => (
              <li key={line} data-boot-row className="ns-label invisible flex gap-3 text-ns-white">
                <span className="text-accent">{String(i + 1).padStart(2, "0")}</span>
                <span data-boot-line />
              </li>
            ))}
          </ol>
          <div className="flex gap-1.5">
            {LINES.map((line) => (
              <div key={line} className="h-0.5 flex-1 bg-ns-line">
                <div data-boot-seg className="ns-boot-seg h-full bg-accent" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
