import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Square, Smartphone, Film, Monitor, FileText, Lock, Unlock } from "lucide-react";
import { ToolLayout, validateImageFile, formatBytes } from "../components/ToolLayout";
import { FileDrop, Field, ErrorBox, RunButton, ResultPanel, EmptyState, WarnBox, HowItWorks } from "../components/ToolControls";
import { fromPx, toPx, type Unit } from "../lib/image-tool-helpers";
import ogImage from "../assets/og/og-resize.jpg";

export const Route = createFileRoute("/image-resizer")({
  head: () => ({
    meta: [
      { title: "Image Resizer — Resize Photos for Instagram, YouTube and Print" },
      { name: "description", content: "Resize any photo to exact pixels or a ready-made size for Instagram, IG Story, YouTube, LinkedIn, X and A4 print. Runs in your browser. Free." },
      { property: "og:title", content: "Image Resizer — Bluebird" },
      { property: "og:description", content: "Resize photos to exact pixels or popular social presets. Free and private." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/image-resizer" },
      { property: "og:image", content: ogImage },
      { name: "twitter:image", content: ogImage },
    ],
    links: [{ rel: "canonical", href: "/image-resizer" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird Image Resizer",
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          description: "Free in-browser tool to resize images to exact pixels or social-media presets.",
        }),
      },
    ],
  }),
  component: Page,
});

type Preset = { id: string; label: string; sub: string; w: number; h: number; Icon: typeof Square };
const PRESETS: Preset[] = [
  { id: "ig-sq",  label: "Instagram",  sub: "Square · 1080×1080", w: 1080, h: 1080, Icon: Square },
  { id: "ig-st",  label: "IG Story",   sub: "Portrait · 1080×1920", w: 1080, h: 1920, Icon: Smartphone },
  { id: "yt",     label: "YouTube",    sub: "Thumb · 1280×720",   w: 1280, h: 720,  Icon: Film },
  { id: "li",     label: "LinkedIn",   sub: "Post · 1200×627",    w: 1200, h: 627,  Icon: Monitor },
  { id: "x",      label: "X / Twitter",sub: "Post · 1200×675",    w: 1200, h: 675,  Icon: Monitor },
  { id: "a4",    label: "A4 print",   sub: "300 dpi · 2480×3508", w: 2480, h: 3508, Icon: FileText },
];

type Fit = "contain" | "cover" | "stretch";

async function resizeFile(
  file: File,
  width: number,
  height: number,
  fit: Fit,
  bg: string,
): Promise<Blob> {
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await img.decode();
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";

  const isJpeg = file.type === "image/jpeg" || file.type === "image/jpg";
  if (fit === "contain" || isJpeg) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);
  }

  if (fit === "stretch") {
    ctx.drawImage(img, 0, 0, width, height);
  } else if (fit === "contain") {
    const r = Math.min(width / img.naturalWidth, height / img.naturalHeight);
    const w = img.naturalWidth * r, h = img.naturalHeight * r;
    ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
  } else {
    // cover
    const r = Math.max(width / img.naturalWidth, height / img.naturalHeight);
    const w = img.naturalWidth * r, h = img.naturalHeight * r;
    ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
  }

  const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), mime, 0.92),
  );
}




