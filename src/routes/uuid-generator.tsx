import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Fingerprint, Copy, Check, RefreshCw, Download } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/uuid-generator")({
  head: () => ({
    meta: [
      { title: "UUID Generator — Free v4 & v7 GUID Generator Online" },
      {
        name: "description",
        content:
          "Generate bulk UUID v4 or time-sortable UUID v7 (GUIDs) in your browser. Copy, download as TXT, CSV or JSON — free and private.",
      },
      { property: "og:title", content: "UUID Generator — Bluebird" },
      { property: "og:description", content: "Free bulk UUID v4 and UUID v7 generator. Browser-only, secure randomness, instant copy and download." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/uuid-generator" },
    ],
    links: [{ rel: "canonical", href: "/uuid-generator" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird UUID Generator",
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: Page,
});

const STORAGE_KEY = "bluebird:uuid-generator:prefs";

export function newUuidV4(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (n) => n.toString(16).padStart(2, "0"));
  return `${h.slice(0, 4).join("")}-${h.slice(4, 6).join("")}-${h.slice(6, 8).join("")}-${h.slice(8, 10).join("")}-${h.slice(10, 16).join("")}`;
}

// RFC 9562 UUID v7: 48-bit ms timestamp + version 7 + random
export function newUuidV7(now: number = Date.now()): string {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  const ts = BigInt(now);
  b[0] = Number((ts >> 40n) & 0xffn);
  b[1] = Number((ts >> 32n) & 0xffn);
  b[2] = Number((ts >> 24n) & 0xffn);
  b[3] = Number((ts >> 16n) & 0xffn);
  b[4] = Number((ts >> 8n) & 0xffn);
  b[5] = Number(ts & 0xffn);
  b[6] = (b[6] & 0x0f) | 0x70; // version 7
  b[8] = (b[8] & 0x3f) | 0x80; // variant 10
  const h = Array.from(b, (n) => n.toString(16).padStart(2, "0"));
  return `${h.slice(0, 4).join("")}-${h.slice(4, 6).join("")}-${h.slice(6, 8).join("")}-${h.slice(8, 10).join("")}-${h.slice(10, 16).join("")}`;
}

export function formatUuid(id: string, opts: { upper?: boolean; hyphens?: boolean; braces?: boolean }): string {
  let out = opts.hyphens === false ? id.replace(/-/g, "") : id;
  if (opts.upper) out = out.toUpperCase();
  if (opts.braces) out = `{${out}}`;
  return out;
}

function clampCount(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.min(1000, Math.floor(n)));
}

type Version = "v4" | "v7";

function Page() {
  const [version, setVersion] = useState<Version>("v4");
  const [count, setCount] = useState(10);
  const [upper, setUpper] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [braces, setBraces] = useState(false);
  const [ids, setIds] = useState<string[]>([]);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedRow, setCopiedRow] = useState<number | null>(null);

  // Restore prefs
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const p = JSON.parse(raw);
      if (p.version === "v4" || p.version === "v7") setVersion(p.version);
      if (typeof p.upper === "boolean") setUpper(p.upper);
      if (typeof p.hyphens === "boolean") setHyphens(p.hyphens);
      if (typeof p.braces === "boolean") setBraces(p.braces);
      if (typeof p.count === "number") setCount(clampCount(p.count));
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ version, upper, hyphens, braces, count })); } catch { /* ignore */ }
  }, [version, upper, hyphens, braces, count]);

  function generate() {
    const n = clampCount(count);
    const make = version === "v7" ? newUuidV7 : newUuidV4;
    const out: string[] = new Array(n);
    for (let i = 0; i < n; i++) out[i] = make();
    setIds(out);
  }

  // Initial batch + regen on version change
  useEffect(() => { generate(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [version]);

  const formatted = ids.map((id) => formatUuid(id, { upper, hyphens, braces }));
  const joined = formatted.join("\n");

  async function copyAll() {
    await navigator.clipboard.writeText(joined);
    setCopiedAll(true);
    window.setTimeout(() => setCopiedAll(false), 1400);
  }

  async function copyRow(i: number) {
    await navigator.clipboard.writeText(formatted[i]);
    setCopiedRow(i);
    window.setTimeout(() => setCopiedRow(null), 1200);
  }

  function downloadAs(kind: "txt" | "json" | "csv") {
    let content = "";
    let mime = "text/plain";
    if (kind === "txt") { content = joined; }
    else if (kind === "json") { content = JSON.stringify(formatted, null, 2); mime = "application/json"; }
    else { content = "uuid\n" + formatted.join("\n"); mime = "text/csv"; }
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uuids-${version}-${ids.length}.${kind}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ToolLayout slug="uuid-generator">
      <div className="grid lg:grid-cols-[340px_1fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-5 self-start">
          <div>
            <div className="eyebrow mb-2">Version</div>
            <div role="radiogroup" aria-label="UUID version" className="inline-flex p-1 rounded-xl bg-muted w-full">
              {(["v4", "v7"] as const).map((v) => (
                <button
                  key={v}
                  role="radio"
                  aria-checked={version === v}
                  onClick={() => setVersion(v)}
                  className={`flex-1 min-h-10 px-3 rounded-lg text-sm font-medium ${version === v ? "bg-card shadow-soft text-foreground" : "text-muted-foreground"}`}
                >
                  {v === "v4" ? "v4 · Random" : "v7 · Time-sortable"}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {version === "v4"
                ? "Classic random UUID. Great for IDs that don't need ordering."
                : "Newer time-ordered UUID. Sorts naturally — ideal for database keys."}
            </p>
          </div>

          <div>
            <label htmlFor="uu-n" className="eyebrow block mb-2">How many?</label>
            <div className="flex items-center gap-2">
              <input
                id="uu-n"
                type="number"
                min={1}
                max={1000}
                value={count}
                onChange={(e) => setCount(clampCount(Number(e.target.value)))}
                className="w-full min-h-11 rounded-xl border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <span className="text-xs text-muted-foreground shrink-0">max 1,000</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[1, 10, 50, 100, 500].map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`min-h-8 px-2.5 rounded-lg border text-xs ${count === n ? "border-primary bg-primary-soft text-primary" : "border-border bg-card hover:bg-primary-soft"}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="eyebrow">Format</div>
            <Toggle label="Uppercase" checked={upper} onChange={setUpper} />
            <Toggle label="Include hyphens" checked={hyphens} onChange={setHyphens} />
            <Toggle label="Wrap in {braces}" checked={braces} onChange={setBraces} />
          </div>

          <button
            onClick={generate}
            className="w-full inline-flex items-center justify-center gap-2 min-h-12 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-95"
          >
            <RefreshCw className="size-4" /> Generate
          </button>
        </section>

        <section className="soft-card p-5 sm:p-6 space-y-3 min-w-0">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Fingerprint className="size-4 text-primary" />
              <div className="font-display text-lg">{ids.length} {ids.length === 1 ? "UUID" : "UUIDs"} <span className="text-sm text-muted-foreground font-sans">· {version}</span></div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={copyAll}
                disabled={ids.length === 0}
                className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs disabled:opacity-50"
              >
                {copiedAll ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copiedAll ? "Copied" : "Copy all"}
              </button>
              <button onClick={() => downloadAs("txt")} disabled={ids.length === 0} className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs disabled:opacity-50">
                <Download className="size-3.5" /> .txt
              </button>
              <button onClick={() => downloadAs("csv")} disabled={ids.length === 0} className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs disabled:opacity-50">
                <Download className="size-3.5" /> .csv
              </button>
              <button onClick={() => downloadAs("json")} disabled={ids.length === 0} className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs disabled:opacity-50">
                <Download className="size-3.5" /> .json
              </button>
            </div>
          </div>

          <ul className="max-h-[520px] overflow-auto rounded-xl border border-border bg-card divide-y divide-border" aria-live="polite">
            {formatted.map((u, i) => (
              <li key={`${u}-${i}`} className="flex items-center justify-between gap-3 px-3 py-2">
                <code className="font-mono text-xs sm:text-sm break-all">{u}</code>
                <button
                  onClick={() => copyRow(i)}
                  aria-label={`Copy UUID ${i + 1}`}
                  className="shrink-0 inline-flex items-center gap-1 min-h-8 px-2 rounded-md border border-border hover:bg-primary-soft text-xs"
                >
                  {copiedRow === i ? <Check className="size-3" /> : <Copy className="size-3" />}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <HowItWorks>
        <li>Pick a version — v4 (random) or v7 (time-sortable) — and how many you need.</li>
        <li>Toggle uppercase, hyphens or {`{braces}`} to match your target format.</li>
        <li>Copy them all, copy one, or download as .txt, .csv or .json.</li>
      </HowItWorks>
    </ToolLayout>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 min-h-11 rounded-xl border border-border bg-card px-3 cursor-pointer hover:bg-primary-soft">
      <span className="text-sm">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4"
        style={{ accentColor: "var(--primary)" }}
      />
    </label>
  );
}
