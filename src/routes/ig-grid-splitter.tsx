import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import JSZip from "jszip";
import { Download } from "lucide-react";
import { ToolLayout, validateImageFile } from "../components/ToolLayout";
import { FileDrop, Field, ErrorBox, RunButton, EmptyState, HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/ig-grid-splitter")({
  head: () => ({
    meta: [
      { title: "Instagram Grid Splitter — Free 3×3, 3×2, 3×1 Online" },
      { name: "description", content: "Split any photo into a 3×3, 3×2 or 3×1 Instagram grid. Numbered, in posting order, ZIP download. 100% in your browser — no upload." },
      { property: "og:title", content: "Instagram Grid Splitter — Bluebird" },
      { property: "og:description", content: "Make a perfect Instagram feed grid in seconds." },
      { property: "og:url", content: "/ig-grid-splitter" },
    ],
    links: [{ rel: "canonical", href: "/ig-grid-splitter" }],
  }),
  component: Page,
});

type Layout = { cols: number; rows: number; label: string };
const LAYOUTS: Layout[] = [
  { cols: 3, rows: 3, label: "3 × 3 (9 tiles)" },
  { cols: 3, rows: 2, label: "3 × 2 (6 tiles)" },
  { cols: 3, rows: 1, label: "3 × 1 (3 tiles)" },
  { cols: 2, rows: 2, label: "2 × 2 (4 tiles)" },
];

async function loadImage(file: File): Promise<HTMLImageElement> {
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await img.decode();
  return img;
}
function canvasToBlob(c: HTMLCanvasElement, mime = "image/jpeg", q = 0.92) {
  return new Promise<Blob>((r, j) => c.toBlob((b) => (b ? r(b) : j(new Error("encode"))), mime, q));
}

function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [layout, setLayout] = useState<Layout>(LAYOUTS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tiles, setTiles] = useState<{ name: string; url: string; idx: number }[]>([]);
  const [zipUrl, setZipUrl] = useState<string | null>(null);

  function onFile(f: File | null) {
    setTiles([]); setZipUrl(null); setImg(null);
    const err = validateImageFile(f);
    setError(err);
    if (err || !f) { setFile(null); return; }
    setFile(f);
    loadImage(f).then(setImg);
  }

  async function run() {
    if (!file || !img) return;
    setBusy(true); setError(null); setTiles([]); setZipUrl(null);
    try {
      // Center-crop the photo to the grid's aspect ratio, then slice into tiles.
      const aspect = layout.cols / layout.rows;
      const srcAspect = img.naturalWidth / img.naturalHeight;
      let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
      if (srcAspect > aspect) {
        sw = sh * aspect; sx = (img.naturalWidth - sw) / 2;
      } else {
        sh = sw / aspect; sy = (img.naturalHeight - sh) / 2;
      }
      const tileW = Math.floor(sw / layout.cols);
      const tileH = Math.floor(sh / layout.rows);
      const zip = new JSZip();
      const items: { name: string; url: string; idx: number }[] = [];
      // Posting order: bottom-right to top-left so feed reveals top-to-bottom.
      // But simpler: number by row-major, left-to-right, top-to-bottom — what people expect.
      let n = 1;
      for (let r = 0; r < layout.rows; r++) {
        for (let c = 0; c < layout.cols; c++) {
          const cv = document.createElement("canvas");
          cv.width = tileW; cv.height = tileH;
          const ctx = cv.getContext("2d")!;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, sx + c * tileW, sy + r * tileH, tileW, tileH, 0, 0, tileW, tileH);
          const blob = await canvasToBlob(cv, "image/jpeg", 0.92);
          const name = `tile-${String(n).padStart(2, "0")}-r${r + 1}c${c + 1}.jpg`;
          zip.file(name, blob);
          items.push({ name, url: URL.createObjectURL(blob), idx: n });
          n++;
        }
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      setTiles(items);
      setZipUrl(URL.createObjectURL(zipBlob));
    } catch {
      setError("Sorry, we couldn't slice that image. Try a different photo.");
    } finally { setBusy(false); }
  }

  const canRun = !!img && !busy;

  return (
    <ToolLayout slug="ig-grid-splitter">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 md:col-span-7 space-y-6">
          <FileDrop file={file} onFile={onFile} label="Pick a photo to split" hint="A landscape or square photo works best — up to 20 MB" />

          <Field label="Grid layout" hint="Choose how many tiles your feed needs.">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {LAYOUTS.map((l) => (
                <button key={l.label} type="button" onClick={() => setLayout(l)}
                  className={`min-h-12 rounded-xl border text-sm font-medium px-3 ${layout === l ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary/40"}`}>
                  {l.label}
                </button>
              ))}
            </div>
          </Field>

          {img && (
            <div>
              <div className="text-sm font-semibold mb-2">Preview</div>
              <div className="checker-bg rounded-xl border border-border p-2 grid gap-1"
                style={{ gridTemplateColumns: `repeat(${layout.cols}, 1fr)` }}>
                {Array.from({ length: layout.cols * layout.rows }).map((_, i) => (
                  <div key={i} className="aspect-square overflow-hidden rounded-md border border-border/60 relative">
                    <img src={img.src} alt=""
                      className="absolute"
                      style={{
                        width: `${layout.cols * 100}%`,
                        height: `${layout.rows * 100}%`,
                        left: `-${(i % layout.cols) * 100}%`,
                        top: `-${Math.floor(i / layout.cols) * 100}%`,
                        objectFit: "cover",
                      }}
                    />
                    <span className="absolute bottom-1 right-1 text-[10px] font-bold text-white bg-black/60 rounded px-1.5 py-0.5 num">{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <ErrorBox>{error}</ErrorBox>}
          <RunButton onClick={run} disabled={!canRun} busy={busy} label="Split into tiles" />

          <HowItWorks>
            Your photo is center-cropped to match the grid, then sliced on a hidden canvas in your browser.
            Tiles are numbered left-to-right, top-to-bottom — the order they appear on your Instagram profile.
          </HowItWorks>
        </div>

        <aside className="col-span-12 md:col-span-5">
          {tiles.length > 0 && zipUrl ? (
            <div className="soft-card p-5 sm:p-6">
              <span className="eyebrow">Ready</span>
              <div className="font-display text-2xl mt-1">Your tiles</div>
              <p className="text-sm text-muted-foreground mt-2">{tiles.length} JPGs in posting order.</p>
              <a href={zipUrl} download="instagram-grid.zip"
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3.5 font-semibold min-h-12 hover:shadow-lift hover:-translate-y-0.5 w-full">
                <Download className="size-4" /> Download all (ZIP)
              </a>
              <ul className="mt-5 grid grid-cols-3 gap-2">
                {tiles.map((t) => (
                  <li key={t.name} className="relative">
                    <a href={t.url} download={t.name} className="block aspect-square overflow-hidden rounded-lg border border-border">
                      <img src={t.url} alt={t.name} className="w-full h-full object-cover" />
                    </a>
                    <span className="absolute top-1 left-1 text-[10px] font-bold text-white bg-black/60 rounded px-1.5 py-0.5 num">{t.idx}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <EmptyState text="Pick a photo and a grid layout — we'll preview the split, then bundle every tile into a ZIP for you." />
          )}
        </aside>
      </div>
    </ToolLayout>
  );
}
