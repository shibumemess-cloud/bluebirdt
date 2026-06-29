import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Eye, Upload } from "lucide-react";
import { ToolLayout, validateImageFile } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/color-blindness")({
  head: () => ({
    meta: [
      { title: "Color Blindness Simulator — See Your Design Through Different Eyes" },
      { name: "description", content: "Simulate how images and colors look to people with protanopia, deuteranopia, tritanopia and monochromacy. 100% browser, no upload." },
      { property: "og:title", content: "Color Blindness Simulator — Bluebird" },
      { property: "og:description", content: "Check designs for color-blind accessibility." },
      { property: "og:url", content: "/color-blindness" },
    ],
    links: [{ rel: "canonical", href: "/color-blindness" }],
  }),
  component: Page,
});

// Matrices from Machado et al. — common simulation approximations
const MATRICES: Record<string, number[]> = {
  Normal: [1, 0, 0, 0, 1, 0, 0, 0, 1],
  "Protanopia (no red)": [0.567, 0.433, 0, 0.558, 0.442, 0, 0, 0.242, 0.758],
  "Deuteranopia (no green)": [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7],
  "Tritanopia (no blue)": [0.95, 0.05, 0, 0, 0.433, 0.567, 0, 0.475, 0.525],
  "Protanomaly (weak red)": [0.817, 0.183, 0, 0.333, 0.667, 0, 0, 0.125, 0.875],
  "Deuteranomaly (weak green)": [0.8, 0.2, 0, 0.258, 0.742, 0, 0, 0.142, 0.858],
  "Tritanomaly (weak blue)": [0.967, 0.033, 0, 0, 0.733, 0.267, 0, 0.183, 0.817],
  "Achromatopsia (greyscale)": [0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114],
};

function applyMatrix(src: ImageData, m: number[]): ImageData {
  const out = new ImageData(src.width, src.height);
  const a = src.data, b = out.data;
  for (let i = 0; i < a.length; i += 4) {
    const r = a[i], g = a[i + 1], bl = a[i + 2];
    b[i] = Math.min(255, Math.max(0, m[0] * r + m[1] * g + m[2] * bl));
    b[i + 1] = Math.min(255, Math.max(0, m[3] * r + m[4] * g + m[5] * bl));
    b[i + 2] = Math.min(255, Math.max(0, m[6] * r + m[7] * g + m[8] * bl));
    b[i + 3] = a[i + 3];
  }
  return out;
}

function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [src, setSrc] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<string>("Deuteranopia (no green)");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const origRef = useRef<HTMLCanvasElement>(null);

  function onPick(f: File | null) {
    setError(null);
    const e = validateImageFile(f); if (e) { setError(e); return; }
    setFile(f);
    const url = URL.createObjectURL(f!);
    const img = new Image();
    img.onload = () => { setSrc(img); URL.revokeObjectURL(url); };
    img.onerror = () => { setError("Couldn't read that image."); URL.revokeObjectURL(url); };
    img.src = url;
  }

  useEffect(() => {
    if (!src) return;
    const maxW = 900;
    const scale = Math.min(1, maxW / src.width);
    const w = Math.round(src.width * scale), h = Math.round(src.height * scale);
    const oc = origRef.current!, sc = canvasRef.current!;
    oc.width = w; oc.height = h; sc.width = w; sc.height = h;
    const octx = oc.getContext("2d")!; const sctx = sc.getContext("2d")!;
    octx.drawImage(src, 0, 0, w, h);
    const data = octx.getImageData(0, 0, w, h);
    sctx.putImageData(applyMatrix(data, MATRICES[mode]), 0, 0);
  }, [src, mode]);

  return (
    <ToolLayout slug="color-blindness">
      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-5">
          <label className="block">
            <span className="eyebrow">Upload an image</span>
            <div className="mt-2 grid place-items-center rounded-2xl border-2 border-dashed border-border bg-card/60 p-6 hover:border-primary">
              <input id="cb-file" type="file" accept="image/*" className="hidden"
                onChange={(e) => onPick(e.target.files?.[0] ?? null)} />
              <label htmlFor="cb-file" className="cursor-pointer text-center">
                <Upload className="size-6 mx-auto text-primary" />
                <div className="mt-2 text-sm font-medium">{file ? file.name : "Choose a photo or screenshot"}</div>
                <div className="text-xs text-muted-foreground">Stays on your device</div>
              </label>
            </div>
          </label>

          <div>
            <div className="eyebrow mb-2">Simulate</div>
            <div className="grid gap-2">
              {Object.keys(MATRICES).map((k) => (
                <button key={k} onClick={() => setMode(k)} aria-pressed={mode === k}
                  className={["min-h-11 px-3 rounded-xl text-sm font-medium border text-left",
                    mode === k ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary"].join(" ")}>
                  {k}
                </button>
              ))}
            </div>
          </div>
          {error && <div className="text-sm text-rose-600">{error}</div>}
          <p className="text-xs text-muted-foreground">About 1 in 12 men and 1 in 200 women have some form of color blindness. Check your design works for everyone.</p>
        </section>

        <section className="space-y-4">
          <div className="soft-card p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2"><Eye className="size-4 text-primary" /><div className="eyebrow">Original</div></div>
            <canvas ref={origRef} className="max-w-full h-auto rounded-xl border border-border bg-card" />
          </div>
          <div className="soft-card p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2"><Eye className="size-4 text-primary" /><div className="eyebrow">{mode}</div></div>
            <canvas ref={canvasRef} className="max-w-full h-auto rounded-xl border border-border bg-card" />
          </div>
        </section>
      </div>

      <HowItWorks>
        <li>Upload a design, photo or screenshot.</li>
        <li>Pick a type of color vision to simulate.</li>
        <li>Compare the original and simulated views to spot accessibility issues.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
