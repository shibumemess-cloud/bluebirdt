import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { RotateCw, RotateCcw, FlipHorizontal2, FlipVertical2 } from "lucide-react";
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
import ogImage from "../assets/og/og-rotate.jpg";

export const Route = createFileRoute("/rotate-flip")({
  head: () => ({
    meta: [
      { title: "Rotate & Flip Image Online — Free, No Upload" },
      {
        name: "description",
        content:
          "Rotate a photo by 90°, straighten it with a free-angle slider, or flip it horizontally or vertically. Runs in your browser. Free, no sign-up, no uploads.",
      },
      { property: "og:title", content: "Rotate & Flip Image — Bluebird" },
      {
        property: "og:description",
        content: "Rotate, straighten and mirror photos in your browser. Free and private.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/rotate-flip" },
      { property: "og:image", content: ogImage },
      { name: "twitter:image", content: ogImage },
    ],
    links: [{ rel: "canonical", href: "/rotate-flip" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird Rotate & Flip",
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          description:
            "Free in-browser tool to rotate, straighten and mirror photos. No uploads, no sign-up.",
        }),
      },
    ],
  }),
  component: Page,
});

async function renderRotated(
  file: File,
  angleDeg: number,
  flipX: boolean,
  flipY: boolean,
  bg: string | null,
): Promise<Blob> {
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await img.decode();

  const rad = (angleDeg * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const newW = Math.round(w * cos + h * sin);
  const newH = Math.round(w * sin + h * cos);

  const canvas = document.createElement("canvas");
  canvas.width = newW;
  canvas.height = newH;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";

  if (bg) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, newW, newH);
  }
  ctx.translate(newW / 2, newH / 2);
  ctx.rotate(rad);
  ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
  ctx.drawImage(img, -w / 2, -h / 2);

  const mime = file.type === "image/png" || file.type === "image/webp" ? file.type : "image/jpeg";
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), mime, 0.95),
  );
}

