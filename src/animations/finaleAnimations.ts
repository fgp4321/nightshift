import gsap from "gsap";

/** Entering the last act: up from black. Time-based. */
export function playFinaleIntro(root: HTMLElement): gsap.core.Timeline {
  return gsap.timeline().fromTo(root.querySelector('[data-fin="world"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, ease: "power2.out" });
}

/**
 * ACT 04 on a 0–1 clock, scrubbed by scroll:
 * the statement arrives line by line → gives way to the wordmark →
 * the wordmark lifts to make room for credits and the way back.
 */
export function createFinaleTimeline(root: HTMLElement, reducedMotion: boolean): gsap.core.Timeline {
  const q = gsap.utils.selector(root);
  const one = (name: string) => q(`[data-fin="${name}"]`);
  const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });

  if (reducedMotion) {
    tl.fromTo(one("line"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05, stagger: 0.07 }, 0.04)
      .to(one("statement"), { autoAlpha: 0, duration: 0.05 }, 0.46)
      .fromTo(one("brand"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.06 }, 0.52)
      .set(one("rule"), { scaleX: 1 }, 0)
      .to(one("brand"), { autoAlpha: 0, duration: 0.05 }, 0.8)
      .fromTo(one("end"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.08 }, 0.86)
      .set({}, {}, 1);
    return tl;
  }

  tl.fromTo(one("line"), { yPercent: 112 }, { yPercent: 0, duration: 0.09, stagger: 0.075, ease: "power3.out" }, 0.03)
    .to(one("statement"), { autoAlpha: 0, y: -48, duration: 0.06, ease: "power2.in" }, 0.45)
    .fromTo(one("brand"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05 }, 0.52)
    .fromTo(one("wordmark"), { scale: 1.28, "--ca": "0.09em" }, { scale: 1, "--ca": "0em", duration: 0.16, ease: "power2.out" }, 0.52)
    .fromTo(one("rule"), { scaleX: 0 }, { scaleX: 1, duration: 0.1, ease: "power2.inOut" }, 0.6)
    .fromTo(one("welcome"), { autoAlpha: 0, letterSpacing: "0.9em" }, { autoAlpha: 1, letterSpacing: "0.42em", duration: 0.1, ease: "power2.out" }, 0.64)
    .to(one("brand-inner"), { y: "-17vh", scale: 0.78, duration: 0.1, ease: "power2.inOut" }, 0.79)
    .fromTo(one("end"), { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.08, ease: "power2.out" }, 0.86)
    .set({}, {}, 1);
  return tl;
}
