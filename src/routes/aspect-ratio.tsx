import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/aspect-ratio")({
  head: () => ({
    meta: [
      { title: "Aspect Ratio Calculator — Free Online (16:9, 4:3, 1:1)" },
      { name: "description", content: "Calculate width or height for any aspect ratio. Presets for 16:9, 9:16, 4:3, 1:1, 21:9 plus social media. Instant results, copy in a tap." },
      { property: "og:title", content: "Aspect Ratio Calculator — Bluebird" },
      { property: "og:description", content: "Get perfect dimensions for video, photo and social." },
      { property: "og:url", content: "/aspect-ratio" },
    ],
    links: [{ rel: "canonical", href: "/aspect-ratio" }],
  }),
  component: Page,
});

function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b); }
function simplify(w: number, h: number) {
  if (!w || !h) return "—";
  const d = gcd(Math.round(w), Math.round(h));
  return `${Math.round(w) / d}:${Math.round(h) / d}`;
}

const PRESETS: { label: string; w: number; h: number }[] = [
  { label: "16:9 (YouTube)", w: 16, h: 9 },
  { label: "9:16 (Reels/TikTok)", w: 9, h: 16 },
  { label: "1:1 (Instagram)", w: 1, h: 1 },
  { label: "4:5 (IG Portrait)", w: 4, h: 5 },
  { label: "4:3 (Classic)", w: 4, h: 3 },
  { label: "3:2 (DSLR)", w: 3, h: 2 },
  { label: "21:9 (Cinema)", w: 21, h: 9 },
  { label: "2.39:1 (Anamorphic)", w: 239, h: 100 },
];

function Page() {
  const [rw, setRw] = useState(16);
  const [rh, setRh] = useState(9);
  const [w, setW] = useState<string>("1920");
  const [h, setH] = useState<string>("1080");
  const [last, setLast] = useState<"w" | "h">("w");

  const computed = useMemo(() => {
    const ratio = rw / rh;
    if (!isFinite(ratio) || ratio <= 0) return { w: "", h: "" };
    if (last === "w") {
      const n = parseFloat(w);
      if (!isFinite(n) || n <= 0) return { w, h: "" };
      return { w, h: String(Math.round((n / ratio) * 100) / 100) };
    }
    const n = parseFloat(h);
    if (!isFinite(n) || n <= 0) return { w: "", h };
    return { w: String(Math.round(n * ratio * 100) / 100), h };
  }, [rw, rh, w, h, last]);

  const previewW = Math.min(480, Math.max(80, parseFloat(computed.w) || 320));
  const previewH = Math.round((previewW * rh) / rw);

  return (
    <ToolLayout slug="aspect-ratio">
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-5">
        <div className="space-y-4">
          <div className="soft-card p-4 sm:p-5 space-y-3">
            <div className="eyebrow">Ratio</div>
            <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
              <label className="block">
                <span className="text-xs text-muted-foreground">Width units</span>
                <input type="number" min={1} value={rw} onChange={(e) => setRw(Math.max(1, parseFloat(e.target.value) || 1))}
                  className="min-h-12 w-full rounded-xl border border-border bg-card px-3 text-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-ring" />
              </label>
              <div className="pb-3 text-xl font-semibold">:</div>
              <label className="block">
                <span className="text-xs text-muted-foreground">Height units</span>
                <input type="number" min={1} value={rh} onChange={(e) => setRh(Math.max(1, parseFloat(e.target.value) || 1))}
                  className="min-h-12 w-full rounded-xl border border-border bg-card px-3 text-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-ring" />
              </label>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {PRESETS.map((p) => (
                <button key={p.label} onClick={() => { setRw(p.w); setRh(p.h); }}
                  className="min-h-9 px-3 rounded-full border border-border bg-card hover:border-primary text-xs">
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="soft-card p-4 sm:p-5 space-y-3">
            <div className="eyebrow">Dimensions (px)</div>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs text-muted-foreground">Width</span>
                <input type="number" min={1} value={last === "w" ? w : computed.w} onChange={(e) => { setW(e.target.value); setLast("w"); }}
                  className="min-h-12 w-full rounded-xl border border-border bg-card px-3 text-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-ring" />
              </label>
              <label className="block">
                <span className="text-xs text-muted-foreground">Height</span>
                <input type="number" min={1} value={last === "h" ? h : computed.h} onChange={(e) => { setH(e.target.value); setLast("h"); }}
                  className="min-h-12 w-full rounded-xl border border-border bg-card px-3 text-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-ring" />
              </label>
            </div>
            <button onClick={() => navigator.clipboard.writeText(`${computed.w} × ${computed.h}`)}
              className="min-h-11 px-4 rounded-xl border border-border bg-card hover:border-primary inline-flex items-center gap-2 text-sm">
              <Copy className="size-4" /> Copy dimensions
            </button>
          </div>
        </div>

        <div className="soft-card p-4 sm:p-5 space-y-3">
          <div className="eyebrow">Preview</div>
          <div className="rounded-xl bg-muted p-4 grid place-items-center min-h-[20rem]">
            <div className="rounded-lg bg-primary/15 border-2 border-primary/40 grid place-items-center"
              style={{ width: `${previewW}px`, height: `${previewH}px` }}>
              <div className="text-center">
                <div className="font-display text-2xl tabular-nums">{simplify(rw, rh)}</div>
                <div className="text-xs text-muted-foreground tabular-nums">{computed.w} × {computed.h}</div>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">Decimal pixel values are rounded for display.</p>
        </div>
      </div>

      <HowItWorks>
        <li>Pick a preset or type a custom ratio like 16:9.</li>
        <li>Enter either the width or the height — the other fills in.</li>
        <li>Use the preview to sanity-check the shape before exporting.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
