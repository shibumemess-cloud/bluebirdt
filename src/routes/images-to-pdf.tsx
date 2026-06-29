import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { GripVertical, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { ToolLayout, validateImageFile, formatBytes } from "../components/ToolLayout";
import {
  Field,
  ErrorBox,
  RunButton,
  ResultPanel,
  EmptyState,
  HowItWorks,
  ProgressBar,
} from "../components/ToolControls";
import { substituteTokens, hasPageToken } from "../lib/image-tool-helpers";
import ogImage from "../assets/og/og-pdf.jpg";

export const Route = createFileRoute("/images-to-pdf")({
  head: () => ({
    meta: [
      { title: "Convert Images to PDF Online — JPG and PNG to PDF, Free" },
      {
        name: "description",
        content:
          "Combine many JPG or PNG photos into a single PDF in your browser. Pick page size, orientation, margin and order. Free, no sign-up, no uploads.",
      },
      { property: "og:title", content: "Images to PDF — Bluebird" },
      {
        property: "og:description",
        content: "Combine images into a single PDF in your browser. Free and private.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/images-to-pdf" },
      { property: "og:image", content: ogImage },
      { name: "twitter:image", content: ogImage },
    ],
    links: [{ rel: "canonical", href: "/images-to-pdf" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird Images to PDF",
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          description: "Free in-browser tool to combine JPG and PNG images into a single PDF.",
        }),
      },
    ],
  }),
  component: Page,
});

type Item = { id: string; file: File; url: string };
type Size = "A4" | "Letter" | "Legal" | "Square" | "Auto";
type Orient = "portrait" | "landscape" | "auto";
type Fit = "contain" | "fill" | "stretch";

const SIZES: Record<Exclude<Size, "Auto">, [number, number]> = {
  // points (1pt = 1/72")
  A4: [595.28, 841.89],
  Letter: [612, 792],
  Legal: [612, 1008],
  Square: [612, 612],
};

