import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import { ToolLayout, validateImageFile, formatBytes } from "../components/ToolLayout";
import {
  FileDrop,
  Field,
  ErrorBox,
  RunButton,
  ResultPanel,
  EmptyState,
  HowItWorks,
  ProgressBar,
} from "../components/ToolControls";
import { placement } from "../lib/image-tool-helpers";
import ogImage from "../assets/og/og-watermark.jpg";

export const Route = createFileRoute("/watermark")({
  head: () => ({
    meta: [
      { title: "Add Watermark to Photo Online — Batch, Free, No Upload" },
      {
        name: "description",
        content:
          "Add a text or logo watermark to one photo or a batch of photos in your browser. Pick position, size, opacity and rotation. Free, no sign-up, no uploads.",
      },
      { property: "og:title", content: "Photo Watermark — Bluebird" },
      {
        property: "og:description",
        content: "Text or logo watermark, single or batch. Free, private, runs in your browser.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/watermark" },
      { property: "og:image", content: ogImage },
      { name: "twitter:image", content: ogImage },
    ],
    links: [{ rel: "canonical", href: "/watermark" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird Photo Watermark",
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          description:
            "Free in-browser tool to add text or logo watermarks to photos, including batch mode.",
        }),
      },
    ],
  }),
  component: Page,
});

type Pos = "tl" | "tc" | "tr" | "ml" | "mc" | "mr" | "bl" | "bc" | "br";
type Mode = "text" | "logo";

type Settings = {
  mode: Mode;
  text: string;
  color: string;
  fontPct: number; // % of min(image w, h)
  opacity: number;
  rotation: number;
  pos: Pos;
  padPct: number;
  logoScalePct: number;
  tile: boolean;
  outline: boolean;
};

const PRESETS_KEY = "bluebird-watermark-presets-v1";




async function drawWatermark(
  file: File,
  s: Settings,
  logoImg: HTMLImageElement | null,
): Promise<Blob> {
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await img.decode();
  const W = img.naturalWidth;
  const H = img.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  ctx.globalAlpha = s.opacity;

  const pad = Math.round((s.padPct / 100) * Math.min(W, H));

  if (s.mode === "text" && s.text.trim()) {
    const fontPx = Math.max(10, Math.round((s.fontPct / 100) * Math.min(W, H)));
    ctx.font = `600 ${fontPx}px "Plus Jakarta Sans", system-ui, sans-serif`;
    ctx.fillStyle = s.color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const metrics = ctx.measureText(s.text);
    const w = metrics.width;
    const h = fontPx * 1.2;
    const draw = (cx: number, cy: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((s.rotation * Math.PI) / 180);
      if (s.outline) {
        ctx.lineWidth = Math.max(2, Math.round(fontPx * 0.08));
        ctx.strokeStyle = "rgba(0,0,0,0.55)";
        ctx.strokeText(s.text, 0, 0);
      } else {
        ctx.shadowColor = "rgba(0,0,0,0.35)";
        ctx.shadowBlur = Math.max(2, Math.round(fontPx * 0.06));
      }
      ctx.fillText(s.text, 0, 0);
      ctx.restore();
    };
    if (s.tile) {
      const stepX = w + fontPx * 2;
      const stepY = h + fontPx * 3;
      for (let y = stepY / 2; y < H + stepY; y += stepY) {
        for (let x = stepX / 2; x < W + stepX; x += stepX) draw(x, y);
      }
    } else {
      const { cx, cy } = placement(s.pos, W, H, w, h, pad);
      draw(cx, cy);
    }
  } else if (s.mode === "logo" && logoImg) {
    const targetW = (s.logoScalePct / 100) * W;
    const r = targetW / logoImg.naturalWidth;
    const w = logoImg.naturalWidth * r;
    const h = logoImg.naturalHeight * r;
    const drawLogo = (cx: number, cy: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((s.rotation * Math.PI) / 180);
      ctx.drawImage(logoImg, -w / 2, -h / 2, w, h);
      ctx.restore();
    };
    if (s.tile) {
      const stepX = w + w * 0.6;
      const stepY = h + h * 0.6;
      for (let y = stepY / 2; y < H + stepY; y += stepY) {
        for (let x = stepX / 2; x < W + stepX; x += stepX) drawLogo(x, y);
      }
    } else {
      const { cx, cy } = placement(s.pos, W, H, w, h, pad);
      drawLogo(cx, cy);
    }
  }
  ctx.globalAlpha = 1;

  const mime = file.type === "image/png" || file.type === "image/webp" ? file.type : "image/jpeg";
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), mime, 0.92),
  );
}

