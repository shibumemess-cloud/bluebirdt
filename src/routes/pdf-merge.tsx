import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { ShieldCheck, Upload, X, ArrowUp, ArrowDown, FileText, Loader2, Download } from "lucide-react";
import { ToolLayout, formatBytes } from "../components/ToolLayout";

export const Route = createFileRoute("/pdf-merge")({
  head: () => ({
    meta: [
      { title: "Merge PDFs Online — Free, No Upload, No Watermark" },
      { name: "description", content: "Combine PDF files into one in your browser. Reorder pages, drag and drop, free forever. No upload, no signup, no watermark." },
      { property: "og:title", content: "PDF Merge — Bluebird" },
      { property: "og:description", content: "Merge multiple PDFs into one in your browser. Private, free, watermark-free." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/pdf-merge" },
    ],
    links: [{ rel: "canonical", href: "/pdf-merge" }],
  }),
  component: Page,
});

type Item = { id: string; file: File };

function Page() {
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: FileList | File[]) => {
    const next: Item[] = [];
    for (const f of Array.from(files)) {
      if (f.type !== "application/pdf" && !/\.pdf$/i.test(f.name)) continue;
      if (f.size > 100 * 1024 * 1024) continue;
      next.push({ id: `${f.name}-${f.size}-${Math.random().toString(36).slice(2, 7)}`, file: f });
    }
    if (next.length) setItems((p) => [...p, ...next]);
  }, []);

  function move(id: string, dir: -1 | 1) {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      const target = idx + dir;
      if (idx < 0 || target < 0 || target >= prev.length) return prev;
      const copy = prev.slice();
      [copy[idx], copy[target]] = [copy[target], copy[idx]];
      return copy;
    });
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }

  async function merge() {
    setError(null);
    if (items.length < 2) {
      setError("Add at least two PDFs to merge.");
      return;
    }
    setBusy(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const merged = await PDFDocument.create();
      for (const item of items) {
        const bytes = await item.file.arrayBuffer();
        const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      const out = await merged.save();
      const blob = new Blob([out as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "bluebird-merged.pdf";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch (e) {
      setError((e as Error).message || "Something went wrong while merging.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolLayout slug="pdf-merge">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 lg:col-span-7 space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
            }}
            className="soft-card border-2 border-dashed border-border hover:border-primary/60 p-8 text-center"
          >
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              multiple
              hidden
              onChange={(e) => e.target.files && addFiles(e.target.files)}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 min-h-12 px-5 rounded-xl bg-primary text-primary-foreground font-semibold"
            >
              <Upload className="size-4" /> Choose PDFs
            </button>
            <p className="mt-3 text-sm text-muted-foreground">or drop them here · up to 100 MB each</p>
          </div>

          {items.length === 0 ? (
            <div className="soft-card p-8 text-center text-sm text-muted-foreground">
              <FileText className="size-8 mx-auto mb-2 opacity-50" />
              Your PDFs appear here in the order they will be combined.
            </div>
          ) : (
            <ol className="space-y-2">
              {items.map((it, idx) => (
                <li key={it.id} className="soft-card p-3 flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground w-6 text-center shrink-0">{idx + 1}</span>
                  <div className="size-10 rounded-lg bg-primary-soft text-primary grid place-items-center shrink-0">
                    <FileText className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{it.file.name}</div>
                    <div className="text-xs text-muted-foreground">{formatBytes(it.file.size)}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      aria-label="Move up"
                      onClick={() => move(it.id, -1)}
                      disabled={idx === 0}
                      className="size-9 grid place-items-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary-soft disabled:opacity-30"
                    >
                      <ArrowUp className="size-4" />
                    </button>
                    <button
                      aria-label="Move down"
                      onClick={() => move(it.id, 1)}
                      disabled={idx === items.length - 1}
                      className="size-9 grid place-items-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary-soft disabled:opacity-30"
                    >
                      <ArrowDown className="size-4" />
                    </button>
                    <button
                      aria-label="Remove"
                      onClick={() => remove(it.id)}
                      className="size-9 grid place-items-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        <aside className="col-span-12 lg:col-span-5 space-y-4">
          <div className="soft-card p-5 space-y-4">
            <div>
              <div className="text-sm font-semibold">Ready to combine</div>
              <p className="text-sm text-muted-foreground mt-1">
                {items.length === 0
                  ? "Add two or more PDFs to start."
                  : `${items.length} file${items.length === 1 ? "" : "s"} queued. Pages keep their original quality.`}
              </p>
            </div>
            <button
              onClick={merge}
              disabled={busy || items.length < 2}
              className="w-full min-h-12 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-50"
            >
              {busy ? (
                <span className="inline-flex items-center gap-2"><Loader2 className="size-4 animate-spin" /> Merging…</span>
              ) : (
                <span className="inline-flex items-center gap-2"><Download className="size-4" /> Merge &amp; download</span>
              )}
            </button>
            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-border bg-primary-soft/40 px-4 py-3 text-sm">
            <ShieldCheck className="size-5 text-primary shrink-0 mt-0.5" />
            <p className="text-muted-foreground">
              Your PDFs are merged inside this browser tab. No watermark added, no file ever uploaded.
            </p>
          </div>
        </aside>
      </div>
    </ToolLayout>
  );
}
