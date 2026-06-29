import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { ToolLayout, validateImageFile, formatBytes } from "../components/ToolLayout";
import {
  FileDrop,
  Field,
  ErrorBox,
  RunButton,
  ResultPanel,
  EmptyState,
  HowItWorks,
} from "../components/ToolControls";
import ogImage from "../assets/og/og-crop.jpg";

export const Route = createFileRoute("/image-cropper")({
  head: () => ({
    meta: [
      { title: "Crop Image Online — Free, Private, No Upload" },
      {
        name: "description",
        content:
          "Crop any photo to a square, 4:5, 16:9, or a custom size. Drag the handles to set the box, then download. Runs in your browser. Free and private.",
      },
      { property: "og:title", content: "Image Cropper — Bluebird" },
      {
        property: "og:description",
        content: "Crop photos to any ratio in your browser. Free, no sign-up, no uploads.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/image-cropper" },
      { property: "og:image", content: ogImage },
      { name: "twitter:image", content: ogImage },
    ],
    links: [{ rel: "canonical", href: "/image-cropper" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird Image Cropper",
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          description: "Free in-browser tool to crop photos to any aspect ratio.",
        }),
      },
    ],
  }),
  component: Page,
});

type RatioId = "free" | "1:1" | "4:5" | "16:9" | "9:16" | "3:2";
const RATIOS: { id: RatioId; label: string; value: number | undefined }[] = [
  { id: "free", label: "Free", value: undefined },
  { id: "1:1", label: "Square", value: 1 },
  { id: "4:5", label: "Portrait 4:5", value: 4 / 5 },
  { id: "16:9", label: "Wide 16:9", value: 16 / 9 },
  { id: "9:16", label: "Story 9:16", value: 9 / 16 },
  { id: "3:2", label: "Classic 3:2", value: 3 / 2 },
];

type OutFmt = "image/jpeg" | "image/png" | "image/webp";

function makeInitialCrop(aspect: number | undefined, mediaW: number, mediaH: number): Crop {
  if (!aspect) {
    return { unit: "%", x: 10, y: 10, width: 80, height: 80 };
  }
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 80 }, aspect, mediaW, mediaH),
    mediaW,
    mediaH,
  );
}

async function exportCrop(
  imgEl: HTMLImageElement,
  px: PixelCrop,
  outFmt: OutFmt,
  quality: number,
): Promise<Blob> {
  const sx = px.x * (imgEl.naturalWidth / imgEl.width);
  const sy = px.y * (imgEl.naturalHeight / imgEl.height);
  const sw = px.width * (imgEl.naturalWidth / imgEl.width);
  const sh = px.height * (imgEl.naturalHeight / imgEl.height);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(sw);
  canvas.height = Math.round(sh);
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  if (outFmt === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(imgEl, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), outFmt, quality),
  );
}

