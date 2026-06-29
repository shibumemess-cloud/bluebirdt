import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Coins } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/coin-flip")({
  head: () => ({
    meta: [
      { title: "Coin Flip — Heads or Tails Online, True Random" },
      { name: "description", content: "Flip a fair coin online. Single flip or batch flip many at once. Cryptographically random — settle any tie." },
      { property: "og:title", content: "Coin Flip — Bluebird" },
      { property: "og:description", content: "Heads or tails, fair and instant." },
      { property: "og:url", content: "/coin-flip" },
    ],
    links: [{ rel: "canonical", href: "/coin-flip" }],
  }),
  component: Page,
});

function flip(): "H" | "T" {
  const b = new Uint8Array(1);
  crypto.getRandomValues(b);
  return b[0] < 128 ? "H" : "T";
}

function Page() {
  const [result, setResult] = useState<"H" | "T" | null>(null);
  const [animating, setAnimating] = useState(false);
  const [count, setCount] = useState(1);
  const [stats, setStats] = useState({ h: 0, t: 0 });
  const [batch, setBatch] = useState<string[]>([]);

  function go() {
    if (count === 1) {
      setAnimating(true);
      setTimeout(() => {
        const r = flip();
        setResult(r);
        setStats((s) => ({ h: s.h + (r === "H" ? 1 : 0), t: s.t + (r === "T" ? 1 : 0) }));
        setAnimating(false);
        setBatch([]);
      }, 600);
    } else {
      const arr: string[] = [];
      let h = 0, t = 0;
      for (let i = 0; i < count; i++) {
        const r = flip();
        arr.push(r === "H" ? "Heads" : "Tails");
        if (r === "H") h++; else t++;
      }
      setBatch(arr);
      setResult(null);
      setStats((s) => ({ h: s.h + h, t: s.t + t }));
    }
  }

  return (
    <ToolLayout slug="coin-flip">
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <section className="soft-card p-8 text-center">
          <div className="mx-auto" style={{ perspective: "1000px" }}>
            <div
              aria-live="polite"
              className={["mx-auto grid place-items-center size-40 sm:size-52 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-amber-900 font-display text-5xl shadow-lift transition-transform duration-500",
                animating ? "animate-[spin_0.6s_linear]" : "",
              ].join(" ")}
            >
              {animating ? "?" : result === "H" ? "H" : result === "T" ? "T" : "?"}
            </div>
          </div>
          <div className="mt-6 font-display text-2xl">
            {animating ? "Flipping…" : result ? (result === "H" ? "Heads" : "Tails") : "Ready when you are"}
          </div>
          <button onClick={go} disabled={animating}
            className="mt-6 min-h-12 px-8 rounded-xl bg-primary text-primary-foreground font-semibold inline-flex items-center gap-2 hover:shadow-lift hover:-translate-y-0.5 disabled:opacity-50">
            <Coins className="size-5" /> Flip
          </button>
          {batch.length > 0 && (
            <div className="mt-6 text-sm text-left max-h-48 overflow-y-auto rounded-xl border border-border bg-card p-3">
              <div className="eyebrow mb-2">{batch.length} flips</div>
              <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                {batch.map((b, i) => (
                  <span key={i} className={["px-2 py-1 rounded border", b === "Heads" ? "border-amber-400/50 bg-amber-50 dark:bg-amber-950/30" : "border-slate-400/40 bg-slate-50 dark:bg-slate-900/40"].join(" ")}>
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="soft-card p-5 sm:p-6 space-y-5">
          <div>
            <label htmlFor="cf-c" className="eyebrow">Flip how many at once</label>
            <input id="cf-c" type="number" min={1} max={1000} value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))}
              className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3 tabular-nums focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <div className="eyebrow mb-2">Session stats</div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="font-display text-3xl tabular-nums text-amber-600">{stats.h}</div>
                <div className="text-xs text-muted-foreground mt-1">Heads</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="font-display text-3xl tabular-nums text-slate-600 dark:text-slate-300">{stats.t}</div>
                <div className="text-xs text-muted-foreground mt-1">Tails</div>
              </div>
            </div>
            {stats.h + stats.t > 0 && (
              <div className="mt-2 text-xs text-muted-foreground text-center">
                Heads {((stats.h / (stats.h + stats.t)) * 100).toFixed(1)}% · Tails {((stats.t / (stats.h + stats.t)) * 100).toFixed(1)}%
              </div>
            )}
            <button onClick={() => setStats({ h: 0, t: 0 })} className="mt-3 w-full min-h-10 rounded-lg border border-border bg-card/50 text-xs text-muted-foreground hover:text-primary">
              Reset stats
            </button>
          </div>
        </section>
      </div>

      <HowItWorks>
        <li>Tap Flip for a fair, animated heads-or-tails.</li>
        <li>Bump the count to flip many coins at once.</li>
        <li>All randomness comes from your browser's secure crypto source.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
