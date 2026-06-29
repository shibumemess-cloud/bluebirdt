import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Download, Plus, Undo2 } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/face-blur")({
  head: () => ({
    meta: [
      { title: "Image Face Blur — Hide Faces in Photos Free" },
      { name: "description", content: "Drag boxes over faces, license plates or anything else you want to hide. The blurred image stays on your device." },
      { property: "og:title", content: "Image Face Blur — Bluebird" },
      { property: "og:description", content: "Blur faces and sensitive areas in a photo, privately." },
    ],
    links: [{ rel: "canonical", href: "/face-blur" }],
  }),
  component: Page,
});

type Box = { x: number; y: number; w: number; h: number };

function Page() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [dragging, setDragging] = useState<Box | null>(null);
  const [strength, setStrength] = useState(18);
  const [outUrl, setOutUrl] = useState<string | null>(null);

  useEffect(() => () => { if (outUrl) URL.revokeObjectURL(outUrl); }, [outUrl]);

  function loadFile(file: File) {
    const url = URL.createObjectURL(file);
    const i = new Image();
    i.onload = () => { setImg(i); setBoxes([]); URL.revokeObjectURL(url); render(i, [], strength); };
    i.src = url;
  }

  function render(image: HTMLImageElement, bs: Box[], blur: number) {
    const c = canvasRef.current!;
    c.width = image.naturalWidth;
    c.height = image.naturalHeight;
    const ctx = c.getContext("2d")!;
    ctx.filter = "none";
    ctx.drawImage(image, 0, 0);
    for (const b of bs) {
      ctx.save();
      ctx.beginPath(); ctx.rect(b.x, b.y, b.w, b.h); ctx.clip();
      ctx.filter = `blur(${blur}px)`;
      ctx.drawImage(image, 0, 0);
      ctx.restore();
    }
  }

  useEffect(() => { if (img) render(img, boxes, strength); }, [img, boxes, strength]);

  function overlayPos(e: React.PointerEvent) {
    const el = overlayRef.current!;
    const r = el.getBoundingClientRect();
    const sx = img!.naturalWidth / r.width;
    const sy = img!.naturalHeight / r.height;
    return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy };
  }

  function down(e: React.PointerEvent) {
    if (!img) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const p = overlayPos(e);
    setDragging({ x: p.x, y: p.y, w: 1, h: 1 });
  }
  function move(e: React.PointerEvent) {
    if (!dragging || !img) return;
    const p = overlayPos(e);
    setDragging({ x: Math.min(dragging.x, p.x), y: Math.min(dragging.y, p.y), w: Math.abs(p.x - dragging.x), h: Math.abs(p.y - dragging.y) });
  }
  function up() {
    if (dragging && dragging.w > 8 && dragging.h > 8) setBoxes((b) => [...b, dragging]);
    setDragging(null);
  }

  async function download() {
    const c = canvasRef.current!;
    const blob: Blob = await new Promise((r) => c.toBlob((b) => r(b!), "image/png"));
    const url = URL.createObjectURL(blob);
    setOutUrl(url);
    const a = document.createElement("a"); a.href = url; a.download = "blurred.png"; a.click();
  }

  return (
    <ToolLayout slug="face-blur">
      <div className="soft-card p-4 sm:p-5 flex flex-wrap gap-3 items-center">
        <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])} />
        <button onClick={() => inputRef.current?.click()} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground inline-flex items-center gap-2 min-h-12"><Plus className="size-4" /> {img ? "Choose another" : "Choose photo"}</button>
        {img && (<>
          <label className="text-sm flex items-center gap-2">Blur strength <input type="range" min={6} max={40} value={strength} onChange={(e) => setStrength(Number(e.target.value))} /></label>
          <button onClick={() => setBoxes((b) => b.slice(0, -1))} disabled={boxes.length === 0} className="px-3 py-2 rounded-xl border border-border min-h-10 inline-flex items-center gap-1.5 disabled:opacity-50"><Undo2 className="size-4" /> Undo</button>
          <button onClick={() => setBoxes([])} disabled={boxes.length === 0} className="px-3 py-2 rounded-xl border border-border min-h-10 disabled:opacity-50">Clear</button>
          <button onClick={download} className="ml-auto px-4 py-2 rounded-xl bg-primary text-primary-foreground inline-flex items-center gap-2 min-h-12"><Download className="size-4" /> Download</button>
        </>)}
      </div>
      {img ? (
        <div className="mt-4 soft-card p-2 relative inline-block max-w-full">
          <div ref={overlayRef} className="relative max-w-full touch-none select-none" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
            <canvas ref={canvasRef} className="block max-w-full h-auto rounded-lg" />
            {dragging && (
              <div className="absolute border-2 border-primary bg-primary/10 pointer-events-none" style={{
                left: `${(dragging.x / img.naturalWidth) * 100}%`,
                top: `${(dragging.y / img.naturalHeight) * 100}%`,
                width: `${(dragging.w / img.naturalWidth) * 100}%`,
                height: `${(dragging.h / img.naturalHeight) * 100}%`,
              }} />
            )}
          </div>
          <p className="mt-2 text-sm text-muted-foreground px-2">Drag boxes over each face or area you want to blur. {boxes.length} hidden so far.</p>
        </div>
      ) : (
        <div className="mt-4 soft-card p-8 text-center text-muted-foreground">Pick a photo to start hiding faces.</div>
      )}
      <HowItWorks>
        <li>Pick a photo from your device.</li>
        <li>Draw boxes over every face, badge or license plate.</li>
        <li>Adjust the blur strength and download the protected image.</li>
      </HowItWorks>
      <div className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground"><ShieldCheck className="size-4 text-primary" /> The photo is edited entirely on your device — no upload, no AI face detection.</div>
    </ToolLayout>
  );
}
