import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Copy, Check, Trash2, ArrowLeftRight, Code2 } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";
import { encodeHtml, decodeHtml } from "../lib/extra-tools-helpers";

export const Route = createFileRoute("/html-entities")({
  head: () => ({
    meta: [
      { title: "HTML Entity Encoder & Decoder — Free Online" },
      { name: "description", content: "Encode HTML special characters or decode named, decimal and hex entities. Free, in-browser, no sign-up." },
      { property: "og:title", content: "HTML Entities — Bluebird" },
      { property: "og:description", content: "Encode or decode HTML entities. Named, numeric and hex — all in your browser." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/html-entities" },
    ],
    links: [{ rel: "canonical", href: "/html-entities" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Bluebird HTML Entity Encoder & Decoder",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any (Web)",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      }),
    }],
  }),
  component: Page,
});

type Mode = "encode" | "decode";
type EncodeMode = "named" | "numeric" | "all";

const PREF_KEY = "bb-html-entities-prefs-v1";

function Page() {
  const [mode, setMode] = useState<Mode>("encode");
  const [encMode, setEncMode] = useState<EncodeMode>("named");
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREF_KEY);
      if (!raw) return;
      const p = JSON.parse(raw);
      if (p.mode === "encode" || p.mode === "decode") setMode(p.mode);
      if (p.encMode === "named" || p.encMode === "numeric" || p.encMode === "all") setEncMode(p.encMode);
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem(PREF_KEY, JSON.stringify({ mode, encMode })); } catch { /* ignore */ }
  }, [mode, encMode]);

  const out = useMemo(() => {
    if (!input) return "";
    return mode === "encode" ? encodeHtml(input, { mode: encMode }) : decodeHtml(input);
  }, [input, mode, encMode]);

  async function copyOut() {
    if (!out) return;
    await navigator.clipboard.writeText(out);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  function swap() {
    if (!out) return;
    setMode(mode === "encode" ? "decode" : "encode");
    setInput(out);
  }

  return (
    <ToolLayout slug="html-entities">
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
            {mode === "encode" && (
              <div role="radiogroup" aria-label="Encoding scope" className="inline-flex p-1 rounded-xl bg-muted">
                {(["named", "numeric", "all"] as const).map((m) => (
                  <button
                    key={m}
                    role="radio"
                    aria-checked={encMode === m}
                    onClick={() => setEncMode(m)}
                    className={`min-h-9 px-3 rounded-lg text-xs font-medium capitalize ${encMode === m ? "bg-card shadow-soft" : "text-muted-foreground"}`}
                  >
                    {m === "all" ? "All non-ASCII" : m}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="he-in" className="eyebrow">Input</label>
            {input && (
              <button onClick={() => setInput("")} className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs">
                <Trash2 className="size-3.5" /> Clear
              </button>
            )}
          </div>
          <textarea
            id="he-in"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "encode" ? 'Paste text with <, >, " or non-ASCII characters…' : "Paste text with &amp; / &#233; / &#x2014; entities…"}
            className="w-full min-h-[260px] rounded-xl border border-border bg-card p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground">
            {mode === "encode"
              ? <><strong>Named</strong> uses &amp;amp; &amp;lt; &amp;gt; &amp;quot; only. <strong>Numeric</strong> adds &amp;#nnn; for non-ASCII. <strong>All non-ASCII</strong> escapes every character outside the printable ASCII range.</>
              : <>Decodes named (&amp;copy;), decimal (&amp;#169;) and hex (&amp;#xA9;) entities.</>}
          </p>
        </section>

        <section className="soft-card p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Code2 className="size-4 text-primary" />
              <div className="font-display text-lg">Result</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={swap}
                disabled={!out}
                className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs disabled:opacity-50"
              >
                <ArrowLeftRight className="size-3.5" /> Swap
              </button>
              <button
                onClick={copyOut}
                disabled={!out}
                className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs disabled:opacity-50"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
          {out ? (
            <pre className="rounded-xl border border-border bg-card p-3 font-mono text-sm break-all whitespace-pre-wrap" aria-live="polite">{out}</pre>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Your encoded or decoded text will appear here.
            </div>
          )}
        </section>
      </div>

      <HowItWorks>
        <li>Paste your text or HTML on the left.</li>
        <li>Pick Encode (and how aggressive) or Decode.</li>
        <li>Copy the result, or hit Swap to round-trip it.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
