import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, RotateCcw, Download, Wand2 } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { FileDrop, HowItWorks, WarnBox, Field, BeforeAfter } from "../components/ToolControls";

export const Route = createFileRoute("/photo-filters")({
  head: () => ({
    meta: [
      { title: "Photo Filters — Free Online Image Effects" },
      { name: "description", content: "Apply gorgeous filters to any photo: grayscale, sepia, contrast, brightness, blur, saturation and more. Live preview, instant download, runs in your browser." },
      { property: "og:title", content: "Photo Filters — Bluebird" },
      { property: "og:description", content: "Add classic and modern filters to photos with live preview." },
      { property: "og:url", content: "/photo-filters" },
    ],
    links: [{ rel: "canonical", href: "/photo-filters" }],
  }),
  component: Page,
});

type Adjustments = {
  brightness: number;
  contrast: number;
  saturate: number;
  grayscale: number;
  sepia: number;
  invert: number;
  blur: number;
  hue: number;
};

const DEFAULTS: Adjustments = {
  brightness: 100, contrast: 100, saturate: 100,
  grayscale: 0, sepia: 0, invert: 0, blur: 0, hue: 0,
};

const PRESETS: { id: string; label: string; adj: Partial<Adjustments> }[] = [
  { id: "original", label: "Original", adj: {} },
  { id: "mono", label: "Mono", adj: { grayscale: 100, contrast: 110 } },
  { id: "vintage", label: "Vintage", adj: { sepia: 60, contrast: 95, saturate: 85, brightness: 105 } },
  { id: "warm", label: "Warm", adj: { sepia: 25, saturate: 120, brightness: 105 } },
  { id: "cool", label: "Cool", adj: { hue: 200, saturate: 90, brightness: 102 } },
  { id: "punch", label: "Punch", adj: { contrast: 130, saturate: 140 } },
  { id: "soft", label: "Soft", adj: { contrast: 92, brightness: 108, blur: 1 } },
  { id: "noir", label: "Noir", adj: { grayscale: 100, contrast: 140, brightness: 90 } },
  { id: "fade", label: "Fade", adj: { saturate: 70, brightness: 110, contrast: 88 } },
  { id: "invert", label: "Invert", adj: { invert: 100 } },
];

function filterString(a: Adjustments) {
  return [
    `brightness(${a.brightness}%)`,
    `contrast(${a.contrast}%)`,
    `saturate(${a.saturate}%)`,
    `grayscale(${a.grayscale}%)`,
    `sepia(${a.sepia}%)`,
    `invert(${a.invert}%)`,
    `hue-rotate(${a.hue}deg)`,
    `blur(${a.blur}px)`,
  ].join(" ");
}

