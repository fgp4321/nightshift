/** NIGHT//SHIFT wordmark. The double slash always carries the accent. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-extrabold uppercase tracking-[0.14em] ${className}`}>
      NIGHT<span className="text-accent">{"//"}</span>SHIFT
    </span>
  );
}
