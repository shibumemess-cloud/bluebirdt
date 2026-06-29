import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { FileType, Download, RotateCcw } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks, Field, WarnBox, RunButton } from "../components/ToolControls";

export const Route = createFileRoute("/text-to-pdf")({
  head: () => ({
    meta: [
      { title: "Text to PDF — Free Online Plain Text to PDF Converter" },
      { name: "description", content: "Paste any text and download a clean, paginated PDF. Pick page size, margins and font size. Free, private, in-browser." },
      { property: "og:title", content: "Text to PDF — Bluebird" },
      { property: "og:description", content: "Turn plain text into a paginated PDF in seconds — runs in your browser." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/text-to-pdf" },
    ],
    links: [{ rel: "canonical", href: "/text-to-pdf" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird Text to PDF",
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: Page,
});

type PageSize = "A4" | "Letter" | "Legal";
const PAGE_DIMS: Record<PageSize, [number, number]> = {
  A4: [595.28, 841.89],
  Letter: [612, 792],
  Legal: [612, 1008],
};

const PREF_KEY = "bb-text-to-pdf-v1";
const SAMPLE = `Bluebird Notes\n\nThis is a quick way to turn plain text into a printable PDF.\n\n• Pick a page size, margin and font size on the left.\n• Type or paste your text on the right.\n• Click Make PDF to download.\n\nEverything happens in your browser — your text never leaves your device.`;

function Page() {
  const [text, setText] = useState(SAMPLE);
  const [size, setSize] = useState<PageSize>("A4");
  const [margin, setMargin] = useState(48);
  const [fontSize, setFontSize] = useState(12);
  const [title, setTitle] = useState("Bluebird Document");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [pages, setPages] = useState(0);
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREF_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (p.size === "A4" || p.size === "Letter" || p.size === "Legal") setSize(p.size);
        if (typeof p.margin === "number") setMargin(Math.max(0, Math.min(160, p.margin)));
        if (typeof p.fontSize === "number") setFontSize(Math.max(8, Math.min(36, p.fontSize)));
      }
    } catch { /* ignore */ }
    setPrefsLoaded(true);
  }, []);
  useEffect(() => {
    if (!prefsLoaded) return;
    try { localStorage.setItem(PREF_KEY, JSON.stringify({ size, margin, fontSize })); } catch { /* ignore */ }
  }, [prefsLoaded, size, margin, fontSize]);

  useEffect(() => () => { if (outUrl) URL.revokeObjectURL(outUrl); }, [outUrl]);

  const stats = useMemo(() => ({
    chars: text.length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    lines: text.split(/\r?\n/).length,
  }), [text]);

  async function run() {
    setErr(null);
    if (!text.trim()) { setErr("Type or paste some text first."); return; }
    if (text.length > 1_500_000) { setErr("Text is too large. Please keep it under ~1.5 million characters."); return; }
    setBusy(true);
    try {
      const { PDFDocument, StandardFonts } = await import("pdf-lib");
      const doc = await PDFDocument.create();
      doc.setTitle(title.slice(0, 200) || "Document");
      doc.setCreator("Bluebird");
      doc.setProducer("Bluebird Text to PDF");
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const [pw, ph] = PAGE_DIMS[size];
      const usableW = pw - margin * 2;
      const lineHeight = fontSize * 1.35;

      // Word-wrap each source line
      const sourceLines = text.replace(/\t/g, "    ").split(/\r?\n/);
      const wrapped: string[] = [];
      for (const src of sourceLines) {
        if (src === "") { wrapped.push(""); continue; }
        const words = src.split(/(\s+)/);
        let cur = "";
        for (const w of words) {
          const test = cur + w;
          const width = font.widthOfTextAtSize(test, fontSize);
          if (width <= usableW) { cur = test; continue; }
          if (cur.trim()) wrapped.push(cur.trimEnd());
          // hard-wrap super-long token
          if (font.widthOfTextAtSize(w, fontSize) > usableW) {
            let chunk = "";
            for (const ch of w) {
              if (font.widthOfTextAtSize(chunk + ch, fontSize) > usableW) {
                wrapped.push(chunk);
                chunk = ch;
              } else chunk += ch;
            }
            cur = chunk;
          } else {
            cur = w.trimStart();
          }
        }
        wrapped.push(cur);
      }

      let page = doc.addPage([pw, ph]);
      let y = ph - margin;
      let pageCount = 1;
      for (const line of wrapped) {
        if (y - lineHeight < margin) {
          page = doc.addPage([pw, ph]);
          pageCount++;
          y = ph - margin;
        }
        // Strip control chars Helvetica can't render
        const safe = line.replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, "?");
        page.drawText(safe, { x: margin, y: y - fontSize, size: fontSize, font });
        y -= lineHeight;
      }
      const bytes = await doc.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      if (outUrl) URL.revokeObjectURL(outUrl);
      setOutUrl(URL.createObjectURL(blob));
      setPages(pageCount);
    } catch (e) {
      console.error(e);
      setErr(e instanceof Error ? e.message : "Could not build the PDF.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    if (outUrl) URL.revokeObjectURL(outUrl);
    setOutUrl(null); setPages(0); setErr(null);
  }

  return (
    <ToolLayout slug="text-to-pdf">
      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-5 self-start">
          <div>
            <div className="eyebrow mb-2">Page size</div>
            <div role="radiogroup" aria-label="Page size" className="grid grid-cols-3 p-1 rounded-xl bg-muted">
              {(["A4", "Letter", "Legal"] as const).map((s) => (
                <button
                  key={s}
                  role="radio"
                  aria-checked={size === s}
                  onClick={() => setSize(s)}
                  className={`min-h-10 px-2 rounded-lg text-sm font-medium ${size === s ? "bg-card shadow-soft text-foreground" : "text-muted-foreground"}`}
                >{s}</button>
              ))}
            </div>
          </div>

          <Field label="Document title" hint="Saved into the PDF metadata.">
            <input
              value={title}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full min-h-11 rounded-xl border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>

          <Field label={`Font size · ${fontSize} pt`}>
            <input
              type="range" min={9} max={24} value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full"
            />
          </Field>

          <Field label={`Margin · ${margin} pt`}>
            <input
              type="range" min={24} max={120} value={margin}
              onChange={(e) => setMargin(Number(e.target.value))}
              className="w-full"
            />
          </Field>

          <RunButton onClick={run} busy={busy} disabled={!text.trim()} label="Make PDF" />
          {err && <WarnBox>{err}</WarnBox>}
        </section>

        <section className="space-y-4 min-w-0">
          <div className="soft-card p-5 sm:p-6 min-w-0">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <FileType className="size-4 text-primary" />
                <div className="font-display text-lg">Your text</div>
              </div>
              <div className="text-xs text-muted-foreground num">{stats.words} words · {stats.chars} chars · {stats.lines} lines</div>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your text here…"
              className="w-full min-h-[420px] rounded-xl border border-border bg-card p-4 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {outUrl && (
            <div className="soft-card p-5 sm:p-6 animate-[pop_.35s_cubic-bezier(0.22,1,0.36,1)_both]">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="font-display text-lg">PDF ready</div>
                <span className="text-xs text-muted-foreground num">{pages} page{pages === 1 ? "" : "s"} · {size}</span>
              </div>
              <iframe title="PDF preview" src={outUrl} className="w-full h-[420px] rounded-xl border border-border bg-card" />
              <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                <a
                  href={outUrl}
                  download={`${(title || "document").replace(/[^a-z0-9-_]+/gi, "-").toLowerCase()}.pdf`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3.5 font-semibold min-h-12 hover:shadow-lift hover:-translate-y-0.5"
                >
                  <Download className="size-4" /> Download PDF
                </a>
                <button onClick={reset} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-medium min-h-12 hover:bg-primary-soft">
                  <RotateCcw className="size-4" /> Reset
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      <HowItWorks>
        <li>Paste your text — anything from a paragraph to a long article.</li>
        <li>Pick a page size, margin and font size. Defaults work for most documents.</li>
        <li>Press Make PDF and download. The PDF is built right here in your browser.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