function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [adj, setAdj] = useState<Adjustments>(DEFAULTS);
  const [err, setErr] = useState<string | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setOutUrl(null); setErr(null); setAdj(DEFAULTS);
    if (!file) { setSrc(null); return; }
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => () => { if (outUrl) URL.revokeObjectURL(outUrl); }, [outUrl]);

  const cssFilter = useMemo(() => filterString(adj), [adj]);

  function applyPreset(id: string) {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    setAdj({ ...DEFAULTS, ...p.adj });
  }

  async function exportImage(format: "image/jpeg" | "image/png" | "image/webp") {
    if (!src || !imgRef.current) { setErr("Load an image first."); return; }
    setBusy(true); setErr(null);
    try {
      const img = imgRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported.");
      ctx.filter = cssFilter;
      ctx.drawImage(img, 0, 0);
      const blob: Blob = await new Promise((res, rej) =>
        canvas.toBlob((b) => (b ? res(b) : rej(new Error("Could not render image."))), format, 0.92),
      );
      if (outUrl) URL.revokeObjectURL(outUrl);
      const url = URL.createObjectURL(blob);
      setOutUrl(url);
      const a = document.createElement("a");
      a.href = url;
      const ext = format === "image/jpeg" ? "jpg" : format === "image/png" ? "png" : "webp";
      a.download = `${(file?.name ?? "photo").replace(/\.[^.]+$/, "")}-filtered.${ext}`;
      a.click();
    } catch (e) {
      console.error(e);
      setErr(e instanceof Error ? e.message : "Could not export the image.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolLayout slug="photo-filters">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-5">
          <FileDrop file={file} onFile={setFile} />

          <Field label="Quick looks">
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.id)}
                  className="min-h-11 px-3 rounded-xl border border-border bg-card text-sm hover:bg-primary-soft hover:border-primary"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Slider label="Brightness" value={adj.brightness} min={0} max={200} suffix="%" onChange={(v) => setAdj({ ...adj, brightness: v })} />
            <Slider label="Contrast" value={adj.contrast} min={0} max={200} suffix="%" onChange={(v) => setAdj({ ...adj, contrast: v })} />
            <Slider label="Saturation" value={adj.saturate} min={0} max={200} suffix="%" onChange={(v) => setAdj({ ...adj, saturate: v })} />
            <Slider label="Hue" value={adj.hue} min={0} max={360} suffix="°" onChange={(v) => setAdj({ ...adj, hue: v })} />
            <Slider label="Grayscale" value={adj.grayscale} min={0} max={100} suffix="%" onChange={(v) => setAdj({ ...adj, grayscale: v })} />
            <Slider label="Sepia" value={adj.sepia} min={0} max={100} suffix="%" onChange={(v) => setAdj({ ...adj, sepia: v })} />
            <Slider label="Blur" value={adj.blur} min={0} max={20} suffix="px" onChange={(v) => setAdj({ ...adj, blur: v })} />
            <Slider label="Invert" value={adj.invert} min={0} max={100} suffix="%" onChange={(v) => setAdj({ ...adj, invert: v })} />
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => setAdj(DEFAULTS)} className="inline-flex items-center gap-2 min-h-11 px-4 rounded-xl border border-border bg-card hover:bg-primary-soft text-sm font-medium">
              <RotateCcw className="size-4" /> Reset
            </button>
            <button onClick={() => exportImage("image/jpeg")} disabled={!src || busy} className="inline-flex items-center gap-2 min-h-11 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-95 disabled:opacity-50">
              <Download className="size-4" /> Save JPG
            </button>
            <button onClick={() => exportImage("image/png")} disabled={!src || busy} className="inline-flex items-center gap-2 min-h-11 px-4 rounded-xl border border-border bg-card hover:bg-primary-soft text-sm font-medium disabled:opacity-50">
              <Download className="size-4" /> Save PNG
            </button>
            <button onClick={() => exportImage("image/webp")} disabled={!src || busy} className="inline-flex items-center gap-2 min-h-11 px-4 rounded-xl border border-border bg-card hover:bg-primary-soft text-sm font-medium disabled:opacity-50">
              <Download className="size-4" /> Save WEBP
            </button>
          </div>
          {err && <WarnBox>{err}</WarnBox>}
        </section>

        <section className="space-y-4 min-w-0">
          {src ? (
            <div className="soft-card p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <Wand2 className="size-4 text-primary" />
                <div className="font-display text-lg">Live preview</div>
              </div>
              <div className="checker-bg rounded-xl overflow-hidden border border-border grid place-items-center min-h-60">
                <img
                  ref={imgRef}
                  src={src}
                  alt="Filtered preview"
                  crossOrigin="anonymous"
                  style={{ filter: cssFilter }}
                  className="max-h-[460px] w-auto object-contain"
                />
              </div>
              {outUrl && (
                <div className="mt-4">
                  <div className="eyebrow mb-2">Before / After</div>
                  <BeforeAfter beforeUrl={src} afterUrl={outUrl} />
                </div>
              )}
            </div>
          ) : (
            <div className="soft-card p-8 text-center text-sm text-muted-foreground">
              <Sparkles className="mx-auto size-10 text-primary mb-3" />
              Drop a photo on the left to see filters applied live.
            </div>
          )}
        </section>
      </div>

      <HowItWorks>
        <li>Drop a photo — it stays on your device.</li>
        <li>Tap a quick look or fine-tune brightness, contrast, hue and more.</li>
        <li>Save as JPG, PNG or WEBP — the filtered pixels are baked in.</li>
      </HowItWorks>
    </ToolLayout>
  );
}

function Slider({ label, value, min, max, suffix, onChange }: {
  label: string; value: number; min: number; max: number; suffix: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between text-sm mb-1.5">
        <span className="font-semibold">{label}</span>
        <span className="text-muted-foreground num">{value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
        aria-label={label}
      />
    </label>
  );
}
