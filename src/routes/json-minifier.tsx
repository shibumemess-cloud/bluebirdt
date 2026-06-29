import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, Check, Braces, Download, ClipboardPaste, Trash2, AlertTriangle } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/json-minifier")({
  head: () => ({
    meta: [
      { title: "JSON Minifier — Compress JSON Online, Free" },
      { name: "description", content: "Paste JSON and minify or pretty-print it instantly. Validates as you type, shows size saved, and never uploads — runs in your browser." },
      { property: "og:title", content: "JSON Minifier — Bluebird" },
      { property: "og:description", content: "Minify, pretty-print and validate JSON in your browser. See the exact size saved." },
      { property: "og:url", content: "/json-minifier" },
    ],
    links: [{ rel: "canonical", href: "/json-minifier" }],
  }),
  component: Page,
});

type Mode = "minify" | "pretty";

function bytes(s: string) { return new Blob([s]).size; }
function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function Page() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("minify");
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!input.trim()) return { ok: true as const, value: "", inSize: 0, outSize: 0 };
    try {
      const parsed = JSON.parse(input);
      const value = mode === "minify" ? JSON.stringify(parsed) : JSON.stringify(parsed, null, indent);
      return { ok: true as const, value, inSize: bytes(input), outSize: bytes(value) };
    } catch (e) {
      const msg = (e as Error).message;
      // Extract position from "Unexpected token X in JSON at position N"
      const m = /position (\d+)/.exec(msg);
      let line: number | null = null, col: number | null = null;
      if (m) {
        const pos = Number(m[1]);
        const before = input.slice(0, pos);
        line = before.split("\n").length;
        col = pos - before.lastIndexOf("\n");
      }
      return { ok: false as const, error: msg, line, col };
    }
  }, [input, mode, indent]);

  async function copy() {
    if (!result.ok || !result.value) return;
    try {
      await navigator.clipboard.writeText(result.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch { /* ignore */ }
  }

  async function paste() {
    try { const t = await navigator.clipboard.readText(); setInput(t); } catch { /* ignore */ }
  }

  function download() {
    if (!result.ok || !result.value) return;
    const blob = new Blob([result.value], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = mode === "minify" ? "minified.json" : "formatted.json";
    a.click();
  }

  const savings = result.ok && result.inSize > 0 && result.outSize < result.inSize
    ? Math.round(((result.inSize - result.outSize) / result.inSize) * 100)
    : 0;

  return (
    <ToolLayout slug="json-minifier">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-xl border border-border bg-card p-1">
            {(["minify", "pretty"] as const).map((m) => (
              <button key={m} type="button" onClick={() => setMode(m)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {m === "minify" ? "Minify" : "Pretty-print"}
              </button>
            ))}
          </div>
          {mode === "pretty" && (
            <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              Indent
              <select value={indent} onChange={(e) => setIndent(Number(e.target.value))} className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm">
                <option value={2}>2 spaces</option><option value={4}>4 spaces</option><option value={8}>Tab (8)</option>
              </select>
            </label>
          )}
          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={paste} className="inline-flex items-center gap-1.5 min-h-10 px-3 rounded-xl border border-border bg-card hover:border-primary text-sm">
              <ClipboardPaste className="size-4" /> Paste
            </button>
            <button type="button" onClick={() => setInput("")} disabled={!input} className="inline-flex items-center gap-1.5 min-h-10 px-3 rounded-xl border border-border bg-card hover:border-primary text-sm disabled:opacity-50">
              <Trash2 className="size-4" /> Clear
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="soft-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="eyebrow">Input JSON</span>
              <span className="text-xs text-muted-foreground num">{fmtBytes(bytes(input))}</span>
            </div>
            <textarea value={input} onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              placeholder='{ "name": "Bluebird", "items": [1, 2, 3] }'
              className="w-full h-[60vh] min-h-72 rounded-xl border border-border bg-background p-3 font-mono text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-y" />
            {!result.ok && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm">
                <AlertTriangle aria-hidden className="size-4 mt-0.5 shrink-0 text-destructive" />
                <div>
                  <div className="font-medium text-destructive">Invalid JSON{result.line ? ` — line ${result.line}, col ${result.col}` : ""}</div>
                  <div className="text-muted-foreground text-xs mt-0.5">{result.error}</div>
                </div>
              </div>
            )}
          </div>

          <div className="soft-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="eyebrow flex items-center gap-1.5"><Braces className="size-3.5" />{mode === "minify" ? "Minified" : "Formatted"}</span>
              <span className="text-xs text-muted-foreground num">
                {fmtBytes(result.ok ? result.outSize : 0)}
                {savings > 0 && <span className="ml-2 text-primary font-semibold">−{savings}%</span>}
              </span>
            </div>
            <textarea value={result.ok ? result.value : ""} readOnly
              placeholder="Result will appear here."
              className="w-full h-[60vh] min-h-72 rounded-xl border border-border bg-muted/40 p-3 font-mono text-sm resize-y" />
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={copy} disabled={!result.ok || !result.value}
                className="inline-flex items-center gap-1.5 min-h-11 px-4 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-50">
                {copied ? <><Check className="size-4" /> Copied</> : <><Copy className="size-4" /> Copy</>}
              </button>
              <button type="button" onClick={download} disabled={!result.ok || !result.value}
                className="inline-flex items-center gap-1.5 min-h-11 px-4 rounded-xl border border-border bg-card hover:border-primary disabled:opacity-50">
                <Download className="size-4" /> Download
              </button>
            </div>
          </div>
        </div>

        <HowItWorks>
          Minify strips every space and line break that JSON doesn't need — perfect for production APIs, smaller
          bundles and faster page loads. Pretty-print does the opposite: it adds indentation so the file is easy
          to read and review. We validate as you type and point to the exact line if something's off.
        </HowItWorks>
      </div>
    </ToolLayout>
  );
}
