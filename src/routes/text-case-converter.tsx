import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, Check, Type, Trash2, ClipboardPaste } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/text-case-converter")({
  head: () => ({
    meta: [
      { title: "Text Case Converter — UPPER, lower, Title, camelCase Free" },
      {
        name: "description",
        content:
          "Switch text between UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case, kebab-case and more. Live word/character counts. Free, in-browser.",
      },
      { property: "og:title", content: "Text Case Converter — Bluebird" },
      { property: "og:description", content: "Convert text to UPPER, lower, Title, camel, snake or kebab case instantly. Free, no sign-up." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/text-case-converter" },
    ],
    links: [{ rel: "canonical", href: "/text-case-converter" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird Text Case Converter",
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          description: "Free in-browser tool to convert text between common letter cases.",
        }),
      },
    ],
  }),
  component: Page,
});

type Case =
  | "upper"
  | "lower"
  | "title"
  | "sentence"
  | "camel"
  | "pascal"
  | "snake"
  | "kebab"
  | "constant"
  | "alternating"
  | "inverse";

const CASES: { id: Case; label: string; sample: string }[] = [
  { id: "upper", label: "UPPERCASE", sample: "HELLO WORLD" },
  { id: "lower", label: "lowercase", sample: "hello world" },
  { id: "title", label: "Title Case", sample: "Hello World" },
  { id: "sentence", label: "Sentence case", sample: "Hello world" },
  { id: "camel", label: "camelCase", sample: "helloWorld" },
  { id: "pascal", label: "PascalCase", sample: "HelloWorld" },
  { id: "snake", label: "snake_case", sample: "hello_world" },
  { id: "kebab", label: "kebab-case", sample: "hello-world" },
  { id: "constant", label: "CONSTANT_CASE", sample: "HELLO_WORLD" },
  { id: "alternating", label: "aLtErNaTiNg", sample: "hElLo WoRlD" },
  { id: "inverse", label: "iNVERSE", sample: "hELLO wORLD" },
];

function splitWords(s: string): string[] {
  return s
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_\-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function convertCase(input: string, c: Case): string {
  if (!input) return "";
  switch (c) {
    case "upper": return input.toUpperCase();
    case "lower": return input.toLowerCase();
    case "title":
      return input
        .toLowerCase()
        .replace(/\b([a-z])(\w*)/g, (_, a, b) => a.toUpperCase() + b);
    case "sentence":
      return input
        .toLowerCase()
        .replace(/(^\s*|[.!?]\s+)([a-z])/g, (_, p, c2) => p + c2.toUpperCase());
    case "camel": {
      const w = splitWords(input).map((x) => x.toLowerCase());
      return w.map((x, i) => (i === 0 ? x : x.charAt(0).toUpperCase() + x.slice(1))).join("");
    }
    case "pascal":
      return splitWords(input)
        .map((x) => x.charAt(0).toUpperCase() + x.slice(1).toLowerCase())
        .join("");
    case "snake": return splitWords(input).map((x) => x.toLowerCase()).join("_");
    case "kebab": return splitWords(input).map((x) => x.toLowerCase()).join("-");
    case "constant": return splitWords(input).map((x) => x.toUpperCase()).join("_");
    case "alternating":
      return Array.from(input).map((ch, i) => (i % 2 === 0 ? ch.toLowerCase() : ch.toUpperCase())).join("");
    case "inverse":
      return Array.from(input).map((ch) => (ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase())).join("");
  }
}

function Page() {
  const [input, setInput] = useState("");
  const [active, setActive] = useState<Case>("title");
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => convertCase(input, active), [input, active]);

  const stats = useMemo(() => {
    const chars = input.length;
    const noSpaces = input.replace(/\s+/g, "").length;
    const words = input.trim() ? input.trim().split(/\s+/).length : 0;
    const lines = input ? input.split(/\r?\n/).length : 0;
    return { chars, noSpaces, words, lines };
  }, [input]);

  async function paste() {
    try {
      const t = await navigator.clipboard.readText();
      setInput(t);
    } catch {}
  }

  async function copy() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <ToolLayout slug="text-case-converter">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        {/* Input + cases */}
        <section className="soft-card p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="tc-input" className="eyebrow">Your text</label>
            <div className="flex gap-2">
              <button
                onClick={paste}
                className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs"
              >
                <ClipboardPaste className="size-3.5" /> Paste
              </button>
              {input && (
                <button
                  onClick={() => setInput("")}
                  className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs"
                >
                  <Trash2 className="size-3.5" /> Clear
                </button>
              )}
            </div>
          </div>

          <textarea
            id="tc-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste your text here…"
            className="w-full min-h-48 rounded-xl border border-border bg-card p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="rounded-lg border border-border bg-card p-2">
              <div className="text-muted-foreground">Characters</div>
              <div className="font-display text-base">{stats.chars.toLocaleString()}</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-2">
              <div className="text-muted-foreground">No spaces</div>
              <div className="font-display text-base">{stats.noSpaces.toLocaleString()}</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-2">
              <div className="text-muted-foreground">Words</div>
              <div className="font-display text-base">{stats.words.toLocaleString()}</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-2">
              <div className="text-muted-foreground">Lines</div>
              <div className="font-display text-base">{stats.lines.toLocaleString()}</div>
            </div>
          </div>

          <div>
            <div className="eyebrow mb-2">Pick a case</div>
            <div role="radiogroup" aria-label="Pick a case" className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CASES.map((c) => (
                <button
                  key={c.id}
                  role="radio"
                  aria-checked={active === c.id}
                  onClick={() => setActive(c.id)}
                  className={`text-left min-h-12 rounded-xl border px-3 py-2 transition ${
                    active === c.id
                      ? "border-primary bg-primary-soft"
                      : "border-border bg-card hover:bg-primary-soft"
                  }`}
                >
                  <div className="text-sm font-medium">{c.label}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">{c.sample}</div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Output */}
        <section className="soft-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Type className="size-4 text-primary" />
              <div className="font-display text-lg">Result</div>
            </div>
            <div className="text-xs text-muted-foreground" aria-live="polite">
              {output.length.toLocaleString()} characters
            </div>
          </div>
          {!input ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Your converted text will appear here.
            </div>
          ) : (
            <>
              <textarea
                readOnly
                value={output}
                className="w-full min-h-48 rounded-xl border border-border bg-card p-3 font-mono text-sm"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={copy}
                  className="inline-flex items-center gap-2 min-h-11 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-95"
                >
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {copied ? "Copied" : "Copy result"}
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([output], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `text-${active}.txt`;
                    a.click();
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
        <li>Type or paste any text into the left box.</li>
        <li>Pick the case you want — sample previews show you the shape.</li>
        <li>Copy the result, or download it as a text file.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
