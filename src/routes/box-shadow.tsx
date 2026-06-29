import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Copy, Check, Plus, Trash2, Layers } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/box-shadow")({
  head: () => ({
    meta: [
      { title: "CSS Box Shadow Generator — Visual, Multi-Layer, Free" },
      {
        name: "description",
        content:
          "Design CSS box-shadow visually. Stack multiple layers, tweak X, Y, blur, spread and color, copy the CSS in one click. Free, in-browser, no sign-up.",
      },
      { property: "og:title", content: "CSS Box Shadow Generator — Bluebird" },
      { property: "og:description", content: "Build beautiful CSS shadows with a live preview and one-click copy." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/box-shadow" },
    ],
    links: [{ rel: "canonical", href: "/box-shadow" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird CSS Box Shadow Generator",
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: Page,
});

type Layer = {
  id: string;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  inset: boolean;
};

const PRESETS: { name: string; layers: Omit<Layer, "id">[] }[] = [
  {
    name: "Soft card",
    layers: [
      { x: 0, y: 1, blur: 2, spread: 0, color: "#0f172a14", inset: false },
      { x: 0, y: 8, blur: 24, spread: -8, color: "#0f172a1f", inset: false },
    ],
  },
  {
    name: "Floating",
    layers: [
      { x: 0, y: 20, blur: 40, spread: -12, color: "#0f172a33", inset: false },
    ],
  },
  {
    name: "Inner glow",
    layers: [
      { x: 0, y: 0, blur: 0, spread: 2, color: "#3b82f6", inset: true },
    ],
  },
  {
    name: "Neumorphism",
    layers: [
      { x: -8, y: -8, blur: 24, spread: 0, color: "#ffffff", inset: false },
      { x: 8, y: 8, blur: 24, spread: 0, color: "#0f172a26", inset: false },
    ],
  },
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function toCss(layers: Layer[]) {
  if (!layers.length) return "none";
  return layers
    .map((l) => `${l.inset ? "inset " : ""}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${l.color}`)
    .join(",\n  ");
}

function Page() {
  const [layers, setLayers] = useState<Layer[]>(() =>
    PRESETS[0].layers.map((l) => ({ ...l, id: uid() })),
  );
  const [bg, setBg] = useState("#f1f5f9");
  const [boxColor, setBoxColor] = useState("#ffffff");
  const [radius, setRadius] = useState(16);
  const [copied, setCopied] = useState(false);

  const css = useMemo(() => toCss(layers), [layers]);

  function update(id: string, patch: Partial<Layer>) {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }
  function remove(id: string) {
    setLayers((prev) => prev.filter((l) => l.id !== id));
  }
  function add() {
    setLayers((prev) => [
      ...prev,
      { id: uid(), x: 0, y: 4, blur: 12, spread: 0, color: "#0f172a26", inset: false },
    ]);
  }

  async function copy() {
    await navigator.clipboard.writeText(`box-shadow: ${css};`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <ToolLayout slug="box-shadow">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        {/* Controls */}
        <section className="soft-card p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="eyebrow">Shadow layers</div>
            <button
              onClick={add}
              className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs"
            >
              <Plus className="size-3.5" /> Add layer
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => setLayers(p.layers.map((l) => ({ ...l, id: uid() })))}
                className="min-h-9 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs"
              >
                {p.name}
              </button>
            ))}
          </div>

          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
            {layers.map((l, i) => (
              <div key={l.id} className="rounded-xl border border-border bg-card/60 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium inline-flex items-center gap-1.5">
                    <Layers className="size-3.5 text-primary" /> Layer {i + 1}
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-1.5 text-xs">
                      <input
                        type="checkbox"
                        checked={l.inset}
                        onChange={(e) => update(l.id, { inset: e.target.checked })}
                      />
                      Inset
                    </label>
                    {layers.length > 1 && (
                      <button
                        aria-label="Remove layer"
                        onClick={() => remove(l.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {(["x", "y", "blur", "spread"] as const).map((k) => (
                    <label key={k} className="space-y-1">
                      <div className="flex justify-between text-muted-foreground">
                        <span className="capitalize">{k}</span>
                        <span className="tabular-nums">{l[k]}px</span>
                      </div>
                      <input
                        type="range"
                        min={k === "blur" ? 0 : -100}
                        max={100}
                        value={l[k]}
                        onChange={(e) => update(l.id, { [k]: Number(e.target.value) } as Partial<Layer>)}
                        className="w-full accent-primary"
                      />
                    </label>
                  ))}
                </div>

                <label className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground w-12">Color</span>
                  <input
                    type="color"
                    value={l.color.length === 7 ? l.color : "#000000"}
                    onChange={(e) => update(l.id, { color: e.target.value })}
                    className="h-8 w-12 rounded border border-border bg-card"
                  />
                  <input
                    type="text"
                    value={l.color}
                    onChange={(e) => update(l.id, { color: e.target.value })}
                    className="flex-1 min-h-9 rounded-lg border border-border bg-card px-2 font-mono"
                  />
                </label>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <label className="space-y-1">
              <div className="text-muted-foreground">Box color</div>
              <input
                type="color"
                value={boxColor}
                onChange={(e) => setBoxColor(e.target.value)}
                className="h-10 w-full rounded border border-border bg-card"
              />
            </label>
            <label className="space-y-1">
              <div className="text-muted-foreground">Background</div>
              <input
                type="color"
                value={bg}
                onChange={(e) => setBg(e.target.value)}
                className="h-10 w-full rounded border border-border bg-card"
              />
            </label>
            <label className="space-y-1">
              <div className="flex justify-between text-muted-foreground">
                <span>Radius</span>
                <span className="tabular-nums">{radius}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={64}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full accent-primary mt-1.5"
              />
            </label>
          </div>
        </section>

        {/* Preview + CSS */}
        <section className="soft-card p-5 sm:p-6 space-y-4">
          <div className="eyebrow">Live preview</div>
          <div
            className="rounded-2xl flex items-center justify-center p-10 transition-colors"
            style={{ background: bg, minHeight: 280 }}
          >
            <div
              style={{
                width: 180,
                height: 120,
                background: boxColor,
                borderRadius: radius,
                boxShadow: css,
              }}
              aria-label="Shadow preview"
            />
          </div>

          <div className="rounded-xl border border-border bg-card p-3 font-mono text-xs whitespace-pre overflow-x-auto">
            box-shadow: {css};
          </div>

          <button
            onClick={copy}
            className="inline-flex items-center gap-2 min-h-11 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-95"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Copied" : "Copy CSS"}
          </button>
        </section>
      </div>

      <HowItWorks>
        <li>Start from a preset or build shadows from scratch.</li>
        <li>Stack multiple layers for depth — drag each slider for X, Y, blur and spread.</li>
        <li>Copy the ready-to-paste CSS into your stylesheet.</li>
      </HowItWorks>
    </ToolLayout>
  );
}

// Keep an export so future tests can import the formatter.
export { toCss as buildBoxShadowCss };

// Silence unused import warning when CI strips dev hooks.
useEffect;
