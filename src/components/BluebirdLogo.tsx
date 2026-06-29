import type { SVGProps } from "react";

/**
 * Bluebird brand mark — a custom geometric bird in flight.
 * Two overlapping wing shapes form the body and a single beak triangle.
 * Designed in-house for Bluebird; not derived from any icon library.
 *
 * Usage:
 *   <BluebirdMark className="size-9" />          // square mark only
 *   <BluebirdLogo className="h-8" />             // mark + wordmark lockup
 *
 * Sizing rules (see brand-kit skill):
 *  - Minimum mark size: 20px. Minimum lockup height: 24px.
 *  - Always inherits currentColor for the wordmark; mark uses brand blues.
 */

export function BluebirdMark({
  title = "Bluebird",
  ...props
}: SVGProps<SVGSVGElement> & { title?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>{title}</title>
      <defs>
        <linearGradient id="bb-wing" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5BA8FF" />
          <stop offset="100%" stopColor="#1E66F5" />
        </linearGradient>
        <linearGradient id="bb-body" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#1E66F5" />
          <stop offset="100%" stopColor="#0B3FB0" />
        </linearGradient>
      </defs>
      {/* Lower wing — sweeping curve */}
      <path
        d="M4 30 C 14 36, 26 36, 38 28 C 30 40, 16 44, 6 38 Z"
        fill="url(#bb-wing)"
      />
      {/* Body — soft triangular bird silhouette */}
      <path
        d="M10 22 C 14 10, 28 8, 38 14 C 42 16, 44 20, 40 24 C 30 30, 18 30, 10 26 Z"
        fill="url(#bb-body)"
      />
      {/* Beak */}
      <path d="M40 14 L 46 18 L 40 20 Z" fill="#FFC04D" />
      {/* Eye highlight */}
      <circle cx="33" cy="17" r="1.6" fill="#F8FAFF" />
    </svg>
  );
}

export function BluebirdLogo({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <BluebirdMark className="size-9 shrink-0" {...props} />
      <span className="font-display text-xl tracking-tight">Bluebird</span>
    </span>
  );
}
