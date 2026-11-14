/** Scanlines, grain and vignette over the whole experience. Purely visual. */
export function ScreenTexture() {
  return (
    <div className="pointer-events-none fixed inset-0 z-30" aria-hidden>
      <div className="ns-scanlines absolute inset-0" />
      <div className="ns-grain absolute inset-0" />
      <div className="ns-vignette absolute inset-0" />
    </div>
  );
}
