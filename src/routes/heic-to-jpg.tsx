import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ShieldCheck, Upload, Download, X, Loader2, ImageIcon } from "lucide-react";
import JSZip from "jszip";
import { ToolLayout, formatBytes } from "../components/ToolLayout";

export const Route = createFileRoute("/heic-to-jpg")({
  head: () => ({
    meta: [
      { title: "HEIC to JPG Converter — Free, In Your Browser" },
      { name: "description", content: "Convert iPhone HEIC photos to JPG or PNG online. Batch convert dozens at once. Runs in your browser — nothing uploads." },
      { property: "og:title", content: "HEIC to JPG — Bluebird" },
      { property: "og:description", content: "Convert HEIC to JPG/PNG in your browser. Batch + ZIP download. No uploads." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/heic-to-jpg" },
    ],
    links: [{ rel: "canonical", href: "/heic-to-jpg" }],
  }),
  component: Page,
});

type Item = {
  id: string;
  name: string;
  inSize: number;
  status: "pending" | "working" | "done" | "error";
  outUrl?: string;
  outBlob?: Blob;
  outSize?: number;
  error?: string;
};

type Format = "image/jpeg" | "image/png";

function Page() {
  const [items, setItems] = useState<Item[]>([]);
  const [format, setFormat] = useState<Format>("image/jpeg");
  const [quality, setQuality] = useState(0.9);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    items.forEach((i) => i.outUrl && URL.revokeObjectURL(i.outUrl));
  }, [items]);

  const addFiles = useCallback((files: FileList | File[]) => {
    const incoming: Item[] = [];
    for (const f of Array.from(files)) {
      const looksHeic =
        /\.(heic|heif)$/i.test(f.name) ||
        f.type === "image/heic" ||
        f.type === "image/heif" ||
        f.type === "";
      if (!looksHeic) continue;
      if (f.size > 40 * 1024 * 1024) continue;
      incoming.push({
        id: `${f.name}-${f.size}-${Math.random().toString(36).slice(2, 7)}`,
        name: f.name,
        inSize: f.size,
        status: "pending",
      });
      // Attach raw file via WeakMap-style closure
      (incoming[incoming.length - 1] as Item & { _file?: File })._file = f;
    }
    if (incoming.length) setItems((prev) => [...prev, ...incoming]);
  }, []);

  async function convertAll() {
    setBusy(true);
    const heic2any = (await import("heic2any")).default;
    for (const item of items) {
      if (item.status === "done") continue;
      setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, status: "working" } : p)));
      try {
        const file = (item as Item & { _file: File })._file;
        const out = (await heic2any({
          blob: file,
          toType: format,
          quality,
        })) as Blob | Blob[];
        const blob = Array.isArray(out) ? out[0] : out;
        const url = URL.createObjectURL(blob);
        setItems((prev) =>
          prev.map((p) =>
            p.id === item.id
              ? { ...p, status: "done", outUrl: url, outBlob: blob, outSize: blob.size }
              : p,
          ),
        );
      } catch (e) {
        setItems((prev) =>
          prev.map((p) =>
            p.id === item.id ? { ...p, status: "error", error: (e as Error).message || "Failed to convert" } : p,
          ),
        );
      }
    }
    setBusy(false);
  }

  async function downloadZip() {
    const done = items.filter((i) => i.status === "done" && i.outBlob);
    if (done.length === 0) return;
    const zip = new JSZip();
    const ext = format === "image/png" ? "png" : "jpg";
    done.forEach((i) => {
      const base = i.name.replace(/\.(heic|heif)$/i, "");
      zip.file(`${base}.${ext}`, i.outBlob!);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bluebird-heic-converted.zip`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function downloadOne(item: Item) {
    if (!item.outUrl) return;
    const ext = format === "image/png" ? "png" : "jpg";
    const a = document.createElement("a");
    a.href = item.outUrl;
    a.download = item.name.replace(/\.(heic|heif)$/i, "") + "." + ext;
    a.click();
  }

  function remove(id: string) {
    setItems((prev) => {
      const t = prev.find((p) => p.id === id);
      if (t?.outUrl) URL.revokeObjectURL(t.outUrl);
      return prev.filter((p) => p.id !== id);
    });
  }

  const doneCount = items.filter((i) => i.status === "done").length;

  return (
    <ToolLayout slug="heic-to-jpg">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        {/* Controls */}
        <div className="col-span-12 lg:col-span-5 space-y-5">
          <div className="soft-card p-5 space-y-4">
            <div className="text-sm font-semibold">Output format</div>
            <div role="radiogroup" className="grid grid-cols-2 gap-2">
              {(["image/jpeg", "image/png"] as Format[]).map((f) => (
                <button
                  key={f}
                  role="radio"
                  aria-checked={format === f}
                  onClick={() => setFormat(f)}
                  className={[
                    "min-h-11 rounded-xl border px-3 text-sm font-medium",
                    format === f ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/60",
                  ].join(" ")}
                >
                  {f === "image/jpeg" ? "JPG (smaller)" : "PNG (lossless)"}
                </button>
              ))}
            </div>

            {format === "image/jpeg" && (
              <div>
                <div className="flex items-center justify-between text-sm">
                  <label htmlFor="q">Quality</label>
                  <span className="font-mono text-muted-foreground">{Math.round(quality * 100)}%</span>
                </div>
                <input
                  id="q"
                  type="range"
                  min={0.4}
                  max={1}
                  step={0.05}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full mt-2 accent-primary"
                />
              </div>
            )}

            <button
              onClick={convertAll}
              disabled={busy || items.length === 0}
              className="w-full min-h-12 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-50 hover:opacity-95"
            >
              {busy ? (
                <span className="inline-flex items-center gap-2"><Loader2 className="size-4 animate-spin" /> Converting…</span>
              ) : (
                `Convert ${items.length || ""} photo${items.length === 1 ? "" : "s"}`
              )}
            </button>

            {doneCount > 1 && (
              <button
                onClick={downloadZip}
                className="w-full min-h-11 rounded-xl border border-primary text-primary font-semibold hover:bg-primary-soft"
              >
                <span className="inline-flex items-center gap-2"><Download className="size-4" /> Download all as ZIP</span>
              </button>
            )}
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-border bg-primary-soft/40 px-4 py-3 text-sm">
            <ShieldCheck className="size-5 text-primary shrink-0 mt-0.5" />
            <p className="text-muted-foreground">
              Your HEIC files are decoded in this browser tab using a WebAssembly converter. No upload, no server, no account.
            </p>
          </div>
        </div>

        {/* Drop + list */}
        <div className="col-span-12 lg:col-span-7 space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
            }}
            className="soft-card border-2 border-dashed border-border hover:border-primary/60 transition-colors p-8 text-center"
          >
            <input
              ref={inputRef}
              type="file"
              accept=".heic,.heif,image/heic,image/heif"
              multiple
              hidden
              onChange={(e) => e.target.files && addFiles(e.target.files)}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 min-h-12 px-5 rounded-xl bg-primary text-primary-foreground font-semibold"
            >
              <Upload className="size-4" /> Choose HEIC files
            </button>
            <p className="mt-3 text-sm text-muted-foreground">
              or drop them here · up to 40 MB each · iPhone .heic / .heif
            </p>
          </div>

          {items.length === 0 ? (
            <div className="soft-card p-8 text-center text-sm text-muted-foreground">
              <ImageIcon className="size-8 mx-auto mb-2 opacity-50" />
              Your queue appears here. Add iPhone photos to begin.
            </div>
          ) : (
            <ul className="space-y-2" aria-live="polite">
              {items.map((i) => (
                <li key={i.id} className="soft-card p-3 flex items-center gap-3">
                  <div className="size-12 rounded-lg bg-primary-soft grid place-items-center text-primary shrink-0 overflow-hidden">
                    {i.outUrl ? (
                      <img src={i.outUrl} alt="" className="size-full object-cover" />
                    ) : (
                      <ImageIcon className="size-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{i.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatBytes(i.inSize)}
                      {i.outSize != null && ` → ${formatBytes(i.outSize)}`}
                      {i.status === "working" && " · converting…"}
                      {i.status === "error" && ` · ${i.error}`}
                    </div>
                  </div>
                  {i.status === "done" && (
                    <button
                      onClick={() => downloadOne(i)}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                      <Download className="size-4" /> Save
                    </button>
                  )}
                  <button
                    aria-label={`Remove ${i.name}`}
                    onClick={() => remove(i.id)}
                    className="size-9 grid place-items-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
