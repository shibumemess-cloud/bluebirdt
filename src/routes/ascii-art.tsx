import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Type as TypeIcon, Copy, Download, Upload } from "lucide-react";
import { ToolLayout, validateImageFile } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/ascii-art")({
  head: () => ({
    meta: [
      { title: "Image to ASCII Art Converter — Free, Browser Only" },
      { name: "description", content: "Turn any photo into ASCII art in your browser. Adjust width, contrast, character set and invert. Copy text or download as PNG." },
      { property: "og:title", content: "Image to ASCII Art — Bluebird" },
      { property: "og:description", content: "Make ASCII art from any image — fully client-side." },
      { property: "og:url", content: "/ascii-art" },
    ],
    links: [{ rel: "canonical", href: "/ascii-art" }],
  }),
  component: Page,
});

const RAMPS: Record<string, string> = {
  Detailed: "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ",
  Classic: "@%#*+=-:. ",
  Blocks: "█▓▒░ ",
  Binary: "10 ",
};

function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [width, setWidth] = useState(120);
  const [contrast, setContrast] = useState(1);
  const [invert, setInvert] = useState(false);
  const [rampKey, setRampKey] = useState<keyof typeof RAMPS>("Classic");
  const [ascii, setAscii] = useState("");
  const previewRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const ramp = invert ? [...RAMPS[rampKey]].reverse().join("") : RAMPS[rampKey];
      const aspect = img.height / img.width;
      // chars are ~2x taller than wide
      const cols = Math.max(20, Math.min(400, Math.floor(width)));
      const rows = Math.max(1, Math.floor(aspect * cols * 0.5));
      const c = document.createElement("canvas");
      c.width = cols; c.height = rows;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, cols, rows);
      const data = ctx.getImageData(0, 0, cols, rows).data;
      let out = "";
      const lastIdx = ramp.length - 1;
      for (let y = 0; y < rows; y++) {
        let line = "";
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4;
          const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          // contrast: shift around 128
          let v = (lum - 128) * contrast + 128;
          v = Math.max(0, Math.min(255, v));
          const r = Math.round((v / 255) * lastIdx);
          line += ramp[r];
        }
        out += line + "\n";
      }
      setAscii(out);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => { setError("Couldn't read that image."); URL.revokeObjectURL(url); };
    img.src = url;
    return () => { cancelled = true; };
  }, [file, width, contrast, invert, rampKey]);

  function onPick(f: File | null) {
    setError(null); setAscii("");
    const e = validateImageFile(f); if (e) { setError(e); return; }
    setFile(f);
  }

  function copy() { if (ascii) navigator.clipboard.writeText(ascii).catch(() => {}); }

  function downloadTxt() {
    const blob = new Blob([ascii], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "ascii-art.txt"; a.click(); URL.revokeObjectURL(a.href);
  }

  function downloadPng() {
    if (!ascii) return;
    const lines = ascii.split("\n");
    const fontSize = 12;
    const charW = fontSize * 0.6;
    const c = document.createElement("canvas");
    c.width = Math.ceil((lines[0]?.length || 1) * charW);
    c.height = lines.length * fontSize;
    const ctx = c.getContext("2d"); if (!ctx) return;
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#0f172a";
    ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.textBaseline = "top";
    lines.forEach((l, i) => ctx.fillText(l, 0, i * fontSize));
    c.toBlob((b) => {
      if (!b) return;
      const a = document.createElement("a"); a.href = URL.createObjectURL(b);
      a.download = "ascii-art.png"; a.click(); URL.revokeObjectURL(a.href);
    }, "image/png");
  }

  return (
    <ToolLayout slug="ascii-art">
      <div className="grid lg:grid-cols-[340px_1fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-5">
          <label className="block">
            <span className="eyebrow">Upload an image</span>
            <div className="mt-2 grid place-items-center rounded-2xl border-2 border-dashed border-border bg-card/60 p-6 hover:border-primary cursor-pointer">
              <input type="file" accept="image/*" className="hidden" id="ai-file"
                onChange={(e) => onPick(e.target.files?.[0] ?? null)} />
              <label htmlFor="ai-file" className="cursor-pointer text-center">
                <Upload className="size-6 mx-auto text-primary" />
                <div className="mt-2 text-sm font-medium">{file ? file.name : "Choose a photo"}</div>
                <div className="text-xs text-muted-foreground">PNG, JPG or WebP — up to 20 MB</div>
              </label>
            </div>
          </label>

          <div>
            <label htmlFor="ai-w" className="eyebrow">Width (characters): <span className="text-foreground">{width}</span></label>
            <input id="ai-w" type="range" min={40} max={300} value={width} onChange={(e) => setWidth(parseInt(e.target.value))} className="w-full mt-2" />
          </div>
          <div>
            <label htmlFor="ai-c" className="eyebrow">Contrast: <span className="text-foreground">{contrast.toFixed(2)}×</span></label>
            <input id="ai-c" type="range" min={0.5} max={2.5} step={0.05} value={contrast} onChange={(e) => setContrast(parseFloat(e.target.value))} className="w-full mt-2" />
          </div>
          <div>
            <div className="eyebrow mb-2">Character set</div>
            <div className="flex flex-wrap gap-2">
              {Object.keys(RAMPS).map((k) => (
                <button key={k} onClick={() => setRampKey(k as keyof typeof RAMPS)} aria-pressed={rampKey === k}
                  className={["min-h-10 px-3 rounded-xl text-sm font-medium border",
                    rampKey === k ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary"].join(" ")}>
                  {k}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={invert} onChange={(e) => setInvert(e.target.checked)} className="size-4 accent-[color:var(--color-primary)]" />
            Invert (for dark backgrounds)
          </label>

          {error && <div className="text-sm text-rose-600">{error}</div>}

          <div className="grid grid-cols-2 gap-2">
            <button onClick={copy} disabled={!ascii} className="min-h-11 rounded-xl border border-border bg-card text-sm font-medium hover:border-primary inline-flex items-center justify-center gap-2 disabled:opacity-50">
              <Copy className="size-4" /> Copy
            </button>
            <button onClick={downloadTxt} disabled={!ascii} className="min-h-11 rounded-xl border border-border bg-card text-sm font-medium hover:border-primary inline-flex items-center justify-center gap-2 disabled:opacity-50">
              <Download className="size-4" /> .txt
            </button>
            <button onClick={downloadPng} disabled={!ascii} className="col-span-2 min-h-11 rounded-xl bg-primary text-primary-foreground font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50">
              <Download className="size-4" /> Download as PNG
            </button>
          </div>
        </section>

        <section className="soft-card p-3 sm:p-4">
          <div className="flex items-center gap-2 px-2 pt-2">
            <TypeIcon className="size-4 text-primary" />
            <div className="eyebrow">ASCII preview</div>
          </div>
          <pre ref={previewRef} className="mt-2 max-h-[34rem] overflow-auto rounded-xl bg-card border border-border p-3 text-[7px] sm:text-[8px] leading-[0.95] font-mono whitespace-pre"
            style={{ color: invert ? "#fff" : "#0f172a", background: invert ? "#0f172a" : undefined }}>
{ascii || "Upload an image to see ASCII art here."}
          </pre>
        </section>
      </div>

      <HowItWorks>
        <li>Pick a photo — high-contrast portraits and logos work best.</li>
        <li>Adjust width, contrast, and pick a character set.</li>
        <li>Copy as text or download as a PNG image.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
