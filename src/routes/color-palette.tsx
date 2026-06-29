import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SwatchBook, Copy, Check, RefreshCw, Lock, Unlock } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks, Field } from "../components/ToolControls";

export const Route = createFileRoute("/color-palette")({
  head: () => ({
    meta: [
      { title: "Color Palette Generator — Free Online Harmony Picker" },
      { name: "description", content: "Generate harmonious color palettes — complementary, analogous, triadic, tetradic and monochrome. Copy HEX, RGB or CSS variables." },
      { property: "og:title", content: "Color Palette Generator — Bluebird" },
      { property: "og:description", content: "Build palettes from any base color. Lock favourites, randomize, export HEX or CSS." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/color-palette" },
    ],
    links: [{ rel: "canonical", href: "/color-palette" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird Color Palette Generator",
          applicationCategory: "DesignApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: Page,
});

type Harmony = "complementary" | "analogous" | "triadic" | "tetradic" | "monochrome" | "shades";

const PREF_KEY = "bb-palette-v1";

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const c = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(c * 255).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return [220, 70, 55];
  const v = parseInt(m[1], 16);
  const r = ((v >> 16) & 255) / 255;
  const g = ((v >> 8) & 255) / 255;
  const b = (v & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h *= 60;
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

export function buildPalette(baseHex: string, harmony: Harmony): string[] {
  const [h, s, l] = hexToHsl(baseHex);
  const wrap = (x: number) => ((x % 360) + 360) % 360;
  switch (harmony) {
    case "complementary":
      return [
        hslToHex(h, s, Math.max(15, l - 25)),
        hslToHex(h, s, l),
        hslToHex(h, Math.max(20, s - 20), Math.min(90, l + 18)),
        hslToHex(wrap(h + 180), s, l),
        hslToHex(wrap(h + 180), Math.max(20, s - 20), Math.min(90, l + 18)),
      ];
    case "analogous":
      return [
        hslToHex(wrap(h - 30), s, l),
        hslToHex(wrap(h - 15), s, l),
        hslToHex(h, s, l),
        hslToHex(wrap(h + 15), s, l),
        hslToHex(wrap(h + 30), s, l),
      ];
    case "triadic":
      return [
        hslToHex(h, s, Math.max(15, l - 18)),
        hslToHex(h, s, l),
        hslToHex(wrap(h + 120), s, l),
        hslToHex(wrap(h + 240), s, l),
        hslToHex(h, Math.max(20, s - 25), Math.min(92, l + 22)),
      ];
    case "tetradic":
      return [
        hslToHex(h, s, l),
        hslToHex(wrap(h + 90), s, l),
        hslToHex(wrap(h + 180), s, l),
        hslToHex(wrap(h + 270), s, l),
        hslToHex(h, Math.max(15, s - 30), Math.min(92, l + 20)),
      ];
    case "monochrome":
      return [
        hslToHex(h, s, 22),
        hslToHex(h, s, 38),
        hslToHex(h, s, l),
        hslToHex(h, Math.max(15, s - 15), Math.min(85, l + 18)),
        hslToHex(h, Math.max(10, s - 30), Math.min(94, l + 32)),
      ];
    case "shades":
      return [
        hslToHex(h, s, 15),
        hslToHex(h, s, 30),
        hslToHex(h, s, 45),
        hslToHex(h, s, 60),
        hslToHex(h, s, 80),
      ];
  }
}

function randomHex(): string {
  const buf = new Uint8Array(3);
  crypto.getRandomValues(buf);
  return "#" + [...buf].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function readableOn(hex: string): string {
  const [, , l] = hexToHsl(hex);
  return l > 60 ? "#0b1220" : "#ffffff";
}

function Page() {
  const [base, setBase] = useState("#3b82f6");
  const [harmony, setHarmony] = useState<Harmony>("analogous");
  const [colors, setColors] = useState<string[]>(() => buildPalette("#3b82f6", "analogous"));
  const [locked, setLocked] = useState<boolean[]>([false, false, false, false, false]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<"hex" | "css" | "rgb" | null>(null);
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREF_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (typeof p.base === "string" && /^#[0-9a-f]{6}$/i.test(p.base)) setBase(p.base);
        if (typeof p.harmony === "string") setHarmony(p.harmony);
      }
    } catch { /* ignore */ }
    setPrefsLoaded(true);
  }, []);
  useEffect(() => {
    if (!prefsLoaded) return;
    try { localStorage.setItem(PREF_KEY, JSON.stringify({ base, harmony })); } catch { /* ignore */ }
  }, [prefsLoaded, base, harmony]);

  useEffect(() => {
    const next = buildPalette(base, harmony);
    setColors((prev) => next.map((c, i) => (locked[i] ? prev[i] : c)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, harmony]);

  function shuffle() {
    setBase(randomHex());
  }
  function toggleLock(i: number) {
    setLocked((arr) => arr.map((v, idx) => (idx === i ? !v : v)));
  }

  async function copyOne(c: string, i: number) {
    await navigator.clipboard.writeText(c.toUpperCase());
    setCopiedIdx(i);
    setTimeout(() => setCopiedIdx(null), 1300);
  }

  const exports = useMemo(() => {
    const hex = colors.map((c) => c.toUpperCase()).join(", ");
    const css = `:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c.toUpperCase()};`).join("\n")}\n}`;
    const rgb = colors.map((c) => {
      const v = parseInt(c.slice(1), 16);
      return `rgb(${(v >> 16) & 255}, ${(v >> 8) & 255}, ${v & 255})`;
    }).join(", ");
    return { hex, css, rgb };
  }, [colors]);

  async function copyExport(kind: "hex" | "css" | "rgb") {
    await navigator.clipboard.writeText(exports[kind]);
    setCopiedAll(kind);
    setTimeout(() => setCopiedAll(null), 1500);
  }

  return (
    <ToolLayout slug="color-palette">
      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-5 self-start">
          <Field label="Base color">
            <div className="flex items-center gap-2">
              <input type="color" value={base} onChange={(e) => setBase(e.target.value)}
                aria-label="Pick base color"
                className="size-12 rounded-xl border border-border bg-card cursor-pointer" />
              <input type="text" value={base.toUpperCase()}
                onChange={(e) => {
                  const v = e.target.value.trim();
                  if (/^#?[0-9a-f]{6}$/i.test(v)) setBase(v.startsWith("#") ? v : `#${v}`);
                  else setBase(v);
                }}
                className="flex-1 min-h-12 rounded-xl border border-border bg-card px-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </Field>

          <div>
            <div className="eyebrow mb-2">Harmony</div>
            <div className="grid grid-cols-2 gap-1.5">
              {(["analogous","complementary","triadic","tetradic","monochrome","shades"] as Harmony[]).map((h) => (
                <button key={h} onClick={() => setHarmony(h)} aria-pressed={harmony === h}
                  className={`min-h-11 rounded-lg text-xs font-medium capitalize px-2 ${harmony === h ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:bg-primary-soft"}`}>
                  {h}
                </button>
              ))}
            </div>
          </div>

          <button onClick={shuffle}
            className="w-full inline-flex items-center justify-center gap-2 min-h-12 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-95">
            <RefreshCw className="size-4" /> Surprise me
          </button>
          <p className="text-xs text-muted-foreground">Tip: tap the lock on a swatch to keep it while you shuffle the rest.</p>
        </section>

        <section className="space-y-4 min-w-0">
          <div className="soft-card p-3 sm:p-4 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 sm:gap-3">
              {colors.map((c, i) => {
                const fg = readableOn(c);
                return (
                  <div key={i} className="relative rounded-2xl overflow-hidden border border-border min-h-44 flex flex-col"
                    style={{ background: c, color: fg }}>
                    <button onClick={() => toggleLock(i)} aria-label={locked[i] ? "Unlock color" : "Lock color"}
                      className="absolute top-2 right-2 size-8 rounded-full grid place-items-center"
                      style={{ background: fg === "#ffffff" ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.45)", color: fg }}>
                      {locked[i] ? <Lock className="size-4" /> : <Unlock className="size-4" />}
                    </button>
                    <div className="mt-auto px-3 py-3 flex items-center justify-between gap-2"
                      style={{ background: fg === "#ffffff" ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.3)" }}>
                      <span className="font-mono text-sm font-semibold tracking-tight">{c.toUpperCase()}</span>
                      <button onClick={() => copyOne(c, i)} aria-label={`Copy ${c}`}
                        className="size-8 rounded-full grid place-items-center hover:opacity-90"
                        style={{ background: fg === "#ffffff" ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.5)" }}>
                        {copiedIdx === i ? <Check className="size-4" /> : <Copy className="size-4" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="soft-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <SwatchBook className="size-4 text-primary" />
              <div className="font-display text-lg">Export</div>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <ExportRow label="HEX list" value={exports.hex} onCopy={() => copyExport("hex")} done={copiedAll === "hex"} />
              <ExportRow label="RGB list" value={exports.rgb} onCopy={() => copyExport("rgb")} done={copiedAll === "rgb"} />
              <ExportRow label="CSS variables" value={exports.css} onCopy={() => copyExport("css")} done={copiedAll === "css"} mono />
            </div>
          </div>
        </section>
      </div>

      <HowItWorks>
        <li>Pick a base color or hit Surprise me for a fresh starting point.</li>
        <li>Choose a harmony — analogous and complementary work well for UI; triadic and tetradic add energy.</li>
        <li>Lock the swatches you love and reshuffle the rest. Copy a single color or export the full palette.</li>
      </HowItWorks>
    </ToolLayout>
  );
}

function ExportRow({ label, value, onCopy, done, mono }: { label: string; value: string; onCopy: () => void; done: boolean; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 min-w-0">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="eyebrow">{label}</div>
        <button onClick={onCopy} className="inline-flex items-center gap-1.5 min-h-8 px-2.5 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs">
          {done ? <Check className="size-3.5" /> : <Copy className="size-3.5" />} {done ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className={`max-h-32 overflow-auto rounded-lg bg-muted/50 p-2 text-xs whitespace-pre-wrap break-words ${mono ? "font-mono" : ""}`}>{value}</pre>
    </div>
  );
}
