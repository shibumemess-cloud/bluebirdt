import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { FileImage as FileImg, Download } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/svg-to-png")({
  head: () => ({
    meta: [
      { title: "SVG to PNG Converter — Any Size, Transparent" },
      { name: "description", content: "Convert any SVG file or markup to a sharp PNG at any size. Keep transparency, scale up to 4K. Free, in your browser." },
      { property: "og:title", content: "SVG to PNG Converter — Bluebird" },
      { property: "og:description", content: "Convert SVG to crisp, transparent PNG at any resolution." },
      { property: "og:url", content: "/svg-to-png" },
    ],
    links: [{ rel: "canonical", href: "/svg-to-png" }],
  }),
  component: Page,
});

const DEFAULT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle cx="100" cy="100" r="80" fill="#3b82f6"/><text x="100" y="115" font-family="sans-serif" font-size="48" fill="white" text-anchor="middle">SVG</text></svg>`;

function Page() {
  const [svg, setSvg] = useState(DEFAULT_SVG);
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [transparent, setTransparent] = useState(true);
  const [bg, setBg] = useState("#ffffff");
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (pngUrl) URL.revokeObjectURL(pngUrl); }, [pngUrl]);

  function onFile(f: File | null) {
    if (!f) return;
    if (!/svg/.test(f.type) && !f.name.toLowerCase().endsWith(".svg")) {
      setError("Please choose an .svg file."); return;
    }
    setError(null);
    f.text().then(setSvg).catch(() => setError("Could not read that file."));
  }

  async function convert() {
    setError(null);
    try {
      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.decoding = "async";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Invalid SVG"));
        img.src = url;
      });
      const w = Math.max(1, Math.min(8192, Math.round(width)));
      const h = Math.max(1, Math.min(8192, Math.round(height)));
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      if (!transparent) { ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h); }
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      const out: Blob = await new Promise((res, rej) =>
        canvas.toBlob((b) => (b ? res(b) : rej(new Error("Conversion failed"))), "image/png"),
      );
      if (pngUrl) URL.revokeObjectURL(pngUrl);
      setPngUrl(URL.createObjectURL(out));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not convert that SVG.");
    }
  }

  function download() {
    if (!pngUrl) return;
    const a = document.createElement("a");
    a.href = pngUrl; a.download = `image-${width}x${height}.png`;
    document.body.appendChild(a); a.click(); a.remove();
  }

  return (
    <ToolLayout slug="svg-to-png">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2"><FileImg className="size-5 text-primary" /><h2 className="font-display text-lg">SVG source</h2></div>
            <button onClick={() => fileRef.current?.click()} className="text-sm text-primary hover:underline">Upload .svg</button>
            <input ref={fileRef} type="file" accept=".svg,image/svg+xml" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
          </div>
          <textarea
            value={svg} onChange={(e) => setSvg(e.target.value)} spellCheck={false}
            className="w-full min-h-64 font-mono text-xs rounded-2xl border border-border bg-card p-4 focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-sm font-medium mb-1.5">Width (px)</span>
              <input type="number" min={1} max={8192} value={width} onChange={(e) => setWidth(+e.target.value)} className="w-full h-12 rounded-xl border border-border bg-card px-3 focus:outline-none focus:ring-2 focus:ring-ring" />
            </label>
            <label className="block">
              <span className="block text-sm font-medium mb-1.5">Height (px)</span>
              <input type="number" min={1} max={8192} value={height} onChange={(e) => setHeight(+e.target.value)} className="w-full h-12 rounded-xl border border-border bg-card px-3 focus:outline-none focus:ring-2 focus:ring-ring" />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={transparent} onChange={(e) => setTransparent(e.target.checked)} className="size-4 accent-primary" />
            Transparent background
          </label>
          {!transparent && (
            <label className="flex items-center gap-2 text-sm">
              <span>Background:</span>
              <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-10 w-16 rounded-lg border border-border" />
            </label>
          )}
          <div className="flex gap-2 pt-2">
            <button onClick={convert} className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2.5 rounded-xl font-medium min-h-12">Convert to PNG</button>
            {pngUrl && (
              <button onClick={download} className="inline-flex items-center gap-2 border border-border hover:bg-primary-soft px-4 py-2.5 rounded-xl font-medium min-h-12">
                <Download className="size-4" /> Save PNG
              </button>
            )}
          </div>
          {error && <div className="text-sm text-rose-600 dark:text-rose-400">{error}</div>}
        </section>
        <section className="soft-card p-5 sm:p-6">
          <h2 className="font-display text-lg mb-3">Preview</h2>
          <div className="rounded-xl border border-border bg-[conic-gradient(at_50%_50%,#0001_25%,transparent_0_50%,#0001_0_75%,transparent_0)] bg-[length:16px_16px] grid place-items-center min-h-64 p-4">
            {pngUrl ? (
              <img src={pngUrl} alt="Converted PNG" className="max-w-full max-h-[26rem] object-contain" />
            ) : (
              <div className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: svg }} />
            )}
          </div>
        </section>
      </div>
      <HowItWorks>
        <li>Paste your SVG markup or upload a .svg file.</li>
        <li>Pick the PNG size and choose transparent or a background color.</li>
        <li>Click Convert, then save the PNG to your device.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
