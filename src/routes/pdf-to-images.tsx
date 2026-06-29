import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import {
  Download,
  FileText,
  CheckSquare,
  Square,
  Loader2,
  ListChecks,
  Repeat2,
  Hash,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";
import { ToolLayout, formatBytes } from "../components/ToolLayout";
import { Field, ErrorBox, RunButton, EmptyState, HowItWorks, ProgressBar } from "../components/ToolControls";
import { dpiToScale, pageFileName, parsePageRange } from "../lib/image-tool-helpers";
import ogImage from "../assets/og/og-pdf-to-images.jpg";

// Lazy-load pdf.js so SSR / prerender stays clean.
async function loadPdfJs() {
  const mod = await import("pdfjs-dist");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  mod.GlobalWorkerOptions.workerSrc = workerUrl;
  return mod;
}

export const Route = createFileRoute("/pdf-to-images")({
  head: () => ({
    meta: [
      { title: "PDF to Images — Free PDF to PNG, JPG and WebP" },
      {
        name: "description",
        content:
          "Turn every page of a PDF into a sharp PNG, JPG or WebP. Pick the pages, pick the resolution. Free, in-browser, no uploads.",
      },
      { property: "og:title", content: "PDF to Images — Bluebird" },
      { property: "og:description", content: "Convert PDF pages to PNG, JPG or WebP in your browser. Free, private, no sign-up." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/pdf-to-images" },
      { property: "og:image", content: ogImage },
      { name: "twitter:image", content: ogImage },
    ],
    links: [{ rel: "canonical", href: "/pdf-to-images" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird PDF to Images",
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          description: "Free in-browser tool to convert PDF pages to PNG, JPG or WebP images.",
        }),
      },
    ],
  }),
  component: Page,
});

type Fmt = "png" | "jpg" | "webp";
type Dpi = 72 | 150 | 300 | 600;
type PageThumb = { num: number; url: string; w: number; h: number };

