import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Dices, Copy, Check, Download, RefreshCw } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks, Field, WarnBox } from "../components/ToolControls";

export const Route = createFileRoute("/random-number")({
  head: () => ({
    meta: [
      { title: "Random Number Generator — Secure Free Online Tool" },
      { name: "description", content: "Generate cryptographically secure random numbers — integers, decimals, single value, lists and unique draws. Free, in-browser, no signup." },
      { property: "og:title", content: "Random Number Generator — Bluebird" },
      { property: "og:description", content: "Secure random integers and decimals, single or bulk, in your browser." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/random-number" },
    ],
    links: [{ rel: "canonical", href: "/random-number" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird Random Number Generator",
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: Page,
});

type Mode = "integer" | "decimal";

const PREF_KEY = "bb-rng-v1";

// Cryptographically secure integer in [0, max). max <= 2^32
function secureUint32(max: number): number {
  const range = Math.floor(max);
  if (range <= 0) return 0;
  const limit = Math.floor(0x1_0000_0000 / range) * range;
  const buf = new Uint32Array(1);
  while (true) {
    crypto.getRandomValues(buf);
    if (buf[0] < limit) return buf[0] % range;
  }
}

export function secureRandomInt(min: number, max: number): number {
  const lo = Math.ceil(Math.min(min, max));
  const hi = Math.floor(Math.max(min, max));
  return lo + secureUint32(hi - lo + 1);
}

export function secureRandomFloat(min: number, max: number, decimals: number): string {
  const buf = new Uint32Array(2);
  crypto.getRandomValues(buf);
  // 53-bit float in [0, 1)
  const f = (buf[0] * 0x200000 + (buf[1] >>> 11)) / 2 ** 53;
  const v = min + f * (max - min);
  return v.toFixed(Math.max(0, Math.min(10, decimals)));
}

export function generateUnique(min: number, max: number, count: number): number[] {
  const lo = Math.ceil(min);
  const hi = Math.floor(max);
  const span = hi - lo + 1;
  if (count > span) throw new Error(`Only ${span} unique values fit between ${lo} and ${hi}.`);
  // Reservoir / Fisher-Yates over a virtual range using a Set
  const out = new Set<number>();
  while (out.size < count) out.add(secureRandomInt(lo, hi));
  return [...out];
}

function Page() {
  const [mode, setMode] = useState<Mode>("integer");
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [decimals, setDecimals] = useState(2);
  const [unique, setUnique] = useState(false);
  const [sorted, setSorted] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREF_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (p.mode === "integer" || p.mode === "decimal") setMode(p.mode);
        if (typeof p.min === "number") setMin(p.min);
        if (typeof p.max === "number") setMax(p.max);
        if (typeof p.count === "number") setCount(p.count);
        if (typeof p.decimals === "number") setDecimals(p.decimals);
        if (typeof p.unique === "boolean") setUnique(p.unique);
        if (typeof p.sorted === "boolean") setSorted(p.sorted);
      }
    } catch { /* ignore */ }
    setPrefsLoaded(true);
  }, []);
  useEffect(() => {
    if (!prefsLoaded) return;
    try { localStorage.setItem(PREF_KEY, JSON.stringify({ mode, min, max, count, decimals, unique, sorted })); } catch { /* ignore */ }
  }, [prefsLoaded, mode, min, max, count, decimals, unique, sorted]);

  function generate() {
    setErr(null); setCopied(false);
    if (!Number.isFinite(min) || !Number.isFinite(max)) { setErr("Min and Max must be numbers."); return; }
    if (min > max) { setErr("Min must be less than or equal to Max."); return; }
    const n = Math.max(1, Math.min(10_000, Math.floor(count) || 1));
    try {
      let nums: string[];
      if (mode === "integer") {
        if (unique) {
          const arr = generateUnique(min, max, n);
          if (sorted) arr.sort((a, b) => a - b);
          nums = arr.map(String);
        } else {
          const arr: number[] = [];
          for (let i = 0; i < n; i++) arr.push(secureRandomInt(min, max));
          if (sorted) arr.sort((a, b) => a - b);
          nums = arr.map(String);
        }
      } else {
        const arr: string[] = [];
        for (let i = 0; i < n; i++) arr.push(secureRandomFloat(min, max, decimals));
        if (sorted) arr.sort((a, b) => Number(a) - Number(b));
        nums = arr;
      }
      setResults(nums);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not generate numbers.");
    }
  }

  const text = useMemo(() => results.join("\n"), [results]);

  async function copyAll() {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }
  function download() {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "random-numbers.txt"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ToolLayout slug="random-number">
      <div className="grid lg:grid-cols-[340px_1fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-5 self-start">
          <div>
            <div className="eyebrow mb-2">Type</div>
            <div role="radiogroup" aria-label="Type" className="grid grid-cols-2 p-1 rounded-xl bg-muted">
              {(["integer", "decimal"] as const).map((m) => (
                <button key={m} role="radio" aria-checked={mode === m} onClick={() => setMode(m)}
                  className={`min-h-10 px-2 rounded-lg text-sm font-medium capitalize ${mode === m ? "bg-card shadow-soft text-foreground" : "text-muted-foreground"}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Min">
              <input type="number" value={min} onChange={(e) => setMin(Number(e.target.value))}
                className="w-full min-h-11 rounded-xl border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </Field>
            <Field label="Max">
              <input type="number" value={max} onChange={(e) => setMax(Number(e.target.value))}
                className="w-full min-h-11 rounded-xl border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </Field>
          </div>

          <Field label="How many?" hint="Up to 10,000 numbers.">
            <input type="number" min={1} max={10000} value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(10000, Number(e.target.value) || 1)))}
              className="w-full min-h-11 rounded-xl border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[1, 6, 10, 50, 100, 1000].map((n) => (
                <button key={n} onClick={() => setCount(n)}
                  className={`min-h-8 px-2.5 rounded-lg border text-xs ${count === n ? "border-primary bg-primary-soft text-primary" : "border-border bg-card hover:bg-primary-soft"}`}>
                  {n}
                </button>
              ))}
            </div>
          </Field>

          {mode === "decimal" && (
            <Field label={`Decimal places · ${decimals}`}>
              <input type="range" min={0} max={10} value={decimals}
                onChange={(e) => setDecimals(Number(e.target.value))} className="w-full" />
            </Field>
          )}

          <div className="space-y-2">
            {mode === "integer" && (
              <Toggle label="Unique values only (no repeats)" checked={unique} onChange={setUnique} />
            )}
            <Toggle label="Sort results from low to high" checked={sorted} onChange={setSorted} />
          </div>

          <button onClick={generate}
            className="w-full inline-flex items-center justify-center gap-2 min-h-12 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-95">
            <RefreshCw className="size-4" /> Generate
          </button>
          {err && <WarnBox>{err}</WarnBox>}
        </section>

        <section className="soft-card p-5 sm:p-6 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Dices className="size-4 text-primary" />
              <div className="font-display text-lg">Results <span className="text-sm font-sans text-muted-foreground">· {results.length}</span></div>
            </div>
            <div className="flex gap-2">
              <button onClick={copyAll} disabled={!results.length}
                className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs disabled:opacity-50">
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />} {copied ? "Copied" : "Copy"}
              </button>
              <button onClick={download} disabled={!results.length}
                className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs disabled:opacity-50">
                <Download className="size-3.5" /> .txt
              </button>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">
              Pick a range and press <strong>Generate</strong>. Numbers come from your browser's secure cryptography.
            </div>
          ) : results.length === 1 ? (
            <div className="rounded-xl border border-border bg-card p-10 text-center">
              <div className="font-display text-6xl tracking-tight num text-primary break-words" aria-live="polite">
                {results[0]}
              </div>
            </div>
          ) : (
            <pre aria-live="polite" className="max-h-[520px] overflow-auto rounded-xl border border-border bg-card p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
              {text}
            </pre>
          )}
        </section>
      </div>

      <HowItWorks>
        <li>Pick integer or decimal, then set the smallest and largest allowed value.</li>
        <li>Choose how many numbers you need — up to 10,000 in one go.</li>
        <li>Press Generate. Numbers are produced by your browser's secure randomness (Web Crypto), the same source used for passwords.</li>
      </HowItWorks>
    </ToolLayout>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 min-h-11 rounded-xl border border-border bg-card px-3 cursor-pointer hover:bg-primary-soft">
      <span className="text-sm">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="size-4" style={{ accentColor: "var(--primary)" }} />
    </label>
  );
}
