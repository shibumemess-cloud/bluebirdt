import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { getPaletteSync } from "colorthief";
import { Check, Copy, Trash2, Pipette, Sparkles } from "lucide-react";
import { ToolLayout, validateImageFile } from "../components/ToolLayout";
import { FileDrop, ErrorBox, EmptyState, HowItWorks } from "../components/ToolControls";
import {
  rgbToHex,
  rgbToHsl,
  rgbToOklch,
  contrastRatio,
  type Swatch,
} from "../lib/image-tool-helpers";
import ogImage from "../assets/og/og-color.jpg";

export const Route = createFileRoute("/color-picker")({
  head: () => ({
    meta: [
      { title: "Color Picker from Image Online — HEX, RGB, HSL" },
      {
        name: "description",
        content:
          "Tap any pixel of any photo to read its HEX, RGB and HSL values. Build a palette and export it as CSS or PNG. Runs in your browser. Free.",
      },
      { property: "og:title", content: "Color Picker from Image — Bluebird" },
      {
        property: "og:description",
        content: "Pick colors from any image. Free, private, runs in your browser.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/color-picker" },
      { property: "og:image", content: ogImage },
      { name: "twitter:image", content: ogImage },
    ],
    links: [{ rel: "canonical", href: "/color-picker" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird Color Picker",
          applicationCategory: "DesignApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          description:
            "Free in-browser color picker. Tap any pixel to read HEX/RGB/HSL and build a palette.",
        }),
      },
    ],
  }),
  component: Page,
});




