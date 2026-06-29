import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { ToolLayout, validateImageFile, formatBytes } from "../components/ToolLayout";
import { FileDrop, ErrorBox, RunButton, ResultPanel, EmptyState, Field, WarnBox, HowItWorks } from "../components/ToolControls";
import ogImage from "../assets/og/og-convert.jpg";

export const Route = createFileRoute("/image-format-converter")({
  head: () => ({
    meta: [
      { title: "Convert PNG to WEBP, JPG to PNG, and More — Free Online" },
      { name: "description", content: "Convert images between PNG, JPG and WEBP with a smart format recommendation and a live size preview. Runs entirely in your browser. Free." },
      { property: "og:title", content: "Convert PNG to WEBP — Bluebird" },
      { property: "og:description", content: "Switch between JPG, PNG and WEBP with one tap. Free, private, in your browser." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/image-format-converter" },
      { property: "og:image", content: ogImage },
      { name: "twitter:image", content: ogImage },
    ],
    links: [{ rel: "canonical", href: "/image-format-converter" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird Image Format Converter",
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          description: "Free in-browser converter for PNG, JPG and WEBP images.",
        }),
      },
    ],
  }),
  component: Page,
});

type Fmt = "image/jpeg" | "image/png" | "image/webp";

const FORMAT_OPTIONS: Array<{ mime: Fmt; label: string; note: string }> = [
  { mime: "image/jpeg", label: "JPG", note: "Best for photos" },
  { mime: "image/png", label: "PNG", note: "Best for graphics" },
  { mime: "image/webp", label: "WEBP", note: "Smallest file size" },
];

async function loadImage(file: File): Promise<HTMLImageElement> {
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await img.decode();
  return img;
}

async function detectAlpha(img: HTMLImageElement): Promise<boolean> {
  const c = document.createElement("canvas");
  const w = Math.min(64, img.naturalWidth);
  const h = Math.min(64, img.naturalHeight);
  c.width = w; c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 250) return true;
  }
  return false;
}

async function encode(img: HTMLImageElement, target: Fmt, quality: number, bg?: string): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  if (target === "image/jpeg" || bg) {
    ctx.fillStyle = bg ?? "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), target, quality),
  );
}

function recommend(file: File, hasAlpha: boolean): { mime: Fmt; reason: string } {
  const isScreenshot = /screenshot|screen-shot|screen_shot/i.test(file.name);
  if (hasAlpha) return { mime: "image/webp", reason: "Keeps transparency and is much smaller than PNG." };
  if (isScreenshot) return { mime: "image/webp", reason: "Screenshots compress about 70% smaller as WEBP." };
  if (file.type === "image/png") return { mime: "image/webp", reason: "Modern format, much smaller than PNG for photos." };
  return { mime: "image/jpeg", reason: "JPG is reliable and small for everyday photos." };
}

