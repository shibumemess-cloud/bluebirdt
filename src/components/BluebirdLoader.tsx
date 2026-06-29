import { BluebirdMark } from "./BluebirdLogo";

/**
 * Branded loader. Three sizes:
 *  - inline: small spinner for buttons/inline use
 *  - block:  centered block with optional label (cards, panels)
 *  - page:   full-screen overlay (route pending, app boot)
 *
 * Animation uses bluebird-float + bluebird-orbit keyframes from styles.css
 * and falls back to a static mark when prefers-reduced-motion is set.
 */
export function BluebirdLoader({
  variant = "block",
  label = "Loading…",
  className = "",
}: {
  variant?: "inline" | "block" | "page";
  label?: string;
  className?: string;
}) {
  if (variant === "inline") {
    return (
      <span
        role="status"
        aria-label={label}
        className={`inline-flex items-center gap-2 ${className}`}
      >
        <span className="bluebird-spinner size-4" aria-hidden />
        <span className="sr-only">{label}</span>
      </span>
    );
  }

  const Mark = (
    <div className="relative flex items-center justify-center">
      <div className="bluebird-orbit absolute inset-0 rounded-full" aria-hidden />
      <BluebirdMark className="bluebird-float relative size-12 drop-shadow-[0_6px_18px_color-mix(in_oklch,var(--primary)_45%,transparent)]" />
    </div>
  );

  if (variant === "page") {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`fixed inset-0 z-[55] flex flex-col items-center justify-center gap-5 bg-background/85 backdrop-blur-sm ${className}`}
      >
        {Mark}
        <div className="flex flex-col items-center gap-1.5">
          <p className="font-display text-base font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">Working privately in your browser</p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-4 py-12 ${className}`}
    >
      {Mark}
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