function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hover, setHover] = useState<Swatch | null>(null);
  const [loupe, setLoupe] = useState<{ x: number; y: number; nx: number; ny: number } | null>(null);
  const [swatches, setSwatches] = useState<Swatch[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!file) { setImgUrl(null); return; }
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function onFile(f: File | null) {
    setSwatches([]);
    setHover(null);
    const err = validateImageFile(f);
    setError(err);
    setFile(err || !f ? null : f);
  }

  function ensureCanvas(img: HTMLImageElement) {
    if (!canvasRef.current) canvasRef.current = document.createElement("canvas");
    const c = canvasRef.current;
    if (c.width !== img.naturalWidth || c.height !== img.naturalHeight) {
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext("2d", { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0);
    }
    return c;
  }

  function readAt(clientX: number, clientY: number): Swatch | null {
    const img = imgRef.current;
    if (!img) return null;
    const rect = img.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * img.naturalWidth;
    const y = ((clientY - rect.top) / rect.height) * img.naturalHeight;
    if (x < 0 || y < 0 || x >= img.naturalWidth || y >= img.naturalHeight) return null;
    const c = ensureCanvas(img);
    const ctx = c.getContext("2d", { willReadFrequently: true })!;
    const d = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
    return { r: d[0], g: d[1], b: d[2], hex: rgbToHex(d[0], d[1], d[2]) };
  }

  function onMove(e: React.PointerEvent<HTMLImageElement>) {
    const img = imgRef.current;
    if (!img) return;
    const rect = img.getBoundingClientRect();
    const s = readAt(e.clientX, e.clientY);
    if (s) setHover(s);
    setLoupe({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      nx: ((e.clientX - rect.left) / rect.width) * img.naturalWidth,
      ny: ((e.clientY - rect.top) / rect.height) * img.naturalHeight,
    });
  }
  function onTap(e: React.PointerEvent<HTMLImageElement>) {
    const s = readAt(e.clientX, e.clientY);
    if (!s) return;
    setSwatches((sw) => {
      if (sw.find((x) => x.hex === s.hex)) return sw;
      return sw.length >= 8 ? [...sw.slice(1), s] : [...sw, s];
    });
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(text);
      setTimeout(() => setCopied((c) => (c === text ? null : c)), 1200);
    }).catch(() => {});
  }

  function autoExtract() {
    const img = imgRef.current;
    if (!img) return;
    try {
      const palette = getPaletteSync(img, { colorCount: 6 }) ?? [];
      const next: Swatch[] = palette.map((c) => {
        const [r, g, b] = c.array();
        return { r, g, b, hex: rgbToHex(r, g, b) };
      });
      setSwatches(next.slice(0, 8));
    } catch {
      setError("Couldn't extract a palette from this image. Try clicking on it instead.");
    }
  }

  function exportCss() {
    if (swatches.length === 0) return;
    const lines = swatches.map((s, i) => `  --color-${i + 1}: ${s.hex};`);
    const css = `:root {\n${lines.join("\n")}\n}\n`;
    downloadText(css, "palette.css", "text/css");
  }
  function exportTailwind() {
    if (swatches.length === 0) return;
    const entries = swatches.map((s, i) => `        brand${i + 1}: "${s.hex}",`).join("\n");
    const js = `// Paste into your tailwind.config.js theme.extend.colors\nexport default {\n  theme: {\n    extend: {\n      colors: {\n${entries}\n      },\n    },\n  },\n};\n`;
    downloadText(js, "tailwind-palette.js", "text/javascript");
  }
  function exportJson() {
    if (swatches.length === 0) return;
    const json = JSON.stringify(
      swatches.map((s, i) => ({ name: `color-${i + 1}`, hex: s.hex, rgb: [s.r, s.g, s.b] })),
      null,
      2,
    );
    downloadText(json, "palette.json", "application/json");
  }
  function downloadText(text: string, name: string, mime: string) {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function exportPng() {
    if (swatches.length === 0) return;
    const W = 800, H = 200;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const ctx = c.getContext("2d")!;
    const w = W / swatches.length;
    swatches.forEach((s, i) => {
      ctx.fillStyle = s.hex;
      ctx.fillRect(i * w, 0, w, H);
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(i * w, H - 36, w, 36);
      ctx.fillStyle = "#fff";
      ctx.font = '600 16px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(s.hex, i * w + w / 2, H - 18);
    });
    c.toBlob((b) => {
      if (!b) return;
      const url = URL.createObjectURL(b);
      const a = document.createElement("a");
      a.href = url;
      a.download = "palette.png";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
  }

  const display = hover ?? swatches[swatches.length - 1] ?? null;

  return (
    <ToolLayout slug="color-picker">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 md:col-span-7 space-y-6">
          <FileDrop file={file} onFile={onFile} />

          {imgUrl && (
            <>
              <div className="soft-card p-3">
                <div className="relative">
                  <img
                    ref={imgRef}
                    src={imgUrl}
                    alt="Pick a color"
                    crossOrigin="anonymous"
                    onPointerMove={onMove}
                    onPointerDown={onTap}
                    onPointerLeave={() => { setHover(null); setLoupe(null); }}
                    className="block max-h-[60vh] w-auto mx-auto cursor-crosshair touch-none"
                    draggable={false}
                  />
                  {loupe && hover && imgRef.current && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute size-24 rounded-full border-2 border-white shadow-pop overflow-hidden"
                      style={{
                        left: loupe.x + 18,
                        top: loupe.y + 18,
                        backgroundImage: `url("${imgUrl}")`,
                        backgroundRepeat: "no-repeat",
                        backgroundSize: `${imgRef.current.naturalWidth * 8}px ${imgRef.current.naturalHeight * 8}px`,
                        backgroundPosition: `${-loupe.nx * 8 + 48}px ${-loupe.ny * 8 + 48}px`,
                        imageRendering: "pixelated",
                      }}
                    >
                      <div
                        className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 size-3 rounded-sm border-2 border-white"
                        style={{ boxShadow: "0 0 0 1px rgba(0,0,0,0.5)" }}
                      />
                    </div>
                  )}
                </div>
                <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
                  <Pipette className="size-3.5" /> Move over the image to zoom in and read a color · Tap to add it to the palette.
                </p>
              </div>

              <button
                type="button"
                onClick={autoExtract}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold hover:border-primary min-h-12"
              >
                <Sparkles className="size-4 text-primary" />
                Auto-extract 6 colors
              </button>
            </>
          )}

          {error && <ErrorBox>{error}</ErrorBox>}

          <HowItWorks>
            Your image is drawn to a private canvas in your browser. We read the pixel under your
            cursor and translate it to HEX, RGB and HSL — all on your device, never uploaded.
          </HowItWorks>
        </div>

        <aside className="col-span-12 md:col-span-5">
          {!file ? (
            <EmptyState text="Drop a photo on the left. The colors under your cursor will appear here." />
          ) : (
            <div className="soft-card p-5 sm:p-6 space-y-5">
              <div className="eyebrow">Color under your cursor</div>
              {display ? (
                <>
                  <div
                    className="h-28 rounded-xl border border-border"
                    style={{ background: display.hex }}
                    aria-label={`Current color ${display.hex}`}
                  />
                  <div className="space-y-2 text-sm">
                    <CopyRow label="HEX" value={display.hex} copied={copied} onCopy={copy} />
                    <CopyRow label="RGB" value={`rgb(${display.r}, ${display.g}, ${display.b})`} copied={copied} onCopy={copy} />
                    <CopyRow
                      label="HSL"
                      value={(() => {
                        const { h, s, l } = rgbToHsl(display.r, display.g, display.b);
                        return `hsl(${h}, ${s}%, ${l}%)`;
                      })()}
                      copied={copied}
                      onCopy={copy}
                    />
                    <CopyRow
                      label="OKLCH"
                      value={(() => {
                        const { L, C, H } = rgbToOklch(display.r, display.g, display.b);
                        return `oklch(${L} ${C} ${H})`;
                      })()}
                      copied={copied}
                      onCopy={copy}
                    />
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Move over the image to read a color.</p>
              )}

              {swatches.length >= 2 && (() => {
                const fg = swatches[swatches.length - 1];
                const bg = swatches[swatches.length - 2];
                const ratio = contrastRatio(fg, bg);
                const aa = ratio >= 4.5, aaa = ratio >= 7, aaLarge = ratio >= 3;
                const tone = aa ? "status-success" : aaLarge ? "status-warn" : "status-danger";
                const label = aaa ? "AAA" : aa ? "AA" : aaLarge ? "AA Large only" : "Fails";
                return (
                  <div className="border-t border-border pt-4">
                    <div className="eyebrow mb-2">Contrast check (last two)</div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 rounded-lg overflow-hidden border border-border grid place-items-center min-h-16"
                           style={{ background: bg.hex, color: fg.hex }}>
                        <span className="font-semibold">Sample text</span>
                      </div>
                      <div className="text-right">
                        <div className="font-display text-2xl num">{ratio.toFixed(2)}</div>
                        <span className={["inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide", tone].join(" ")}>{label}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="eyebrow">Palette ({swatches.length}/8)</div>
                  {swatches.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSwatches([])}
                      className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                    >
                      <Trash2 className="size-3.5" /> Clear
                    </button>
                  )}
                </div>
                {swatches.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Tap the image to add colors here.</p>
                ) : (
                  <ul className="grid grid-cols-4 gap-2">
                    {swatches.map((s) => (
                      <li key={s.hex}>
                        <button
                          type="button"
                          onClick={() => copy(s.hex)}
                          className="block w-full rounded-lg border border-border overflow-hidden text-left group"
                        >
                          <span className="block h-14" style={{ background: s.hex }} />
                          <span className="block px-2 py-1.5 text-[11px] font-semibold num text-center bg-card group-hover:bg-primary-soft">
                            {s.hex}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {swatches.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <ExportBtn onClick={exportPng}>PNG</ExportBtn>
                    <ExportBtn onClick={exportCss}>CSS variables</ExportBtn>
                    <ExportBtn onClick={exportTailwind}>Tailwind</ExportBtn>
                    <ExportBtn onClick={exportJson}>JSON</ExportBtn>
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>
    </ToolLayout>
  );
}

function CopyRow({
  label, value, copied, onCopy,
}: { label: string; value: string; copied: string | null; onCopy: (v: string) => void }) {
  const isCopied = copied === value;
  return (
    <div className="flex items-center gap-2">
      <span className="w-10 text-xs font-semibold text-muted-foreground">{label}</span>
      <code className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm num truncate">
        {value}
      </code>
      <button
        type="button"
        onClick={() => onCopy(value)}
        className="rounded-lg border border-border bg-card px-2.5 py-2 text-xs font-semibold hover:bg-primary-soft inline-flex items-center gap-1 min-h-9"
        aria-label={`Copy ${label}`}
      >
        {isCopied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        {isCopied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function ExportBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-semibold hover:border-primary"
    >
      {children}
    </button>
  );
}
