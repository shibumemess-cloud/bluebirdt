import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ShieldCheck, Upload, FileText, Loader2, Download } from "lucide-react";
import JSZip from "jszip";
import { ToolLayout, formatBytes } from "../components/ToolLayout";

export const Route = createFileRoute("/pdf-split")({
  head: () => ({
    meta: [
      { title: "Split PDF Online — Extract Pages Free, No Upload" },
      { name: "description", content: "Split a PDF into single pages or extract a range like 1-3,7. Runs in your browser — free, private, no watermark." },
      { property: "og:title", content: "PDF Split — Bluebird" },
      { property: "og:description", content: "Split or extract pages from a PDF in your browser. Free, private, no signup." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/pdf-split" },
    ],
    links: [{ rel: "canonical", href: "/pdf-split" }],
  }),
  component: Page,
});

type Mode = "every" | "range";

export function parseRange(input: string, total: number): number[] {
  const out = new Set<number>();
  const parts = input.split(",").map((s) => s.trim()).filter(Boolean);
  for (const p of parts) {
    const m = p.match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) {
      const a = Math.max(1, Math.min(total, Number(m[1])));
      const b = Math.max(1, Math.min(total, Number(m[2])));
      const [lo, hi] = a <= b ? [a, b] : [b, a];
      for (let i = lo; i <= hi; i++) out.add(i);
    } else if (/^\d+$/.test(p)) {
      const n = Number(p);
      if (n >= 1 && n <= total) out.add(n);
    }
  }
  return [...out].sort((a, b) => a - b);
}

function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState<Mode>("every");
  const [range, setRange] = useState("1-1");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFile(f: File | null) {
    setError(null);
    setFile(null);
    setPageCount(0);
    if (!f) return;
    if (f.type !== "application/pdf" && !/\.pdf$/i.test(f.name)) {
      setError("Please choose a PDF file.");
      return;
    }
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await f.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      setFile(f);
      setPageCount(doc.getPageCount());
      setRange(`1-${doc.getPageCount()}`);
    } catch (e) {
      setError((e as Error).message || "Could not read this PDF.");
    }
  }

  async function run() {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const total = src.getPageCount();
      const baseName = file.name.replace(/\.pdf$/i, "");

      if (mode === "every") {
        const zip = new JSZip();
        for (let i = 0; i < total; i++) {
          const out = await PDFDocument.create();
          const [pg] = await out.copyPages(src, [i]);
          out.addPage(pg);
          const buf = await out.save();
          zip.file(`${baseName}-page-${String(i + 1).padStart(3, "0")}.pdf`, buf);
        }
        const blob = await zip.generateAsync({ type: "blob" });
        triggerDownload(blob, `${baseName}-pages.zip`);
      } else {
        const pages = parseRange(range, total);
        if (pages.length === 0) {
          setError("That page range doesn't match any pages in this PDF.");
          return;
        }
        const out = await PDFDocument.create();
        const copied = await out.copyPages(src, pages.map((n) => n - 1));
        copied.forEach((p) => out.addPage(p));
        const buf = await out.save();
        const blob = new Blob([buf as BlobPart], { type: "application/pdf" });
        triggerDownload(blob, `${baseName}-extract.pdf`);
      }
    } catch (e) {
      setError((e as Error).message || "Something went wrong while splitting.");
    } finally {
      setBusy(false);
    }
  }

  function triggerDownload(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  return (
    <ToolLayout slug="pdf-split">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 lg:col-span-7 space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) onFile(f);
            }}
            className="soft-card border-2 border-dashed border-border hover:border-primary/60 p-8 text-center"
          >
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              hidden
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 min-h-12 px-5 rounded-xl bg-primary text-primary-foreground font-semibold"
            >
              <Upload className="size-4" /> Choose a PDF
            </button>
            <p className="mt-3 text-sm text-muted-foreground">or drop one here</p>
          </div>

          {file && (
            <div className="soft-card p-4 flex items-center gap-3">
              <div className="size-12 rounded-lg bg-primary-soft text-primary grid place-items-center shrink-0">
                <FileText className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{file.name}</div>
                <div className="text-xs text-muted-foreground">
                  {pageCount} page{pageCount === 1 ? "" : "s"} · {formatBytes(file.size)}
                </div>
              </div>
            </div>
          )}
        </div>

        <aside className="col-span-12 lg:col-span-5 space-y-4">
          <div className="soft-card p-5 space-y-4">
            <div>
              <div className="text-sm font-semibold mb-2">Split mode</div>
              <div role="radiogroup" className="grid grid-cols-2 gap-2">
                {(["every", "range"] as Mode[]).map((m) => (
                  <button
                    key={m}
                    role="radio"
                    aria-checked={mode === m}
                    onClick={() => setMode(m)}
                    className={[
                      "min-h-11 rounded-xl border px-3 text-sm font-medium",
                      mode === m ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/60",
                    ].join(" ")}
                  >
                    {m === "every" ? "Every page" : "Page range"}
                  </button>
                ))}
              </div>
            </div>

            {mode === "range" && (
              <div>
                <label htmlFor="rng" className="text-sm font-semibold">Pages</label>
                <input
                  id="rng"
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  placeholder="e.g. 1-3,7,10-12"
                  className="mt-2 w-full min-h-11 rounded-xl border border-border bg-card px-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Use commas for separate pages, dashes for ranges.
                </p>
              </div>
            )}

            <button
              onClick={run}
              disabled={busy || !file}
              className="w-full min-h-12 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-50"
            >
              {busy ? (
                <span className="inline-flex items-center gap-2"><Loader2 className="size-4 animate-spin" /> Working…</span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Download className="size-4" />
                  {mode === "every" ? "Split & download ZIP" : "Extract & download"}
                </span>
              )}
            </button>
            {error && <div className="text-sm text-destructive">{error}</div>}
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-border bg-primary-soft/40 px-4 py-3 text-sm">
            <ShieldCheck className="size-5 text-primary shrink-0 mt-0.5" />
            <p className="text-muted-foreground">
              The PDF is parsed and re-saved entirely in your browser. No file is uploaded.
            </p>
          </div>
        </aside>
      </div>
    </ToolLayout>
  );
}