function Page() {
  const [files, setFiles] = useState<File[]>([]);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  const [settings, setSettings] = useState<Settings>({
    mode: "text",
    text: "© Your Name",
    color: "#ffffff",
    fontPct: 5,
    opacity: 0.7,
    rotation: 0,
    pos: "br",
    padPct: 3,
    logoScalePct: 18,
    tile: false,
    outline: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ url: string; name: string; size: number; count: number } | null>(null);
  const [livePreview, setLivePreview] = useState<string | null>(null);
  const debounceRef = useRef<number | null>(null);

  // Load logo file into Image
  useEffect(() => {
    if (!logo) {
      setLogoImg(null);
      return;
    }
    const url = URL.createObjectURL(logo);
    const img = new Image();
    img.onload = () => setLogoImg(img);
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [logo]);

  // Live preview of first image
  useEffect(() => {
    if (!files[0]) {
      setLivePreview(null);
      return;
    }
    if (settings.mode === "logo" && !logoImg) {
      setLivePreview(null);
      return;
    }
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      try {
        const blob = await drawWatermark(files[0], settings, logoImg);
        setLivePreview((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(blob);
        });
      } catch {
        /* ignore */
      }
    }, 180);
  }, [files, settings, logoImg]);

  function onFirstFile(f: File | null) {
    setResult(null);
    if (!f) {
      setFiles([]);
      setError(null);
      return;
    }
    const err = validateImageFile(f);
    setError(err);
    setFiles(err ? [] : [f]);
  }

  function onMultiSelect(list: FileList | null) {
    if (!list || list.length === 0) return;
    const arr = Array.from(list);
    const bad = arr.map((f) => validateImageFile(f)).find(Boolean);
    if (bad) {
      setError(bad);
      return;
    }
    setError(null);
    setResult(null);
    setFiles(arr);
  }

  const total = files.length;

  async function run() {
    if (total === 0) return;
    if (settings.mode === "text" && !settings.text.trim()) {
      setError("Please type the watermark text first.");
      return;
    }
    if (settings.mode === "logo" && !logoImg) {
      setError("Please choose a logo PNG first.");
      return;
    }
    setBusy(true);
    setError(null);
    setProgress(0);
    try {
      if (total === 1) {
        const blob = await drawWatermark(files[0], settings, logoImg);
        setResult({
          url: URL.createObjectURL(blob),
          name: `watermarked-${files[0].name}`,
          size: blob.size,
          count: 1,
        });
        setProgress(1);
      } else {
        const zip = new JSZip();
        let totalBytes = 0;
        for (let i = 0; i < files.length; i++) {
          const f = files[i];
          const blob = await drawWatermark(f, settings, logoImg);
          totalBytes += blob.size;
          zip.file(`watermarked-${f.name}`, blob);
          setProgress((i + 1) / files.length);
          await new Promise((r) => setTimeout(r, 0));
        }
        const blob = await zip.generateAsync({ type: "blob" });
        setResult({
          url: URL.createObjectURL(blob),
          name: `watermarked-${files.length}-images.zip`,
          size: blob.size,
          count: files.length,
        });
      }
    } catch {
      setError("Sorry, something went wrong while watermarking. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const canRun = total > 0 && !busy && !error;
  const posLabel = useMemo(
    () =>
      ({
        tl: "Top-left", tc: "Top center", tr: "Top-right",
        ml: "Middle-left", mc: "Center", mr: "Middle-right",
        bl: "Bottom-left", bc: "Bottom center", br: "Bottom-right",
      }[settings.pos]),
    [settings.pos],
  );

  return (
    <ToolLayout slug="watermark">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 md:col-span-7 space-y-6">
          <FileDrop
            file={files[0] ?? null}
            onFile={onFirstFile}
            label="Drag a photo here, or click to choose one"
            hint="JPG · PNG · WEBP — up to 20 MB each"
          />
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 hover:border-primary">
              + Add a batch of photos
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => onMultiSelect(e.target.files)}
              />
            </label>
            {total > 1 && (
              <span className="text-muted-foreground num">
                {total} photos selected — they'll be downloaded as a ZIP.
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSettings((s) => ({ ...s, mode: "text" }))}
              aria-pressed={settings.mode === "text"}
              className={[
                "rounded-xl border px-3 py-3 text-sm font-semibold min-h-12",
                settings.mode === "text"
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border bg-card hover:border-primary/60",
              ].join(" ")}
            >
              Text watermark
            </button>
            <button
              type="button"
              onClick={() => setSettings((s) => ({ ...s, mode: "logo" }))}
              aria-pressed={settings.mode === "logo"}
              className={[
                "rounded-xl border px-3 py-3 text-sm font-semibold min-h-12",
                settings.mode === "logo"
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border bg-card hover:border-primary/60",
              ].join(" ")}
            >
              Logo watermark
            </button>
          </div>

          <Section title="Content" defaultOpen>
            {settings.mode === "text" ? (
              <>
                <Field label="Watermark text">
                  <input
                    type="text"
                    value={settings.text}
                    onChange={(e) => setSettings((s) => ({ ...s, text: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-card px-3 py-3 text-base focus:outline-none focus:border-primary"
                  />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2 mt-4">
                  <Field label={`Text size — ${settings.fontPct}%`}>
                    <input type="range" min={2} max={20} value={settings.fontPct}
                      onChange={(e) => setSettings((s) => ({ ...s, fontPct: Number(e.target.value) }))}
                      className="w-full accent-[color:var(--color-primary)]" />
                  </Field>
                  <Field label="Color">
                    <div className="flex items-center gap-3">
                      <input type="color" value={settings.color}
                        onChange={(e) => setSettings((s) => ({ ...s, color: e.target.value }))}
                        className="size-11 rounded-lg border border-border bg-card cursor-pointer" />
                      <code className="rounded-lg border border-border bg-card px-3 py-2 text-sm num">{settings.color}</code>
                    </div>
                  </Field>
                </div>
              </>
            ) : (
              <>
                <Field label="Logo file (PNG with transparent background works best)">
                  <input
                    type="file"
                    accept="image/png,image/webp,image/svg+xml"
                    onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
                    className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:px-3 file:py-2 file:font-semibold"
                  />
                </Field>
                <div className="mt-4">
                  <Field label={`Logo size — ${settings.logoScalePct}% of image width`}>
                    <input type="range" min={5} max={50} value={settings.logoScalePct}
                      onChange={(e) => setSettings((s) => ({ ...s, logoScalePct: Number(e.target.value) }))}
                      className="w-full accent-[color:var(--color-primary)]" />
                  </Field>
                </div>
              </>
            )}
          </Section>

          <Section title="Look">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={`Opacity — ${Math.round(settings.opacity * 100)}%`}>
                <input type="range" min={0.1} max={1} step={0.05} value={settings.opacity}
                  onChange={(e) => setSettings((s) => ({ ...s, opacity: Number(e.target.value) }))}
                  className="w-full accent-[color:var(--color-primary)]" />
              </Field>
              <Field label={`Rotation — ${settings.rotation}°`}>
                <input type="range" min={-90} max={90} value={settings.rotation}
                  onChange={(e) => setSettings((s) => ({ ...s, rotation: Number(e.target.value) }))}
                  className="w-full accent-[color:var(--color-primary)]" />
              </Field>
            </div>
            {settings.mode === "text" && (
              <div className="mt-4">
                <ToggleRow
                  label="Dark outline (better readability on busy photos)"
                  checked={settings.outline}
                  onChange={(v) => setSettings((s) => ({ ...s, outline: v }))}
                />
              </div>
            )}
          </Section>

          <Section title={`Position — ${settings.tile ? "Tiled across photo" : posLabel}`}>
            <div className="mb-3">
              <ToggleRow
                label="Tile across the whole photo"
                checked={settings.tile}
                onChange={(v) => setSettings((s) => ({ ...s, tile: v }))}
              />
            </div>
            {!settings.tile && (
              <div className="inline-grid grid-cols-3 gap-1.5 rounded-xl border border-border bg-card p-2">
                {(["tl","tc","tr","ml","mc","mr","bl","bc","br"] as Pos[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSettings((s) => ({ ...s, pos: p }))}
                    aria-pressed={settings.pos === p}
                    aria-label={p}
                    className={[
                      "size-9 rounded-md transition-colors",
                      settings.pos === p ? "bg-primary" : "bg-muted hover:bg-primary/30",
                    ].join(" ")}
                  />
                ))}
              </div>
            )}
          </Section>

          <PresetBar settings={settings} onLoad={(s) => setSettings(s)} />


          {busy && total > 1 && (
            <ProgressBar value={progress} label={`Watermarking ${Math.round(progress * total)} of ${total}…`} />
          )}
          {error && <ErrorBox>{error}</ErrorBox>}
          <RunButton
            onClick={run}
            disabled={!canRun}
            busy={busy}
            label={total > 1 ? `Watermark ${total} photos` : "Add watermark"}
          />

          <HowItWorks>
            Each photo is drawn on a private canvas in your browser, the watermark is composited
            on top, and you get the file straight back. Nothing is uploaded.
          </HowItWorks>
        </div>

        <aside className="col-span-12 md:col-span-5">
          {result ? (
            <ResultPanel
              title={result.count > 1 ? "Your watermarked ZIP is ready" : "Your watermarked image is ready"}
              delta={{ label: result.count > 1 ? `${result.count} photos` : posLabel, tone: "success" }}
              lines={[
                ["Photos", String(result.count)],
                ["File size", formatBytes(result.size)],
                ["Position", posLabel],
              ]}
              previewUrl={result.count === 1 ? result.url : undefined}
              href={result.url}
              download={result.name}
              onReset={() => {
                setFiles([]);
                setResult(null);
              }}
            />
          ) : livePreview ? (
            <div className="soft-card p-4">
              <div className="eyebrow mb-2">Live preview {total > 1 && <span className="text-muted-foreground font-normal">(first photo)</span>}</div>
              <div className="checker-bg rounded-xl overflow-hidden border border-border grid place-items-center min-h-48">
                <img src={livePreview} alt="Live preview" className="max-h-72 w-auto object-contain" />
              </div>
            </div>
          ) : (
            <EmptyState text="Drop a photo on the left and type your watermark. A live preview will appear here." />
          )}
        </aside>
      </div>
    </ToolLayout>
  );
}

function Section({ title, defaultOpen, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  return (
    <details open={defaultOpen} className="soft-card group p-0 overflow-hidden">
      <summary className="list-none cursor-pointer px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-primary-soft/40">
        <span className="font-display text-lg">{title}</span>
        <span className="text-xs text-muted-foreground transition-transform group-open:rotate-180">▾</span>
      </summary>
      <div className="px-5 pb-5 pt-1">{children}</div>
    </details>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <span
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          "relative inline-flex h-7 w-12 rounded-full transition-colors flex-shrink-0",
          checked ? "bg-primary" : "bg-muted",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-0.5 size-6 rounded-full bg-white shadow transition-all",
            checked ? "left-[22px]" : "left-0.5",
          ].join(" ")}
        />
      </span>
      <span className="text-sm">{label}</span>
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

type SavedPreset = { id: string; name: string; settings: Settings };

function PresetBar({ settings, onLoad }: { settings: Settings; onLoad: (s: Settings) => void }) {
  const [presets, setPresets] = useState<SavedPreset[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PRESETS_KEY);
      if (raw) setPresets(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);
  function persist(next: SavedPreset[]) {
    setPresets(next);
    try { localStorage.setItem(PRESETS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }
  function save() {
    const name = window.prompt("Name this watermark preset:", `Preset ${presets.length + 1}`);
    if (!name) return;
    persist([...presets, { id: `${Date.now()}`, name, settings }]);
  }
  function remove(id: string) {
    persist(presets.filter((p) => p.id !== id));
  }
  return (
    <div className="soft-card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="eyebrow">Saved presets</div>
        <button
          type="button"
          onClick={save}
          className="text-xs font-semibold text-primary hover:underline"
        >
          + Save current
        </button>
      </div>
      {presets.length === 0 ? (
        <p className="text-xs text-muted-foreground">Save your favourite watermark setup to reuse with one tap. Presets stay on your device.</p>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <li key={p.id} className="inline-flex items-center rounded-full border border-border bg-card overflow-hidden">
              <button
                type="button"
                onClick={() => onLoad(p.settings)}
                className="px-3 py-1.5 text-sm font-medium hover:bg-primary-soft"
              >
                {p.name}
              </button>
              <button
                type="button"
                aria-label={`Delete ${p.name}`}
                onClick={() => remove(p.id)}
                className="px-2 py-1.5 text-xs text-muted-foreground hover:text-rose-600 border-l border-border"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
