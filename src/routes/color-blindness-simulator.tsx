import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Download, Eye } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks, FileDrop, ErrorBox } from "../components/ToolControls";

export const Route = createFileRoute("/color-blindness-simulator")({
  head: () => ({
    meta: [
      { title: "Color Blindness Simulator — Free Image Tool" },
      { name: "description", content: "See how your image looks to people with protanopia, deuteranopia or tritanopia. Runs offline on canvas — your image never uploads." },
      { property: "og:title", content: "Color Blindness Simulator — Bluebird" },
      { property: "og:description", content: "Free image simulator for the three main types of color blindness." },
    ],
    links: [{ rel: "canonical", href: "/color-blindness-simulator" }],
  }),
  component: Page,
});

type Mode = "normal" | "protanopia" | "deuteranopia" | "tritanopia";
// Brettel/Viénot/Mollon matrices (Machado approximation, common online values)
const MATRICES: Record<Mode, number[]> = {
  normal:        [1,0,0, 0,1,0, 0,0,1],
  protanopia:    [0.567,0.433,0,    0.558,0.442,0,    0,0.242,0.758],
  deuteranopia:  [0.625,0.375,0,    0.7,0.3,0,        0,0.3,0.7],
  tritanopia:    [0.95,0.05,0,      0,0.433,0.567,    0,0.475,0.525],
};

function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>("deuteranopia");
  const [err, setErr] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setErr(null); setDownloadUrl(null);
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const max = 1024;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const m = MATRICES[mode];
      const d = data.data;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        d[i]     = Math.min(255, r * m[0] + g * m[1] + b * m[2]);
        d[i + 1] = Math.min(255, r * m[3] + g * m[4] + b * m[5]);
        d[i + 2] = Math.min(255, r * m[6] + g * m[7] + b * m[8]);
      }
      ctx.putImageData(data, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) setDownloadUrl(URL.createObjectURL(blob));
      }, "image/png");
      URL.revokeObjectURL(url);
    };
    img.onerror = () => { if (!cancelled) setErr("Could not read that image."); URL.revokeObjectURL(url); };
    img.src = url;
    return () => { cancelled = true; };
  }, [file, mode]);

  useEffect(() => () => { if (downloadUrl) URL.revokeObjectURL(downloadUrl); }, [downloadUrl]);

  return (
    <ToolLayout slug="color-blindness-simulator">
      <div className="soft-card p-5 sm:p-6 space-y-5">
        <FileDrop file={file} onFile={setFile} accept="image/*" />
        {err && <ErrorBox>{err}</ErrorBox>}

        <div role="radiogroup" aria-label="Color blindness type" className="flex flex-wrap gap-2">
          {(["normal", "protanopia", "deuteranopia", "tritanopia"] as Mode[]).map((m) => (
            <button key={m} role="radio" aria-checked={mode === m} onClick={() => setMode(m)} className={`rounded-full px-4 py-2 text-sm font-medium border ${mode === m ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-primary-soft"}`}>
              {m === "normal" ? "Normal vision" : m[0].toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <canvas ref={canvasRef} className="w-full h-auto rounded-lg" aria-label="Simulated preview" />
          {!file && <p className="text-sm text-muted-foreground p-4 flex items-center gap-2"><Eye className="size-4" /> Upload an image to simulate how it looks.</p>}
          {downloadUrl && (
            <a href={downloadUrl} download={`cb-${mode}.png`} className="mt-3 inline-flex items-center gap-2 min-h-12 px-5 rounded-xl bg-primary text-primary-foreground font-medium">
              <Download className="size-4" /> Download PNG
            </a>
          )}
        </div>
      </div>
      <HowItWorks>
        <p>Drop in any image, then switch between the three common types of color blindness — protanopia (red), deuteranopia (green) and tritanopia (blue). Use it to check charts, UI screenshots and infographics for accessibility.</p>
      </HowItWorks>
    </ToolLayout>
  );
}
