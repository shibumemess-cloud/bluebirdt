import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download } from "lucide-react";
import { ToolLayout, validateImageFile } from "../components/ToolLayout";
import { FileDrop, Field, ErrorBox, RunButton, EmptyState, HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/ig-photo-resizer")({
  head: () => ({
    meta: [
      { title: "Instagram Photo Resizer — Post, Story, Reel Sizes Free" },
      { name: "description", content: "Resize any photo to Instagram post (1:1), portrait (4:5), story (9:16) or reel cover sizes. Smart-color padding, no awkward crop. In your browser." },
      { property: "og:title", content: "Instagram Photo Resizer — Bluebird" },
      { property: "og:description", content: "Fit any photo to Instagram in one tap." },
      { property: "og:url", content: "/ig-photo-resizer" },
    ],
    links: [{ rel: "canonical", href: "/ig-photo-resizer" }],
  }),
  component: Page,
});

type Preset = { id: string; label: string; w: number; h: number };
const PRESETS: Preset[] = [
  { id: "post", label: "Square post (1:1)", w: 1080, h: 1080 },
  { id: "portrait", label: "Portrait post (4:5)", w: 1080, h: 1350 },
  { id: "story", label: "Story / Reel (9:16)", w: 1080, h: 1920 },
  { id: "landscape", label: "Landscape (1.91:1)", w: 1080, h: 566 },
  { id: "profile", label: "Profile picture (1:1)", w: 320, h: 320 },
];

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
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [mode, setMode] = useState<"fit" | "fill">("fit");
  const [bg, setBg] = useState<"smart" | "white" | "black" | "custom">("smart");
  const [customBg, setCustomBg] = useState("#ffffff");
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
      cv.width = preset.w; cv.height = preset.h;
      const ctx = cv.getContext("2d")!;
      ctx.imageSmoothingQuality = "high";
      let fill = "#ffffff";
      if (bg === "smart") fill = sampleEdgeColor(img);
      else if (bg === "white") fill = "#ffffff";
      else if (bg === "black") fill = "#000000";
      else fill = customBg;
      ctx.fillStyle = fill;
      ctx.fillRect(0, 0, preset.w, preset.h);

      const srcA = img.naturalWidth / img.naturalHeight;
      const dstA = preset.w / preset.h;
      if (mode === "fit") {
        // Letterbox / pillarbox.
        let w = preset.w, h = preset.h;
        if (srcA > dstA) h = preset.w / srcA; else w = preset.h * srcA;
        ctx.drawImage(img, (preset.w - w) / 2, (preset.h - h) / 2, w, h);
      } else {
        // Cover / center-crop.
        let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
        if (srcA > dstA) { sw = sh * dstA; sx = (img.naturalWidth - sw) / 2; }
        else { sh = sw / dstA; sy = (img.naturalHeight - sh) / 2; }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, preset.w, preset.h);
      }
      const blob = await new Promise<Blob>((r, j) => cv.toBlob((b) => (b ? r(b) : j(new Error())), "image/jpeg", 0.93));
      setOut(URL.createObjectURL(blob));
    } catch {
      setError("Sorry, we couldn't resize that photo.");
    } finally { setBusy(false); }
  }

  const canRun = !!img && !busy;

  return (
    <ToolLayout slug="ig-photo-resizer">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 md:col-span-7 space-y-6">
          <FileDrop file={file} onFile={onFile} label="Pick a photo to resize" />

          <Field label="Instagram size" hint="Pick the exact format your post will be.">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESETS.map((p) => (
                <button key={p.id} type="button" onClick={() => setPreset(p)}
                  className={`min-h-14 rounded-xl border text-sm font-medium px-3 ${preset.id === p.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary/40"}`}>
                  <div>{p.label}</div>
                  <div className="text-[11px] font-normal text-muted-foreground num">{p.w} × {p.h}</div>
                </button>
              ))}
            </div>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="How to fit" hint="Fit keeps the whole photo. Fill fully covers the frame.">
              <div className="grid grid-cols-2 gap-2">
                {(["fit", "fill"] as const).map((m) => (
                  <button key={m} type="button" onClick={() => setMode(m)}
                    className={`min-h-12 rounded-xl border text-sm font-medium ${mode === m ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary/40"}`}>
                    {m === "fit" ? "Fit (pad)" : "Fill (crop)"}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Background color" hint="Only used when fitting with padding.">
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

          {error && <ErrorBox>{error}</ErrorBox>}
          <RunButton onClick={run} disabled={!canRun} busy={busy} label="Resize photo" />

          <HowItWorks>
            Your photo is drawn onto a Canvas at the exact Instagram size. In "fit" mode we sample the average edge
            color so padding blends in; in "fill" mode we center-crop to fully cover the frame.
          </HowItWorks>
        </div>

        <aside className="col-span-12 md:col-span-5">
          {out ? (
            <div className="soft-card p-5 sm:p-6">
              <span className="eyebrow">Ready</span>
              <div className="font-display text-2xl mt-1">Your Instagram photo</div>
              <div className="mt-4 checker-bg rounded-xl border border-border overflow-hidden grid place-items-center" style={{ aspectRatio: `${preset.w} / ${preset.h}` }}>
                <img src={out} alt="Resized" className="w-full h-full object-contain" />
              </div>
              <a href={out} download={`instagram-${preset.id}-${preset.w}x${preset.h}.jpg`}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3.5 font-semibold min-h-12 hover:shadow-lift hover:-translate-y-0.5 w-full">
                <Download className="size-4" /> Download
              </a>
            </div>
          ) : (
            <EmptyState text="Pick a photo and an Instagram size — we'll fit or fill the frame and produce a ready-to-post JPG." />
          )}
        </aside>
      </div>
    </ToolLayout>
  );
}
