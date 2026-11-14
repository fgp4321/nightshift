import gsap from "gsap";

/** Everything the camera timeline animates. Applied to the camera per frame. */
export interface CameraRig {
  px: number; py: number; pz: number;
  tx: number; ty: number; tz: number;
  fov: number;
  /** Fog density: thin from the air, thick in the streets. */
  fog: number;
  /** Access terminal power, 0–1. */
  holo: number;
}

/**
 * The five beats of ACT 01, as scene-progress positions.
 * Reduced-motion mode cuts between these instead of flying.
 */
export const CAMERA_STATIONS = [0, 0.26, 0.56, 0.76, 0.93] as const;

const SHOTS: CameraRig[] = [
  // 1 — establishing aerial
  { px: -150, py: 185, pz: 340, tx: 0, ty: 70, tz: 0, fov: 38, fog: 0.0026, holo: 0 },
  // 2 — slow approach towards the skyline
  { px: -58, py: 108, pz: 222, tx: 0, ty: 78, tz: 0, fov: 40, fog: 0.003, holo: 0 },
  // 3 — down between the buildings, along the boulevard
  { px: 6, py: 27, pz: 150, tx: 0, ty: 46, tz: 30, fov: 46, fog: 0.0042, holo: 0.1 },
  // 4 — out from under the highway: the spire fills the sky
  { px: 9, py: 11, pz: 62, tx: 0, ty: 112, tz: 0, fov: 56, fog: 0.0044, holo: 0.4 },
  // 5 — the access terminal
  { px: 0, py: 5.6, pz: 47, tx: 0, ty: 4.6, tz: 30, fov: 42, fog: 0.005, holo: 1 },
  // 6 — push in until the hologram is the screen
  { px: 0, py: 4.4, pz: 34.6, tx: 0, ty: 4.4, tz: 30, fov: 36, fog: 0.005, holo: 1 },
];

export function createCameraRig(): CameraRig {
  return { ...SHOTS[0] };
}

/** Paused timeline of length 1; drive it with `timeline.progress(sceneProgress)`. */
export function createCameraTimeline(rig: CameraRig): gsap.core.Timeline {
  const [s0, s1, s2, s3, s4] = CAMERA_STATIONS;
  return gsap
    .timeline({ paused: true, defaults: { ease: "sine.inOut" } })
    .set(rig, { ...SHOTS[0] }, 0)
    .to(rig, { ...SHOTS[1], duration: s1 - s0, ease: "sine.out" }, s0)
    .to(rig, { ...SHOTS[2], duration: s2 - s1 }, s1)
    .to(rig, { ...SHOTS[3], duration: s3 - s2 }, s2)
    .to(rig, { ...SHOTS[4], duration: s4 - s3 }, s3)
    .to(rig, { ...SHOTS[5], duration: 1 - s4, ease: "power2.in" }, s4);
}

/** Which station a progress value belongs to (for reduced motion). */
export function stationFor(progress: number): number {
  let station: number = CAMERA_STATIONS[0];
  for (const stop of CAMERA_STATIONS) if (progress >= stop - 0.04) station = stop;
  return station;
}

/**
 * Captions and the terminal hand-off, on the same 0–1 clock as the camera.
 * Elements are looked up by `data-city` inside `root`.
 */
export function createCityOverlayTimeline(root: HTMLElement, reducedMotion: boolean): gsap.core.Timeline {
  const q = gsap.utils.selector(root);
  const shift = reducedMotion ? 0 : 28;
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });

  const beat = (name: string, start: number, end: number, initiallyVisible = false) => {
    const el = q(`[data-city="${name}"]`);
    if (!initiallyVisible) {
      tl.fromTo(el, { autoAlpha: 0, y: shift }, { autoAlpha: 1, y: 0, duration: 0.045 }, start);
    }
    tl.to(el, { autoAlpha: 0, y: -shift, duration: 0.04, ease: "power2.in" }, end);
  };

  beat("title", 0, 0.13, true);
  beat("district", 0.19, 0.43);
  beat("watching", 0.5, 0.68);
  beat("spire", 0.72, 0.86);

  // Terminal: brackets close in, the scan runs, the world goes dark.
  tl.fromTo(q('[data-city="terminal"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.03 }, 0.9)
    .fromTo(q('[data-city="brackets"]'), { scale: 1.35 }, { scale: 1, duration: 0.06 }, 0.9)
    .fromTo(q('[data-city="granted"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.015 }, 0.965)
    .to(q('[data-city="scanning"]'), { autoAlpha: 0, duration: 0.01 }, 0.96)
    .fromTo(q('[data-city="cover"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.035, ease: "none" }, 0.965)
    // Pad to exactly 1 so progress maps 1:1.
    .set({}, {}, 1);

  return tl;
}
