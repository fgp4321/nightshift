"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const INTERACTIVE = "a, button, input, select, textarea, [role='button'], [data-cursor]";

/**
 * Desktop cursor: a precise dot, a trailing ring that expands over
 * interactive elements, and an optional label from `data-cursor`.
 * It only activates on the first real mouse movement, so touch and pen
 * input keep their native behaviour.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const trail = reduced ? 0 : 0.35;
    const ringX = gsap.quickTo(ring, "x", { duration: trail, ease: "power3" });
    const ringY = gsap.quickTo(ring, "y", { duration: trail, ease: "power3" });
    const dotX = gsap.quickSetter(dot, "x", "px");
    const dotY = gsap.quickSetter(dot, "y", "px");
    let active = false;

    const show = (visible: boolean) => gsap.to([dot, ring], { autoAlpha: visible ? 1 : 0, duration: 0.2, overwrite: "auto" });

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      if (!active) {
        active = true;
        document.documentElement.classList.add("ns-cursor-on");
        gsap.set(ring, { x: event.clientX, y: event.clientY });
        show(true);
      }
      dotX(event.clientX);
      dotY(event.clientY);
      ringX(event.clientX);
      ringY(event.clientY);
    };

    const onOver = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const target = (event.target as Element | null)?.closest?.(INTERACTIVE) as HTMLElement | null;
      const disabled = target?.matches(":disabled") ?? false;
      const hovering = Boolean(target) && !disabled;
      ring.dataset.hover = hovering ? "true" : "false";
      label.textContent = hovering ? (target?.dataset.cursor ?? "") : "";
    };

    const onDown = () => (ring.dataset.down = "true");
    const onUp = () => (ring.dataset.down = "false");
    const onLeave = () => active && show(false);
    const onEnter = () => active && show(true);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.documentElement.addEventListener("pointerenter", onEnter);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.removeEventListener("pointerenter", onEnter);
      document.documentElement.classList.remove("ns-cursor-on");
      gsap.killTweensOf([dot, ring]);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed left-0 top-0 z-[100]" aria-hidden>
      <div ref={ringRef} className="ns-cursor-ring invisible absolute">
        <span ref={labelRef} className="ns-label ns-cursor-label" />
      </div>
      <div ref={dotRef} className="ns-cursor-dot invisible absolute" />
    </div>
  );
}
