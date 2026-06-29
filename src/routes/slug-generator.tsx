import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Copy, Check, Trash2, SquareSlash } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";
import { slugify } from "../lib/extra-tools-helpers";

export const Route = createFileRoute("/slug-generator")({
  head: () => ({
    meta: [
      { title: "Slug Generator — Free URL Slugify Tool Online" },
      { name: "description", content: "Turn any title into a clean URL slug. Lowercase, accent-safe, custom separator — free and runs in your browser." },
      { property: "og:title", content: "Slug Generator — Bluebird" },
      { property: "og:description", content: "Free URL slug / slugify tool. Accent-safe, customizable, in-browser." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/slug-generator" },
    ],
    links: [{ rel: "canonical", href: "/slug-generator" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Bluebird Slug Generator",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any (Web)",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      }),
    }],
  }),
  component: Page,
});

const PREF_KEY = "bb-slug-prefs-v1";

function Page() {
  const [input, setInput] = useState("");
  const [separator, setSeparator] = useState<"-" | "_" | ".">("-");
  const [lowercase, setLowercase] = useState(true);
  const [strict, setStrict] = useState(true);
  const [maxLength, setMaxLength] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREF_KEY);
      if (!raw) return;
      const p = JSON.parse(raw);
      if (p.separator === "-" || p.separator === "_" || p.separator === ".") setSeparator(p.separator);
      if (typeof p.lowercase === "boolean") setLowercase(p.lowercase);
      if (typeof p.strict === "boolean") setStrict(p.strict);
      if (typeof p.maxLength === "number") setMaxLength(p.maxLength);
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem(PREF_KEY, JSON.stringify({ separator, lowercase, strict, maxLength })); } catch { /* ignore */ }
  }, [separator, lowercase, strict, maxLength]);

  const lines = useMemo(() => input.split(/\r?\n/), [input]);
  const single = useMemo(() => slugify(input, { separator, lowercase, strict, maxLength }), [input, separator, lowercase, strict, maxLength]);
  const batch = useMemo(() => lines.map((l) => slugify(l, { separator, lowercase, strict, maxLength })).join("\n"), [lines, separator, lowercase, strict, maxLength]);
  const isBatch = lines.length > 1;
  const out = isBatch ? batch : single;

  async function copyOut() {
    if (!out) return;
    await navigator.clipboard.writeText(out);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <ToolLayout slug="slug-generator">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div role="radiogroup" aria-label="Separator" className="inline-flex p-1 rounded-xl bg-muted">
              {(["-", "_", "."] as const).map((s) => (
                <button
                  key={s}
                  role="radio"
                  aria-checked={separator === s}
                  onClick={() => setSeparator(s)}
                  className={`min-h-9 px-4 rounded-lg text-sm font-mono ${separator === s ? "bg-card shadow-soft" : "text-muted-foreground"}`}
                >{s}</button>
              ))}
            </div>
            <label className="inline-flex items-center gap-2 min-h-9 px-3 rounded-lg border border-border bg-card text-xs">
              <input type="checkbox" checked={lowercase} onChange={(e) => setLowercase(e.target.checked)} /> lowercase
            </label>
            <label className="inline-flex items-center gap-2 min-h-9 px-3 rounded-lg border border-border bg-card text-xs">
              <input type="checkbox" checked={strict} onChange={(e) => setStrict(e.target.checked)} /> ASCII-only
            </label>
            <label className="inline-flex items-center gap-2 min-h-9 px-3 rounded-lg border border-border bg-card text-xs">
              Max
              <input
                type="number"
                min={0}
                max={200}
                value={maxLength}
                onChange={(e) => setMaxLength(Math.max(0, Math.min(200, Number(e.target.value) || 0)))}
                className="w-16 bg-transparent text-right tabular-nums focus:outline-none"
              />
            </label>
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="slug-in" className="eyebrow">Title or text</label>
            {input && (
              <button onClick={() => setInput("")} className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs">
                <Trash2 className="size-3.5" /> Clear
              </button>
            )}
          </div>
          <textarea
            id="slug-in"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a title here — paste multiple lines for batch mode."
            className="w-full min-h-[260px] rounded-xl border border-border bg-card p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground">
            {isBatch ? `Batch mode — ${lines.length} lines.` : "One line in, one slug out. Add new lines to batch-process."}
          </p>
        </section>

        <section className="soft-card p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <SquareSlash className="size-4 text-primary" />
              <div className="font-display text-lg">Slug</div>
            </div>
            <button
              onClick={copyOut}
              disabled={!out}
              className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs disabled:opacity-50"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          {out ? (
            <pre className="rounded-xl border border-border bg-card p-3 font-mono text-sm break-all whitespace-pre-wrap" aria-live="polite">{out}</pre>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Your URL-friendly slug will appear here.
            </div>
          )}
          {out && !isBatch && (
            <p className="text-xs text-muted-foreground">{out.length} character{out.length === 1 ? "" : "s"}</p>
          )}
        </section>
      </div>

      <HowItWorks>
        <li>Type or paste a title on the left.</li>
        <li>Pick your separator and toggle ASCII-only or a max length.</li>
        <li>Copy the slug — or paste several lines to batch-convert them.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
