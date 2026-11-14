import type Lenis from "lenis";

/**
 * Holder for the one and only Lenis instance. `useLenis` owns its lifecycle;
 * everything else (navigation, scroll locks) goes through these helpers.
 * `null` means native scrolling is in use (reduced motion).
 */
let instance: Lenis | null = null;

/** Reasons scrolling is currently locked (boot, menu, transition…). */
const locks = new Set<string>();

function apply() {
  const locked = locks.size > 0;
  document.documentElement.style.overflow = locked ? "hidden" : "";
  if (locked) instance?.stop();
  else instance?.start();
}

export const setLenis = (lenis: Lenis | null) => {
  instance = lenis;
  if (lenis && locks.size > 0) lenis.stop();
};

export const getLenis = () => instance;

/** Locks are keyed so independent owners can never unlock each other. */
export function lockScroll(reason: string) {
  locks.add(reason);
  apply();
}

export function unlockScroll(reason: string) {
  locks.delete(reason);
  apply();
}
