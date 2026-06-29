import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { Mail, Globe, MessageCircle, SlidersHorizontal } from "lucide-react";
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
import ogImage from "../assets/og/og-compress.jpg";

export const Route = createFileRoute("/image-compressor")({
  head: () => ({
    meta: [
      { title: "Image Compressor — Shrink JPG, PNG and WEBP Online Free" },
      { name: "description", content: "Compress JPG, PNG or WEBP photos in your browser. Pick a goal — email, web, chat or a custom size — and download a smaller image. Free and private." },
      { property: "og:title", content: "Image Compressor — Bluebird" },
      { property: "og:description", content: "Shrink photos without losing quality. Free, private, runs in your browser." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/image-compressor" },
      { property: "og:image", content: ogImage },
      { name: "twitter:image", content: ogImage },
    ],
    links: [{ rel: "canonical", href: "/image-compressor" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird Image Compressor",
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          description: "Free in-browser tool to compress JPG, PNG and WEBP photos to a target size.",
        }),
      },
    ],
  }),
  component: Page,
});

type Preset = { id: string; label: string; sub: string; targetKB: number; Icon: typeof Mail };
const PRESETS: Preset[] = [
  { id: "email", label: "Email", sub: "≤ 1 MB attachment", targetKB: 1024, Icon: Mail },
  { id: "web",   label: "Web",   sub: "≤ 300 KB page asset", targetKB: 300,  Icon: Globe },
  { id: "chat",  label: "Chat",  sub: "≤ 150 KB messaging", targetKB: 150,  Icon: MessageCircle },
  { id: "custom",label: "Custom",sub: "Set your own target", targetKB: 0,    Icon: SlidersHorizontal },
];
const LS_KEY = "bluebird.compressor.preset";

