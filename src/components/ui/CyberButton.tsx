import type { ButtonHTMLAttributes, Ref } from "react";

interface CyberButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "ghost" | "solid";
  ref?: Ref<HTMLButtonElement>;
  /** Label shown next to the custom cursor on hover. */
  cursorLabel?: string;
}

/** HUD button: hairline frame with an accent corner tick. */
export function CyberButton({ variant = "ghost", cursorLabel, className = "", children, ...props }: CyberButtonProps) {
  const look =
    variant === "solid"
      ? "bg-accent text-ns-black hover:bg-ns-white"
      : "border border-ns-line text-ns-white hover:border-accent hover:text-accent";
  return (
    <button
      type="button"
      data-cursor={cursorLabel}
      className={`ns-label ns-tick relative inline-flex h-11 items-center gap-2 px-4 transition-colors duration-200 ${look} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
