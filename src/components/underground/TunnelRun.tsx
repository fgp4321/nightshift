/** Number of frames flown through in the service tunnel. */
export const TUNNEL_RINGS = 9;

/**
 * The last run through the service tunnel: nested frames that scale past
 * the viewer. Purely 2D transforms, animated in undergroundAnimations.ts.
 */
export function TunnelRun() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#050307]">
      <div className="absolute left-1/2 top-1/2 size-[28vmin] -translate-x-1/2 -translate-y-1/2 bg-ns-magenta blur-[60px]" aria-hidden />
      {Array.from({ length: TUNNEL_RINGS }, (_, i) => (
        <div key={i} data-ug="ring" className="ns-ring" aria-hidden>
          <span className="ns-ring-lamp left-[8%] top-0" />
          <span className="ns-ring-lamp right-[8%] top-0" />
          <span className="absolute -left-px top-[30%] h-[2px] w-[6%] bg-ns-magenta/70" />
          <span className="absolute -right-px top-[62%] h-[2px] w-[6%] bg-ns-magenta/70" />
          {i % 3 === 0 && (
            <span className="ns-label absolute bottom-2 left-3 text-ns-magenta/80">S9-{String(40 - i * 4).padStart(2, "0")}</span>
          )}
        </div>
      ))}
    </div>
  );
}
