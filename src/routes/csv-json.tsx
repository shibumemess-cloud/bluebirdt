import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import { ArrowLeftRight, Copy, Check, Download, Trash2, Upload, Sparkles } from "lucide-react";

import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks, WarnBox } from "../components/ToolControls";

export const Route = createFileRoute("/csv-json")({
  head: () => ({
    meta: [
      { title: "CSV to JSON Converter — Free Online CSV ⇄ JSON Tool" },
      { name: "description", content: "Convert CSV to JSON or JSON to CSV in your browser. Auto-detect delimiter, preview the result, copy or download — free and private." },
      { property: "og:title", content: "CSV to JSON Converter — Bluebird" },
      { property: "og:description", content: "Free in-browser CSV ⇄ JSON converter with auto-detect, preview and downloads." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/csv-json" },
    ],
    links: [{ rel: "canonical", href: "/csv-json" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird CSV to JSON Converter",
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: Page,
});

type Direction = "csv2json" | "json2csv";

const SAMPLE_CSV = `name,role,city
Ada Lovelace,Engineer,London
Grace Hopper,Admiral,New York
Katherine Johnson,Mathematician,Hampton
`;

const PREF_KEY = "bb-csv-json-prefs-v1";

function csvToJson(input: string, opts: { header: boolean; delimiter: string }): { json: string; rows: number; cols: number; error?: string } {
  if (!input.trim()) return { json: "", rows: 0, cols: 0 };
  const result = Papa.parse<string[] | Record<string, string>>(input, {
    header: opts.header,
    skipEmptyLines: "greedy",
    delimiter: opts.delimiter || undefined,
  });
  if (result.errors.length) {
    const e = result.errors[0];
    return { json: "", rows: 0, cols: 0, error: `Line ${e.row ?? "?"}: ${e.message}` };
  }
  const rows = result.data.length;
  const first = result.data[0];
  const cols = Array.isArray(first) ? first.length : first ? Object.keys(first).length : 0;
  return { json: JSON.stringify(result.data, null, 2), rows, cols };
}

function jsonToCsv(input: string, opts: { delimiter: string }): { csv: string; rows: number; cols: number; error?: string } {
  if (!input.trim()) return { csv: "", rows: 0, cols: 0 };
  try {
    const parsed = JSON.parse(input);
    if (!Array.isArray(parsed)) {
      return { csv: "", rows: 0, cols: 0, error: "JSON must be an array of objects or an array of arrays." };
    }
    const csv = Papa.unparse(parsed as Papa.UnparseObject<Record<string, unknown>>["data"], { delimiter: opts.delimiter || "," });
    const cols = csv.split(/\r?\n/)[0]?.split(opts.delimiter || ",").length ?? 0;
    return { csv, rows: parsed.length, cols };
  } catch (e) {
    return { csv: "", rows: 0, cols: 0, error: e instanceof Error ? e.message : "Invalid JSON." };
  }
}

function Page() {
  const [direction, setDirection] = useState<Direction>("csv2json");
  const [header, setHeader] = useState(true);
  const [delimiter, setDelimiter] = useState<"" | "," | ";" | "\t" | "|">("");
  const [input, setInput] = useState(SAMPLE_CSV);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREF_KEY);
      if (!raw) return;
      const p = JSON.parse(raw);
      if (p.direction === "csv2json" || p.direction === "json2csv") setDirection(p.direction);
      if (typeof p.header === "boolean") setHeader(p.header);
      if (typeof p.delimiter === "string") setDelimiter(p.delimiter);
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem(PREF_KEY, JSON.stringify({ direction, header, delimiter })); } catch { /* ignore */ }
  }, [direction, header, delimiter]);

  const out = useMemo(() => {
    return direction === "csv2json"
      ? csvToJson(input, { header, delimiter })
      : jsonToCsv(input, { delimiter });
  }, [input, direction, header, delimiter]);

  const result = direction === "csv2json"
    ? { text: (out as ReturnType<typeof csvToJson>).json, ...out }
    : { text: (out as ReturnType<typeof jsonToCsv>).csv, ...out };

  async function copy() {
    if (!result.text) return;
    await navigator.clipboard.writeText(result.text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  function download() {
    if (!result.text) return;
    const ext = direction === "csv2json" ? "json" : "csv";
    const mime = direction === "csv2json" ? "application/json" : "text/csv";
    const blob = new Blob([result.text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bluebird-converted.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function swap() {
    if (!result.text) return;
    setDirection(direction === "csv2json" ? "json2csv" : "csv2json");
    setInput(result.text);
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) return;
    const text = await file.text();
    setInput(text);
    // Auto-pick direction from extension.
    if (/\.json$/i.test(file.name)) setDirection("json2csv");
    else if (/\.(csv|tsv)$/i.test(file.name)) setDirection("csv2json");
  }

  return (
    <ToolLayout slug="csv-json">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div role="radiogroup" aria-label="Direction" className="inline-flex p-1 rounded-xl bg-muted">
              {(["csv2json", "json2csv"] as const).map((d) => (
                <button
                  key={d}
                  role="radio"
                  aria-checked={direction === d}
                  onClick={() => setDirection(d)}
                  className={`min-h-9 px-4 rounded-lg text-sm font-medium ${direction === d ? "bg-card shadow-soft" : "text-muted-foreground"}`}
                >
                  {d === "csv2json" ? "CSV → JSON" : "JSON → CSV"}
                </button>
              ))}
            </div>
            <label className="inline-flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Delimiter</span>
              <select
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value as "" | "," | ";" | "\t" | "|")}
                className="min-h-9 rounded-lg border border-border bg-card px-2 text-xs"
              >
                <option value="">Auto</option>
                <option value=",">Comma ,</option>
                <option value=";">Semicolon ;</option>
                <option value={"\t"}>Tab</option>
                <option value="|">Pipe |</option>
              </select>
            </label>
            {direction === "csv2json" && (
              <label className="inline-flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={header}
                  onChange={(e) => setHeader(e.target.checked)}
                  className="size-4 accent-primary"
                />
                First row is header
              </label>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="cj-in" className="eyebrow">Input</label>
            <div className="flex gap-2">
              <label className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs cursor-pointer">
                <Upload className="size-3.5" /> Open file
                <input
                  type="file"
                  accept=".csv,.tsv,.json,text/csv,application/json"
                  className="hidden"
                  onChange={(e) => onFile(e.target.files?.[0])}
                />
              </label>
              {input && (
                <button onClick={() => setInput("")} className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs">
                  <Trash2 className="size-3.5" /> Clear
                </button>
              )}
            </div>
          </div>
          <textarea
            id="cj-in"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={direction === "csv2json" ? "Paste CSV here, or open a .csv file…" : 'Paste JSON array of objects, like [{ "name": "Ada" }]…'}
            className="w-full min-h-[300px] rounded-xl border border-border bg-card p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground">
            <Sparkles className="inline size-3 text-primary" /> Files stay on your device — parsing happens in your browser.
          </p>
        </section>

        <section className="soft-card p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="font-display text-lg">Result</div>
            <div className="flex gap-2">
              <button onClick={swap} disabled={!result.text} className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs disabled:opacity-50">
                <ArrowLeftRight className="size-3.5" /> Swap
              </button>
              <button onClick={copy} disabled={!result.text} className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs disabled:opacity-50">
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button onClick={download} disabled={!result.text} className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg bg-primary text-primary-foreground hover:shadow-lift text-xs disabled:opacity-50">
                <Download className="size-3.5" /> Download
              </button>
            </div>
          </div>
          {result.error ? (
            <WarnBox>{result.error}</WarnBox>
          ) : result.text ? (
            <>
              <p className="text-xs text-muted-foreground num">
                {result.rows} {result.rows === 1 ? "row" : "rows"} · {result.cols} {result.cols === 1 ? "column" : "columns"}
              </p>
              <pre className="rounded-xl border border-border bg-card p-3 font-mono text-xs overflow-auto max-h-[60vh]" aria-live="polite">{result.text}</pre>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Your converted output will appear here.
            </div>
          )}
        </section>
      </div>

      <HowItWorks>
        <li>Pick a direction — CSV → JSON or JSON → CSV — and paste your data, or open a file.</li>
        <li>Choose the delimiter (auto works for most files) and whether the first CSV row is a header.</li>
        <li>Copy the result, hit Swap to round-trip, or download as <code>.json</code>/<code>.csv</code>.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
