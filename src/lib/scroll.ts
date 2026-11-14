import type Lenis from "lenis";

/**
 * Holder for the one and only Lenis instance. `useLenis` owns its lifecycle;
 * everything else (navigation, scroll locks) goes through these helpers.
 * `null` means native scrolling is in use (reduced motion).
 */
let instance: Lenis | null = null;

export const setLenis = (lenis: Lenis | null) => {
  instance = lenis;
};

export const getLenis = () => instance;

export function lockScroll() {
  if (instance) instance.stop();
  else document.documentElement.style.overflow = "hidden";
}

export function unlockScroll() {
  if (instance) instance.start();
  else document.documentElement.style.overflow = "";
}