function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageThumb[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState<number | undefined>(undefined);
  const [rangeInput, setRangeInput] = useState("");

  const [format, setFormat] = useState<Fmt>("png");
  const [dpi, setDpi] = useState<Dpi>(150);
  const [quality, setQuality] = useState(0.92);

  const [busy, setBusy] = useState(false);
  const [exportProgress, setExportProgress] = useState<number | undefined>(undefined);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("pages.zip");
  const [statusMsg, setStatusMsg] = useState("");

  const pdfRef = useRef<unknown | null>(null);
  const pdfNameRef = useRef<string>("document.pdf");

  function reset(keepFile = false) {
    setPages([]); setSelected(new Set()); setError(null);
    setDownloadUrl((u) => { if (u) URL.revokeObjectURL(u); return null; });
    if (!keepFile) { setFile(null); pdfRef.current = null; }
  }

  async function onFile(f: File | null) {
    reset();
    if (!f) return;
    if (!/\.pdf$/i.test(f.name) && f.type !== "application/pdf") {
      setError("Please choose a PDF file.");
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      setError("That PDF is bigger than 50 MB. Try a smaller file.");
      return;
    }
    setFile(f);
    pdfNameRef.current = f.name;
    setLoading(true); setLoadProgress(0);
    try {
      const pdfjs = await loadPdfJs();
      const buf = await f.arrayBuffer();
      const doc = await pdfjs.getDocument({ data: buf }).promise;
      pdfRef.current = doc;
      const total = doc.numPages;
      const out: PageThumb[] = [];
      for (let i = 1; i <= total; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 0.4 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(viewport.width);
        canvas.height = Math.round(viewport.height);
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        const url = canvas.toDataURL("image/jpeg", 0.7);
        out.push({ num: i, url, w: viewport.width, h: viewport.height });
        setPages([...out]);
        setLoadProgress(Math.round((i / total) * 100));
      }
      setSelected(new Set(out.map((p) => p.num)));
      setStatusMsg(`PDF loaded with ${total} page${total === 1 ? "" : "s"}.`);
    } catch {
      setError("Couldn't open that PDF. It may be encrypted or damaged.");
      pdfRef.current = null;
    } finally {
      setLoading(false); setLoadProgress(undefined);
    }
  }

  function toggle(n: number) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(n)) next.delete(n); else next.add(n);
      return next;
    });
  }
  function selectAll() { setSelected(new Set(pages.map((p) => p.num))); }
  function clearAll() { setSelected(new Set()); }
  function invert() {
    setSelected((s) => {
      const next = new Set<number>();
      for (const p of pages) if (!s.has(p.num)) next.add(p.num);
      return next;
    });
  }
  function selectOdd() { setSelected(new Set(pages.filter((p) => p.num % 2 === 1).map((p) => p.num))); }
  function selectEven() { setSelected(new Set(pages.filter((p) => p.num % 2 === 0).map((p) => p.num))); }
  function applyRange() {
    if (!rangeInput.trim() || pages.length === 0) return;
    const nums = parsePageRange(rangeInput, pages.length);
    if (nums.length === 0) {
      setError("Couldn't read that range. Try something like 1-3, 5, 8-10.");
      return;
    }
    setError(null);
    setSelected(new Set(nums));
  }

  // Approximate output dimensions for the first selected page at the chosen DPI
  const firstSelectedPreview = useMemo(() => {
    if (pages.length === 0 || selected.size === 0) return null;
    const first = pages.find((p) => selected.has(p.num));
    if (!first) return null;
    const scale = dpiToScale(dpi);
    return {
      w: Math.round((first.w / 0.4) * scale),
      h: Math.round((first.h / 0.4) * scale),
    };
  }, [pages, selected, dpi]);

  async function exportImages() {
    const doc = pdfRef.current as { getPage: (n: number) => Promise<unknown> } | null;
    if (!doc || selected.size === 0) return;
    setBusy(true); setExportProgress(0); setError(null);
    setDownloadUrl((u) => { if (u) URL.revokeObjectURL(u); return null; });

    try {
      const scale = dpiToScale(dpi);
      const mime = format === "png" ? "image/png" : format === "jpg" ? "image/jpeg" : "image/webp";
      const ext = format;
      const total = selected.size;
      const sortedNums = pages.map((p) => p.num).filter((n) => selected.has(n));

      const results: { name: string; blob: Blob }[] = [];
      let done = 0;
      for (const n of sortedNums) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const page: any = await doc.getPage(n);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(viewport.width);
        canvas.height = Math.round(viewport.height);
        const ctx = canvas.getContext("2d")!;
        if (format === "jpg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        const blob: Blob = await new Promise((res, rej) =>
          canvas.toBlob(
            (b) => (b ? res(b) : rej(new Error("encode"))),
            mime,
            format === "png" ? undefined : quality,
          ),
        );
        results.push({ name: pageFileName(pdfNameRef.current, n, pages.length, ext), blob });
        done += 1;
        setExportProgress(Math.round((done / total) * 100));
      }

      if (results.length === 1) {
        setDownloadUrl(URL.createObjectURL(results[0].blob));
        setDownloadName(results[0].name);
        setStatusMsg(`Page ${sortedNums[0]} ready as ${ext.toUpperCase()}.`);
      } else {
        const zip = new JSZip();
        for (const r of results) zip.file(r.name, r.blob);
        const blob = await zip.generateAsync({ type: "blob" });
        setDownloadUrl(URL.createObjectURL(blob));
        setDownloadName(`${pdfNameRef.current.replace(/\.pdf$/i, "")}-pages.zip`);
        setStatusMsg(`Bundled ${results.length} pages into a zip.`);
      }
    } catch {
      setError("Couldn't export those pages. Try a lower resolution or fewer pages at once.");
    } finally {
      setBusy(false); setExportProgress(undefined);
    }
  }

  // Quick single-page download bypassing the main button
  async function exportSinglePage(num: number) {
    const doc = pdfRef.current as { getPage: (n: number) => Promise<unknown> } | null;
    if (!doc) return;
    try {
      const scale = dpiToScale(dpi);
      const mime = format === "png" ? "image/png" : format === "jpg" ? "image/jpeg" : "image/webp";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const page: any = await doc.getPage(num);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      const ctx = canvas.getContext("2d")!;
      if (format === "jpg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      const blob: Blob = await new Promise((res, rej) =>
        canvas.toBlob((b) => (b ? res(b) : rej(new Error("encode"))), mime, format === "png" ? undefined : quality),
      );
      const u = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = u; a.download = pageFileName(pdfNameRef.current, num, pages.length, format); a.click();
      setTimeout(() => URL.revokeObjectURL(u), 1500);
    } catch {
      setError("Couldn't save that page.");
    }
  }

  useEffect(() => () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
  }, [downloadUrl]);

  const allSelected = pages.length > 0 && selected.size === pages.length;

  return (
    <ToolLayout slug="pdf-to-images">
      {/* Screen-reader-only status for select/load/export events */}
      <p className="sr-only" role="status" aria-live="polite">{statusMsg}</p>

      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 md:col-span-7 space-y-6">
          {/* File drop */}
          {!file ? (
            <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-border bg-card hover:border-primary hover:bg-primary-soft/40 px-6 py-12 text-center transition">
              <div aria-hidden className="mx-auto mb-4 grid place-items-center size-14 rounded-2xl bg-primary text-primary-foreground shadow-soft">
                <FileText className="size-6" />
              </div>
              <div className="font-display text-xl sm:text-2xl">Drag a PDF here, or tap to choose one</div>
              <div className="mt-2 text-sm text-muted-foreground">Up to 50 MB · pages render right in your browser</div>
              <input type="file" accept="application/pdf,.pdf" className="hidden"
                aria-label="Choose a PDF file"
                onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
            </label>
          ) : (
            <div className="soft-card p-4 sm:p-5">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid place-items-center size-10 rounded-xl bg-primary-soft text-primary shrink-0" aria-hidden>
                    <FileText className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{file.name}</div>
                    <div className="text-xs text-muted-foreground num">
                      {formatBytes(file.size)} · {pages.length || "…"} page{pages.length === 1 ? "" : "s"}
                    </div>
                  </div>
                </div>
                <label className="shrink-0 cursor-pointer text-sm text-primary hover:underline underline-offset-4 min-h-11 inline-flex items-center px-2">
                  Replace PDF
                  <input type="file" accept="application/pdf,.pdf" className="hidden"
                    aria-label="Replace PDF"
                    onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
                </label>
              </div>
            </div>
          )}

          {loading && <ProgressBar label="Reading PDF pages…" value={loadProgress} />}
          {error && <ErrorBox>{error}</ErrorBox>}

          {pages.length > 0 && (
            <>
              {/* Export options */}
              <div className="soft-card p-5 grid gap-5 sm:grid-cols-3">
                <Field
                  label="Format"
                  hint={
                    format === "jpg" ? "Smaller files; no transparency."
                    : format === "webp" ? "Smallest at same quality. Modern browsers."
                    : "Sharper text; supports transparency."
                  }
                >
                  <div role="radiogroup" aria-label="Output format" className="grid grid-cols-3 gap-1.5">
                    {(["png", "jpg", "webp"] as const).map((f) => (
                      <button
                        key={f}
                        type="button"
                        role="radio"
                        aria-checked={format === f}
                        onClick={() => setFormat(f)}
                        className={[
                          "rounded-lg border px-2 py-2.5 text-xs font-semibold uppercase min-h-11",
                          format === f ? "border-primary bg-primary text-primary-foreground"
                                       : "border-border bg-card text-muted-foreground hover:text-primary",
                        ].join(" ")}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="Resolution" hint="Higher is sharper but slower and bigger.">
                  <div role="radiogroup" aria-label="Output resolution" className="grid grid-cols-4 gap-1.5">
                    {([72, 150, 300, 600] as Dpi[]).map((d) => (
                      <button
                        key={d}
                        type="button"
                        role="radio"
                        aria-checked={dpi === d}
                        onClick={() => setDpi(d)}
                        className={[
                          "rounded-lg border px-1.5 py-2.5 text-[11px] sm:text-xs font-semibold num min-h-11",
                          dpi === d ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border bg-card text-muted-foreground hover:text-primary",
                        ].join(" ")}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </Field>

                {format !== "png" && (
                  <Field label={`Quality · ${Math.round(quality * 100)}%`} hint="Lower means smaller files.">
                    <input type="range" min={0.5} max={1} step={0.02} value={quality}
                      aria-label="Image quality"
                      onChange={(e) => setQuality(Number(e.target.value))} className="w-full" />
                  </Field>
                )}

                {firstSelectedPreview && (
                  <div className="sm:col-span-3 rounded-lg bg-primary-soft/40 border border-border px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
                    <Sparkles className="size-3.5 text-primary shrink-0" aria-hidden />
                    <span>
                      First selected page will render at{" "}
                      <span className="num font-semibold text-foreground">
                        {firstSelectedPreview.w} × {firstSelectedPreview.h} px
                      </span>{" "}
                      ({dpi} DPI, {format.toUpperCase()})
                    </span>
                  </div>
                )}
              </div>

              {/* Smart selection toolbar */}
              <div className="soft-card p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="text-sm">
                    <span className="font-semibold num">{selected.size}</span>
                    <span className="text-muted-foreground"> of {pages.length} selected</span>
                  </div>
                  <ListChecks className="size-4 text-primary shrink-0" aria-hidden />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <PickButton onClick={selectAll} active={allSelected}>All</PickButton>
                  <PickButton onClick={clearAll} active={selected.size === 0}>None</PickButton>
                  <PickButton onClick={invert}><Repeat2 className="size-3.5" aria-hidden /> Invert</PickButton>
                  <PickButton onClick={selectOdd}>Odd</PickButton>
                  <PickButton onClick={selectEven}>Even</PickButton>
                </div>
                <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                  <label className="sr-only" htmlFor="range-input">Page range</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" aria-hidden />
                    <input
                      id="range-input"
                      value={rangeInput}
                      onChange={(e) => setRangeInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") applyRange(); }}
                      placeholder="e.g. 1-3, 5, 8-10"
                      inputMode="numeric"
                      className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2.5 text-sm min-h-11 num"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={applyRange}
                    className="rounded-lg border border-border bg-card px-4 text-sm font-medium hover:bg-primary-soft min-h-11"
                  >
                    Pick range
                  </button>
                </div>
              </div>

              {/* Page picker grid */}
              <div className="soft-card overflow-hidden">
                <ul
                  role="listbox"
                  aria-multiselectable="true"
                  aria-label="Choose pages to export"
                  className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 max-h-[28rem] overflow-y-auto"
                >
                  {pages.map((p) => {
                    const on = selected.has(p.num);
                    return (
                      <li key={p.num} className="relative group">
                        <button
                          type="button"
                          role="option"
                          aria-selected={on}
                          aria-label={`Page ${p.num}${on ? " (selected)" : ""}`}
                          onClick={() => toggle(p.num)}
                          className={[
                            "block w-full rounded-xl overflow-hidden border-2 transition text-left",
                            on ? "border-primary shadow-soft" : "border-border opacity-80 hover:opacity-100",
                          ].join(" ")}
                        >
                          <div className="checker-bg aspect-[3/4] grid place-items-center relative">
                            <img src={p.url} alt="" className="max-h-full w-auto" />
                            <span
                              aria-hidden
                              className={[
                                "absolute top-1.5 left-1.5 grid place-items-center size-6 rounded-md border-2 backdrop-blur-sm transition",
                                on ? "bg-primary text-primary-foreground border-primary"
                                   : "bg-card/85 text-muted-foreground border-border",
                              ].join(" ")}
                            >
                              {on ? <CheckSquare className="size-4" /> : <Square className="size-4" />}
                            </span>
                          </div>
                          <div className="flex items-center justify-between px-2.5 py-1.5 text-xs bg-card">
                            <span className="font-semibold num">Page {p.num}</span>
                          </div>
                        </button>
                        {/* Quick single-page download */}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); exportSinglePage(p.num); }}
                          aria-label={`Save page ${p.num} as ${format.toUpperCase()}`}
                          className="absolute bottom-1.5 right-1.5 grid place-items-center size-8 rounded-md bg-card/90 border border-border text-muted-foreground hover:text-primary hover:bg-card shadow-soft opacity-0 group-hover:opacity-100 focus:opacity-100 transition"
                        >
                          <Download className="size-3.5" aria-hidden />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {busy && <ProgressBar label={`Exporting ${selected.size} page${selected.size === 1 ? "" : "s"}…`} value={exportProgress} />}

              {/* Desktop / inline export button */}
              <div className="hidden sm:block">
                <RunButton
                  onClick={exportImages}
                  disabled={!selected.size || busy}
                  busy={busy}
                  label={selected.size > 1 ? `Export ${selected.size} pages as ${format.toUpperCase()}` : `Export 1 page as ${format.toUpperCase()}`}
                />
              </div>
            </>
          )}

          <HowItWorks>
            Your PDF is parsed and rendered to canvas with Mozilla's PDF.js, page by page, entirely in your
            browser. Selected pages export as PNG, JPG or WebP; pick more than one and they're zipped
            together for a single download. Nothing is uploaded.
          </HowItWorks>
        </div>

        {/* Result panel */}
        <aside className="col-span-12 md:col-span-5">
          <div className="md:sticky md:top-24 space-y-4">
            {downloadUrl ? (
              <div className="soft-card p-5 sm:p-6 flex flex-col animate-[pop_.4s_cubic-bezier(0.22,1,0.36,1)_both]">
                <span className="eyebrow">Ready</span>
                <div className="font-display text-2xl mt-1">
                  {selected.size > 1 ? `${selected.size} pages packaged` : "Page ready"}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {selected.size > 1
                    ? "All selected pages are bundled into a single .zip for one-click saving."
                    : `Your ${format.toUpperCase()} image is ready to download.`}
                </p>
                <a href={downloadUrl} download={downloadName}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3.5 font-semibold min-h-12 hover:shadow-lift hover:-translate-y-0.5">
                  <Download className="size-4" aria-hidden /> Download {selected.size > 1 ? "zip" : format.toUpperCase()}
                </a>
                <p className="mt-2 text-xs text-muted-foreground truncate" title={downloadName}>
                  {downloadName}
                </p>
              </div>
            ) : pages.length === 0 ? (
              <EmptyState text="Drop a PDF on the left. You'll see a thumbnail for every page and can pick exactly which ones to save." />
            ) : (
              <div className="soft-card p-5 sm:p-6 flex flex-col items-center justify-center text-center gap-3">
                <span className="grid place-items-center size-12 rounded-2xl bg-primary-soft text-primary" aria-hidden>
                  {busy ? <Loader2 className="size-6 animate-spin" /> : <ImageIcon className="size-6" />}
                </span>
                <p className="text-sm text-muted-foreground max-w-[20rem]">
                  Pick the pages you want, choose your format and resolution, then tap
                  <span className="font-semibold text-foreground"> Export</span>.
                </p>
                <p className="text-xs text-muted-foreground">
                  Hover any thumbnail to grab a single page in one click.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Mobile sticky action bar */}
      {pages.length > 0 && (
        <div className="sm:hidden fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur px-4 py-3 shadow-lift">
          <button
            type="button"
            onClick={exportImages}
            disabled={!selected.size || busy}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3.5 text-base font-semibold min-h-12 disabled:opacity-50"
          >
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Exporting… {exportProgress ?? 0}%
              </>
            ) : (
              <>
                <Download className="size-4" aria-hidden />
                Export {selected.size || 0} page{selected.size === 1 ? "" : "s"} as {format.toUpperCase()}
              </>
            )}
          </button>
        </div>
      )}
    </ToolLayout>
  );
}

function PickButton({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium min-h-9 transition",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:text-primary hover:border-primary",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
