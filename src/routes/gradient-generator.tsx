import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, Check, Plus, X, Shuffle } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/gradient-generator")({
  head: () => ({
    meta: [
      { title: "CSS Gradient Generator — Free Linear & Radial Gradients" },
      { name: "description", content: "Design beautiful CSS gradients with a live preview. Linear, radial and conic. Pick angles, stops and colors — copy the CSS in one click." },
      { property: "og:title", content: "CSS Gradient Generator — Bluebird" },
      { property: "og:description", content: "Build linear, radial and conic CSS gradients with a live preview." },
      { property: "og:url", content: "/gradient-generator" },
    ],
    links: [{ rel: "canonical", href: "/gradient-generator" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird Gradient Generator",
          applicationCategory: "DesignApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: Page,
});

type GType = "linear" | "radial" | "conic";
type Stop = { color: string; pos: number };

const PRESETS: { name: string; stops: Stop[]; angle: number }[] = [
  { name: "Sky", angle: 135, stops: [{ color: "#60a5fa", pos: 0 }, { color: "#a78bfa", pos: 100 }] },
  { name: "Sunset", angle: 90, stops: [{ color: "#fb7185", pos: 0 }, { color: "#fbbf24", pos: 100 }] },
  { name: "Mint", angle: 120, stops: [{ color: "#34d399", pos: 0 }, { color: "#22d3ee", pos: 100 }] },
  { name: "Peach", angle: 45, stops: [{ color: "#fda4af", pos: 0 }, { color: "#fed7aa", pos: 100 }] },
  { name: "Night", angle: 180, stops: [{ color: "#1e3a8a", pos: 0 }, { color: "#0f172a", pos: 100 }] },
  { name: "Aurora", angle: 110, stops: [{ color: "#a7f3d0", pos: 0 }, { color: "#93c5fd", pos: 50 }, { color: "#c4b5fd", pos: 100 }] },
];

export function buildGradient(type: GType, angle: number, stops: Stop[]): string {
  const s = [...stops].sort((a, b) => a.pos - b.pos).map((st) => `${st.color} ${st.pos}%`).join(", ");
  if (type === "linear") return `linear-gradient(${angle}deg, ${s})`;
  if (type === "radial") return `radial-gradient(circle, ${s})`;
  return `conic-gradient(from ${angle}deg, ${s})`;
}

function Page() {
  const [type, setType] = useState<GType>("linear");
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState<Stop[]>(PRESETS[0].stops);
  const [copied, setCopied] = useState(false);

  const css = useMemo(() => buildGradient(type, angle, stops), [type, angle, stops]);
  const fullCss = `background: ${css};`;

  function addStop() {
    if (stops.length >= 8) return;
    const last = stops[stops.length - 1];
    setStops([...stops, { color: last.color, pos: Math.min(100, last.pos + 10) }]);
  }
  function update(i: number, patch: Partial<Stop>) {
    setStops(stops.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }
  function remove(i: number) {
    if (stops.length <= 2) return;
    setStops(stops.filter((_, idx) => idx !== i));
  }
  function shuffle() {
    setStops([...stops].sort(() => Math.random() - 0.5).map((s, i, arr) => ({ ...s, pos: Math.round((i / Math.max(1, arr.length - 1)) * 100) })));
  }
  async function copy() {
    await navigator.clipboard.writeText(fullCss);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  return (
    <ToolLayout slug="gradient-generator">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        {/* Preview */}
        <section className="soft-card p-5 sm:p-6 space-y-4">
          <div className="eyebrow">Live preview</div>
          <div
            className="rounded-2xl border border-border min-h-72 shadow-soft"
            style={{ background: css }}
            aria-label="Gradient preview"
          />
          <div>
            <div className="eyebrow mb-2">Presets</div>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => { setStops(p.stops); setAngle(p.angle); }}
                  className="rounded-xl border border-border overflow-hidden hover:border-primary min-h-11 px-3 text-sm inline-flex items-center gap-2"
                >
                  <span className="inline-block size-5 rounded-full border border-border" style={{ background: buildGradient("linear", p.angle, p.stops) }} />
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Controls */}
        <section className="soft-card p-5 sm:p-6 space-y-5">
          <div>
            <div className="eyebrow mb-2">Type</div>
            <div role="radiogroup" className="grid grid-cols-3 gap-2">
              {(["linear", "radial", "conic"] as GType[]).map((g) => (
                <button
                  key={g}
                  role="radio"
                  aria-checked={type === g}
                  onClick={() => setType(g)}
                  className={`min-h-11 rounded-xl border px-3 text-sm capitalize ${type === g ? "border-primary bg-primary-soft" : "border-border bg-card hover:bg-primary-soft"}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {type !== "radial" && (
            <div>
              <label htmlFor="g-angle" className="eyebrow mb-2 block">Angle · {angle}°</label>
              <input
                id="g-angle"
                type="range"
                min={0}
                max={360}
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="eyebrow">Color stops</div>
              <div className="flex gap-2">
                <button onClick={shuffle} className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs">
                  <Shuffle className="size-3.5" /> Even
                </button>
                <button onClick={addStop} disabled={stops.length >= 8} className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs disabled:opacity-50">
                  <Plus className="size-3.5" /> Add stop
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {stops.map((s, i) => (
                <div key={i} className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-2">
                  <input
                    type="color"
                    value={s.color}
                    onChange={(e) => update(i, { color: e.target.value })}
                    aria-label={`Stop ${i + 1} color`}
                    className="size-10 rounded-lg border border-border bg-card cursor-pointer"
                  />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={s.pos}
                    onChange={(e) => update(i, { pos: Number(e.target.value) })}
                    aria-label={`Stop ${i + 1} position`}
                    className="w-full accent-primary"
                  />
                  <span className="w-12 text-right text-sm tabular-nums text-muted-foreground">{s.pos}%</span>
                  <button
                    onClick={() => remove(i)}
                    disabled={stops.length <= 2}
                    aria-label={`Remove stop ${i + 1}`}
                    className="grid place-items-center size-10 rounded-lg border border-border bg-card hover:bg-primary-soft disabled:opacity-40"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="eyebrow mb-2">CSS</div>
            <pre className="rounded-xl border border-border bg-card p-3 text-xs font-mono overflow-x-auto">{fullCss}</pre>
            <button onClick={copy} className="mt-3 inline-flex items-center gap-2 min-h-11 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-95">
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Copied" : "Copy CSS"}
            </button>
          </div>
        </section>
      </div>

      <HowItWorks>
        <li>Pick a preset or start with two colors of your own.</li>
        <li>Adjust the type, angle and stop positions in the live preview.</li>
        <li>Copy the CSS and paste it straight into your stylesheet.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
