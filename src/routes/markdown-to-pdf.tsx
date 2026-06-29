import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { FileType, Download, RotateCcw } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks, Field, WarnBox, RunButton } from "../components/ToolControls";

export const Route = createFileRoute("/markdown-to-pdf")({
  head: () => ({
    meta: [
      { title: "Markdown to PDF — Free Online MD to PDF Converter" },
      { name: "description", content: "Convert Markdown to a clean, paginated PDF. Headings, lists, code, quotes and rules — all rendered in your browser. No upload." },
      { property: "og:title", content: "Markdown to PDF — Bluebird" },
      { property: "og:description", content: "Turn Markdown into a printable PDF in seconds. Free, private, in-browser." },
      { property: "og:url", content: "/markdown-to-pdf" },
    ],
    links: [{ rel: "canonical", href: "/markdown-to-pdf" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird Markdown to PDF",
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

const SAMPLE = `# Bluebird Notes

A quick way to turn **Markdown** into a printable PDF.

## What it handles

- Headings (H1 – H4)
- **Bold** and *italic* text
- Numbered lists
- Inline \`code\` and code blocks
- > Blockquotes
- Horizontal rules

\`\`\`
function hello() {
  return "world";
}
\`\`\`

---

Made with care in your browser. Nothing leaves your device.`;

const PREF_KEY = "bb-md-pdf-v1";

function Page() {
  const [text, setText] = useState(SAMPLE);
  const [size, setSize] = useState<PageSize>("A4");
  const [margin, setMargin] = useState(54);
  const [fontSize, setFontSize] = useState(11);
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
        if (typeof p.margin === "number") setMargin(Math.max(24, Math.min(120, p.margin)));
        if (typeof p.fontSize === "number") setFontSize(Math.max(9, Math.min(18, p.fontSize)));
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
    lines: text.split(/\r?\n/).length,
  }), [text]);

  async function run() {
    setErr(null);
    if (!text.trim()) { setErr("Type or paste some Markdown first."); return; }
    if (text.length > 500_000) { setErr("Document is too large. Please keep it under ~500,000 characters."); return; }
    setBusy(true);
    try {
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
      const { marked } = await import("marked");

      const doc = await PDFDocument.create();
      doc.setTitle(title.slice(0, 200) || "Document");
      doc.setCreator("Bluebird");
      doc.setProducer("Bluebird Markdown to PDF");

      const reg = await doc.embedFont(StandardFonts.Helvetica);
      const bold = await doc.embedFont(StandardFonts.HelveticaBold);
      const italic = await doc.embedFont(StandardFonts.HelveticaOblique);
      const boldIt = await doc.embedFont(StandardFonts.HelveticaBoldOblique);
      const mono = await doc.embedFont(StandardFonts.Courier);

      const [pw, ph] = PAGE_DIMS[size];
      const usableW = pw - margin * 2;
      const sanitize = (s: string) => s.replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, "?");

      let page = doc.addPage([pw, ph]);
      let y = ph - margin;
      let pageCount = 1;

      function ensureSpace(needed: number) {
        if (y - needed < margin) {
          page = doc.addPage([pw, ph]);
          pageCount++;
          y = ph - margin;
        }
      }

      // Inline tokens → array of styled runs
      type Run = { text: string; bold: boolean; italic: boolean; code: boolean };
      function runsFromInline(tokens: Array<{ type: string; text?: string; tokens?: unknown[] }>): Run[] {
        const out: Run[] = [];
        const walk = (toks: Array<{ type: string; text?: string; tokens?: unknown[] }>, b: boolean, i: boolean, c: boolean) => {
          for (const t of toks) {
            if (t.type === "strong") walk((t.tokens ?? []) as typeof toks, true, i, c);
            else if (t.type === "em") walk((t.tokens ?? []) as typeof toks, b, true, c);
            else if (t.type === "codespan") out.push({ text: t.text ?? "", bold: b, italic: i, code: true });
            else if (t.type === "br") out.push({ text: "\n", bold: b, italic: i, code: c });
            else if (t.tokens) walk(t.tokens as typeof toks, b, i, c);
            else out.push({ text: t.text ?? "", bold: b, italic: i, code: c });
          }
        };
        walk(tokens, false, false, false);
        return out;
      }

      function pickFont(r: Run) {
        if (r.code) return mono;
        if (r.bold && r.italic) return boldIt;
        if (r.bold) return bold;
        if (r.italic) return italic;
        return reg;
      }

      function drawRuns(runs: Run[], fs: number, indent: number) {
        const lineHeight = fs * 1.45;
        let lineX = margin + indent;
        const maxX = margin + usableW;
        ensureSpace(lineHeight);

        const writeWord = (w: string, font: ReturnType<typeof pickFont>) => {
          if (!w) return;
          const safe = sanitize(w);
          const width = font.widthOfTextAtSize(safe, fs);
          if (lineX + width > maxX && lineX > margin + indent) {
            y -= lineHeight;
            ensureSpace(lineHeight);
            lineX = margin + indent;
          }
          page.drawText(safe, { x: lineX, y: y - fs, size: fs, font, color: rgb(0.08, 0.1, 0.16) });
          lineX += width;
        };

        for (const r of runs) {
          const font = pickFont(r);
          const parts = r.text.split(/(\s+|\n)/);
          for (const p of parts) {
            if (p === "") continue;
            if (p === "\n") {
              y -= lineHeight;
              ensureSpace(lineHeight);
              lineX = margin + indent;
              continue;
            }
            writeWord(p, font);
          }
        }
        y -= lineHeight;
      }

      const tokens = marked.lexer(text);

      const renderList = (items: Array<{ tokens?: unknown[]; text?: string }>, ordered: boolean, depth: number) => {
        items.forEach((it, idx) => {
          const bullet = ordered ? `${idx + 1}. ` : "• ";
          const inline = ((it.tokens ?? []) as Array<{ type: string; tokens?: unknown[]; text?: string }>)
            .filter((t) => t.type !== "list");
          const runs: Run[] = [{ text: bullet, bold: false, italic: false, code: false }, ...runsFromInline(inline as Parameters<typeof runsFromInline>[0])];
          drawRuns(runs, fontSize, depth * 16);
          const nested = ((it.tokens ?? []) as Array<{ type: string; items?: typeof items; ordered?: boolean }>)
            .find((t) => t.type === "list");
          if (nested?.items) renderList(nested.items, !!nested.ordered, depth + 1);
        });
      };

      for (const tok of tokens) {
        const t = tok as { type: string; depth?: number; tokens?: unknown[]; text?: string; items?: unknown[]; ordered?: boolean; raw?: string };
        if (t.type === "heading") {
          const sizes = [0, fontSize * 2.2, fontSize * 1.7, fontSize * 1.35, fontSize * 1.15];
          const fs = sizes[Math.min(4, t.depth ?? 1)];
          ensureSpace(fs * 1.6);
          y -= fs * 0.4;
          drawRuns(
            runsFromInline(((t.tokens ?? []) as Parameters<typeof runsFromInline>[0])).map((r) => ({ ...r, bold: true })),
            fs,
            0
          );
          y -= fs * 0.2;
        } else if (t.type === "paragraph") {
          drawRuns(runsFromInline((t.tokens ?? []) as Parameters<typeof runsFromInline>[0]), fontSize, 0);
          y -= fontSize * 0.4;
        } else if (t.type === "list") {
          renderList((t.items ?? []) as Array<{ tokens?: unknown[]; text?: string }>, !!t.ordered, 0);
          y -= fontSize * 0.4;
        } else if (t.type === "blockquote") {
          drawRuns(
            runsFromInline(((t.tokens ?? []) as Parameters<typeof runsFromInline>[0])).map((r) => ({ ...r, italic: true })),
            fontSize,
            18
          );
          y -= fontSize * 0.4;
        } else if (t.type === "code") {
          const lh = fontSize * 1.35;
          const lines = (t.text ?? "").split(/\r?\n/);
          for (const line of lines) {
            ensureSpace(lh);
            page.drawText(sanitize(line), { x: margin + 6, y: y - fontSize, size: fontSize * 0.92, font: mono, color: rgb(0.15, 0.2, 0.35) });
            y -= lh;
          }
          y -= fontSize * 0.4;
        } else if (t.type === "hr") {
          ensureSpace(fontSize);
          page.drawLine({ start: { x: margin, y: y - 4 }, end: { x: margin + usableW, y: y - 4 }, thickness: 0.6, color: rgb(0.78, 0.83, 0.92) });
          y -= fontSize * 1.2;
        } else if (t.type === "space") {
          y -= fontSize * 0.6;
        }
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
    <ToolLayout slug="markdown-to-pdf">
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

          <Field label={`Body font · ${fontSize} pt`}>
            <input type="range" min={9} max={18} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full" />
          </Field>

          <Field label={`Margin · ${margin} pt`}>
            <input type="range" min={24} max={120} value={margin} onChange={(e) => setMargin(Number(e.target.value))} className="w-full" />
          </Field>

          <RunButton onClick={run} busy={busy} disabled={!text.trim()} label="Make PDF" />
          {err && <WarnBox>{err}</WarnBox>}
        </section>

        <section className="space-y-4 min-w-0">
          <div className="soft-card p-5 sm:p-6 min-w-0">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <FileType className="size-4 text-primary" />
                <div className="font-display text-lg">Your Markdown</div>
              </div>
              <div className="text-xs text-muted-foreground num">{stats.chars} chars · {stats.lines} lines</div>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="# Type or paste Markdown here…"
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
        <li>Paste or type Markdown — headings, lists, code and quotes are all supported.</li>
        <li>Pick a page size and tweak the font or margin if you'd like.</li>
        <li>Press Make PDF and download. Nothing ever leaves your browser.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
