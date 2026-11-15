import gsap from "gsap";

interface UndergroundOptions {
  reducedMotion: boolean;
  /** Skip the SVG displacement filter (everything below the top quality tier). */
  lightweight: boolean;
}

/** Entering the act: fade up from black and settle the title. Time-based. */
export function playUndergroundIntro(root: HTMLElement, reducedMotion: boolean): gsap.core.Timeline {
  const q = gsap.utils.selector(root);
  const tl = gsap.timeline().fromTo(q('[data-ug="world"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, ease: "power2.out" });
  if (!reducedMotion) {
    tl.fromTo(
      q('[data-ug="title-line"]'),
      { yPercent: 110, "--ca": "0.16em" },
      { yPercent: 0, "--ca": "0em", duration: 0.9, ease: "power4.out", stagger: 0.09 },
      0.2,
    );
  }
  return tl;
}

/**
 * ACT 03 on one 0–1 clock, scrubbed by scroll:
 *   0.00 alley → 0.14 the door opens → 0.22 club → 0.36 gallery wipe →
 *   0.41–0.72 horizontal wall → 0.72 service tunnel → 0.93 lights out.
 * Must be rebuilt on resize (the horizontal distance is measured in px).
 */
export function createUndergroundTimeline(root: HTMLElement, { reducedMotion, lightweight }: UndergroundOptions): gsap.core.Timeline {
  const q = gsap.utils.selector(root);
  const one = (name: string) => q(`[data-ug="${name}"]`);
  const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
  const move = !reducedMotion;

  /* ── Alley ── */
  if (move) {
    tl.fromTo(one("alley-art"), { scale: 1 }, { scale: 1.9, duration: 0.21, ease: "power1.in" }, 0)
      .fromTo(one("alley-signs"), { scale: 1 }, { scale: 2.7, duration: 0.21, ease: "power1.in" }, 0)
      // Text fragmentation: the title breaks apart as the visitor walks in.
      .to(
        one("letter"),
        {
          x: (i: number) => ((i * 53) % 17) * 14 - 110,
          y: (i: number) => ((i * 31) % 13) * 16 - 130,
          rotation: (i: number) => ((i * 47) % 11) * 9 - 45,
          autoAlpha: 0,
          duration: 0.05,
          ease: "power2.in",
          stagger: 0.0025,
        },
        0.04,
      );
  } else {
    tl.to(one("title"), { autoAlpha: 0, duration: 0.03 }, 0.07);
  }
  tl.to(one("alley-copy"), { autoAlpha: 0, duration: 0.03 }, 0.045).to(one("alley-signs"), { autoAlpha: 0, duration: 0.03 }, 0.15);

  /* ── The door opens onto the club ── */
  if (move) {
    tl.set(one("club"), { autoAlpha: 1 }, 0.14)
      .fromTo(one("club"), { clipPath: "inset(38% 45% 31% 45%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.08, ease: "power2.inOut" }, 0.14)
      .fromTo(one("club-inner"), { scale: 1.14 }, { scale: 1, duration: 0.2, ease: "power1.out" }, 0.14);
    if (!lightweight) {
      // Distortion transition: the image tears while the door is opening.
      tl.set(one("club"), { filter: "url(#ug-distort)" }, 0.14)
        .fromTo(one("displace"), { attr: { scale: 0 } }, { attr: { scale: 80 }, duration: 0.035, ease: "power1.in" }, 0.14)
        .to(one("displace"), { attr: { scale: 0 }, duration: 0.045, ease: "power1.out" }, 0.175)
        .set(one("club"), { filter: "none" }, 0.2205);
    }
  } else {
    tl.fromTo(one("club"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05 }, 0.15);
  }
  tl.set(one("alley"), { autoAlpha: 0 }, 0.222)
    .fromTo(one("club-copy"), { autoAlpha: 0, y: move ? 24 : 0 }, { autoAlpha: 1, y: 0, duration: 0.03, ease: "power2.out" }, 0.225)
    .to(one("club-copy"), { autoAlpha: 0, duration: 0.02 }, 0.32);

  /* ── Experimental type crossing the frame ── */
  tl.fromTo(one("marquee"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.02 }, 0.3).to(one("marquee"), { autoAlpha: 0, duration: 0.02 }, 0.42);
  if (move) {
    tl.fromTo(one("marquee-a"), { xPercent: 0 }, { xPercent: -38, duration: 0.15 }, 0.29).fromTo(
      one("marquee-b"),
      { xPercent: -38 },
      { xPercent: 0, duration: 0.15 },
      0.29,
    );
  }

  /* ── The wall: mask wipe in, then horizontal travel ── */
  const track = one("track")[0] as HTMLElement | undefined;
  const distance = track ? Math.max(0, track.scrollWidth - root.clientWidth) : 0;
  const start = 0.41;
  const span = 0.31;

  if (move) {
    tl.set(one("gallery"), { autoAlpha: 1 }, 0.36).fromTo(
      one("gallery"),
      { clipPath: "inset(0% 0% 0% 100%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: 0.05, ease: "power2.inOut" },
      0.36,
    );
  } else {
    tl.fromTo(one("gallery"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.04 }, 0.37);
  }
  tl.set(one("club"), { autoAlpha: 0 }, 0.412).fromTo(one("track"), { x: 0 }, { x: -distance, duration: span }, start);

  if (move) {
    // Scroll-linked reveals: each poster unmasks as it reaches the frame.
    (one("poster") as HTMLElement[]).forEach((poster) => {
      const figure = poster.closest("figure");
      const offset = figure ? figure.offsetLeft - root.clientWidth * 0.82 : 0;
      const at = start + span * Math.min(1, Math.max(0, distance ? offset / distance : 0));
      tl.fromTo(poster, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.04, ease: "power2.out" }, Math.max(0.37, at - 0.01));
    });
    tl.fromTo(one("poster-art"), { xPercent: 2.5, scale: 1.06 }, { xPercent: -2.5, scale: 1.06, duration: span + 0.04 }, start - 0.04);
  }

  /* ── Service tunnel ── */
  tl.fromTo(one("tunnel"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.03 }, 0.72).set(one("gallery"), { autoAlpha: 0 }, 0.752);
  const rings = one("ring");
  if (move) {
    rings.forEach((ring, i) => {
      const at = 0.725 + i * 0.011;
      tl.fromTo(ring, { scale: 0.04 }, { scale: 4.2, duration: 0.13, ease: "power3.in" }, at)
        .fromTo(ring, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.015 }, at)
        .to(ring, { autoAlpha: 0, duration: 0.008 }, at + 0.122);
    });
  } else {
    rings.forEach((ring, i) => tl.set(ring, { scale: 0.12 * 1.42 ** i, autoAlpha: 1 }, 0));
  }
  tl.fromTo(one("tunnel-copy"), { autoAlpha: 0, scale: move ? 0.92 : 1 }, { autoAlpha: 1, scale: 1, duration: 0.03, ease: "power2.out" }, 0.8)
    .to(one("tunnel-copy"), { autoAlpha: 0, duration: 0.025 }, 0.9)
    .fromTo(one("hatch"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.02 }, 0.755)
    .to(one("hatch"), { autoAlpha: 0, duration: 0.02 }, 0.885);

  /* ── Lights out ── */
  tl.fromTo(one("cover"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05 }, 0.93)
    .fromTo(one("lost"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, 0.955)
    .to(one("lost"), { autoAlpha: 0, duration: 0.015 }, 0.98)
    .set({}, {}, 1);

  return tl;
}
