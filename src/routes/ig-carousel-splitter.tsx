import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import JSZip from "jszip";
import { Download } from "lucide-react";
import { ToolLayout, validateImageFile } from "../components/ToolLayout";
import { FileDrop, Field, ErrorBox, RunButton, EmptyState, HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/ig-carousel-splitter")({
  head: () => ({
    meta: [
      { title: "Instagram Carousel Maker — Split Wide Photo Free Online" },
      { name: "description", content: "Turn one wide photo into 2–10 seamless Instagram carousel slides (1:1 or 4:5). ZIP download in posting order — 100% in your browser." },
      { property: "og:title", content: "Instagram Carousel Maker — Bluebird" },
      { property: "og:description", content: "Make a swipeable Instagram carousel from any photo." },
      { property: "og:url", content: "/ig-carousel-splitter" },
    ],
    links: [{ rel: "canonical", href: "/ig-carousel-splitter" }],
  }),
  component: Page,
});

async function loadImage(file: File): Promise<HTMLImageElement> {
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await img.decode();
  return img;
}
function canvasToBlob(c: HTMLCanvasElement) {
  return new Promise<Blob>((r, j) => c.toBlob((b) => (b ? r(b) : j(new Error("encode"))), "image/jpeg", 0.92));
}

function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [slides, setSlides] = useState(3);
  const [ratio, setRatio] = useState<"1:1" | "4:5">("1:1");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [out, setOut] = useState<{ name: string; url: string }[]>([]);
  const [zipUrl, setZipUrl] = useState<string | null>(null);

  function onFile(f: File | null) {
    setOut([]); setZipUrl(null); setImg(null);
    const err = validateImageFile(f);
    setError(err);
    if (err || !f) { setFile(null); return; }
    setFile(f);
    loadImage(f).then(setImg);
  }

  async function run() {
    if (!img) return;
    setBusy(true); setError(null); setOut([]); setZipUrl(null);
    try {
      const slideAspect = ratio === "1:1" ? 1 : 4 / 5;
      // Target slide height matches the source's available height, capped at 1350 (IG cap).
      const slideH = Math.min(img.naturalHeight, 1350);
      const slideW = Math.round(slideH * slideAspect);
      // Total source width we will sample: covers `slides` slides at this output aspect.
      const sampleH = img.naturalHeight;
      const sampleW = Math.min(img.naturalWidth, Math.round(sampleH * slideAspect * slides));
      const sx = (img.naturalWidth - sampleW) / 2;
      const stepW = sampleW / slides;
      const zip = new JSZip();
      const items: { name: string; url: string }[] = [];
      for (let i = 0; i < slides; i++) {
        const cv = document.createElement("canvas");
        cv.width = slideW; cv.height = slideH;
        const ctx = cv.getContext("2d")!;
        ctx.imageSmoothingQuality = "high";
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, slideW, slideH);
        ctx.drawImage(img, sx + i * stepW, 0, stepW, sampleH, 0, 0, slideW, slideH);
        const blob = await canvasToBlob(cv);
        const name = `slide-${String(i + 1).padStart(2, "0")}.jpg`;
        zip.file(name, blob);
        items.push({ name, url: URL.createObjectURL(blob) });
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      setOut(items);
      setZipUrl(URL.createObjectURL(zipBlob));
    } catch {
      setError("Sorry, we couldn't split that photo. Try a wider image.");
    } finally { setBusy(false); }
  }

  const canRun = !!img && !busy;

  return (
    <ToolLayout slug="ig-carousel-splitter">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 md:col-span-7 space-y-6">
          <FileDrop file={file} onFile={onFile} label="Pick a wide photo" hint="Panoramas and group shots work great — up to 20 MB" />

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={`Number of slides · ${slides}`} hint="Instagram allows up to 10 slides per carousel.">
              <input type="range" min={2} max={10} step={1} value={slides} onChange={(e) => setSlides(Number(e.target.value))} className="w-full" />
            </Field>
            <Field label="Slide shape" hint="Portrait (4:5) takes more screen on Instagram.">
              <div className="grid grid-cols-2 gap-2">
                {(["1:1", "4:5"] as const).map((r) => (
                  <button key={r} type="button" onClick={() => setRatio(r)}
                    className={`min-h-12 rounded-xl border text-sm font-medium ${ratio === r ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary/40"}`}>
                    {r === "1:1" ? "Square 1:1" : "Portrait 4:5"}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          {error && <ErrorBox>{error}</ErrorBox>}
          <RunButton onClick={run} disabled={!canRun} busy={busy} label="Split into slides" />

          <HowItWorks>
            We sample your photo's full height and slice it horizontally into evenly-sized slides — when posted in
            order they line up as one seamless carousel on the viewer's feed.
          </HowItWorks>
        </div>

        <aside className="col-span-12 md:col-span-5">
          {out.length > 0 && zipUrl ? (
            <div className="soft-card p-5 sm:p-6">
              <span className="eyebrow">Ready</span>
              <div className="font-display text-2xl mt-1">Your carousel</div>
              <p className="text-sm text-muted-foreground mt-2">{out.length} slides at {ratio}.</p>
              <a href={zipUrl} download="instagram-carousel.zip"
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3.5 font-semibold min-h-12 hover:shadow-lift hover:-translate-y-0.5 w-full">
                <Download className="size-4" /> Download all (ZIP)
              </a>
              <ul className="mt-5 grid grid-cols-3 gap-2">
                {out.map((s, i) => (
                  <li key={s.name} className="relative">
                    <a href={s.url} download={s.name} className="block overflow-hidden rounded-lg border border-border" style={{ aspectRatio: ratio === "1:1" ? "1/1" : "4/5" }}>
                      <img src={s.url} alt={s.name} className="w-full h-full object-cover" />
                    </a>
                    <span className="absolute top-1 left-1 text-[10px] font-bold text-white bg-black/60 rounded px-1.5 py-0.5 num">{i + 1}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <EmptyState text="Upload a wide photo, pick how many slides, then we'll produce a seamless Instagram carousel." />
          )}
        </aside>
      </div>
    </ToolLayout>
  );
}
