import { useEffect, useRef, useState, type ReactNode, type DragEvent } from "react";
import {
  AlertTriangle,
  ArrowUpToLine,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  ImageIcon,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { formatBytes } from "./ToolLayout";

/* -------------------------------------------------------------------------- */
/*  FileDrop — drop zone with live preview, dimensions, and clipboard paste   */
/* -------------------------------------------------------------------------- */

export function FileDrop({
  file,
  onFile,
  accept = "image/*",
  label = "Drag an image here, or click to choose one",
  hint = "JPG · PNG · WEBP — up to 20 MB",
}: {
  file?: File | null;
  onFile: (f: File | null) => void;
  accept?: string;
  label?: string;
  hint?: string;
}) {
  const [drag, setDrag] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      setDims(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    const img = new Image();
    img.onload = () => setDims({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Paste-from-clipboard support, only when no file is loaded
  useEffect(() => {
    if (file) return;
    function onPaste(e: ClipboardEvent) {
      const item = Array.from(e.clipboardData?.items ?? []).find((i) =>
        i.type.startsWith("image/"),
      );
      const f = item?.getAsFile();
      if (f) onFile(f);
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [file, onFile]);

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  }

  if (file && preview) {
    return (
      <div className="soft-card p-4 sm:p-5 animate-[pop_.35s_cubic-bezier(0.22,1,0.36,1)_both]">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 mb-3">
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <CheckCircle2 className="size-4 shrink-0 text-[color:var(--color-success)]" />
            <span className="font-medium truncate">Image ready</span>
          </div>
          <label className="shrink-0 cursor-pointer text-sm text-primary hover:underline underline-offset-4 min-h-11 inline-flex items-center px-2">
            Replace image
            <input
              type="file"
              accept={accept}
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px]">
          <div className="checker-bg rounded-xl overflow-hidden border border-border grid place-items-center min-h-48">
            <img
              src={preview}
              alt="Selected preview"
              className="max-h-72 w-auto object-contain animate-[fade-in_.3s_ease-out_both]"
            />
          </div>
          <dl className="text-sm space-y-2 self-center min-w-0">
            <Row k="File">{file.name}</Row>
            <Row k="Size"><span className="num">{formatBytes(file.size)}</span></Row>
            <Row k="Type">{file.type.replace("image/", "").toUpperCase()}</Row>
            {dims && (
              <Row k="Dimensions">
                <span className="num">{dims.w} × {dims.h} px</span>
              </Row>
            )}
          </dl>
        </div>
      </div>
    );
  }

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      className={[
        "block cursor-pointer rounded-2xl border-2 border-dashed px-6 py-12 text-center",
        "transition-all duration-200",
        drag
          ? "border-primary bg-primary-soft scale-[1.01]"
          : "border-border bg-card hover:border-primary hover:bg-primary-soft/40",
      ].join(" ")}
    >
      <div
        aria-hidden
        className="mx-auto mb-4 grid place-items-center size-14 rounded-2xl bg-primary text-primary-foreground shadow-soft animate-[float_6s_ease-in-out_infinite]"
      >
        <ArrowUpToLine className="size-6" />
      </div>
      <div className="font-display text-xl sm:text-2xl">{label}</div>
      <div className="mt-2 text-sm text-muted-foreground">{hint}</div>
      <div className="mt-3 text-xs text-muted-foreground/80">
        Tip: you can also paste an image with{" "}
        <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-sans text-[11px] shadow-sm">⌘V</kbd>{" "}
        /{" "}
        <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-sans text-[11px] shadow-sm">Ctrl V</kbd>
      </div>
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
    </label>
  );
}

function Row({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd
        className="font-medium text-right truncate max-w-[10rem]"
        title={typeof children === "string" ? children : undefined}
      >
        {children}
      </dd>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Field / ErrorBox / RunButton                                              */
/* -------------------------------------------------------------------------- */

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted-foreground mt-1.5">{hint}</span>}
    </label>
  );
}

export function ErrorBox({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-xl border status-danger px-4 py-3 text-sm animate-[pop_.3s_ease-out_both]"
    >
      <AlertTriangle aria-hidden className="size-4 mt-0.5 shrink-0" />
      <span className="min-w-0">{children}</span>
    </div>
  );
}

export function WarnBox({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border status-warn px-4 py-3 text-sm">
      <AlertTriangle aria-hidden className="size-4 mt-0.5 shrink-0" />
      <span className="min-w-0">{children}</span>
    </div>
  );
}

export function RunButton({
  onClick,
  disabled,
  busy,
  label,
  busyLabel = "Working…",
}: {
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
  label: string;
  busyLabel?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center gap-2",
        "rounded-xl bg-primary text-primary-foreground",
        "px-7 py-4 text-base font-semibold",
        "shadow-soft hover:shadow-lift hover:-translate-y-0.5",
        "active:translate-y-0 active:scale-[0.99]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-soft",
        "min-h-12 min-w-44",
      ].join(" ")}
    >
      {busy ? (
        <>
          <span className="inline-block size-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
          {busyLabel}
        </>
      ) : (
        <>
          {label} <span aria-hidden>→</span>
        </>
      )}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  ResultPanel — visual result, deltas, primary download + reset             */
/* -------------------------------------------------------------------------- */

export function ResultPanel({
  title,
  lines,
  href,
  download,
  previewUrl,
  extra,
  delta,
  onReset,
  beforeUrl,
}: {
  title: string;
  lines?: [string, string][];
  href?: string;
  download?: string;
  previewUrl?: string;
  beforeUrl?: string;
  extra?: ReactNode;
  delta?: { label: string; tone?: "success" | "warn" } | null;
  onReset?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    if (!href) return;
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="soft-card p-5 sm:p-6 h-full flex flex-col animate-[pop_.4s_cubic-bezier(0.22,1,0.36,1)_both]">
      <div className="flex items-center justify-between gap-3 mb-1">
        <div className="flex items-center gap-2 min-w-0">
          <CheckCircle2
            aria-hidden
            className="size-4 text-[color:var(--color-success)] shrink-0"
          />
          <span className="eyebrow">Done</span>
        </div>
        {delta && (
          <span
            className={[
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold num",
              delta.tone === "warn" ? "status-warn" : "status-success",
            ].join(" ")}
          >
            {delta.label}
          </span>
        )}
      </div>
      <div className="font-display text-2xl">{title}</div>

      {previewUrl && (
        <div className="mt-4">
          {beforeUrl ? (
            <BeforeAfter beforeUrl={beforeUrl} afterUrl={previewUrl} />
          ) : (
            <div className="checker-bg rounded-xl overflow-hidden border border-border grid place-items-center min-h-40">
              <img
                src={previewUrl}
                alt="Result preview"
                className="max-h-60 w-auto object-contain"
              />
            </div>
          )}
        </div>
      )}

      {lines && (
        <dl className="mt-5 divide-y divide-border">
          {lines.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-2 text-sm">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="font-semibold text-right num">{v}</dd>
            </div>
          ))}
        </dl>
      )}
      {extra}

      {href && (
        <div className="mt-auto pt-5 space-y-2">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <a
              href={href}
              download={download}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3.5 font-semibold min-h-12 hover:shadow-lift hover:-translate-y-0.5"
            >
              <Download aria-hidden className="size-4" /> Download
            </a>
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-medium min-h-12 hover:bg-primary-soft"
              aria-label="Copy download link"
            >
              {copied ? (
                <>
                  <Check className="size-4" /> Copied
                </>
              ) : (
                "Copy link"
              )}
            </button>
          </div>
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card/50 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary-soft/60 min-h-11"
            >
              <RotateCcw className="size-4" /> Start over with a new image
            </button>
          )}
          <p className="sr-only-live" role="status" aria-live="polite">
            Image ready to download.
          </p>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  BeforeAfter — wipe slider                                                 */
/* -------------------------------------------------------------------------- */

export function BeforeAfter({
  beforeUrl,
  afterUrl,
  beforeLabel = "Before",
  afterLabel = "After",
}: {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
}) {
  const [pct, setPct] = useState(50);
  const ref = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);

  function moveTo(clientX: number) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const p = ((clientX - r.left) / r.width) * 100;
    setPct(Math.max(0, Math.min(100, p)));
  }

  return (
    <div
      ref={ref}
      className="checker-bg relative select-none overflow-hidden rounded-xl border border-border touch-none"
      onPointerDown={(e) => {
        dragging.current = true;
        (e.target as Element).setPointerCapture?.(e.pointerId);
        moveTo(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && moveTo(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      <img
        src={beforeUrl}
        alt="Before"
        className="block w-full max-h-72 object-contain"
        draggable={false}
      />
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 0 0 ${pct}%)` }}
        aria-hidden
      >
        <img
          src={afterUrl}
          alt="After"
          className="block w-full max-h-72 object-contain"
          draggable={false}
        />
      </div>
      <div
        className="absolute top-0 bottom-0 w-px bg-primary shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-primary)_30%,transparent)] pointer-events-none"
        style={{ left: `${pct}%` }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 grid place-items-center size-9 rounded-full bg-primary text-primary-foreground shadow-lift pointer-events-none"
        style={{ left: `${pct}%` }}
      >
        <span aria-hidden>⇆</span>
      </div>
      <span className="absolute left-2 top-2 rounded-md bg-card/85 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground backdrop-blur">
        {beforeLabel}
      </span>
      <span className="absolute right-2 top-2 rounded-md bg-primary/90 px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
        {afterLabel}
      </span>
      <input
        type="range"
        min={0}
        max={100}
        value={pct}
        onChange={(e) => setPct(Number(e.target.value))}
        aria-label="Wipe between before and after"
        className="absolute inset-x-0 bottom-2 mx-auto w-2/3 opacity-0"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  EmptyState                                                                */
/* -------------------------------------------------------------------------- */

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 h-full flex flex-col items-center justify-center text-center gap-3">
      <span
        aria-hidden
        className="grid place-items-center size-12 rounded-2xl bg-primary-soft text-primary"
      >
        <ImageIcon className="size-6" />
      </span>
      <p className="text-sm text-muted-foreground max-w-[18rem]">{text}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  HowItWorks — small disclosure with privacy guarantee                      */
/* -------------------------------------------------------------------------- */

export function HowItWorks({ children }: { children: ReactNode }) {
  return (
    <section
      aria-label="How this works"
      className="block clear-both my-12 sm:my-16"
    >
      <details className="group soft-card overflow-hidden [&_summary::-webkit-details-marker]:hidden">
        <summary className="flex items-center gap-3 cursor-pointer list-none p-4 sm:p-5 font-display text-base sm:text-lg tracking-tight">
          <span
            aria-hidden
            className="grid place-items-center size-10 shrink-0 rounded-xl bg-primary-soft text-primary"
          >
            <ShieldCheck className="size-5" />
          </span>
          <span className="min-w-0 flex-1 truncate">
            How this works <span className="text-muted-foreground font-normal">— and why it's private</span>
          </span>
          <ChevronDown
            aria-hidden
            className="ml-auto size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
          />
        </summary>
        <div className="border-t border-border px-4 sm:px-5 py-4 sm:py-5 text-sm sm:text-base text-muted-foreground leading-relaxed">
          <ul className="space-y-2 list-disc pl-5 marker:text-primary">{children}</ul>
        </div>
      </details>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Progress bar — determinate when possible                                  */
/* -------------------------------------------------------------------------- */

export function ProgressBar({
  label,
  value,
}: {
  label: string;
  value?: number;
}) {
  const determinate = typeof value === "number";
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3" role="status" aria-live="polite">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="font-medium">{label}</span>
        {determinate && <span className="num text-muted-foreground">{Math.round(value!)}%</span>}
      </div>
      <div className="h-1.5 rounded-full bg-primary-soft overflow-hidden">
        {determinate ? (
          <div
            className="h-full bg-primary transition-[width] duration-200"
            style={{ width: `${Math.max(2, Math.min(100, value!))}%` }}
          />
        ) : (
          <div className="h-full w-1/3 bg-primary animate-[indeterminate_1.2s_ease-in-out_infinite]" />
        )}
      </div>
      <style>{`@keyframes indeterminate { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
    </div>
  );
}
