import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { ToolLayout, validateImageFile } from "../components/ToolLayout";
import { FileDrop, Field, ErrorBox, HowItWorks, EmptyState } from "../components/ToolControls";

export const Route = createFileRoute("/ig-reels-cover")({
  head: () => ({
    meta: [
      { title: "Instagram Reels Cover Maker — Safe Zones & Text" },
      { name: "description", content: "Design a Reels cover that doesn't get cut by Instagram's profile-grid crop. Live safe-zone guides, custom title text, 1080×1920 export." },
      { property: "og:title", content: "Reels Cover Maker — Bluebird" },
      { property: "og:description", content: "Reels covers that look perfect on the grid and in feed." },
      { property: "og:url", content: "/ig-reels-cover" },
    ],
    links: [{ rel: "canonical", href: "/ig-reels-cover" }],
  }),
  component: Page,
});

const W = 1080, H = 1920;
// Instagram crops Reels covers to 1:1 on the profile grid, centered. The safe
// zone for the title is a 1080×1080 square in the middle, minus the bottom
// strip where the username overlay shows.
const GRID_TOP = (H - W) / 2;       // 420
const BOTTOM_SAFE_PAD = 220;        // username + caption overlay

async function loadImage(file: File) {
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await img.decode();
  return img;
}

function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("MY REEL TITLE");
  const [color, setColor] = useState("#ffffff");
  const [size, setSize] = useState(120);
  const [pos, setPos] = useState<"top" | "middle" | "bottom">("middle");
  const [shadow, setShadow] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  const [out, setOut] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function onFile(f: File | null) {
    setOut(null); setImg(null);
    const err = validateImageFile(f);
    setError(err);
    if (err || !f) { setFile(null); return; }
    setFile(f);
    loadImage(f).then(setImg);
  }

  function draw(includeGuides: boolean) {
    const cv = canvasRef.current!;
    cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d")!;
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
    if (img) {
      // Cover the canvas.
      const srcA = img.naturalWidth / img.naturalHeight;
      const dstA = W / H;
      let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
      if (srcA > dstA) { sw = sh * dstA; sx = (img.naturalWidth - sw) / 2; }
      else { sh = sw / dstA; sy = (img.naturalHeight - sh) / 2; }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
    }

    // Title text.
    if (title.trim()) {
      ctx.fillStyle = color;
      ctx.font = `800 ${size}px Outfit, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (shadow) {
        ctx.shadowColor = "rgba(0,0,0,0.55)";
        ctx.shadowBlur = 24; ctx.shadowOffsetY = 4;
      } else { ctx.shadowColor = "transparent"; }
      let y = H / 2;
      if (pos === "top") y = GRID_TOP + W * 0.18;
      if (pos === "bottom") y = GRID_TOP + W - BOTTOM_SAFE_PAD - size * 0.5;
      // Word wrap to ~14 chars per line.
      const words = title.split(/\s+/);
      const lines: string[] = []; let cur = "";
      for (const w of words) {
        const test = cur ? `${cur} ${w}` : w;
        if (test.length > 14 && cur) { lines.push(cur); cur = w; } else cur = test;
      }
      if (cur) lines.push(cur);
      const lh = size * 1.15;
      const startY = y - (lines.length - 1) * lh / 2;
      lines.forEach((l, i) => ctx.fillText(l, W / 2, startY + i * lh));
      ctx.shadowColor = "transparent";
    }

    if (includeGuides) {
      // Grid safe zone (1080×1080 centered).
      ctx.strokeStyle = "rgba(59,130,246,0.9)";
      ctx.setLineDash([18, 12]);
      ctx.lineWidth = 4;
      ctx.strokeRect(0, GRID_TOP, W, W);
      // Bottom username/caption overlay.
      ctx.strokeStyle = "rgba(239,68,68,0.9)";
      ctx.strokeRect(0, GRID_TOP + W - BOTTOM_SAFE_PAD, W, BOTTOM_SAFE_PAD);
      ctx.setLineDash([]);
    }
  }

  useEffect(() => {
    draw(showGuides);
    // For export we re-render without guides.
    if (img) {
      const ex = document.createElement("canvas");
      ex.width = W; ex.height = H;
      const ec = ex.getContext("2d")!;
      // Reuse same drawing by temporarily swapping ref… simpler: copy current then redraw clean.
      draw(false);
      ec.drawImage(canvasRef.current!, 0, 0);
      ex.toBlob((b) => { if (b) setOut(URL.createObjectURL(b)); }, "image/jpeg", 0.94);
      // Restore guides for live view.
      draw(showGuides);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [img, title, color, size, pos, shadow, showGuides]);

  return (
    <ToolLayout slug="ig-reels-cover">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 md:col-span-7 space-y-6">
          <FileDrop file={file} onFile={onFile} label="Pick a still or background for the cover" />
          {error && <ErrorBox>{error}</ErrorBox>}

          <Field label="Title text">
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full min-h-12 rounded-xl border border-border bg-card px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Text color">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
                className="w-full h-12 rounded-xl border border-border bg-card cursor-pointer" />
            </Field>
            <Field label={`Text size — ${size}px`}>
              <input type="range" min={60} max={220} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full" />
            </Field>
            <Field label="Position">
              <div className="grid grid-cols-3 gap-2">
                {(["top","middle","bottom"] as const).map((p) => (
                  <button key={p} type="button" onClick={() => setPos(p)}
                    className={`min-h-11 rounded-xl border text-sm font-medium capitalize ${pos === p ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary/40"}`}>{p}</button>
                ))}
              </div>
            </Field>
            <Field label="Options">
              <div className="flex flex-col gap-2">
                <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={shadow} onChange={(e) => setShadow(e.target.checked)} /> Drop shadow on text</label>
                <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={showGuides} onChange={(e) => setShowGuides(e.target.checked)} /> Show safe-zone guides</label>
              </div>
            </Field>
          </div>

          <HowItWorks>
            The blue dashed box shows what appears on your profile grid (Instagram center-crops Reels to a square).
            The red box at the bottom is where the username and caption overlay sit in the feed. Keep your title
            inside the blue box and above the red box and it will look perfect everywhere.
          </HowItWorks>
        </div>

        <aside className="col-span-12 md:col-span-5">
          <div className="soft-card p-5 sm:p-6 sticky top-4">
            <span className="eyebrow">Live preview</span>
            {img ? (
              <div className="mt-3 grid place-items-center">
                <div className="w-full max-w-[280px] aspect-[9/16] rounded-2xl overflow-hidden border border-border shadow-soft bg-black">
                  <canvas ref={canvasRef} className="w-full h-full block" />
                </div>
              </div>
            ) : (
              <div className="mt-3">
                <EmptyState text="Pick a background image to start designing your Reels cover." />
                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}
            {out && (
              <a href={out} download="reels-cover-1080x1920.jpg"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3.5 font-semibold min-h-12 hover:shadow-lift hover:-translate-y-0.5">
                <Download className="size-4" /> Download cover (1080×1920)
              </a>
            )}
          </div>
        </aside>
      </div>
    </ToolLayout>
  );
}
