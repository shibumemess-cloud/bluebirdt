import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Link2, Copy, Check, Trash2, ArrowLeftRight, Rows3 } from "lucide-react";

import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks, WarnBox } from "../components/ToolControls";

export const Route = createFileRoute("/url-encoder")({
  head: () => ({
    meta: [
      { title: "URL Encoder & Decoder — Free Online URL Escape Tool" },
      { name: "description", content: "Percent-encode or decode URLs in your browser. Whole-URL or component mode, no sign-up, free forever." },
      { property: "og:title", content: "URL Encoder & Decoder — Bluebird" },
      { property: "og:description", content: "Free in-browser URL encoder/decoder with whole-URL and component modes." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/url-encoder" },
    ],
    links: [{ rel: "canonical", href: "/url-encoder" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird URL Encoder & Decoder",
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: Page,
});

type Mode = "encode" | "decode";
type Scope = "component" | "url";

export function transformUrl(input: string, mode: Mode, scope: Scope): { out: string; error?: string } {
  if (!input) return { out: "" };
  try {
    if (mode === "encode") {
      return { out: scope === "component" ? encodeURIComponent(input) : encodeURI(input) };
    }
    return { out: scope === "component" ? decodeURIComponent(input) : decodeURI(input) };
  } catch (e) {
    return { out: "", error: e instanceof Error ? e.message : "Invalid input." };
  }
}

export function transformUrlBatch(input: string, mode: Mode, scope: Scope): { out: string; errorCount: number } {
  const lines = input.split(/\r?\n/);
  let errors = 0;
  const out = lines.map((line) => {
    if (!line.trim()) return "";
    const r = transformUrl(line, mode, scope);
    if (r.error) { errors++; return `# error: ${r.error}`; }
    return r.out;
  });
  return { out: out.join("\n"), errorCount: errors };
}

const PREF_KEY = "bb-url-encoder-prefs-v1";


function Page() {
  const [mode, setMode] = useState<Mode>("encode");
  const [scope, setScope] = useState<Scope>("component");
  const [batch, setBatch] = useState(false);
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  // Restore prefs
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREF_KEY);
      if (!raw) return;
      const p = JSON.parse(raw);
      if (p.mode === "encode" || p.mode === "decode") setMode(p.mode);
      if (p.scope === "component" || p.scope === "url") setScope(p.scope);
      if (typeof p.batch === "boolean") setBatch(p.batch);
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem(PREF_KEY, JSON.stringify({ mode, scope, batch })); } catch { /* ignore */ }
  }, [mode, scope, batch]);

  const single = useMemo(() => transformUrl(input, mode, scope), [input, mode, scope]);
  const multi = useMemo(() => transformUrlBatch(input, mode, scope), [input, mode, scope]);
  const result = batch
    ? { out: multi.out, error: multi.errorCount > 0 ? `${multi.errorCount} line${multi.errorCount === 1 ? "" : "s"} could not be ${mode === "encode" ? "encoded" : "decoded"}.` : undefined }
    : single;

  async function copyOut() {
    if (!result.out) return;
    await navigator.clipboard.writeText(result.out);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  function swap() {
    if (!result.out) return;
    setMode(mode === "encode" ? "decode" : "encode");
    setInput(result.out);
  }


  return (
    <ToolLayout slug="url-encoder">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div role="radiogroup" aria-label="Mode" className="inline-flex p-1 rounded-xl bg-muted">
              {(["encode", "decode"] as const).map((m) => (
                <button
                  key={m}
                  role="radio"
                  aria-checked={mode === m}
                  onClick={() => setMode(m)}
                  className={`min-h-9 px-4 rounded-lg text-sm font-medium ${mode === m ? "bg-card shadow-soft" : "text-muted-foreground"}`}
                >
                  {m === "encode" ? "Encode" : "Decode"}
                </button>
              ))}
            </div>
            <div role="radiogroup" aria-label="Scope" className="inline-flex p-1 rounded-xl bg-muted">
              {(["component", "url"] as const).map((s) => (
                <button
                  key={s}
                  role="radio"
                  aria-checked={scope === s}
                  onClick={() => setScope(s)}
                  className={`min-h-9 px-3 rounded-lg text-xs font-medium ${scope === s ? "bg-card shadow-soft" : "text-muted-foreground"}`}
                >
                  {s === "component" ? "Component (safer)" : "Whole URL"}
                </button>
              ))}
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={batch}
              onClick={() => setBatch(!batch)}
              className={`inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border text-xs font-medium ${batch ? "border-primary bg-primary-soft text-primary" : "border-border bg-card hover:bg-primary-soft text-muted-foreground"}`}
              title="Process each line as a separate value"
            >
              <Rows3 className="size-3.5" /> Batch (line by line)
            </button>
          </div>


          <div className="flex items-center justify-between">
            <label htmlFor="ue-in" className="eyebrow">Input</label>
            {input && (
              <button onClick={() => setInput("")} className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs">
                <Trash2 className="size-3.5" /> Clear
              </button>
            )}
          </div>
          <textarea
            id="ue-in"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={batch
              ? "Paste one URL per line…"
              : mode === "encode" ? "Paste any text or URL to encode…" : "Paste a percent-encoded string to decode…"}
            className="w-full min-h-[260px] rounded-xl border border-border bg-card p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground">
            {batch
              ? <>Each non-empty line is processed independently. Lines that fail are marked with <code className="font-mono">{`# error: …`}</code>.</>
              : <><strong>Component</strong> escapes every reserved character — use it for query values or path segments. <strong>Whole URL</strong> keeps :/?#&amp;= intact — use it for full addresses.</>}
          </p>

        </section>

        <section className="soft-card p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Link2 className="size-4 text-primary" />
              <div className="font-display text-lg">Result</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={swap}
                disabled={!result.out}
                className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs disabled:opacity-50"
                aria-label="Swap result back to input"
              >
                <ArrowLeftRight className="size-3.5" /> Swap
              </button>
              <button
                onClick={copyOut}
                disabled={!result.out}
                className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs disabled:opacity-50"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
          {result.error ? (
            <WarnBox>{result.error} — usually a stray %, or a % not followed by two hex digits.</WarnBox>
          ) : result.out ? (
            <pre className="rounded-xl border border-border bg-card p-3 font-mono text-sm break-all whitespace-pre-wrap" aria-live="polite">{result.out}</pre>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Your encoded or decoded text will appear here.
            </div>
          )}
        </section>
      </div>

      <HowItWorks>
        <li>Paste your text or URL on the left.</li>
        <li>Pick Encode or Decode and choose Component (safer) or Whole URL.</li>
        <li>Copy the result, or hit Swap to round-trip it back through the other direction.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
