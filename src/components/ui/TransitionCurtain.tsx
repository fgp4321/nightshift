/**
 * Full-screen wipe used when jumping between acts. Markup only — it is
 * animated exclusively by GSAP from `animations/transitions.ts`, which
 * finds it by id.
 */

export function TransitionCurtain() {
  return (
    <div
      id="ns-curtain"
      className="invisible fixed inset-0 z-[70] flex items-center justify-center bg-ns-black"
      aria-hidden
    >
      <div className="ns-grid absolute inset-0" />
      <div className="absolute inset-x-0 top-0 h-px bg-accent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-accent" />
      <div className="relative px-[var(--hud-pad)] text-center">
        <p className="ns-label text-accent" data-curtain-kicker>
          Rerouting
        </p>
        <p className="ns-monument mt-3 text-[length:var(--text-hero)] text-ns-white" data-curtain-title />
      </div>
    </div>
  );
}
