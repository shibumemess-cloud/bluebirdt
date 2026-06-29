import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import JsBarcode from "jsbarcode";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/barcode-generator")({
  head: () => ({
    meta: [
      { title: "Barcode Generator — Free Online Code128, EAN, UPC, ITF" },
      { name: "description", content: "Generate barcodes in Code128, EAN-13, UPC, Code39, ITF and more. Live preview, custom size and download as PNG or SVG." },
      { property: "og:title", content: "Barcode Generator — Bluebird" },
      { property: "og:description", content: "Make print-ready barcodes in your browser." },
      { property: "og:url", content: "/barcode-generator" },
    ],
    links: [{ rel: "canonical", href: "/barcode-generator" }],
  }),
  component: Page,
});

const FORMATS = [
  { v: "CODE128", l: "CODE128 (auto)" },
  { v: "CODE39", l: "CODE39" },
  { v: "EAN13", l: "EAN-13 (12 or 13 digits)" },
  { v: "EAN8", l: "EAN-8 (7 or 8 digits)" },
  { v: "UPC", l: "UPC-A (11 or 12 digits)" },
  { v: "ITF14", l: "ITF-14 (13 or 14 digits)" },
  { v: "ITF", l: "ITF (even digits)" },
  { v: "MSI", l: "MSI" },
  { v: "pharmacode", l: "Pharmacode" },
];

function Page() {
  const [value, setValue] = useState("Bluebird-123");
  const [format, setFormat] = useState("CODE128");
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(100);
  const [showText, setShowText] = useState(true);
  const [bg, setBg] = useState("#ffffff");
  const [fg, setFg] = useState("#0b1220");
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !svgRef.current) return;
    const opts = {
      format, width, height, displayValue: showText,
      background: bg, lineColor: fg, margin: 10,
    };
    try {
      JsBarcode(canvasRef.current, value || " ", opts);
      JsBarcode(svgRef.current, value || " ", opts);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid input for this format");
    }
  }, [value, format, width, height, showText, bg, fg]);

  function downloadPng() {
    if (!canvasRef.current) return;
    const a = document.createElement("a");
    a.href = canvasRef.current.toDataURL("image/png");
    a.download = `barcode-${format.toLowerCase()}.png`;
    a.click();
  }
  function downloadSvg() {
    if (!svgRef.current) return;
    const xml = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([xml], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `barcode-${format.toLowerCase()}.svg`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  return (
    <ToolLayout slug="barcode-generator">
      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        <div className="soft-card p-4 sm:p-5 space-y-4">
          <label className="block">
            <div className="eyebrow mb-1">Value to encode</div>
            <input value={value} onChange={(e) => setValue(e.target.value)} aria-label="Barcode value"
              className="w-full min-h-12 px-3 rounded-lg border border-border bg-card font-mono" />
          </label>

          <div className="rounded-2xl border border-border bg-white p-4 grid place-items-center min-h-[180px] overflow-auto">
            <canvas ref={canvasRef} className="max-w-full h-auto" />
            <svg ref={svgRef} className="hidden" />
          </div>

          {error && (
            <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm p-3">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button onClick={downloadPng} disabled={!!error}
              className="min-h-11 px-4 rounded-lg bg-primary text-primary-foreground inline-flex items-center gap-2 text-sm font-medium disabled:opacity-50">
              <Download className="size-4" /> Download PNG
            </button>
            <button onClick={downloadSvg} disabled={!!error}
              className="min-h-11 px-4 rounded-lg border border-border bg-card hover:border-primary inline-flex items-center gap-2 text-sm disabled:opacity-50">
              <Download className="size-4" /> Download SVG
            </button>
          </div>
        </div>

        <div className="soft-card p-4 sm:p-5 space-y-3 h-fit lg:sticky lg:top-24">
          <label className="block text-sm">
            <div className="eyebrow mb-1">Format</div>
            <select value={format} onChange={(e) => setFormat(e.target.value)}
              className="w-full min-h-11 px-3 rounded-lg border border-border bg-card">
              {FORMATS.map((f) => <option key={f.v} value={f.v}>{f.l}</option>)}
            </select>
          </label>
          <label className="block text-sm">
            <div className="eyebrow mb-1">Bar width: {width}px</div>
            <input type="range" min={1} max={6} step={1} value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full" />
          </label>
          <label className="block text-sm">
            <div className="eyebrow mb-1">Height: {height}px</div>
            <input type="range" min={40} max={200} step={10} value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full" />
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={showText} onChange={(e) => setShowText(e.target.checked)} />
            Show value under bars
          </label>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <label>
              <div className="eyebrow mb-1">Bars</div>
              <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="w-full h-11 rounded-lg border border-border bg-card" />
            </label>
            <label>
              <div className="eyebrow mb-1">Background</div>
              <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-full h-11 rounded-lg border border-border bg-card" />
            </label>
          </div>
        </div>
      </div>

      <HowItWorks>
        <li>Type the value you want to encode in the barcode.</li>
        <li>Pick a format — CODE128 works for almost any text.</li>
        <li>Tweak the size and colours, then download a PNG or SVG.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
