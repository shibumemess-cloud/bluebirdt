import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState, type DragEvent } from "react";
import {
  Copy,
  Check,
  Download,
  Braces,
  Trash2,
  Sparkles,
  ClipboardPaste,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Upload,
  FileCode2,
} from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";
import { jsonToYaml } from "../lib/image-tool-helpers";
import ogImage from "../assets/og/og-json.jpg";

export const Route = createFileRoute("/json-formatter")({
  head: () => ({
    meta: [
      { title: "JSON Formatter — Pretty-print, Validate, Minify Free" },
      {
        name: "description",
        content:
          "Paste JSON to pretty-print, validate or minify it instantly. Convert to YAML, pinpoint syntax errors with line and column. Free, in-browser, no uploads.",
      },
      { property: "og:title", content: "JSON Formatter — Bluebird" },
      { property: "og:description", content: "Pretty-print, validate, minify and convert JSON to YAML instantly in your browser. Free, no sign-up." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/json-formatter" },
      { property: "og:image", content: ogImage },
      { name: "twitter:image", content: ogImage },
    ],
    links: [{ rel: "canonical", href: "/json-formatter" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird JSON Formatter",
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          description: "Free in-browser JSON formatter with validate, pretty-print, minify and YAML export.",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Does my JSON get uploaded anywhere?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "No. All parsing, formatting and conversion happens in your browser using JSON.parse. Your data never leaves the page.",
              },
            },
            {
              "@type": "Question",
              name: "Can I open a .json file directly?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. Drag any .json file onto the input area, or click 'Open file' to pick one. Files up to 5 MB work smoothly.",
              },
            },
            {
              "@type": "Question",
              name: "What's the difference between formatted and minified output?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Formatted is indented for humans to read. Minified strips all whitespace for the smallest file size — great for APIs and config bundles.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: Page,
});


const MAX_BYTES = 5 * 1024 * 1024; // 5 MB — generous for JSON

const SAMPLE = `{"name":"Bluebird","tools":12,"private":true,"features":["compress","resize","format","validate"],"meta":{"free":true,"signUp":false}}`;

type ParseResult =
  | { ok: true; value: unknown }
  | { ok: false; message: string; line?: number; column?: number };

function parseJson(input: string): ParseResult {
  if (!input.trim()) return { ok: false, message: "Paste some JSON to begin." };
  try {
    const value = JSON.parse(input);
    return { ok: true, value };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Most engines report a character position — translate to line/column.
    const posMatch = msg.match(/position (\d+)/i);
    if (posMatch) {
      const pos = Math.min(input.length, parseInt(posMatch[1], 10));
      const before = input.slice(0, pos);
      const line = (before.match(/\n/g) ?? []).length + 1;
      const column = pos - before.lastIndexOf("\n");
      return { ok: false, message: humanise(msg), line, column };
    }
    return { ok: false, message: humanise(msg) };
  }
}

function humanise(msg: string): string {
  return msg
    .replace(/^JSON\.parse:\s*/i, "")
    .replace(/^Unexpected token/i, "Unexpected character")
    .replace(/in JSON at position \d+/i, "")
    .trim() || "That doesn't look like valid JSON.";
}

function countNodes(v: unknown): { keys: number; arrays: number; depth: number } {
  let keys = 0, arrays = 0, depth = 0;
  function walk(node: unknown, d: number) {
    if (d > depth) depth = d;
    if (Array.isArray(node)) {
      arrays++;
      for (const item of node) walk(item, d + 1);
    } else if (node && typeof node === "object") {
      const obj = node as Record<string, unknown>;
      for (const k of Object.keys(obj)) {
        keys++;
        walk(obj[k], d + 1);
      }
    }
  }
  walk(v, 0);
  return { keys, arrays, depth };
}

function bytesLabel(s: string): string {
  const b = new Blob([s]).size;
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}

function Page() {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState<2 | 4 | 0>(2); // 0 = tab
  const [sortKeys, setSortKeys] = useState(false);
  const [view, setView] = useState<"json" | "yaml">("json");
  const [copied, setCopied] = useState(false);
  const [oversize, setOversize] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const result = useMemo(() => parseJson(input), [input]);

  useEffect(() => {
    setOversize(new Blob([input]).size > MAX_BYTES);
  }, [input]);

  const formatted = useMemo(() => {
    if (!result.ok) return "";
    const space = indent === 0 ? "\t" : indent;
    const replacer = sortKeys
      ? (_k: string, v: unknown) => {
          if (v && typeof v === "object" && !Array.isArray(v)) {
            const obj = v as Record<string, unknown>;
            return Object.keys(obj)
              .sort()
              .reduce<Record<string, unknown>>((acc, k) => {
                acc[k] = obj[k];
                return acc;
              }, {});
          }
          return v;
        }
      : undefined;
    try {
      return JSON.stringify(result.value, replacer, space);
    } catch {
      return "";
    }
  }, [result, indent, sortKeys]);

  const yaml = useMemo(() => {
    if (!result.ok) return "";
    try {
      // Apply the same sort if requested so YAML matches the JSON view.
      const v = sortKeys ? JSON.parse(formatted) : result.value;
      return jsonToYaml(v);
    } catch {
      return "";
    }
  }, [result, formatted, sortKeys]);

  const minified = useMemo(() => {
    if (!result.ok) return "";
    try { return JSON.stringify(result.value); } catch { return ""; }
  }, [result]);

  const stats = useMemo(() => (result.ok ? countNodes(result.value) : null), [result]);

  const output = view === "yaml" ? yaml : formatted;
  const outputName = view === "yaml" ? "data.yaml" : "formatted.json";
  const outputMime = view === "yaml" ? "text/yaml" : "application/json";

  async function copy(s: string) {
    if (!s) return;
    try {
      await navigator.clipboard.writeText(s);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  async function paste() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setInput(text);
    } catch {
      /* ignore — clipboard may be blocked */
    }
  }

  const loadFile = useCallback(async (file: File) => {
    setFileError(null);
    if (file.size > MAX_BYTES) {
      setFileError(`File is over 5 MB. Try pasting just the part you need.`);
      return;
    }
    const looksJson = /\.json$|\.jsonc$|\.txt$/i.test(file.name) || file.type.includes("json") || file.type.startsWith("text/");
    if (!looksJson) {
      setFileError("That doesn't look like a text or .json file.");
      return;
    }
    try {
      const text = await file.text();
      setInput(text);
    } catch {
      setFileError("Couldn't read that file.");
    }
  }, []);

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void loadFile(file);
  }

  function download(content: string, name: string, mime: string) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  return (
    <ToolLayout slug="json-formatter">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input */}
        <div
          className={[
            "soft-card p-5 sm:p-6 flex flex-col transition-shadow",
            dragging ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "",
          ].join(" ")}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <span className="eyebrow inline-flex items-center gap-2">
              <Braces className="size-4 text-primary" /> Paste or drop JSON
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <label className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium hover:bg-primary-soft min-h-9 cursor-pointer">
                <Upload className="size-4" />
                <span className="hidden sm:inline">Open file</span>
                <input
                  type="file"
                  accept=".json,.jsonc,.txt,application/json,text/*"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void loadFile(f);
                    e.target.value = "";
                  }}
                />
              </label>
              <SmallBtn onClick={paste} icon={<ClipboardPaste className="size-4" />} label="Paste" />
              <SmallBtn onClick={() => setInput(SAMPLE)} icon={<Sparkles className="size-4" />} label="Sample" />
              <SmallBtn onClick={() => { setInput(""); setFileError(null); }} icon={<Trash2 className="size-4" />} label="Clear" disabled={!input} />
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder='{"hello": "world"}  — or drop a .json file here'
            aria-label="JSON input"
            className="w-full grow min-h-72 font-mono text-sm rounded-xl border border-border bg-card p-3 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
          />
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="num">{bytesLabel(input)}</span>
            <span className="num">{input.length.toLocaleString()} characters</span>
            <span className="num">{(input.match(/\n/g)?.length ?? 0) + (input ? 1 : 0)} lines</span>
            {oversize && (
              <span className="inline-flex items-center gap-1 text-[color:var(--color-warn-foreground)]">
                <AlertTriangle className="size-3.5" /> Very large input — the page may feel slow.
              </span>
            )}
          </div>
          {fileError && (
            <div role="alert" className="mt-3 inline-flex items-start gap-2 rounded-xl status-danger border px-3 py-2 text-sm">
              <AlertTriangle className="size-4 mt-0.5 shrink-0" /> {fileError}
            </div>
          )}



          {/* Status */}
          <div className="mt-3" aria-live="polite">
            {input && (result.ok ? (
              <div className="inline-flex items-center gap-2 rounded-xl status-success border px-3 py-2 text-sm">
                <CheckCircle2 className="size-4" />
                <span>Valid JSON{stats && ` · ${stats.keys} keys, ${stats.arrays} arrays, depth ${stats.depth}`}</span>
              </div>
            ) : (
              <div role="alert" className="inline-flex items-start gap-2 rounded-xl status-danger border px-3 py-2 text-sm">
                <AlertTriangle className="size-4 mt-0.5 shrink-0" />
                <span>
                  {result.message}
                  {result.line && (
                    <> — line <strong className="num">{result.line}</strong>, column <strong className="num">{result.column}</strong></>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Output */}
        <div className="soft-card p-5 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-muted/40 border border-border" role="radiogroup" aria-label="Output format">
              {(["json", "yaml"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={view === v}
                  onClick={() => setView(v)}
                  className={[
                    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold min-h-9 transition-colors",
                    view === v
                      ? "bg-card text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {v === "json" ? <Braces className="size-3.5" /> : <FileCode2 className="size-3.5" />}
                  {v === "json" ? "JSON" : "YAML"}
                </button>
              ))}
            </div>
            {view === "json" && (
              <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Indentation">
                {[2, 4, 0].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={indent === n}
                    onClick={() => setIndent(n as 2 | 4 | 0)}
                    className={[
                      "rounded-lg border px-2.5 py-1.5 text-xs font-medium min-h-9",
                      indent === n
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border bg-card text-muted-foreground hover:bg-primary-soft/40",
                    ].join(" ")}
                  >
                    {n === 0 ? "Tab" : `${n} sp`}
                  </button>
                ))}
                <button
                  type="button"
                  role="switch"
                  aria-checked={sortKeys}
                  onClick={() => setSortKeys((v) => !v)}
                  className={[
                    "ml-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium min-h-9",
                    sortKeys
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border bg-card text-muted-foreground hover:bg-primary-soft/40",
                  ].join(" ")}
                  title="Sort object keys alphabetically"
                >
                  A→Z keys
                </button>
              </div>
            )}
          </div>

          <pre
            className="grow min-h-72 max-h-[28rem] overflow-auto rounded-xl border border-border bg-card p-3 font-mono text-sm whitespace-pre"
            aria-label={`Formatted ${view.toUpperCase()} output`}
          >
            {output || <span className="text-muted-foreground">Pretty-printed {view.toUpperCase()} will appear here.</span>}
          </pre>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => copy(output)}
              disabled={!output}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3 font-semibold min-h-12 hover:shadow-lift hover:-translate-y-0.5 disabled:opacity-50"
            >
              {copied ? <><Check className="size-4" /> Copied</> : <><Copy className="size-4" /> Copy {view === "yaml" ? "YAML" : "formatted"}</>}
            </button>
            <button
              type="button"
              onClick={() => download(output, outputName, outputMime)}
              disabled={!output}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 font-medium min-h-12 hover:bg-primary-soft disabled:opacity-50"
            >
              <Download className="size-4" /> Download .{view === "yaml" ? "yaml" : "json"}
            </button>
          </div>


          {minified && (
            <div className="mt-4 rounded-xl border border-border bg-card/60 p-3">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-semibold inline-flex items-center gap-1.5">
                  <Minus className="size-3.5 text-primary" /> Minified · {bytesLabel(minified)}
                </span>
                <button
                  type="button"
                  onClick={() => copy(minified)}
                  className="text-xs font-medium text-primary hover:underline underline-offset-4"
                >
                  Copy
                </button>
              </div>
              <code className="block font-mono text-xs break-all text-muted-foreground line-clamp-3">{minified}</code>
            </div>
          )}

          <HowItWorks>
            We parse your JSON with your browser's built-in <code>JSON.parse</code>.
            Nothing is uploaded — your data never leaves this tab.
          </HowItWorks>
        </div>
      </div>
    </ToolLayout>
  );
}

function SmallBtn({
  onClick,
  icon,
  label,
  disabled,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium hover:bg-primary-soft disabled:opacity-50 min-h-9"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