function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [target, setTarget] = useState<Fmt | "">("");
  const [quality, setQuality] = useState(0.9);
  const [bg, setBg] = useState("#ffffff");
  const [hasAlpha, setHasAlpha] = useState(false);
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [estSize, setEstSize] = useState<number | null>(null);
  const [estPreview, setEstPreview] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<{ mime: Fmt; reason: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ url: string; name: string; size: number } | null>(null);
  const debounceRef = useRef<number | null>(null);

  function onFile(f: File | null) {
    setResult(null); setSuggestion(null); setImgEl(null); setEstSize(null); setHasAlpha(false);
    const err = validateImageFile(f);
    setError(err);
    if (err || !f) { setFile(null); return; }
    setFile(f);
    (async () => {
      const img = await loadImage(f);
      setImgEl(img);
      const alpha = await detectAlpha(img);
      setHasAlpha(alpha);
      const s = recommend(f, alpha);
      setSuggestion(s);
      if (!target) setTarget(s.mime);
    })();
  }

  // Live size estimate when slider/format changes (debounced)
  useEffect(() => {
    if (!imgEl || !target) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      try {
        const lossy = target === "image/jpeg" || target === "image/webp";
        const blob = await encode(imgEl, target, lossy ? quality : 1, target === "image/jpeg" && hasAlpha ? bg : undefined);
        setEstSize(blob.size);
        if (estPreview) URL.revokeObjectURL(estPreview);
        setEstPreview(URL.createObjectURL(blob));
      } catch { /* ignore */ }
    }, 250);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imgEl, target, quality, hasAlpha, bg]);

  async function convert() {
    if (!file || !target || !imgEl) return;
    setBusy(true); setError(null);
    try {
      const lossy = target === "image/jpeg" || target === "image/webp";
      const blob = await encode(imgEl, target, lossy ? quality : 1, target === "image/jpeg" && hasAlpha ? bg : undefined);
      const ext = target.split("/")[1].replace("jpeg", "jpg");
      const base = file.name.replace(/\.[^.]+$/, "");
      setResult({ url: URL.createObjectURL(blob), name: `${base}.${ext}`, size: blob.size });
    } catch {
      setError("Sorry, your browser couldn't save the image in that format. Try a different one.");
    } finally { setBusy(false); }
  }

  const canRun = !!file && !!target && !error && !busy && !!imgEl;
  const lossy = target === "image/jpeg" || target === "image/webp";
  const willLoseAlpha = target === "image/jpeg" && hasAlpha;

  return (
    <ToolLayout slug="image-format-converter">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 md:col-span-7 space-y-6">
          <FileDrop file={file} onFile={onFile} />

          {suggestion && (
            <div className="flex items-start gap-2.5 rounded-xl border border-primary/40 bg-primary-soft/50 px-4 py-3 text-sm">
              <Sparkles className="size-4 mt-0.5 shrink-0 text-primary" />
              <div>
                <span className="font-semibold">We suggest {FORMAT_OPTIONS.find((o) => o.mime === suggestion.mime)!.label}.</span>{" "}
                <span className="text-muted-foreground">{suggestion.reason}</span>
              </div>
            </div>
          )}

          <div>
            <div className="text-sm font-semibold mb-3">Choose a new format</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {FORMAT_OPTIONS.map(({ mime, label, note }) => {
                const active = target === mime;
                const recommended = suggestion?.mime === mime;
                return (
                  <button
                    key={mime}
                    type="button"
                    onClick={() => setTarget(mime)}
                    aria-pressed={active}
                    className={[
                      "relative rounded-2xl border px-4 py-5 text-left transition-all",
                      active
                        ? "border-primary bg-primary-soft shadow-soft"
                        : "border-border bg-card hover:border-primary/60",
                    ].join(" ")}
                  >
                    {recommended && (
                      <span className="absolute top-2 right-2 rounded-full bg-primary text-primary-foreground text-[10px] font-bold tracking-wide px-2 py-0.5">
                        SUGGESTED
                      </span>
                    )}
                    <div className="font-display text-2xl">{label}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">{note}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {lossy && (
            <Field
              label={`Picture quality · ${Math.round(quality * 100)}%`}
              hint={estSize ? `About ${formatBytes(estSize)} at this setting.` : "Higher quality looks better; lower makes the file smaller."}
            >
              <input
                type="range" min={0.1} max={1} step={0.05} value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full"
              />
            </Field>
          )}

          {willLoseAlpha && (
            <WarnBox>
              This picture has transparent areas. JPG can't keep transparency — they'll be filled in. Pick a background color, or choose PNG / WEBP to keep transparency.
            </WarnBox>
          )}
          {willLoseAlpha && (
            <Field label="Background color (used in place of transparency)">
              <div className="flex items-center gap-3">
                <input type="color" value={bg} onChange={(e) => setBg(e.target.value)}
                  className="size-11 rounded-lg border border-border bg-card cursor-pointer" />
                <code className="rounded-lg border border-border bg-card px-3 py-2 text-sm num">{bg}</code>
              </div>
            </Field>
          )}

          {error && <ErrorBox>{error}</ErrorBox>}
          <RunButton onClick={convert} disabled={!canRun} busy={busy} label="Convert image" />

          <HowItWorks>
            Conversion uses your browser's built-in image encoders — your photo never leaves your device.
            The live size estimate re-encodes a small preview as you adjust the quality.
          </HowItWorks>
        </div>

        <aside className="col-span-12 md:col-span-5">
          {result ? (
            <ResultPanel
              title="Your converted image is ready"
              delta={file ? {
                label: `${formatBytes(file.size)} → ${formatBytes(result.size)}`,
                tone: result.size < file.size ? "success" : "warn",
              } : null}
              lines={[
                ["File name", result.name],
                ["File size", formatBytes(result.size)],
              ]}
              previewUrl={result.url}
              href={result.url}
              download={result.name}
              onReset={() => { setFile(null); setResult(null); setTarget(""); setImgEl(null); }}
            />
          ) : estPreview && imgEl ? (
            <div className="soft-card p-5">
              <div className="eyebrow mb-2">Live preview</div>
              <div className="font-display text-xl mb-3">
                About <span className="num">{estSize ? formatBytes(estSize) : "—"}</span>
              </div>
              <div className="checker-bg rounded-xl border border-border overflow-hidden">
                <img src={estPreview} alt="Preview" className="block w-full max-h-72 object-contain" />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Press <span className="font-semibold">Convert</span> to save the final file.
              </p>
            </div>
          ) : (
            <EmptyState text="Pick an image and a format — we'll show a live size preview before you download." />
          )}
        </aside>
      </div>
    </ToolLayout>
  );
}
