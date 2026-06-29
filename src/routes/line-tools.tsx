import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, Check, Trash2, ClipboardPaste, ListFilter } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/line-tools")({
  head: () => ({
    meta: [
      { title: "Line Sort & Dedupe — Free Browser Text Line Tools" },
      { name: "description", content: "Sort lines A→Z or Z→A, remove duplicates, trim whitespace, drop blanks and reverse lists. Runs fully in your browser." },
      { property: "og:title", content: "Line Sort & Dedupe — Bluebird" },
      { property: "og:description", content: "Sort, dedupe, trim and clean text lines in your browser. No upload." },
      { property: "og:url", content: "/line-tools" },
    ],
    links: [{ rel: "canonical", href: "/line-tools" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird Line Sort & Dedupe",
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: Page,
});

type SortMode = "none" | "asc" | "desc" | "natural" | "reverse" | "shuffle";

export function processLines(input: string, opts: {
  sort: SortMode;
  dedupe: boolean;
  trim: boolean;
  dropBlank: boolean;
  caseInsensitive: boolean;
}): string {
  let lines = input.split(/\r?\n/);
  if (opts.trim) lines = lines.map((l) => l.trim());
  if (opts.dropBlank) lines = lines.filter((l) => l.length > 0);
  if (opts.dedupe) {
    const seen = new Set<string>();
    lines = lines.filter((l) => {
      const k = opts.caseInsensitive ? l.toLowerCase() : l;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }
  const cmp = (a: string, b: string) => {
    const x = opts.caseInsensitive ? a.toLowerCase() : a;
    const y = opts.caseInsensitive ? b.toLowerCase() : b;
    return x.localeCompare(y);
  };
  if (opts.sort === "asc") lines.sort(cmp);
  else if (opts.sort === "desc") lines.sort((a, b) => cmp(b, a));
  else if (opts.sort === "natural")
    lines.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: opts.caseInsensitive ? "base" : "variant" }));
  else if (opts.sort === "reverse") lines.reverse();
  else if (opts.sort === "shuffle") {
    for (let i = lines.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [lines[i], lines[j]] = [lines[j], lines[i]];
    }
  }
  return lines.join("\n");
}

function Page() {
  const [input, setInput] = useState("");
  const [sort, setSort] = useState<SortMode>("asc");
  const [dedupe, setDedupe] = useState(true);
  const [trim, setTrim] = useState(true);
  const [dropBlank, setDropBlank] = useState(true);
  const [ci, setCi] = useState(false);
  const [copied, setCopied] = useState(false);

  const output = useMemo(
    () => processLines(input, { sort, dedupe, trim, dropBlank, caseInsensitive: ci }),
    [input, sort, dedupe, trim, dropBlank, ci]
  );

  const inLines = input ? input.split(/\r?\n/).length : 0;
  const outLines = output ? output.split(/\r?\n/).length : 0;

  async function paste() {
    try { setInput(await navigator.clipboard.readText()); } catch {}
  }
  async function copy() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  return (
    <ToolLayout slug="line-tools">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="lt-in" className="eyebrow">Your lines</label>
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
            id="lt-in"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={"apple\nbanana\napple\n  cherry  \n\nbanana"}
            className="w-full min-h-56 rounded-xl border border-border bg-card p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />

          <div className="text-xs text-muted-foreground">{inLines.toLocaleString()} lines in</div>

          <div>
            <div className="eyebrow mb-2">Order</div>
            <div role="radiogroup" className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {([
                ["none", "Keep order"],
                ["asc", "A → Z"],
                ["desc", "Z → A"],
                ["natural", "Natural (1,2,10)"],
                ["reverse", "Reverse"],
                ["shuffle", "Shuffle"],
              ] as [SortMode, string][]).map(([id, label]) => (
                <button
                  key={id}
                  role="radio"
                  aria-checked={sort === id}
                  onClick={() => setSort(id)}
                  className={`min-h-11 rounded-xl border px-3 text-sm ${sort === id ? "border-primary bg-primary-soft" : "border-border bg-card hover:bg-primary-soft"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {([
              ["Remove duplicates", dedupe, setDedupe],
              ["Trim whitespace", trim, setTrim],
              ["Drop blank lines", dropBlank, setDropBlank],
              ["Case insensitive", ci, setCi],
            ] as [string, boolean, (v: boolean) => void][]).map(([label, val, set]) => (
              <label key={label} className="flex items-center gap-2 min-h-11 rounded-xl border border-border bg-card px-3 text-sm cursor-pointer">
                <input type="checkbox" checked={val} onChange={(e) => set(e.target.checked)} className="size-4 accent-primary" />
                {label}
              </label>
            ))}
          </div>
        </section>

        <section className="soft-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListFilter className="size-4 text-primary" />
              <div className="font-display text-lg">Result</div>
            </div>
            <div className="text-xs text-muted-foreground" aria-live="polite">
              {outLines.toLocaleString()} lines · {(inLines - outLines).toLocaleString()} removed
            </div>
          </div>
          {!input ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Your cleaned, sorted lines will appear here.
            </div>
          ) : (
            <>
              <textarea readOnly value={output} className="w-full min-h-56 rounded-xl border border-border bg-card p-3 font-mono text-sm" />
              <div className="flex flex-wrap gap-2">
                <button onClick={copy} className="inline-flex items-center gap-2 min-h-11 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-95">
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {copied ? "Copied" : "Copy result"}
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([output], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url; a.download = "lines.txt"; a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="inline-flex items-center gap-2 min-h-11 px-4 rounded-xl border border-border bg-card hover:bg-primary-soft text-sm font-medium"
                >
                  Download .txt
                </button>
              </div>
            </>
          )}
        </section>
      </div>

      <HowItWorks>
        <li>Paste your list of lines into the left box.</li>
        <li>Pick an order and toggle the cleaners you need.</li>
        <li>Copy the polished list or save it as a text file.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
