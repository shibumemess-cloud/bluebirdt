import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, Download, RotateCcw, Copy, Check } from "lucide-react";
import { ToolLayout, formatBytes } from "../components/ToolLayout";
import { FileDrop, HowItWorks, WarnBox, RunButton, Field, ProgressBar } from "../components/ToolControls";
import { parsePageRange } from "../lib/image-tool-helpers";

export const Route = createFileRoute("/pdf-extract-text")({
  head: () => ({
    meta: [
      { title: "PDF to Text — Free Online PDF Text Extractor" },
      { name: "description", content: "Pull clean, copyable text out of any PDF. Pick all pages or a custom range. Free, in-browser, no upload, no sign-up." },
      { property: "og:title", content: "PDF to Text — Bluebird" },
      { property: "og:description", content: "Extract text from a PDF in your browser. Copy or download as .txt." },
      { property: "og:url", content: "/pdf-extract-text" },
    ],
    links: [{ rel: "canonical", href: "/pdf-extract-text" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird PDF Text Extractor",
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: Page,
});

async function loadPdfJs() {
  const mod = await import("pdfjs-dist");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  mod.GlobalWorkerOptions.workerSrc = workerUrl;
  return mod;
}

function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [scope, setScope] = useState<"all" | "range">("all");
  const [range, setRange] = useState("1-");
  const [pageBreaks, setPageBreaks] = useState(true);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setText(""); setErr(null); setPageCount(null);
    if (!file) return;
    (async () => {
      try {
        const pdfjs = await loadPdfJs();
        const buf = await file.arrayBuffer();
        const doc = await pdfjs.getDocument({ data: buf }).promise;
        setPageCount(doc.numPages);
      } catch (e) {
        console.error(e);
        setErr("Could not open that PDF.");
      }
    })();
  }, [file]);

  async function run() {
    setErr(null); setText("");
    if (!file) { setErr("Choose a PDF first."); return; }
    if (file.size > 80 * 1024 * 1024) { setErr("That PDF is over 80 MB. Try a smaller file."); return; }
    setBusy(true); setProgress(0);
    try {
      const pdfjs = await loadPdfJs();
      const buf = await file.arrayBuffer();
      const doc = await pdfjs.getDocument({ data: buf }).promise;
      const total = doc.numPages;
      const targets = scope === "all"
        ? Array.from({ length: total }, (_, i) => i + 1)
        : parsePageRange(range, total);
      if (!targets.length) { setErr("That page range doesn't match any pages."); setBusy(false); return; }

      const parts: string[] = [];
      for (let idx = 0; idx < targets.length; idx++) {
        const n = targets[idx];
        const page = await doc.getPage(n);
        const content = await page.getTextContent();
        // Reassemble lines by Y position
        type Item = { str: string; transform: number[] };
        const items = (content.items as Item[]).filter((i) => "str" in i);
        let lastY: number | null = null;
        let line = "";
        const lines: string[] = [];
        for (const it of items) {
          const y = Math.round(it.transform[5]);
          if (lastY !== null && Math.abs(y - lastY) > 2) {
            lines.push(line.trimEnd());
            line = "";
          }
          line += it.str;
          lastY = y;
        }
        if (line) lines.push(line.trimEnd());
        const pageText = lines.join("\n").replace(/[ \t]+\n/g, "\n").trim();
        if (pageBreaks) parts.push(`── Page ${n} ──\n${pageText}`);
        else parts.push(pageText);
        setProgress(Math.round(((idx + 1) / targets.length) * 100));
      }
      setText(parts.join("\n\n"));
    } catch (e) {
      console.error(e);
      setErr(e instanceof Error ? e.message : "Could not extract text.");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  function download() {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(file?.name ?? "document").replace(/\.pdf$/i, "")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function reset() {
    setFile(null); setText(""); setErr(null); setPageCount(null); setProgress(0);
  }

  const words = text ? text.trim().split(/\s+/).length : 0;

  return (
    <ToolLayout slug="pdf-extract-text">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-5">
          <FileDrop
            file={file}
            onFile={setFile}
            accept="application/pdf"
            label="Drop a PDF here, or click to choose one"
            hint="PDF — up to 80 MB"
          />

          {pageCount !== null && (
            <div className="text-sm text-muted-foreground">
              {pageCount} page{pageCount === 1 ? "" : "s"} · {file && formatBytes(file.size)}
            </div>
          )}

          <div>
            <div className="eyebrow mb-2">Which pages</div>
            <div role="radiogroup" className="grid grid-cols-2 gap-2">
              {(["all", "range"] as const).map((s) => (
                <button
                  key={s}
                  role="radio"
                  aria-checked={scope === s}
                  onClick={() => setScope(s)}
                  className={`min-h-11 rounded-xl border px-3 text-sm ${scope === s ? "border-primary bg-primary-soft" : "border-border bg-card hover:bg-primary-soft"}`}
                >
                  {s === "all" ? "All pages" : "Custom range"}
                </button>
              ))}
            </div>
          </div>

          {scope === "range" && (
            <Field label="Page range" hint="e.g. 1-3,7,10-12">
              <input
                value={range}
                onChange={(e) => setRange(e.target.value)}
                placeholder="1-3,7"
                className="w-full min-h-11 rounded-xl border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>
          )}

          <label className="flex items-center gap-2 min-h-11 rounded-xl border border-border bg-card px-3 text-sm cursor-pointer">
            <input type="checkbox" checked={pageBreaks} onChange={(e) => setPageBreaks(e.target.checked)} className="size-4 accent-primary" />
            Add page-break markers
          </label>

          <RunButton onClick={run} busy={busy} disabled={!file} label="Extract text" />
          {busy && <ProgressBar value={progress} label="Extracting pages" />}
          {err && <WarnBox>{err}</WarnBox>}
        </section>

        <section className="soft-card p-5 sm:p-6 space-y-4 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              <div className="font-display text-lg">Extracted text</div>
            </div>
            <div className="text-xs text-muted-foreground" aria-live="polite">
              {text ? `${words.toLocaleString()} words` : ""}
            </div>
          </div>
          {!text ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Your text will appear here after extracting.
            </div>
          ) : (
            <>
              <textarea readOnly value={text} className="w-full min-h-[420px] rounded-xl border border-border bg-card p-3 font-mono text-sm" />
              <div className="flex flex-wrap gap-2">
                <button onClick={copy} className="inline-flex items-center gap-2 min-h-11 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-95">
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {copied ? "Copied" : "Copy all"}
                </button>
                <button onClick={download} className="inline-flex items-center gap-2 min-h-11 px-4 rounded-xl border border-border bg-card hover:bg-primary-soft text-sm font-medium">
                  <Download className="size-4" /> Download .txt
                </button>
                <button onClick={reset} className="inline-flex items-center gap-2 min-h-11 px-4 rounded-xl border border-border bg-card hover:bg-primary-soft text-sm font-medium">
                  <RotateCcw className="size-4" /> Reset
                </button>
              </div>
            </>
          )}
        </section>
      </div>

      <HowItWorks>
        <li>Drop a PDF — it never leaves your browser.</li>
        <li>Pick all pages or just a range like 1-3,7.</li>
        <li>Copy the extracted text or save it as a .txt file.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
