import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, Download, RotateCcw, RotateCw } from "lucide-react";
import { ToolLayout, formatBytes } from "../components/ToolLayout";
import { FileDrop, HowItWorks, WarnBox, RunButton, Field } from "../components/ToolControls";
import { parsePageRange } from "../lib/image-tool-helpers";

export const Route = createFileRoute("/pdf-rotate")({
  head: () => ({
    meta: [
      { title: "Rotate PDF — Free Online PDF Page Rotator" },
      { name: "description", content: "Rotate every page or just a custom range of a PDF by 90°, 180° or 270°. Free, private, runs entirely in your browser." },
      { property: "og:title", content: "Rotate PDF — Bluebird" },
      { property: "og:description", content: "Rotate PDF pages 90°, 180° or 270° in your browser. No upload." },
      { property: "og:url", content: "/pdf-rotate" },
    ],
    links: [{ rel: "canonical", href: "/pdf-rotate" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird Rotate PDF",
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: Page,
});

type Angle = 90 | 180 | 270;

function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [angle, setAngle] = useState<Angle>(90);
  const [scope, setScope] = useState<"all" | "range">("all");
  const [range, setRange] = useState("1-");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);

  useEffect(() => () => { if (outUrl) URL.revokeObjectURL(outUrl); }, [outUrl]);
  useEffect(() => {
    setOutUrl(null); setPageCount(null); setErr(null);
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
    setErr(null);
    if (!file) { setErr("Choose a PDF first."); return; }
    if (file.size > 80 * 1024 * 1024) { setErr("That PDF is over 80 MB. Try a smaller file."); return; }
    setBusy(true);
    try {
      const { PDFDocument, degrees } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const total = doc.getPageCount();
      let targets: number[];
      if (scope === "all") {
        targets = Array.from({ length: total }, (_, i) => i);
      } else {
        const parsed = parsePageRange(range, total);
        if (!parsed.length) { setErr("That page range doesn't match any pages."); setBusy(false); return; }
        targets = parsed.map((p) => p - 1);
      }
      for (const i of targets) {
        const page = doc.getPage(i);
        const current = page.getRotation().angle;
        page.setRotation(degrees((current + angle) % 360));
      }
      const out = await doc.save();
      const blob = new Blob([out.buffer as ArrayBuffer], { type: "application/pdf" });
      if (outUrl) URL.revokeObjectURL(outUrl);
      setOutUrl(URL.createObjectURL(blob));
    } catch (e) {
      console.error(e);
      setErr(e instanceof Error ? e.message : "Could not rotate the PDF.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    if (outUrl) URL.revokeObjectURL(outUrl);
    setOutUrl(null); setErr(null); setFile(null); setPageCount(null);
  }

  return (
    <ToolLayout slug="pdf-rotate">
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
            <div className="eyebrow mb-2">Rotation</div>
            <div role="radiogroup" className="grid grid-cols-3 gap-2">
              {([90, 180, 270] as Angle[]).map((a) => (
                <button
                  key={a}
                  role="radio"
                  aria-checked={angle === a}
                  onClick={() => setAngle(a)}
                  className={`min-h-12 rounded-xl border px-3 text-sm font-medium inline-flex items-center justify-center gap-2 ${angle === a ? "border-primary bg-primary-soft" : "border-border bg-card hover:bg-primary-soft"}`}
                >
                  <RotateCw className="size-4" style={{ transform: `rotate(${a === 270 ? -90 : a === 180 ? 180 : 0}deg)` }} />
                  {a}°
                </button>
              ))}
            </div>
          </div>

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

          <RunButton onClick={run} busy={busy} disabled={!file} label="Rotate PDF" />
          {err && <WarnBox>{err}</WarnBox>}
        </section>

        <section className="space-y-4 min-w-0">
          {outUrl ? (
            <div className="soft-card p-5 sm:p-6 animate-[pop_.35s_cubic-bezier(0.22,1,0.36,1)_both]">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="font-display text-lg">PDF ready</div>
                <span className="text-xs text-muted-foreground">Rotated {angle}°</span>
              </div>
              <iframe title="PDF preview" src={outUrl} className="w-full h-[480px] rounded-xl border border-border bg-card" />
              <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                <a
                  href={outUrl}
                  download={`${(file?.name ?? "document").replace(/\.pdf$/i, "")}-rotated.pdf`}
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
              <FileText className="mx-auto size-10 text-primary mb-3" />
              Drop a PDF on the left, pick a rotation, and your file will appear here.
            </div>
          )}
        </section>
      </div>

      <HowItWorks>
        <li>Drop a PDF — it stays on your device the whole time.</li>
        <li>Pick the rotation and choose all pages or a custom range.</li>
        <li>Press Rotate PDF and save the new file.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