function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [ratio, setRatio] = useState<RatioId>("1:1");
  const [crop, setCrop] = useState<Crop>();
  const [pixelCrop, setPixelCrop] = useState<PixelCrop | null>(null);
  const [outFmt, setOutFmt] = useState<OutFmt>("image/jpeg");
  const [quality, setQuality] = useState(0.9);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; name: string; size: number; w: number; h: number } | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!file) {
      setImgUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Keyboard nudging: arrow keys = 1px, Shift = 10px (in display space)
  useEffect(() => {
    if (!file || !imgRef.current) return;
    function onKey(e: KeyboardEvent) {
      if (!crop || !imgRef.current) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const dirs: Record<string, [number, number]> = {
        ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1],
      };
      const d = dirs[e.key];
      if (!d) return;
      e.preventDefault();
      const step = e.shiftKey ? 10 : 1;
      const w = imgRef.current.width, h = imgRef.current.height;
      const dxPct = (d[0] * step / w) * 100;
      const dyPct = (d[1] * step / h) * 100;
      setCrop((c) => {
        if (!c || c.unit !== "%") return c;
        return { ...c, x: Math.max(0, Math.min(100 - c.width, c.x + dxPct)), y: Math.max(0, Math.min(100 - c.height, c.y + dyPct)) };
      });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [file, crop]);


  function onFile(f: File | null) {
    setResult(null);
    setCrop(undefined);
    setPixelCrop(null);
    const err = validateImageFile(f);
    setError(err);
    setFile(err || !f ? null : f);
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const aspect = RATIOS.find((r) => r.id === ratio)?.value;
    setCrop(makeInitialCrop(aspect, width, height));
  }

  function applyRatio(id: RatioId) {
    setRatio(id);
    if (imgRef.current) {
      const aspect = RATIOS.find((r) => r.id === id)?.value;
      setCrop(makeInitialCrop(aspect, imgRef.current.width, imgRef.current.height));
    }
  }

  async function run() {
    if (!file || !imgRef.current || !pixelCrop) return;
    setBusy(true);
    setError(null);
    try {
      const blob = await exportCrop(imgRef.current, pixelCrop, outFmt, quality);
      const ext = outFmt.split("/")[1];
      const url = URL.createObjectURL(blob);
      setResult({
        url,
        name: `cropped-${Math.round(pixelCrop.width)}x${Math.round(pixelCrop.height)}.${ext}`,
        size: blob.size,
        w: Math.round(pixelCrop.width * (imgRef.current.naturalWidth / imgRef.current.width)),
        h: Math.round(pixelCrop.height * (imgRef.current.naturalHeight / imgRef.current.height)),
      });
    } catch {
      setError("Sorry, we couldn't crop that image. Please try a different one.");
    } finally {
      setBusy(false);
    }
  }

  const aspectVal = RATIOS.find((r) => r.id === ratio)?.value;
  const canRun = !!file && !error && !!pixelCrop && pixelCrop.width > 0 && pixelCrop.height > 0;

  return (
    <ToolLayout slug="image-cropper">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 md:col-span-7 space-y-6">
          <FileDrop file={file} onFile={onFile} />

          {imgUrl && (
            <>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="eyebrow">Frame · aspect ratio</div>
                  <button
                    type="button"
                    onClick={() => applyRatio(ratio)}
                    className="text-xs font-semibold text-muted-foreground hover:text-primary"
                  >
                    Reset crop
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {RATIOS.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => applyRatio(r.id)}
                      aria-pressed={ratio === r.id}
                      className={[
                        "rounded-full border px-3 py-1.5 text-sm font-medium",
                        ratio === r.id
                          ? "border-primary bg-primary-soft text-primary"
                          : "border-border bg-card hover:border-primary/60",
                      ].join(" ")}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="soft-card p-3">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percent) => setCrop(percent)}
                  onComplete={(c) => setPixelCrop(c)}
                  aspect={aspectVal}
                  keepSelection
                  ruleOfThirds
                  className="max-w-full"
                >
                  <img
                    ref={imgRef}
                    src={imgUrl}
                    alt="To crop"
                    onLoad={onImageLoad}
                    className="max-h-[60vh] w-auto mx-auto block"
                  />
                </ReactCrop>
                {pixelCrop && imgRef.current && (() => {
                  const sx = imgRef.current.naturalWidth / imgRef.current.width;
                  const sy = imgRef.current.naturalHeight / imgRef.current.height;
                  const outW = Math.round(pixelCrop.width * sx);
                  const outH = Math.round(pixelCrop.height * sy);
                  const keepPct = Math.round(
                    ((pixelCrop.width * pixelCrop.height) /
                      (imgRef.current.width * imgRef.current.height)) * 100,
                  );
                  return (
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                      <span className="rounded-full border border-border bg-card px-3 py-1 num font-semibold">
                        {outW} × {outH} px
                      </span>
                      <span className="text-muted-foreground num">keeps {keepPct}% of original</span>
                      <span className="text-xs text-muted-foreground ml-auto hidden sm:inline">
                        Tip: arrow keys nudge · Shift = 10px
                      </span>
                    </div>
                  );
                })()}
              </div>

              <div className="eyebrow pt-1">Output</div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Output format">
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["image/jpeg", "image/png", "image/webp"] as OutFmt[]).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setOutFmt(f)}
                        aria-pressed={outFmt === f}
                        className={[
                          "rounded-xl border px-3 py-2.5 text-sm font-semibold uppercase",
                          outFmt === f
                            ? "border-primary bg-primary-soft text-primary"
                            : "border-border bg-card hover:border-primary/60",
                        ].join(" ")}
                      >
                        {f.split("/")[1]}
                      </button>
                    ))}
                  </div>
                </Field>
                {(outFmt === "image/jpeg" || outFmt === "image/webp") && (
                  <Field label={`Quality — ${Math.round(quality * 100)}%`}>
                    <input
                      type="range"
                      min={0.3}
                      max={1}
                      step={0.05}
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="w-full accent-[color:var(--color-primary)]"
                    />
                  </Field>
                )}
              </div>
            </>
          )}

          {error && <ErrorBox>{error}</ErrorBox>}
          <RunButton onClick={run} disabled={!canRun} busy={busy} label="Crop image" />

          <HowItWorks>
            Cropping happens entirely in your browser. Your image is drawn to a private canvas, the
            selection is copied out, and we hand you the file — no upload, no server.
          </HowItWorks>
        </div>

        <aside className="col-span-12 md:col-span-5">
          {result ? (
            <ResultPanel
              title="Your cropped image is ready"
              delta={{ label: `${result.w} × ${result.h}`, tone: "success" }}
              lines={[
                ["Size", `${result.w} × ${result.h} px`],
                ["File size", formatBytes(result.size)],
                ["Format", outFmt.split("/")[1].toUpperCase()],
              ]}
              previewUrl={result.url}
              href={result.url}
              download={result.name}
              onReset={() => {
                setFile(null);
                setResult(null);
              }}
            />
          ) : (
            <EmptyState text="Drop a photo on the left, drag the crop box, then tap Crop image." />
          )}
        </aside>
      </div>
    </ToolLayout>
  );
}
