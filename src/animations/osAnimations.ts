import gsap from "gsap";

/**
 * NIGHT//OS coming online. Time-based (not scrubbed) so the desktop is
 * always usable the moment the act is entered, including via deep link.
 * Animates `[data-os-in]` children only; the outro owns their wrapper.
 */
export function playOsIntro(root: HTMLElement, reducedMotion: boolean): gsap.core.Timeline {
  const q = gsap.utils.selector(root);
  return gsap
    .timeline()
    .fromTo(q('[data-os="backdrop"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, ease: "power2.out" })
    .fromTo(
      q("[data-os-in]"),
      { autoAlpha: 0, y: reducedMotion ? 0 : 18 },
      { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out", stagger: reducedMotion ? 0 : 0.06 },
      0.15,
    );
}

/** Where in the act's scroll progress the interference begins. */
export const OS_INTERFERENCE_START = 0.7;

/**
 * Signal loss → warning → glitch → collapse. A paused timeline of length 1,
 * scrubbed by the act's scroll progress, so it also plays in reverse.
 * Reduced motion keeps the warning and replaces the glitch with a fade.
 */
export function createOsOutroTimeline(root: HTMLElement, reducedMotion: boolean): gsap.core.Timeline {
  const q = gsap.utils.selector(root);
  const desktop = q('[data-os="desktop"]');
  const warning = q('[data-os="warning"]');
  const slices = q('[data-os="slices"]');
  const cover = q('[data-os="cover"]');
  const start = OS_INTERFERENCE_START;

  const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });

  // 1 — the network signal drops.
  tl.to(q(".ns-signal-bar"), { scaleY: 0.12, duration: 0.05, stagger: { each: 0.012, from: "end" } }, start)
    .to(q('[data-os="link-ok"]'), { autoAlpha: 0, duration: 0.01 }, start + 0.03)
    .fromTo(q('[data-os="link-lost"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, start + 0.03)
    .to(q('[data-os="hint"]'), { autoAlpha: 0, duration: 0.02 }, start);

  // 2 — the warning. From here the desktop no longer takes input.
  tl.set(desktop, { pointerEvents: "none" }, start + 0.08).fromTo(
    warning,
    { autoAlpha: 0, scale: reducedMotion ? 1 : 1.12 },
    { autoAlpha: 1, scale: 1, duration: 0.03, ease: "power2.out" },
    start + 0.09,
  );

  if (reducedMotion) {
    tl.to(desktop, { autoAlpha: 0.25, duration: 0.08 }, start + 0.12)
      .fromTo(cover, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, 0.88)
      .set({}, {}, 1);
    return tl;
  }

  // 3 — flicker, then the glitch takes over.
  tl.to(desktop, { opacity: 0.5, duration: 0.008, repeat: 5, yoyo: true }, start + 0.02)
    .to(desktop, { skewX: -6, x: -16, filter: "hue-rotate(70deg) saturate(1.7)", duration: 0.05, ease: "steps(3)" }, 0.84)
    .to(desktop, { skewX: 4, x: 22, duration: 0.045, ease: "steps(2)" }, 0.89)
    .fromTo(slices, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, 0.83)
    .fromTo(
      q('[data-os="slices"] > *'),
      { xPercent: 0 },
      { xPercent: (i: number) => [14, -22, 9, -12, 26, -8, 17][i % 7], duration: 0.11, ease: "steps(6)", stagger: 0.004 },
      0.83,
    );

  // 4 — collapse to a line, then nothing.
  tl.to(desktop, { scaleY: 0.006, skewX: 0, x: 0, filter: "brightness(3)", duration: 0.04, ease: "power4.in" }, 0.94)
    .to(warning, { autoAlpha: 0, duration: 0.02 }, 0.94)
    .to(slices, { autoAlpha: 0, duration: 0.02 }, 0.955)
    .fromTo(cover, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.03 }, 0.96)
    .set({}, {}, 1);

  return tl;
}
