import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ListOrdered, Download, RotateCcw, FileText } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks, Field, WarnBox, RunButton } from "../components/ToolControls";

export const Route = createFileRoute("/pdf-page-numbers")({
  head: () => ({
    meta: [
      { title: "Add Page Numbers to PDF — Free Online, Private" },
      { name: "description", content: "Add clean page numbers to any PDF. Choose position, format and starting number. Runs in your browser — no uploads." },
      { property: "og:title", content: "PDF Page Numbers — Bluebird" },
      { property: "og:description", content: "Add page numbers to PDFs privately, in your browser. Free, fast and watermark-free." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/pdf-page-numbers" },
    ],
    links: [{ rel: "canonical", href: "/pdf-page-numbers" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird PDF Page Numbers",
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: Page,
});

type Pos = "bottom-center" | "bottom-right" | "bottom-left" | "top-center" | "top-right" | "top-left";
type Fmt = "n" | "n_of_N" | "page_n" | "page_n_of_N";

const PREF_KEY = "bb-pdf-pagenum-v1";

function format(fmt: Fmt, n: number, total: number): string {
  switch (fmt) {
    case "n_of_N": return `${n} / ${total}`;
    case "page_n": return `Page ${n}`;
    case "page_n_of_N": return `Page ${n} of ${total}`;
    default: return String(n);
  }
}

function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [pos, setPos] = useState<Pos>("bottom-center");
  const [fmt, setFmt] = useState<Fmt>("n_of_N");
  const [startAt, setStartAt] = useState(1);
  const [fontSize, setFontSize] = useState(11);
  const [margin, setMargin] = useState(28);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [outName, setOutName] = useState("numbered.pdf");
  const [pageCount, setPageCount] = useState(0);
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREF_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (typeof p.pos === "string") setPos(p.pos);
        if (typeof p.fmt === "string") setFmt(p.fmt);
        if (typeof p.fontSize === "number") setFontSize(p.fontSize);
        if (typeof p.margin === "number") setMargin(p.margin);
      }
    } catch { /* ignore */ }
    setPrefsLoaded(true);
  }, []);
  useEffect(() => {
    if (!prefsLoaded) return;
    try { localStorage.setItem(PREF_KEY, JSON.stringify({ pos, fmt, fontSize, margin })); } catch { /* ignore */ }
  }, [prefsLoaded, pos, fmt, fontSize, margin]);

  useEffect(() => () => { if (outUrl) URL.revokeObjectURL(outUrl); }, [outUrl]);

  function onPick(f: File | null) {
    setErr(null); setOutUrl(null); setPageCount(0);
    if (!f) { setFile(null); return; }
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      setErr("Please choose a PDF file."); return;
    }
    if (f.size > 50 * 1024 * 1024) {
      setErr("File is too large. Please keep PDFs under 50 MB."); return;
    }
    setFile(f);
    setOutName(f.name.replace(/\.pdf$/i, "") + "-numbered.pdf");
  }

  async function run() {
    if (!file) return;
    setErr(null); setBusy(true);
    try {
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
      const buf = await file.arrayBuffer();
      const doc = await PDFDocument.load(buf);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();
      const total = pages.length;
      pages.forEach((page, i) => {
        const n = startAt + i;
        const label = format(fmt, n, total);
        const { width, height } = page.getSize();
        const tw = font.widthOfTextAtSize(label, fontSize);
        let x = margin;
        let y = margin;
        if (pos.endsWith("center")) x = (width - tw) / 2;
        else if (pos.endsWith("right")) x = width - margin - tw;
        if (pos.startsWith("top")) y = height - margin - fontSize;
        page.drawText(label, { x, y, size: fontSize, font, color: rgb(0.15, 0.18, 0.22) });
      });
      const bytes = await doc.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      if (outUrl) URL.revokeObjectURL(outUrl);
      setOutUrl(URL.createObjectURL(blob));
      setPageCount(total);
    } catch (e) {
      console.error(e);
      setErr(e instanceof Error ? `Could not process the PDF: ${e.message}` : "Could not process the PDF.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    if (outUrl) URL.revokeObjectURL(outUrl);
    setFile(null); setOutUrl(null); setErr(null); setPageCount(0);
  }

  return (
    <ToolLayout slug="pdf-page-numbers">
      <div className="grid lg:grid-cols-[340px_1fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-5 self-start">
          <Field label="PDF file" hint="Up to 50 MB. Processed entirely in your browser.">
            <label className="block cursor-pointer rounded-xl border border-dashed border-border bg-card hover:bg-primary-soft/40 px-4 py-5 text-center">
              <FileText className="mx-auto size-6 text-primary mb-2" />
              <div className="text-sm font-medium">{file ? file.name : "Click to choose a PDF"}</div>
              {file && <div className="text-xs text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</div>}
              <input type="file" accept="application/pdf" className="hidden"
                onChange={(e) => onPick(e.target.files?.[0] ?? null)} />
            </label>
          </Field>

          <div>
            <div className="eyebrow mb-2">Position</div>
            <div className="grid grid-cols-3 gap-1.5">
              {(["top-left","top-center","top-right","bottom-left","bottom-center","bottom-right"] as Pos[]).map((p) => (
                <button key={p} onClick={() => setPos(p)} aria-pressed={pos === p}
                  className={`min-h-11 rounded-lg text-[11px] font-medium capitalize px-1 ${pos === p ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:bg-primary-soft"}`}>
                  {p.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>

          <Field label="Format">
            <select value={fmt} onChange={(e) => setFmt(e.target.value as Fmt)}
              className="w-full min-h-11 rounded-xl border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="n">1, 2, 3 …</option>
              <option value="n_of_N">1 / 10</option>
              <option value="page_n">Page 1</option>
              <option value="page_n_of_N">Page 1 of 10</option>
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Start at">
              <input type="number" min={1} max={9999} value={startAt}
                onChange={(e) => setStartAt(Math.max(1, Math.min(9999, Number(e.target.value) || 1)))}
                className="w-full min-h-11 rounded-xl border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </Field>
            <Field label={`Size · ${fontSize}pt`}>
              <input type="range" min={8} max={20} value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))} className="w-full" />
            </Field>
          </div>

          <Field label={`Edge margin · ${margin}pt`}>
            <input type="range" min={10} max={80} value={margin}
              onChange={(e) => setMargin(Number(e.target.value))} className="w-full" />
          </Field>

          <RunButton onClick={run} busy={busy} disabled={!file} label="Add page numbers" />
          {err && <WarnBox>{err}</WarnBox>}
        </section>

        <section className="min-w-0">
          {outUrl ? (
            <div className="soft-card p-5 sm:p-6 animate-[pop_.35s_cubic-bezier(0.22,1,0.36,1)_both]">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <ListOrdered className="size-4 text-primary" />
                  <div className="font-display text-lg">Numbered PDF ready</div>
                </div>
                <span className="text-xs text-muted-foreground num">{pageCount} pages</span>
              </div>
              <iframe title="PDF preview" src={outUrl} className="w-full h-[520px] rounded-xl border border-border bg-card" />
              <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                <a href={outUrl} download={outName}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3.5 font-semibold min-h-12 hover:shadow-lift hover:-translate-y-0.5">
                  <Download className="size-4" /> Download PDF
                </a>
                <button onClick={reset} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-medium min-h-12 hover:bg-primary-soft">
                  <RotateCcw className="size-4" /> Reset
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 h-full grid place-items-center text-center">
              <div>
                <span className="grid place-items-center size-12 mx-auto rounded-2xl bg-primary-soft text-primary mb-3">
                  <ListOrdered className="size-6" />
                </span>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Pick a PDF on the left, choose where the numbers should sit, then click <strong>Add page numbers</strong>.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      <HowItWorks>
        <li>Choose any PDF up to 50 MB — it is opened and edited locally with PDF-lib.</li>
        <li>Pick a position, format and starting number. You can preview the result instantly.</li>
        <li>Download your numbered PDF. The original file is never uploaded to a server.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
