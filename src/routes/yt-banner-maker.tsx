import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download } from "lucide-react";
import { ToolLayout, validateImageFile } from "../components/ToolLayout";
import { FileDrop, Field, ErrorBox, RunButton, EmptyState, HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/yt-banner-maker")({
  head: () => ({
    meta: [
      { title: "YouTube Banner Maker — 2560×1440 with Safe Zone Guide" },
      { name: "description", content: "Resize any photo to a YouTube channel banner (2560×1440) and see the TV-safe zone live so your text and logo are never cropped. In your browser." },
      { property: "og:title", content: "YouTube Banner Maker — Bluebird" },
      { property: "og:description", content: "Build a perfect 2560×1440 YouTube channel banner — with a live safe zone." },
      { property: "og:url", content: "/yt-banner-maker" },
    ],
    links: [{ rel: "canonical", href: "/yt-banner-maker" }],
  }),
  component: Page,
});

// YouTube channel art recommended canvas + the TV-safe central area
// where text and logos must sit so they're not cropped on TV / mobile.
const W = 2560, H = 1440;
const SAFE_W = 1546, SAFE_H = 423;

async function loadImage(file: File): Promise<HTMLImageElement> {
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await img.decode();
  return img;
}

function sampleEdgeColor(img: HTMLImageElement): string {
  const c = document.createElement("canvas");
  c.width = 16; c.height = 16;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, 0, 0, 16, 16);
  const d = ctx.getImageData(0, 0, 16, 16).data;
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i+1]; b += d[i+2]; n++; }
  return `rgb(${Math.round(r/n)}, ${Math.round(g/n)}, ${Math.round(b/n)})`;
}

function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [mode, setMode] = useState<"fill" | "fit">("fill");
  const [bg, setBg] = useState<"smart" | "white" | "black" | "custom">("smart");
  const [customBg, setCustomBg] = useState("#0b1220");
  const [showSafe, setShowSafe] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [out, setOut] = useState<string | null>(null);

  function onFile(f: File | null) {
    setOut(null); setImg(null);
    const err = validateImageFile(f);
    setError(err);
    if (err || !f) { setFile(null); return; }
    setFile(f);
    loadImage(f).then(setImg);
  }

  async function run() {
    if (!img) return;
    setBusy(true); setError(null);
    try {
      const cv = document.createElement("canvas");
      cv.width = W; cv.height = H;
      const ctx = cv.getContext("2d")!;
      ctx.imageSmoothingQuality = "high";

      let fill = "#000000";
      if (bg === "smart") fill = sampleEdgeColor(img);
      else if (bg === "white") fill = "#ffffff";
      else if (bg === "black") fill = "#000000";
      else fill = customBg;
      ctx.fillStyle = fill;
      ctx.fillRect(0, 0, W, H);

      const srcA = img.naturalWidth / img.naturalHeight;
      const dstA = W / H;
      if (mode === "fit") {
        let w = W, h = H;
        if (srcA > dstA) h = W / srcA; else w = H * srcA;
        ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
      } else {
        let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
        if (srcA > dstA) { sw = sh * dstA; sx = (img.naturalWidth - sw) / 2; }
        else { sh = sw / dstA; sy = (img.naturalHeight - sh) / 2; }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
      }
      const blob = await new Promise<Blob>((r, j) => cv.toBlob((b) => (b ? r(b) : j(new Error())), "image/png"));
      setOut(URL.createObjectURL(blob));
    } catch {
      setError("Sorry, we couldn't build that banner.");
    } finally { setBusy(false); }
  }

  return (
    <ToolLayout slug="yt-banner-maker">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 md:col-span-7 space-y-6">
          <FileDrop file={file} onFile={onFile} label="Pick a photo for your banner" />

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="How to fit" hint="Fill covers the whole banner. Fit keeps the entire photo with padding.">
              <div className="grid grid-cols-2 gap-2">
                {(["fill", "fit"] as const).map((m) => (
                  <button key={m} type="button" onClick={() => setMode(m)}
                    className={`min-h-12 rounded-xl border text-sm font-medium ${mode === m ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary/40"}`}>
                    {m === "fill" ? "Fill (crop)" : "Fit (pad)"}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Background" hint="Used when fitting with padding.">
              <div className="flex gap-2 items-center flex-wrap">
                {(["smart", "white", "black", "custom"] as const).map((b) => (
                  <button key={b} type="button" onClick={() => setBg(b)}
                    className={`min-h-11 px-3 rounded-xl border text-sm font-medium capitalize ${bg === b ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary/40"}`}>
                    {b}
                  </button>
                ))}
                {bg === "custom" && (
                  <input type="color" value={customBg} onChange={(e) => setCustomBg(e.target.value)}
                    className="size-11 rounded-lg border border-border bg-card cursor-pointer" />
                )}
              </div>
            </Field>
          </div>

          <Field label="Preview overlay">
            <label className="inline-flex items-center gap-3 min-h-11 px-4 rounded-xl border border-border bg-card cursor-pointer">
              <input type="checkbox" checked={showSafe} onChange={(e) => setShowSafe(e.target.checked)} className="size-4" />
              <span className="text-sm">Show TV-safe zone (1546 × 423)</span>
            </label>
          </Field>

          {error && <ErrorBox>{error}</ErrorBox>}
          <RunButton onClick={run} disabled={!img || busy} busy={busy} label="Build my banner" />

          <HowItWorks>
            YouTube uses the same 2560×1440 image across TV, desktop and mobile — but only the central 1546×423
            area is guaranteed visible everywhere. Keep your text and logo inside the safe box and your banner will
            look great on every device.
          </HowItWorks>
        </div>

        <aside className="col-span-12 md:col-span-5">
          {out ? (
            <div className="soft-card p-5 sm:p-6">
              <span className="eyebrow">Ready · 2560 × 1440</span>
              <div className="font-display text-2xl mt-1">Your YouTube banner</div>
              <div className="mt-4 relative checker-bg rounded-xl border border-border overflow-hidden" style={{ aspectRatio: `${W} / ${H}` }}>
                <img src={out} alt="YouTube banner" className="w-full h-full object-contain" />
                {showSafe && (
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-primary/80 rounded-md pointer-events-none"
                    style={{ width: `${(SAFE_W / W) * 100}%`, height: `${(SAFE_H / H) * 100}%` }}>
                    <span className="absolute -top-2.5 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">SAFE ZONE</span>
                  </div>
                )}
              </div>
              <a href={out} download={`youtube-banner-2560x1440.png`}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3.5 font-semibold min-h-12 hover:shadow-lift hover:-translate-y-0.5 w-full">
                <Download className="size-4" /> Download PNG
              </a>
            </div>
          ) : (
            <EmptyState text="Pick a photo and we'll size it to 2560×1440 with the TV-safe zone marked, so your title stays visible on every screen." />
          )}
        </aside>
      </div>
    </ToolLayout>
  );
}
