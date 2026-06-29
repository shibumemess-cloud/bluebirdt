import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Download, Plus, Undo2, Loader2 } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/pdf-redact")({
  head: () => ({
    meta: [
      { title: "PDF Redaction Tool — Black Out Sensitive Text Free" },
      { name: "description", content: "Open a PDF, drag black boxes over names, account numbers or signatures and download a flattened redacted copy." },
      { property: "og:title", content: "PDF Redaction Tool — Bluebird" },
      { property: "og:description", content: "Permanently black out parts of a PDF, in your browser." },
    ],
    links: [{ rel: "canonical", href: "/pdf-redact" }],
  }),
  component: Page,
});

type Box = { page: number; x: number; y: number; w: number; h: number };
type Pg = { url: string; w: number; h: number; pdfW: number; pdfH: number };

function Page() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileBuf, setFileBuf] = useState<ArrayBuffer | null>(null);
  const [pages, setPages] = useState<Pg[]>([]);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [dragging, setDragging] = useState<Box | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => () => pages.forEach((p) => URL.revokeObjectURL(p.url)), [pages]);

  async function loadFile(file: File) {
    setBusy(true); setErr(""); setBoxes([]); setPages([]);
    try {
      const buf = await file.arrayBuffer();
      setFileBuf(buf);
      const pdfjs: any = await import("pdfjs-dist");
      const workerSrc = (await import("pdfjs-dist/build/pdf.worker.mjs?url")).default;
      pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
      const pdf = await pdfjs.getDocument({ data: buf.slice(0) }).promise;
      const out: Pg[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const vp = page.getViewport({ scale: 1.5 });
        const c = document.createElement("canvas");
        c.width = vp.width; c.height = vp.height;
        await page.render({ canvasContext: c.getContext("2d")!, viewport: vp }).promise;
        const url = c.toDataURL("image/png");
        const orig = page.getViewport({ scale: 1 });
        out.push({ url, w: vp.width, h: vp.height, pdfW: orig.width, pdfH: orig.height });
      }
      setPages(out);
    } catch (e: any) {
      setErr(e?.message || "Could not open that PDF.");
    } finally {
      setBusy(false);
    }
  }

  function down(e: React.PointerEvent, page: number) {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragging({ page, x: e.clientX - r.left, y: e.clientY - r.top, w: 1, h: 1 });
  }
  function move(e: React.PointerEvent) {
    if (!dragging) return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const px = e.clientX - r.left, py = e.clientY - r.top;
    setDragging({ ...dragging, x: Math.min(dragging.x, px), y: Math.min(dragging.y, py), w: Math.abs(px - dragging.x), h: Math.abs(py - dragging.y) });
  }
  function up() {
    if (dragging && dragging.w > 6 && dragging.h > 6) setBoxes((b) => [...b, dragging]);
    setDragging(null);
  }

  async function download() {
    if (!fileBuf) return;
    setBusy(true); setErr("");
    try {
      const { PDFDocument, rgb } = await import("pdf-lib");
      const doc = await PDFDocument.load(fileBuf);
      const pdfPages = doc.getPages();
      boxes.forEach((b) => {
        const pg = pages[b.page]; const target = pdfPages[b.page];
        if (!pg || !target) return;
        const sx = pg.pdfW / pg.w; const sy = pg.pdfH / pg.h;
        const x = b.x * sx;
        const y = pg.pdfH - (b.y + b.h) * sy;
        target.drawRectangle({ x, y, width: b.w * sx, height: b.h * sy, color: rgb(0, 0, 0) });
      });
      const bytes = await doc.save();
      const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
      const blob = new Blob([ab], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "redacted.pdf"; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (e: any) {
      setErr(e?.message || "Could not save the redacted PDF.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolLayout slug="pdf-redact">
      <div className="soft-card p-4 sm:p-5 flex flex-wrap gap-3 items-center">
        <input ref={inputRef} type="file" accept="application/pdf" className="sr-only" onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])} />
        <button onClick={() => inputRef.current?.click()} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground inline-flex items-center gap-2 min-h-12">
          {busy ? <><Loader2 className="size-4 animate-spin" /> Working…</> : <><Plus className="size-4" /> {pages.length ? "Open another PDF" : "Open PDF"}</>}
        </button>
        {pages.length > 0 && (<>
          <button onClick={() => setBoxes((b) => b.slice(0, -1))} disabled={boxes.length === 0} className="px-3 py-2 rounded-xl border border-border min-h-10 disabled:opacity-50 inline-flex items-center gap-1.5"><Undo2 className="size-4" /> Undo</button>
          <button onClick={() => setBoxes([])} disabled={boxes.length === 0} className="px-3 py-2 rounded-xl border border-border min-h-10 disabled:opacity-50">Clear</button>
          <button onClick={download} disabled={boxes.length === 0 || busy} className="ml-auto px-4 py-2 rounded-xl bg-primary text-primary-foreground inline-flex items-center gap-2 min-h-12 disabled:opacity-60"><Download className="size-4" /> Download redacted PDF</button>
        </>)}
      </div>
      {err && <div className="mt-3 text-sm text-destructive">{err}</div>}
      {pages.length > 0 ? (
        <div className="mt-4 grid gap-4">
          {pages.map((p, i) => (
            <div key={i} className="soft-card p-2 mx-auto" style={{ width: "min(100%, " + p.w + "px)" }}>
              <div className="relative touch-none select-none" onPointerDown={(e) => down(e, i)} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
                <img src={p.url} alt={`Page ${i + 1}`} className="block w-full h-auto rounded-md" />
                {boxes.filter((b) => b.page === i).map((b, k) => (
                  <div key={k} className="absolute bg-black" style={{ left: b.x, top: b.y, width: b.w, height: b.h }} />
                ))}
                {dragging && dragging.page === i && (
                  <div className="absolute border-2 border-primary bg-black/70" style={{ left: dragging.x, top: dragging.y, width: dragging.w, height: dragging.h }} />
                )}
              </div>
              <div className="text-xs text-muted-foreground px-2 pt-2">Page {i + 1} of {pages.length}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 soft-card p-8 text-center text-muted-foreground">Open a PDF to start redacting.</div>
      )}
      <HowItWorks>
        <li>Open a PDF from your device — it never leaves your browser.</li>
        <li>Drag black boxes over names, account numbers or any sensitive area.</li>
        <li>Download a new flattened PDF. The boxes are permanent in the saved file.</li>
      </HowItWorks>
      <div className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground"><ShieldCheck className="size-4 text-primary" /> Redaction runs locally with pdf-lib — no uploads.</div>
    </ToolLayout>
  );
}
