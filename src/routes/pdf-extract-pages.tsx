import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, Download, RotateCcw, FilePlus2 } from "lucide-react";
import { ToolLayout, formatBytes } from "../components/ToolLayout";
import { FileDrop, HowItWorks, WarnBox, RunButton, Field } from "../components/ToolControls";
import { parsePageRange } from "../lib/image-tool-helpers";

export const Route = createFileRoute("/pdf-extract-pages")({
  head: () => ({
    meta: [
      { title: "Extract PDF Pages — Free Online PDF Page Picker" },
      { name: "description", content: "Pull specific pages out of a PDF into a new, smaller PDF. Pick any range like 1-3,7 and save. Free, private, in-browser." },
      { property: "og:title", content: "Extract PDF Pages — Bluebird" },
      { property: "og:description", content: "Save just the PDF pages you need. No upload, no sign-up." },
      { property: "og:url", content: "/pdf-extract-pages" },
    ],
    links: [{ rel: "canonical", href: "/pdf-extract-pages" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird Extract PDF Pages",
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: Page,
});

function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [range, setRange] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [kept, setKept] = useState<number | null>(null);

  useEffect(() => () => { if (outUrl) URL.revokeObjectURL(outUrl); }, [outUrl]);
  useEffect(() => {
    setOutUrl(null); setPageCount(null); setErr(null); setKept(null);
    if (!file) return;
    (async () => {
      try {
        const { PDFDocument } = await import("pdf-lib");
        const bytes = await file.arrayBuffer();
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        setPageCount(doc.getPageCount());
      } catch (e) {
        console.error(e);
        setErr("Could not read that PDF. It may be encrypted or damaged.");
      }
    })();
  }, [file]);

  async function run() {
    setErr(null); setKept(null);
    if (!file) { setErr("Choose a PDF first."); return; }
    if (!range.trim()) { setErr("Type which pages to keep, e.g. 1-3,7."); return; }
    if (file.size > 80 * 1024 * 1024) { setErr("That PDF is over 80 MB. Try a smaller file."); return; }
    setBusy(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const total = src.getPageCount();
      const targets = parsePageRange(range, total);
      if (!targets.length) { setErr("That page range doesn't match any pages."); setBusy(false); return; }
      const out = await PDFDocument.create();
      const copied = await out.copyPages(src, targets.map((n) => n - 1));
      copied.forEach((p) => out.addPage(p));
      const bytesOut = await out.save();
      const blob = new Blob([bytesOut.buffer as ArrayBuffer], { type: "application/pdf" });
      if (outUrl) URL.revokeObjectURL(outUrl);
      setOutUrl(URL.createObjectURL(blob));
      setKept(targets.length);
    } catch (e) {
      console.error(e);
      setErr(e instanceof Error ? e.message : "Could not extract pages.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    if (outUrl) URL.revokeObjectURL(outUrl);
    setOutUrl(null); setErr(null); setFile(null); setPageCount(null); setRange(""); setKept(null);
  }

  return (
    <ToolLayout slug="pdf-extract-pages">
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

          <Field label="Pages to keep" hint="e.g. 1-3,7,10-12">
            <input
              value={range}
              onChange={(e) => setRange(e.target.value)}
              placeholder="1-3,7"
              className="w-full min-h-12 rounded-xl border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>

          <RunButton onClick={run} busy={busy} disabled={!file} label="Extract pages" />
          {err && <WarnBox>{err}</WarnBox>}
        </section>

        <section className="space-y-4 min-w-0">
          {outUrl ? (
            <div className="soft-card p-5 sm:p-6 animate-[pop_.35s_cubic-bezier(0.22,1,0.36,1)_both]">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="font-display text-lg">New PDF ready</div>
                {kept !== null && (
                  <span className="text-xs text-muted-foreground">
                    {kept} page{kept === 1 ? "" : "s"} kept
                  </span>
                )}
              </div>
              <iframe title="PDF preview" src={outUrl} className="w-full h-[480px] rounded-xl border border-border bg-card" />
              <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                <a
                  href={outUrl}
                  download={`${(file?.name ?? "document").replace(/\.pdf$/i, "")}-pages.pdf`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3.5 font-semibold min-h-12 hover:shadow-lift hover:-translate-y-0.5"
                >
                  <Download className="size-4" /> Download PDF
                </a>
                <button onClick={reset} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-medium min-h-12 hover:bg-primary-soft">
                  <RotateCcw className="size-4" /> Reset
                </button>
              </div>
            </div>
          ) : (
            <div className="soft-card p-8 text-center text-sm text-muted-foreground">
              <FilePlus2 className="mx-auto size-10 text-primary mb-3" />
              Drop a PDF on the left, list the pages to keep, and a fresh PDF will appear here.
            </div>
          )}
        </section>
      </div>

      <HowItWorks>
        <li>Drop a PDF — it stays on your device.</li>
        <li>Type the pages you want to keep. Use ranges like 1-3 and commas for lists.</li>
        <li>Press Extract pages and download a fresh, smaller PDF.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
