import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Copy, Check, Shuffle } from "lucide-react";

import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks, WarnBox } from "../components/ToolControls";

export const Route = createFileRoute("/color-converter")({
  head: () => ({
    meta: [
      { title: "Color Converter — HEX, RGB, HSL, HSV, OKLCH" },
      { name: "description", content: "Convert any color between HEX, RGB, HSL, HSV and OKLCH in your browser. Type any format, see live swatches, copy one click — free." },
      { property: "og:title", content: "Color Converter — Bluebird" },
      { property: "og:description", content: "Free in-browser color converter for HEX, RGB, HSL, HSV and OKLCH." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/color-converter" },
    ],
    links: [{ rel: "canonical", href: "/color-converter" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird Color Converter",
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: Page,
});

// ---------- Color math ----------

type RGB = { r: number; g: number; b: number; a: number };
type HSL = { h: number; s: number; l: number; a: number };
type HSV = { h: number; s: number; v: number; a: number };

function clamp(n: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, n));
}

function parseHex(input: string): RGB | null {
  const s = input.trim().replace(/^#/, "");
  if (!/^([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(s)) return null;
  let r = 0, g = 0, b = 0, a = 1;
  if (s.length === 3 || s.length === 4) {
    r = parseInt(s[0] + s[0], 16);
    g = parseInt(s[1] + s[1], 16);
    b = parseInt(s[2] + s[2], 16);
    if (s.length === 4) a = parseInt(s[3] + s[3], 16) / 255;
  } else {
    r = parseInt(s.slice(0, 2), 16);
    g = parseInt(s.slice(2, 4), 16);
    b = parseInt(s.slice(4, 6), 16);
    if (s.length === 8) a = parseInt(s.slice(6, 8), 16) / 255;
  }
  return { r, g, b, a };
}

function parseFunc(input: string): RGB | null {
  // rgb()/rgba()/hsl()/hsla() — any common form
  const m = input.trim().match(/^(rgba?|hsla?)\(([^)]+)\)$/i);
  if (!m) return null;
  const kind = m[1].toLowerCase();
  const parts = m[2].split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3) return null;
  const num = (s: string, max: number) => {
    if (s.endsWith("%")) return (parseFloat(s) / 100) * max;
    return parseFloat(s);
  };
  const a = parts[3] != null ? num(parts[3], 1) : 1;
  if (kind.startsWith("rgb")) {
    return { r: num(parts[0], 255), g: num(parts[1], 255), b: num(parts[2], 255), a: clamp(a) };
  }
  const h = parseFloat(parts[0]);
  const s = num(parts[1], 1) / (parts[1].endsWith("%") ? 1 : 1);
  const l = num(parts[2], 1) / (parts[2].endsWith("%") ? 1 : 1);
  return hslToRgb({ h, s, l, a: clamp(a) });
}

function parseAny(input: string): RGB | null {
  const t = input.trim();
  if (!t) return null;
  if (t.startsWith("#") || /^[0-9a-f]{3,8}$/i.test(t)) return parseHex(t);
  if (/^(rgb|hsl)/i.test(t)) return parseFunc(t);
  // Bare "255, 128, 64" → RGB
  if (/^[\d.\s,/%]+$/.test(t)) {
    const parts = t.split(/[\s,/]+/).filter(Boolean);
    if (parts.length === 3 || parts.length === 4) {
      const n = parts.map((p) => p.endsWith("%") ? (parseFloat(p) / 100) * 255 : parseFloat(p));
      return { r: n[0], g: n[1], b: n[2], a: parts.length === 4 ? clamp(n[3]) : 1 };
    }
  }
  return null;
}

function rgbToHsl({ r, g, b, a }: RGB): HSL {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case R: h = ((G - B) / d + (G < B ? 6 : 0)); break;
      case G: h = ((B - R) / d + 2); break;
      default: h = ((R - G) / d + 4);
    }
    h *= 60;
  }
  return { h, s, l, a };
}

function hslToRgb({ h, s, l, a }: HSL): RGB {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (hp < 1) { r = c; g = x; }
  else if (hp < 2) { r = x; g = c; }
  else if (hp < 3) { g = c; b = x; }
  else if (hp < 4) { g = x; b = c; }
  else if (hp < 5) { r = x; b = c; }
  else { r = c; b = x; }
  const m = l - c / 2;
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255, a };
}

function rgbToHsv({ r, g, b, a }: RGB): HSV {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    switch (max) {
      case R: h = ((G - B) / d + (G < B ? 6 : 0)); break;
      case G: h = ((B - R) / d + 2); break;
      default: h = ((R - G) / d + 4);
    }
    h *= 60;
  }
  const s = max === 0 ? 0 : d / max;
  return { h, s, v: max, a };
}

// sRGB → linear → OKLCH (Björn Ottosson)
function srgbToLin(c: number): number {
  const x = c / 255;
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}
function rgbToOklch({ r, g, b, a }: RGB): { l: number; c: number; h: number; a: number } {
  const lr = srgbToLin(r), lg = srgbToLin(g), lb = srgbToLin(b);
  const l_ = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m_ = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s_ = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const C = Math.sqrt(A * A + B * B);
  let h = (Math.atan2(B, A) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: L, c: C, h, a };
}

