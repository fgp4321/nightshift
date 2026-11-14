"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setLenis } from "@/lib/scroll";

/**
 * Creates the single Lenis instance and drives it from GSAP's ticker, so
 * smooth scrolling, ScrollTrigger and every tween share one animation loop.
 * Call once, from ExperienceController. With `enabled = false` (reduced
 * motion) the page keeps native scrolling and ScrollTrigger works unchanged.
 */
export function useLenis(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const lenis = new Lenis({
      autoRaf: false,
      lerp: 0.085,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2,
    });
    setLenis(lenis);

    const offScroll = lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      offScroll();
      lenis.destroy();
      setLenis(null);
    };
  }, [enabled]);
}