function fmtKB(kb: number) {
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${kb} KB`;
}

function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [presetId, setPresetId] = useState<string>("web");
  const [customKB, setCustomKB] = useState<number>(500);
  const [stripExif, setStripExif] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [result, setResult] = useState<{ blob: Blob; url: string; before: string; name: string; originalSize: number } | null>(null);
  const lastBeforeUrl = useRef<string | null>(null);

  // Remember last preset
  useEffect(() => {
    try {
      const v = localStorage.getItem(LS_KEY);
      if (v) setPresetId(v);
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, presetId); } catch { /* ignore */ }
  }, [presetId]);

  function reset() {
    setFile(null); setResult(null); setError(null);
    if (lastBeforeUrl.current) URL.revokeObjectURL(lastBeforeUrl.current);
    lastBeforeUrl.current = null;
  }

  function onFile(f: File | null) {
    setResult(null);
    const err = validateImageFile(f);
    setError(err);
    setFile(err ? null : f);
  }

  const preset = PRESETS.find((p) => p.id === presetId)!;
  const targetKB = presetId === "custom" ? customKB : preset.targetKB;

  async function compress() {
    if (!file) return;
    setBusy(true); setError(null); setProgress(0);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: Math.max(0.01, targetKB / 1024),
        maxWidthOrHeight: 4096,
        useWebWorker: true,
        initialQuality: 0.82,
        // browser-image-compression iterates internally; we report progress
        onProgress: (p: number) => setProgress(p),
        // preserve transparency for PNGs; otherwise prefer JPEG for size
        fileType: file.type === "image/png" ? "image/png" : undefined,
      } as Parameters<typeof imageCompression>[1]);

      // Optionally strip EXIF: re-encoding through canvas removes metadata.
      let finalBlob: Blob = compressed;
      if (stripExif && file.type === "image/jpeg") {
        const img = new Image();
        img.src = URL.createObjectURL(compressed);
        await img.decode();
        const c = document.createElement("canvas");
        c.width = img.naturalWidth; c.height = img.naturalHeight;
        c.getContext("2d")!.drawImage(img, 0, 0);
        finalBlob = await new Promise<Blob>((resolve, reject) =>
          c.toBlob((b) => (b ? resolve(b) : reject(new Error("encode"))), "image/jpeg", 0.9),
        );
      }

      const beforeUrl = URL.createObjectURL(file);
      if (lastBeforeUrl.current) URL.revokeObjectURL(lastBeforeUrl.current);
      lastBeforeUrl.current = beforeUrl;
      setResult({
        blob: finalBlob,
        url: URL.createObjectURL(finalBlob),
        before: beforeUrl,
        name: `compressed-${file.name}`,
        originalSize: file.size,
      });
    } catch {
      setError("Sorry, we couldn't compress that image. Please try a different one.");
    } finally {
      setBusy(false);
      setProgress(undefined);
    }
  }

  const canRun = !!file && !error && !busy && targetKB > 0;
  const savedPct = result ? Math.round((1 - result.blob.size / result.originalSize) * 100) : 0;
  const savedBytes = result ? result.originalSize - result.blob.size : 0;

  return (
    <ToolLayout slug="image-compressor">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 md:col-span-7 space-y-6">
          <FileDrop file={file} onFile={onFile} />

          <div>
            <div className="text-sm font-semibold mb-3">Pick a goal</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PRESETS.map((p) => {
                const active = p.id === presetId;
                const Icon = p.Icon;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPresetId(p.id)}
                    aria-pressed={active}
                    className={[
                      "rounded-2xl border px-3 py-3.5 text-left transition-all min-h-20",
                      active
                        ? "border-primary bg-primary-soft shadow-soft"
                        : "border-border bg-card hover:border-primary/60",
                    ].join(" ")}
                  >
                    <Icon className={["size-5 mb-1.5", active ? "text-primary" : "text-muted-foreground"].join(" ")} />
                    <div className="font-semibold text-sm">{p.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{p.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {presetId === "custom" && (
            <Field label={`Target file size · about ${fmtKB(customKB)}`} hint="We'll get as close to this size as possible while keeping quality up.">
              <input
                type="range" min={50} max={5000} step={10} value={customKB}
                onChange={(e) => setCustomKB(Number(e.target.value))}
                className="w-full"
              />
            </Field>
          )}

          <label className="flex items-start gap-3 rounded-xl border border-border bg-card/60 px-4 py-3 cursor-pointer">
            <input
              type="checkbox"
              checked={stripExif}
              onChange={(e) => setStripExif(e.target.checked)}
              className="size-4 mt-0.5 accent-[color:var(--color-primary)]"
            />
            <div className="text-sm">
              <div className="font-semibold">Also remove hidden info (recommended)</div>
              <div className="text-muted-foreground text-xs mt-0.5">
                Strips camera, date and GPS data stored inside JPG photos.
              </div>
            </div>
          </label>

          {error && <ErrorBox>{error}</ErrorBox>}
          {busy && (
            <ProgressBar
              label={`Compressing to about ${fmtKB(targetKB)}…`}
              value={typeof progress === "number" ? progress : undefined}
            />
          )}
          <RunButton onClick={compress} disabled={!canRun} busy={busy} label="Compress image" />

          <HowItWorks>
            Compression runs in your browser using a Web Worker — your image is never uploaded. We use
            smart re-encoding to hit your target file size while keeping the picture looking good.
          </HowItWorks>
        </div>

        <aside className="col-span-12 md:col-span-5">
          {result ? (
            <ResultPanel
              title="Your smaller image is ready"
              delta={{
                label: `−${savedPct}% · saved ${formatBytes(Math.max(0, savedBytes))}`,
                tone: savedPct > 0 ? "success" : "warn",
              }}
              lines={[
                ["Before", formatBytes(result.originalSize)],
                ["After", formatBytes(result.blob.size)],
                ["Target", fmtKB(targetKB)],
              ]}
              beforeUrl={result.before}
              previewUrl={result.url}
              href={result.url}
              download={result.name}
              onReset={reset}
            />
          ) : (
            <EmptyState text="Choose an image on the left and we'll show the smaller version here — with a slider to compare quality." />
          )}
        </aside>
      </div>
    </ToolLayout>
  );
}
