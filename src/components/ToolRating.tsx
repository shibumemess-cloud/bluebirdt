import { useEffect, useState } from "react";
import { Star } from "lucide-react";

type Stats = { count: number; sum: number };

function readStats(slug: string): Stats {
  try {
    const raw = localStorage.getItem(`bb:rating:stats:${slug}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { count: 0, sum: 0 };
}
function writeStats(slug: string, s: Stats) {
  try { localStorage.setItem(`bb:rating:stats:${slug}`, JSON.stringify(s)); } catch {}
}
function readMine(slug: string): number | null {
  try {
    const v = localStorage.getItem(`bb:rating:mine:${slug}`);
    return v ? Number(v) : null;
  } catch { return null; }
}

export function ToolRating({ slug, name }: { slug: string; name: string }) {
  const [mine, setMine] = useState<number | null>(null);
  const [hover, setHover] = useState(0);
  const [stats, setStats] = useState<Stats>({ count: 0, sum: 0 });

  useEffect(() => {
    setMine(readMine(slug));
    setStats(readStats(slug));
  }, [slug]);

  function rate(n: number) {
    const prev = mine;
    const next = readStats(slug);
    if (prev) {
      next.sum = Math.max(0, next.sum - prev);
    } else {
      next.count += 1;
    }
    next.sum += n;
    writeStats(slug, next);
    try { localStorage.setItem(`bb:rating:mine:${slug}`, String(n)); } catch {}
    setStats(next);
    setMine(n);
  }

  const avg = stats.count ? stats.sum / stats.count : 0;
  const shown = hover || mine || 0;

  return (
    <section className="mt-10 soft-card p-5 sm:p-6" aria-labelledby={`rate-${slug}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 id={`rate-${slug}`} className="font-display text-lg sm:text-xl tracking-tight">
            Rate {name}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {mine ? "Thanks for rating — tap a star to change it." : "Your feedback helps us improve this tool."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-1"
            role="radiogroup"
            aria-label={`Rate ${name} from 1 to 5 stars`}
            onMouseLeave={() => setHover(0)}
          >
            {[1, 2, 3, 4, 5].map((n) => {
              const active = n <= shown;
              return (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={mine === n}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  onMouseEnter={() => setHover(n)}
                  onFocus={() => setHover(n)}
                  onBlur={() => setHover(0)}
                  onClick={() => rate(n)}
                  className="p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-ring transition-transform hover:scale-110"
                >
                  <Star
                    className={[
                      "size-7 transition-colors",
                      active ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40",
                    ].join(" ")}
                  />
                </button>
              );
            })}
          </div>
          <div className="text-sm text-muted-foreground tabular-nums min-w-[5.5rem] text-right">
            {stats.count > 0 ? (
              <>
                <span className="font-semibold text-foreground">{avg.toFixed(1)}</span>
                <span> / 5 · {stats.count}</span>
              </>
            ) : (
              <span>No ratings yet</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