function fmt(n: number, d = 0): string {
  return Number.isFinite(n) ? n.toFixed(d) : "0";
}
function toHex({ r, g, b, a }: RGB): string {
  const h = (n: number) => Math.round(clamp(n / 255, 0, 1) * 255).toString(16).padStart(2, "0");
  const base = `#${h(r)}${h(g)}${h(b)}`;
  return a < 1 ? `${base}${Math.round(a * 255).toString(16).padStart(2, "0")}` : base;
}

const formats = ["HEX", "RGB", "HSL", "HSV", "OKLCH"] as const;
type Fmt = (typeof formats)[number];

function formatAll(rgb: RGB) {
  const hsl = rgbToHsl(rgb);
  const hsv = rgbToHsv(rgb);
  const ok = rgbToOklch(rgb);
  const alpha = rgb.a < 1 ? ` / ${fmt(rgb.a * 100, 0)}%` : "";
  return {
    HEX: toHex(rgb),
    RGB: rgb.a < 1
      ? `rgb(${fmt(rgb.r)} ${fmt(rgb.g)} ${fmt(rgb.b)} / ${fmt(rgb.a * 100, 0)}%)`
      : `rgb(${fmt(rgb.r)} ${fmt(rgb.g)} ${fmt(rgb.b)})`,
    HSL: `hsl(${fmt(hsl.h, 0)} ${fmt(hsl.s * 100, 0)}% ${fmt(hsl.l * 100, 0)}%${alpha})`,
    HSV: `hsv(${fmt(hsv.h, 0)} ${fmt(hsv.s * 100, 0)}% ${fmt(hsv.v * 100, 0)}%${alpha})`,
    OKLCH: `oklch(${fmt(ok.l, 3)} ${fmt(ok.c, 3)} ${fmt(ok.h, 1)}${alpha})`,
  } satisfies Record<Fmt, string>;
}

const PREF_KEY = "bb-color-converter-v1";

function randomHex(): string {
  const h = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");
  return `#${h}`;
}

function Page() {
  const [input, setInput] = useState("#1E66F5");
  const [copied, setCopied] = useState<Fmt | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PREF_KEY);
      if (saved) setInput(saved);
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem(PREF_KEY, input); } catch { /* ignore */ }
  }, [input]);

  const parsed = useMemo(() => parseAny(input), [input]);
  const values = parsed ? formatAll(parsed) : null;
  const swatch = parsed ? values?.RGB : "transparent";

  async function copyFormat(f: Fmt) {
    if (!values) return;
    await navigator.clipboard.writeText(values[f]);
    setCopied(f);
    window.setTimeout(() => setCopied(null), 1200);
  }

  return (
    <ToolLayout slug="color-converter">
      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-4">
          <div>
            <label htmlFor="cc-in" className="eyebrow">Color</label>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <input
                id="cc-in"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="#1E66F5, rgb(30 102 245), hsl(220 92% 54%)…"
                spellCheck={false}
                className="flex-1 min-w-0 min-h-12 rounded-xl border border-border bg-card px-3 font-mono text-base focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                type="color"
                aria-label="Pick a color"
                value={parsed ? toHex({ ...parsed, a: 1 }) : "#000000"}
                onChange={(e) => setInput(e.target.value)}
                className="size-12 rounded-xl border border-border bg-card p-1 cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setInput(randomHex())}
                className="inline-flex items-center gap-1.5 min-h-12 px-3 rounded-xl border border-border bg-card hover:bg-primary-soft text-sm"
                aria-label="Generate a random color"
              >
                <Shuffle className="size-4" /> Random
              </button>
            </div>
            {input && !parsed && (
              <div className="mt-3">
                <WarnBox>Didn't recognize that color. Try <code>#1E66F5</code>, <code>rgb(30 102 245)</code> or <code>hsl(220 92% 54%)</code>.</WarnBox>
              </div>
            )}
          </div>

          <div
            className="checker-bg rounded-2xl border border-border h-48"
            aria-label="Color preview"
          >
            <div className="h-full w-full rounded-2xl" style={{ background: swatch }} />
          </div>
        </section>

        <section className="soft-card p-5 sm:p-6 space-y-3">
          <div className="eyebrow">Formats</div>
          {values ? (
            <ul className="space-y-2">
              {formats.map((f) => (
                <li key={f} className="grid grid-cols-[80px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
                  <span className="text-xs font-semibold text-muted-foreground">{f}</span>
                  <code className="font-mono text-sm truncate">{values[f]}</code>
                  <button
                    onClick={() => copyFormat(f)}
                    aria-label={`Copy ${f}`}
                    className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs"
                  >
                    {copied === f ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    {copied === f ? "Copied" : "Copy"}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Type a color on the left to see every format.
            </div>
          )}
        </section>
      </div>

      <HowItWorks>
        <li>Paste or pick a color in any format — HEX, RGB, HSL, HSV or OKLCH.</li>
        <li>See every other format calculated instantly, with a live swatch including transparency.</li>
        <li>Tap Copy next to the format you need — perfect for CSS, design tools and brand kits.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
