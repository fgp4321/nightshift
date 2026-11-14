/**
 * Text with a one-shot RGB split. Plays when a parent link/button is hovered
 * or focused, or while `active` is true. Styles: `.ns-glitch` in globals.css.
 */
export function GlitchText({ children, active = false }: { children: string; active?: boolean }) {
  return (
    <span className="ns-glitch" data-text={children} data-active={active || undefined}>
      {children}
    </span>
  );
}
