import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import xmlFormat from "xml-formatter";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/xml-formatter")({
  head: () => ({
    meta: [
      { title: "XML Formatter — Free Online XML Beautifier & Minifier" },
      { name: "description", content: "Format, validate and minify XML in your browser. Pretty-print, collapse whitespace, set indent. Works offline once loaded." },
      { property: "og:title", content: "XML Formatter — Bluebird" },
      { property: "og:description", content: "Beautify and validate XML instantly." },
      { property: "og:url", content: "/xml-formatter" },
    ],
    links: [{ rel: "canonical", href: "/xml-formatter" }],
  }),
  component: Page,
});

function Page() {
  const [input, setInput] = useState(`<note><to>You</to><from>Bluebird</from><body>Format me!</body></note>`);
  const [indent, setIndent] = useState(2);
  const [mode, setMode] = useState<"pretty" | "minify">("pretty");
  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: null as string | null };
    try {
      if (mode === "minify") {
        return { output: xmlFormat.minify(input, { collapseContent: true }), error: null };
      }
      return { output: xmlFormat(input, { indentation: " ".repeat(indent), collapseContent: true, lineSeparator: "\n" }), error: null };
    } catch (e) {
      return { output: "", error: e instanceof Error ? e.message : "Invalid XML" };
    }
  }, [input, indent, mode]);

  return (
    <ToolLayout slug="xml-formatter">
      <div className="soft-card p-4 sm:p-5 mb-5 flex flex-wrap gap-3 items-end">
        <label className="text-sm">
          <div className="eyebrow mb-1">Mode</div>
          <select value={mode} onChange={(e) => setMode(e.target.value as "pretty" | "minify")}
            className="min-h-10 px-3 rounded-lg border border-border bg-card">
            <option value="pretty">Pretty print</option>
            <option value="minify">Minify</option>
          </select>
        </label>
        {mode === "pretty" && (
          <label className="text-sm">
            <div className="eyebrow mb-1">Indent</div>
            <select value={indent} onChange={(e) => setIndent(Number(e.target.value))}
              className="min-h-10 px-3 rounded-lg border border-border bg-card">
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
            </select>
          </label>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="soft-card p-4 sm:p-5 space-y-3">
          <div className="eyebrow">Your XML</div>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={16} spellCheck={false}
            aria-label="XML input"
            className="w-full font-mono text-sm rounded-xl border border-border bg-card p-3 focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="soft-card p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="eyebrow">{mode === "minify" ? "Minified" : "Formatted"}</div>
            <button onClick={() => navigator.clipboard.writeText(output)} disabled={!output}
              className="min-h-10 px-3 rounded-lg border border-border bg-card hover:border-primary inline-flex items-center gap-2 text-sm disabled:opacity-50">
              <Copy className="size-4" /> Copy
            </button>
          </div>
          {error ? (
            <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 text-destructive p-3 text-sm">{error}</div>
          ) : (
            <pre aria-live="polite" className="min-h-[24rem] rounded-xl border border-border bg-card p-3 overflow-auto font-mono text-sm whitespace-pre">{output}</pre>
          )}
        </div>
      </div>

      <HowItWorks>
        <li>Paste your XML into the editor.</li>
        <li>Choose pretty-print with 2 or 4-space indent, or minify to one line.</li>
        <li>Copy the result — invalid XML shows a clear error message.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
