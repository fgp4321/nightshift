import type { HTMLAttributes, ReactNode } from "react";

interface HolographicPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Small caption in the panel's top edge. */
  label?: string;
  children: ReactNode;
}

/** Translucent NIGHT//OS surface: hairline frame, lit top edge, caption. */
export function HolographicPanel({ label, children, className = "", ...props }: HolographicPanelProps) {
  return (
    <div className={`ns-holo relative ${className}`} {...props}>
      {label && <p className="ns-label mb-3 text-accent">{label}</p>}
      {children}
    </div>
  );
}