function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [width, setWidth] = useState(1080);
  const [height, setHeight] = useState(1080);
  const [keepRatio, setKeepRatio] = useState(true);
  const [fit, setFit] = useState<Fit>("contain");
  const [bg, setBg] = useState("#ffffff");
  const [origDims, setOrigDims] = useState<{ w: number; h: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ url: string; name: string; size: number } | null>(null);
  const [unit, setUnit] = useState<Unit>("px");
  const [dpi, setDpi] = useState(72);

  function onFile(f: File | null) {
    setResult(null);
    const err = validateImageFile(f);
    setError(err);
    if (err || !f) { setFile(null); setOrigDims(null); return; }
    setFile(f);
    const img = new Image();
    img.onload = () => {
      setOrigDims({ w: img.naturalWidth, h: img.naturalHeight });
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
    };
    img.src = URL.createObjectURL(f);
  }

  function updateW(w: number) {
    setWidth(w);
    if (keepRatio && origDims) setHeight(Math.round((w / origDims.w) * origDims.h));
  }
  function updateH(h: number) {
    setHeight(h);
    if (keepRatio && origDims) setWidth(Math.round((h / origDims.h) * origDims.w));
  }
  function applyPreset(p: Preset) {
    setKeepRatio(false);
    setUnit("px");
    setWidth(p.w); setHeight(p.h);
  }
  function applyScale(pct: number) {
    if (!origDims) return;
    setKeepRatio(true);
    setUnit("px");
    setWidth(Math.max(1, Math.round((origDims.w * pct) / 100)));
    setHeight(Math.max(1, Math.round((origDims.h * pct) / 100)));
  }

  // gcd for the aspect chip
  const aspect = (() => {
    if (!width || !height) return "—";
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const g = gcd(width, height);
    const a = width / g, b = height / g;
    if (a > 50 || b > 50) return `${(width / height).toFixed(2)} : 1`;
    return `${a} : ${b}`;
  })();

  const upscale = origDims && (width > origDims.w || height > origDims.h);

  async function resize() {
    if (!file) return;
    setBusy(true); setError(null);
    try {
      const blob = await resizeFile(file, width, height, fit, bg);
      setResult({ url: URL.createObjectURL(blob), name: `resized-${width}x${height}-${file.name}`, size: blob.size });
    } catch {
      setError("Sorry, we couldn't resize that image. Please try a different one.");
    } finally { setBusy(false); }
  }

  const canRun = !!file && !error && !busy && width > 0 && height > 0;

  useEffect(() => { /* placeholder for future preview */ }, [width, height, fit]);

  return (
    <ToolLayout slug="image-resizer">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 md:col-span-7 space-y-6">
          <FileDrop file={file} onFile={onFile} />

          {origDims && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full border border-border bg-card px-3 py-1 num">
                Source: {origDims.w} × {origDims.h} px
              </span>
              <button
                type="button"
                onClick={() => setKeepRatio((k) => !k)}
                className={[
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 border text-sm transition-colors",
                  keepRatio ? "border-primary text-primary bg-primary-soft" : "border-border text-muted-foreground bg-card hover:border-primary/60",
                ].join(" ")}
                aria-pressed={keepRatio}
                title="Lock aspect ratio"
              >
                {keepRatio ? <Lock className="size-3.5" /> : <Unlock className="size-3.5" />}
                Aspect {aspect}
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold mr-1">Units:</span>
            {(["px", "in", "cm"] as Unit[]).map((u) => (
              <button key={u} type="button" onClick={() => setUnit(u)}
                aria-pressed={unit === u}
                className={[
                  "rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide",
                  unit === u ? "border-primary bg-primary-soft text-primary" : "border-border bg-card hover:border-primary/60",
                ].join(" ")}>{u}</button>
            ))}
            {unit !== "px" && (
              <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                DPI
                <input type="number" min={36} max={1200} value={dpi}
                  onChange={(e) => setDpi(Math.max(36, Number(e.target.value) || 72))}
                  className="w-20 rounded-lg border border-border bg-card px-2 py-1 num text-foreground" />
                <span className="hidden sm:inline">(72 web · 300 print)</span>
              </label>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={`Width (${unit})`}>
              <input type="number" min={0.01} max={10000} step={unit === "px" ? 1 : 0.01}
                value={fromPx(width, unit, dpi)}
                onChange={(e) => updateW(toPx(Number(e.target.value), unit, dpi))}
                className="w-full rounded-xl border border-border bg-card px-3 py-3 text-base num focus:outline-none focus:border-primary" />
            </Field>
            <Field label={`Height (${unit})`}>
              <input type="number" min={0.01} max={10000} step={unit === "px" ? 1 : 0.01}
                value={fromPx(height, unit, dpi)}
                onChange={(e) => updateH(toPx(Number(e.target.value), unit, dpi))}
                className="w-full rounded-xl border border-border bg-card px-3 py-3 text-base num focus:outline-none focus:border-primary" />
            </Field>
          </div>
          {unit !== "px" && (
            <p className="text-xs text-muted-foreground num">
              That's {width} × {height} pixels at {dpi} DPI.
            </p>
          )}

          <div className="flex flex-wrap gap-1.5">
            {[25, 50, 75, 100, 150, 200].map((p) => (
              <button key={p} type="button" onClick={() => applyScale(p)}
                disabled={!origDims}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary disabled:opacity-50 num">
                {p}%
              </button>
            ))}
          </div>

          <div>
            <div className="text-sm font-semibold mb-2">How should it fit?</div>
            <div className="grid grid-cols-3 gap-2">
              {(["contain", "cover", "stretch"] as Fit[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFit(f)}
                  aria-pressed={fit === f}
                  className={[
                    "rounded-xl border px-3 py-3 text-center transition-colors",
                    fit === f ? "border-primary bg-primary-soft" : "border-border bg-card hover:border-primary/60",
                  ].join(" ")}
                >
                  <FitDiagram mode={f} />
                  <div className="text-sm font-semibold capitalize mt-1.5">{f}</div>
                  <div className="text-[11px] text-muted-foreground">{FIT_HINT[f]}</div>
                </button>
              ))}
            </div>
          </div>

          {fit === "contain" && (
            <Field label="Fill color (used for the empty space)">
              <div className="flex items-center gap-3">
                <input type="color" value={bg} onChange={(e) => setBg(e.target.value)}
                  className="size-11 rounded-lg border border-border bg-card cursor-pointer" />
                <code className="rounded-lg border border-border bg-card px-3 py-2 text-sm num">{bg}</code>
              </div>
            </Field>
          )}

          <div>
            <div className="text-sm font-semibold mb-3">Or pick a popular size</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {PRESETS.map((p) => {
                const Icon = p.Icon;
                const active = width === p.w && height === p.h;
                return (
                  <button key={p.id} type="button" onClick={() => applyPreset(p)}
                    className={[
                      "rounded-xl border px-3 py-3 text-left transition-colors flex items-start gap-3",
                      active ? "border-primary bg-primary-soft" : "border-border bg-card hover:border-primary/60",
                    ].join(" ")}>
                    <Icon className={["size-5 mt-0.5", active ? "text-primary" : "text-muted-foreground"].join(" ")} />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">{p.label}</div>
                      <div className="text-[11px] text-muted-foreground num">{p.sub}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {upscale && (
            <WarnBox>
              You're enlarging the image (source is {origDims!.w} × {origDims!.h} px). The result may look soft. Pick a smaller target for sharp output.
            </WarnBox>
          )}
          {error && <ErrorBox>{error}</ErrorBox>}
          <RunButton onClick={resize} disabled={!canRun} busy={busy} label="Resize image" />

          <HowItWorks>
            Resizing happens on your device using the browser's image engine. The high-quality smoothing setting keeps lines clean when you scale down.
          </HowItWorks>
        </div>

        <aside className="col-span-12 md:col-span-5">
          {result ? (
            <ResultPanel
              title="Your resized image is ready"
              delta={{ label: `${width} × ${height} px`, tone: "success" }}
              lines={[
                ["New size", `${width} × ${height} px`],
                ["File size", formatBytes(result.size)],
                ["Fit mode", fit.charAt(0).toUpperCase() + fit.slice(1)],
              ]}
              previewUrl={result.url}
              href={result.url}
              download={result.name}
              onReset={() => { setFile(null); setResult(null); }}
            />
          ) : (
            <EmptyState text="Pick a size or a preset on the left. Your resized picture will appear here." />
          )}
        </aside>
      </div>
    </ToolLayout>
  );
}

const FIT_HINT: Record<Fit, string> = {
  contain: "Whole image, padded",
  cover: "Fills, may crop",
  stretch: "Distorts to fit",
};

function FitDiagram({ mode }: { mode: Fit }) {
  return (
    <svg viewBox="0 0 40 30" className="w-full h-7 mx-auto" aria-hidden>
      <rect x="1" y="1" width="38" height="28" rx="3"
        className="fill-card stroke-border" strokeWidth="1" />
      {mode === "contain" && (
        <rect x="8" y="6" width="24" height="18" rx="2" className="fill-primary/70" />
      )}
      {mode === "cover" && (
        <>
          <rect x="-4" y="3" width="48" height="24" rx="2" className="fill-primary/70" />
          <rect x="1" y="1" width="38" height="28" rx="3"
            className="fill-none stroke-border" strokeWidth="1" />
        </>
      )}
      {mode === "stretch" && (
        <rect x="3" y="3" width="34" height="24" rx="2" className="fill-primary/70" />
      )}
    </svg>
  );
}
