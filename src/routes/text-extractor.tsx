import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, Check, Trash2, ClipboardPaste, Search } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/text-extractor")({
  head: () => ({
    meta: [
      { title: "Text Extractor — Pull Emails, URLs, Numbers from Text" },
      { name: "description", content: "Extract emails, URLs, phone numbers, hashtags, mentions, IP addresses and numbers from any text. Free, private, in-browser." },
      { property: "og:title", content: "Text Extractor — Bluebird" },
      { property: "og:description", content: "Pull emails, URLs, numbers and more out of any text block." },
      { property: "og:url", content: "/text-extractor" },
    ],
    links: [{ rel: "canonical", href: "/text-extractor" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird Text Extractor",
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: Page,
});

type Kind = "email" | "url" | "phone" | "ipv4" | "number" | "hashtag" | "mention";

const PATTERNS: Record<Kind, { label: string; regex: RegExp; desc: string }> = {
  email:   { label: "Emails",       regex: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,           desc: "name@example.com" },
  url:     { label: "URLs",         regex: /\bhttps?:\/\/[^\s<>"')]+/gi,                                desc: "https://…" },
  phone:   { label: "Phone numbers",regex: /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?){2,4}\d{2,4}/g, desc: "+1 555-123-4567" },
  ipv4:    { label: "IPv4 addresses",regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,                             desc: "192.168.1.1" },
  number:  { label: "Numbers",      regex: /-?\d+(?:\.\d+)?/g,                                          desc: "42 · 3.14" },
  hashtag: { label: "Hashtags",     regex: /#[A-Za-z0-9_]+/g,                                           desc: "#bluebird" },
  mention: { label: "@mentions",    regex: /@[A-Za-z0-9_]+/g,                                           desc: "@friend" },
};

export function extract(input: string, kind: Kind, unique: boolean): string[] {
  if (!input) return [];
  const matches = input.match(PATTERNS[kind].regex) ?? [];
  return unique ? Array.from(new Set(matches)) : matches;
}

function Page() {
  const [input, setInput] = useState("");
  const [kind, setKind] = useState<Kind>("email");
  const [unique, setUnique] = useState(true);
  const [copied, setCopied] = useState(false);

  const results = useMemo(() => extract(input, kind, unique), [input, kind, unique]);

  async function paste() { try { setInput(await navigator.clipboard.readText()); } catch {} }
  async function copy() {
    if (!results.length) return;
    await navigator.clipboard.writeText(results.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  return (
    <ToolLayout slug="text-extractor">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="tx-in" className="eyebrow">Paste any text</label>
            <div className="flex gap-2">
              <button onClick={paste} className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs">
                <ClipboardPaste className="size-3.5" /> Paste
              </button>
              {input && (
                <button onClick={() => setInput("")} className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs">
                  <Trash2 className="size-3.5" /> Clear
                </button>
              )}
            </div>
          </div>

          <textarea
            id="tx-in"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste an email thread, a doc, a chat log…"
            className="w-full min-h-56 rounded-xl border border-border bg-card p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />

          <div>
            <div className="eyebrow mb-2">What to pull out</div>
            <div role="radiogroup" className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(PATTERNS) as Kind[]).map((k) => (
                <button
                  key={k}
                  role="radio"
                  aria-checked={kind === k}
                  onClick={() => setKind(k)}
                  className={`text-left min-h-12 rounded-xl border px-3 py-2 ${kind === k ? "border-primary bg-primary-soft" : "border-border bg-card hover:bg-primary-soft"}`}
                >
                  <div className="text-sm font-medium">{PATTERNS[k].label}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">{PATTERNS[k].desc}</div>
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 min-h-11 rounded-xl border border-border bg-card px-3 text-sm cursor-pointer w-fit">
            <input type="checkbox" checked={unique} onChange={(e) => setUnique(e.target.checked)} className="size-4 accent-primary" />
            Remove duplicates
          </label>
        </section>

        <section className="soft-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="size-4 text-primary" />
              <div className="font-display text-lg">Found</div>
            </div>
            <div className="text-xs text-muted-foreground" aria-live="polite">
              {results.length.toLocaleString()} {PATTERNS[kind].label.toLowerCase()}
            </div>
          </div>
          {!input ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Matches will appear here as you type.
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Nothing matched. Try a different category.
            </div>
          ) : (
            <>
              <textarea readOnly value={results.join("\n")} className="w-full min-h-56 rounded-xl border border-border bg-card p-3 font-mono text-sm" />
              <div className="flex flex-wrap gap-2">
                <button onClick={copy} className="inline-flex items-center gap-2 min-h-11 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-95">
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {copied ? "Copied" : "Copy all"}
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([results.join("\n")], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url; a.download = `${kind}.txt`; a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="inline-flex items-center gap-2 min-h-11 px-4 rounded-xl border border-border bg-card hover:bg-primary-soft text-sm font-medium"
                >
                  Download
                </button>
              </div>
            </>
          )}
        </section>
      </div>

      <HowItWorks>
        <li>Paste any block of text — an email, a chat, a webpage copy.</li>
        <li>Choose the kind of item you want pulled out.</li>
        <li>Copy the clean list, or save it as a text file.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