function Page() {
  const [items, setItems] = useState<Item[]>([]);
  const [size, setSize] = useState<Size>("A4");
  const [orient, setOrient] = useState<Orient>("portrait");
  const [margin, setMargin] = useState(24);
  const [fit, setFit] = useState<Fit>("contain");
  const [header, setHeader] = useState("");
  const [footer, setFooter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ url: string; name: string; size: number; pages: number } | null>(null);

  useEffect(() => () => items.forEach((it) => URL.revokeObjectURL(it.url)), [items]);

  function add(list: FileList | null) {
    if (!list) return;
    const arr = Array.from(list);
    for (const f of arr) {
      const e = validateImageFile(f);
      if (e) { setError(e); return; }
      if (!["image/jpeg", "image/jpg", "image/png"].includes(f.type)) {
        setError("Please use JPG or PNG photos for PDF.");
        return;
      }
    }
    setError(null);
    setResult(null);
    setItems((prev) => [
      ...prev,
      ...arr.map((f) => ({ id: `${f.name}-${f.lastModified}-${Math.random()}`, file: f, url: URL.createObjectURL(f) })),
    ]);
  }

  function move(id: string, dir: -1 | 1) {
    setItems((arr) => {
      const i = arr.findIndex((x) => x.id === id);
      if (i < 0) return arr;
      const j = i + dir;
      if (j < 0 || j >= arr.length) return arr;
      const next = arr.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }
  function remove(id: string) {
    setItems((arr) => arr.filter((x) => x.id !== id));
  }

  async function run() {
    if (items.length === 0) return;
    setBusy(true);
    setError(null);
    setProgress(0);
    try {
      const pdf = await PDFDocument.create();
      const font = await pdf.embedFont(StandardFonts.Helvetica);

      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const bytes = new Uint8Array(await it.file.arrayBuffer());
        const img = it.file.type === "image/png" ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);

        let pageW: number, pageH: number;
        if (size === "Auto") {
          pageW = img.width + margin * 2;
          pageH = img.height + margin * 2;
        } else {
          const [a, b] = SIZES[size];
          const eff: Orient =
            orient === "auto" ? (img.width > img.height ? "landscape" : "portrait") : orient;
          pageW = eff === "portrait" ? a : b;
          pageH = eff === "portrait" ? b : a;
        }
        const page = pdf.addPage([pageW, pageH]);

        const innerW = pageW - margin * 2;
        const innerH = pageH - margin * 2;
        let drawW = innerW, drawH = innerH;
        if (fit !== "stretch") {
          const r = fit === "contain"
            ? Math.min(innerW / img.width, innerH / img.height)
            : Math.max(innerW / img.width, innerH / img.height);
          drawW = img.width * r;
          drawH = img.height * r;
        }
        const x = margin + (innerW - drawW) / 2;
        const y = margin + (innerH - drawH) / 2;
        page.drawImage(img, { x, y, width: drawW, height: drawH });

        const subst = (t: string) => substituteTokens(t, i + 1, items.length);
        if (header.trim()) {
          page.drawText(subst(header), {
            x: margin, y: pageH - margin / 2 - 6, size: 10, font, color: rgb(0.3, 0.3, 0.3),
          });
        }
        if (footer.trim()) {
          const f = hasPageToken(footer) ? subst(footer) : `${footer}  ·  ${i + 1} / ${items.length}`;
          page.drawText(f, {
            x: margin, y: margin / 2 - 4, size: 10, font, color: rgb(0.3, 0.3, 0.3),
          });
        }

        setProgress((i + 1) / items.length);
        await new Promise((r) => setTimeout(r, 0));
      }

      const bytes = await pdf.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      setResult({
        url: URL.createObjectURL(blob),
        name: `bluebird-${items.length}-images.pdf`,
        size: blob.size,
        pages: items.length,
      });
    } catch {
      setError("Sorry, we couldn't build the PDF. Try removing any problem image and run again.");
    } finally {
      setBusy(false);
    }
  }

  const canRun = items.length > 0 && !busy && !error;

  return (
    <ToolLayout slug="images-to-pdf">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 md:col-span-7 space-y-6">
          <label
            className="block cursor-pointer rounded-2xl border-2 border-dashed border-border bg-card hover:border-primary hover:bg-primary-soft/40 px-6 py-10 text-center transition-colors"
          >
            <div className="font-display text-xl">Add JPG or PNG photos</div>
            <div className="mt-1 text-sm text-muted-foreground">Drop or tap to choose — add as many as you like</div>
            <input
              type="file"
              accept="image/jpeg,image/png"
              multiple
              className="hidden"
              onChange={(e) => add(e.target.files)}
            />
          </label>

          {items.length > 0 && (
            <ul className="space-y-2">
              {items.map((it, i) => (
                <li
                  key={it.id}
                  draggable
                  onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", it.id); }}
                  onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const fromId = e.dataTransfer.getData("text/plain");
                    if (!fromId || fromId === it.id) return;
                    setItems((arr) => {
                      const from = arr.findIndex((x) => x.id === fromId);
                      const to = arr.findIndex((x) => x.id === it.id);
                      if (from < 0 || to < 0) return arr;
                      const next = arr.slice();
                      const [m] = next.splice(from, 1);
                      next.splice(to, 0, m);
                      return next;
                    });
                  }}
                  className="soft-card p-3 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 cursor-grab active:cursor-grabbing"
                >
                  <span className="grid place-items-center size-12 rounded-lg overflow-hidden bg-muted">
                    <img src={it.url} alt="" className="size-full object-cover" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{it.file.name}</div>
                    <div className="text-xs text-muted-foreground num">
                      Page {i + 1} of {items.length} · {formatBytes(it.file.size)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <IconBtn label="Move up" onClick={() => move(it.id, -1)} disabled={i === 0}>
                      <ChevronUp className="size-4" />
                    </IconBtn>
                    <IconBtn label="Move down" onClick={() => move(it.id, 1)} disabled={i === items.length - 1}>
                      <ChevronDown className="size-4" />
                    </IconBtn>
                    <IconBtn label="Remove" onClick={() => remove(it.id)}>
                      <Trash2 className="size-4" />
                    </IconBtn>
                    <GripVertical className="size-4 text-muted-foreground/60" aria-hidden />
                  </div>
                </li>
              ))}
            </ul>
          )}
          {items.length > 1 && (
            <p className="text-xs text-muted-foreground -mt-2">
              Tip: drag a row up or down to reorder the pages.
            </p>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Page size">
              <div className="grid grid-cols-3 gap-1.5">
                {(["A4", "Letter", "Legal", "Square", "Auto"] as Size[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    aria-pressed={size === s}
                    className={[
                      "rounded-xl border px-3 py-2.5 text-sm font-semibold",
                      size === s ? "border-primary bg-primary-soft text-primary" : "border-border bg-card hover:border-primary/60",
                    ].join(" ")}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Orientation" hint={size === "Auto" ? "Auto sizes each page to the image" : "Auto picks per image"}>
              <div className="grid grid-cols-3 gap-1.5">
                {(["portrait", "landscape", "auto"] as Orient[]).map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => setOrient(o)}
                    aria-pressed={orient === o}
                    disabled={size === "Auto"}
                    className={[
                      "rounded-xl border px-3 py-2.5 text-sm font-semibold capitalize disabled:opacity-50",
                      orient === o ? "border-primary bg-primary-soft text-primary" : "border-border bg-card hover:border-primary/60",
                    ].join(" ")}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </Field>
          </div>


          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={`Margin — ${margin}pt`}>
              <input
                type="range" min={0} max={72} value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full accent-[color:var(--color-primary)]"
              />
            </Field>
            <Field label="Image fit">
              <div className="grid grid-cols-3 gap-1.5">
                {(["contain", "fill", "stretch"] as Fit[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFit(f)}
                    aria-pressed={fit === f}
                    className={[
                      "rounded-xl border px-3 py-2.5 text-sm font-semibold capitalize",
                      fit === f ? "border-primary bg-primary-soft text-primary" : "border-border bg-card hover:border-primary/60",
                    ].join(" ")}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Header text (optional)" hint="Use {page} and {total} for page numbers.">
              <input
                type="text" value={header}
                onChange={(e) => setHeader(e.target.value)}
                placeholder="e.g. Project notes — page {page} of {total}"
                className="w-full rounded-xl border border-border bg-card px-3 py-3 text-base focus:outline-none focus:border-primary"
              />
            </Field>
            <Field label="Footer text (optional)" hint="Use {page} / {total} or leave blank for auto numbering.">
              <input
                type="text" value={footer}
                onChange={(e) => setFooter(e.target.value)}
                placeholder="e.g. Your name"
                className="w-full rounded-xl border border-border bg-card px-3 py-3 text-base focus:outline-none focus:border-primary"
              />
            </Field>
          </div>

          {busy && items.length > 1 && (
            <ProgressBar value={progress} label={`Adding page ${Math.round(progress * items.length)} of ${items.length}…`} />
          )}
          {error && <ErrorBox>{error}</ErrorBox>}
          <RunButton onClick={run} disabled={!canRun} busy={busy} label="Build PDF" />

          <HowItWorks>
            Each photo is embedded into a brand-new PDF document built inside your browser. Nothing
            is sent anywhere — the file you download is created right on your device.
          </HowItWorks>
        </div>

        <aside className="col-span-12 md:col-span-5">
          {result ? (
            <ResultPanel
              title="Your PDF is ready"
              delta={{ label: `${result.pages} page${result.pages > 1 ? "s" : ""}`, tone: "success" }}
              lines={[
                ["Pages", String(result.pages)],
                ["Page size", size],
                ["File size", formatBytes(result.size)],
              ]}
              href={result.url}
              download={result.name}
              onReset={() => {
                setItems([]);
                setResult(null);
              }}
            />
          ) : (
            <EmptyState text="Add a few photos on the left. They'll be combined into a single PDF in the order shown." />
          )}
        </aside>
      </div>
    </ToolLayout>
  );
}

function IconBtn({
  onClick, disabled, children, label,
}: { onClick: () => void; disabled?: boolean; children: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid place-items-center size-9 rounded-lg border border-border bg-card hover:border-primary disabled:opacity-40"
    >
      {children}
    </button>
  );
}