function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [angle, setAngle] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [bg, setBg] = useState("#ffffff");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ url: string; name: string; size: number } | null>(null);
  const [livePreview, setLivePreview] = useState<string | null>(null);

  function onFile(f: File | null) {
    setResult(null);
    setAngle(0);
    setFlipX(false);
    setFlipY(false);
    const err = validateImageFile(f);
    setError(err);
    setFile(err || !f ? null : f);
  }

  const isJpeg = file?.type === "image/jpeg" || file?.type === "image/jpg";
  const usesBg = isJpeg || (angle % 90 !== 0);

  // Live small-preview rendering (debounced)
  useEffect(() => {
    if (!file) {
      setLivePreview(null);
      return;
    }
    let cancelled = false;
    const id = setTimeout(async () => {
      try {
        const blob = await renderRotated(file, angle, flipX, flipY, usesBg ? bg : null);
        if (!cancelled) setLivePreview(URL.createObjectURL(blob));
      } catch {
        /* ignore */
      }
    }, 120);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [file, angle, flipX, flipY, bg, usesBg]);

  const rotateBy = (delta: number) => setAngle((a) => ((a + delta) % 360 + 360) % 360);

  async function run() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const blob = await renderRotated(file, angle, flipX, flipY, usesBg ? bg : null);
      setResult({
        url: URL.createObjectURL(blob),
        name: `rotated-${Math.round(angle)}-${file.name}`,
        size: blob.size,
      });
    } catch {
      setError("Sorry, we couldn't process that image. Please try a different one.");
    } finally {
      setBusy(false);
    }
  }

  const canRun = !!file && !error && !busy;

  const angleLabel = useMemo(() => {
    const a = ((angle % 360) + 360) % 360;
    return a > 180 ? `${a - 360}°` : `${a}°`;
  }, [angle]);

  return (
    <ToolLayout slug="rotate-flip">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 md:col-span-7 space-y-6">
          <FileDrop file={file} onFile={onFile} />

          {file && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <ActionBtn onClick={() => rotateBy(-90)} icon={<RotateCcw className="size-4" />}>
                  Rotate left
                </ActionBtn>
                <ActionBtn onClick={() => rotateBy(90)} icon={<RotateCw className="size-4" />}>
                  Rotate right
                </ActionBtn>
                <ActionBtn
                  onClick={() => setFlipX((v) => !v)}
                  active={flipX}
                  icon={<FlipHorizontal2 className="size-4" />}
                >
                  Flip H
                </ActionBtn>
                <ActionBtn
                  onClick={() => setFlipY((v) => !v)}
                  active={flipY}
                  icon={<FlipVertical2 className="size-4" />}
                >
                  Flip V
                </ActionBtn>
              </div>

              <Field label={`Straighten — ${angleLabel}`}>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  value={angle}
                  onChange={(e) => setAngle(Number(e.target.value))}
                  className="w-full accent-[color:var(--color-primary)]"
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[-90, -45, 0, 45, 90].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setAngle(d)}
                      className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary num"
                    >
                      {d}°
                    </button>
                  ))}
                </div>
              </Field>

              {usesBg && (
                <Field label="Fill color (for the corners exposed by rotation)">
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={bg}
                      onChange={(e) => setBg(e.target.value)}
                      className="size-11 rounded-lg border border-border bg-card cursor-pointer"
                    />
                    <code className="rounded-lg border border-border bg-card px-3 py-2 text-sm num">
                      {bg}
                    </code>
                  </div>
                </Field>
              )}
            </>
          )}

          {error && <ErrorBox>{error}</ErrorBox>}
          <RunButton onClick={run} disabled={!canRun} busy={busy} label="Save image" />

          <HowItWorks>
            Rotation and flipping happen on your device using the browser's image engine — your
            photo is never sent to a server.
          </HowItWorks>
        </div>

        <aside className="col-span-12 md:col-span-5">
          {result ? (
            <ResultPanel
              title="Your image is ready"
              delta={{ label: angleLabel, tone: "success" }}
              lines={[
                ["Rotation", angleLabel],
                ["Mirror", `${flipX ? "Horizontal" : "—"}${flipY ? (flipX ? " + Vertical" : "Vertical") : ""}` || "None"],
                ["File size", formatBytes(result.size)],
              ]}
              previewUrl={result.url}
              href={result.url}
              download={result.name}
              onReset={() => {
                setFile(null);
                setResult(null);
              }}
            />
          ) : livePreview && file ? (
            <CompareCard livePreview={livePreview} file={file} />

          ) : (
            <EmptyState text="Drop a photo on the left. The rotated preview will appear here as you change settings." />
          )}
        </aside>
      </div>
    </ToolLayout>
  );
}

function ActionBtn({
  onClick,
  active,
  icon,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-semibold min-h-12 transition-colors",
        active
          ? "border-primary bg-primary-soft text-primary"
          : "border-border bg-card hover:border-primary/60",
      ].join(" ")}
    >
      {icon}
      {children}
    </button>
  );
}

function CompareCard({ livePreview, file }: { livePreview: string; file: File }) {
  const [origUrl, setOrigUrl] = useState<string | null>(null);
  const [showOrig, setShowOrig] = useState(false);
  useEffect(() => {
    const u = URL.createObjectURL(file);
    setOrigUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return (
    <div className="soft-card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="eyebrow">Live preview</div>
        <button
          type="button"
          onPointerDown={() => setShowOrig(true)}
          onPointerUp={() => setShowOrig(false)}
          onPointerLeave={() => setShowOrig(false)}
          className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold hover:border-primary select-none"
        >
          {showOrig ? "Showing original" : "Hold to compare"}
        </button>
      </div>
      <div className="checker-bg rounded-xl overflow-hidden border border-border grid place-items-center min-h-48">
        <img
          src={showOrig && origUrl ? origUrl : livePreview}
          alt="Live preview"
          className="max-h-72 w-auto object-contain"
        />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Tap "Save image" when it looks right.
      </p>
    </div>
  );
}
