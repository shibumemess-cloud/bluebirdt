import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Clock, Copy, Check, RefreshCw } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks, WarnBox } from "../components/ToolControls";

export const Route = createFileRoute("/timestamp-converter")({
  head: () => ({
    meta: [
      { title: "Unix Timestamp Converter — Epoch to Date & Back, Free" },
      { name: "description", content: "Convert Unix epoch timestamps to human dates and back. Seconds or milliseconds, your timezone or UTC. Free, in your browser." },
      { property: "og:title", content: "Unix Timestamp Converter — Bluebird" },
      { property: "og:description", content: "Free in-browser Unix epoch to date converter with seconds/ms and timezone support." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/timestamp-converter" },
    ],
    links: [{ rel: "canonical", href: "/timestamp-converter" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird Unix Timestamp Converter",
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: Page,
});

type Unit = "seconds" | "milliseconds";

export function parseTimestamp(raw: string, unit: Unit): Date | null {
  const n = Number(raw.trim());
  if (!Number.isFinite(n)) return null;
  const ms = unit === "seconds" ? n * 1000 : n;
  if (Math.abs(ms) > 8.64e15) return null; // outside Date range
  const d = new Date(ms);
  return isNaN(d.getTime()) ? null : d;
}

// Heuristic: 13+ digit integers are almost certainly milliseconds.
export function detectUnit(raw: string): Unit | null {
  const s = raw.trim();
  if (!/^-?\d+$/.test(s)) return null;
  const digits = s.replace(/^-/, "").length;
  if (digits >= 13) return "milliseconds";
  if (digits >= 9 && digits <= 11) return "seconds";
  return null;
}

const PREF_KEY = "bb-timestamp-prefs-v1";


export function formatRelative(d: Date, now: Date = new Date()): string {
  const diffMs = d.getTime() - now.getTime();
  const sign = diffMs >= 0 ? "in " : "";
  const suffix = diffMs >= 0 ? "" : " ago";
  const abs = Math.abs(diffMs);
  const units: [string, number][] = [
    ["year", 365 * 24 * 3600 * 1000],
    ["month", 30 * 24 * 3600 * 1000],
    ["day", 24 * 3600 * 1000],
    ["hour", 3600 * 1000],
    ["minute", 60 * 1000],
    ["second", 1000],
  ];
  for (const [name, ms] of units) {
    if (abs >= ms || name === "second") {
      const n = Math.round(abs / ms);
      return `${sign}${n} ${name}${n === 1 ? "" : "s"}${suffix}`;
    }
  }
  return "just now";
}

function Page() {
  const [unit, setUnit] = useState<Unit>("seconds");
  const [tsInput, setTsInput] = useState("");
  const [dateInput, setDateInput] = useState(""); // local datetime string
  const [now, setNow] = useState(() => new Date());
  const [copied, setCopied] = useState<string | null>(null);
  const [autoDetected, setAutoDetected] = useState<Unit | null>(null);

  // Live clock
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Seed inputs from current time on mount + restore unit pref
  useEffect(() => {
    let initialUnit: Unit = "seconds";
    try {
      const raw = localStorage.getItem(PREF_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (p.unit === "seconds" || p.unit === "milliseconds") initialUnit = p.unit;
      }
    } catch { /* ignore */ }
    setUnit(initialUnit);
    const n = new Date();
    setTsInput(String(initialUnit === "seconds" ? Math.floor(n.getTime() / 1000) : n.getTime()));
    setDateInput(toLocalInput(n));
  }, []);

  useEffect(() => {
    try { localStorage.setItem(PREF_KEY, JSON.stringify({ unit })); } catch { /* ignore */ }
  }, [unit]);

  // Auto-detect seconds vs ms when the input length strongly suggests the other unit
  function onTsChange(value: string) {
    setTsInput(value);
    const guess = detectUnit(value);
    if (guess && guess !== unit) {
      setUnit(guess);
      setAutoDetected(guess);
      window.setTimeout(() => setAutoDetected(null), 2200);
    }
  }


  const parsed = useMemo(() => parseTimestamp(tsInput, unit), [tsInput, unit]);
  const dateFromPicker = useMemo(() => (dateInput ? new Date(dateInput) : null), [dateInput]);

  function setFromNow() {
    const n = new Date();
    setTsInput(String(unit === "seconds" ? Math.floor(n.getTime() / 1000) : n.getTime()));
    setDateInput(toLocalInput(n));
  }

  function setUnitWith(next: Unit) {
    if (parsed) {
      setTsInput(String(next === "seconds" ? Math.floor(parsed.getTime() / 1000) : parsed.getTime()));
    }
    setUnit(next);
  }

  async function copy(name: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(name);
    window.setTimeout(() => setCopied(null), 1300);
  }

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <ToolLayout slug="timestamp-converter">
      <div className="soft-card p-5 sm:p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            <div className="font-display text-lg">Right now</div>
          </div>
          <button onClick={setFromNow} className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs">
            <RefreshCw className="size-3.5" /> Use now
          </button>
        </div>
        <dl className="mt-3 grid sm:grid-cols-3 gap-3 text-sm">
          <Stat label="Seconds" value={String(Math.floor(now.getTime() / 1000))} onCopy={(v) => copy("now-s", v)} copied={copied === "now-s"} />
          <Stat label="Milliseconds" value={String(now.getTime())} onCopy={(v) => copy("now-ms", v)} copied={copied === "now-ms"} />
          <Stat label="ISO 8601 (UTC)" value={now.toISOString()} onCopy={(v) => copy("now-iso", v)} copied={copied === "now-iso"} mono />
        </dl>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="font-display text-lg">Timestamp → Date</div>
            <div role="radiogroup" aria-label="Unit" className="inline-flex p-1 rounded-xl bg-muted">
              {(["seconds", "milliseconds"] as const).map((u) => (
                <button
                  key={u}
                  role="radio"
                  aria-checked={unit === u}
                  onClick={() => setUnitWith(u)}
                  className={`min-h-9 px-3 rounded-lg text-xs font-medium ${unit === u ? "bg-card shadow-soft" : "text-muted-foreground"}`}
                >
                  {u === "seconds" ? "Seconds" : "Milliseconds"}
                </button>
              ))}
            </div>
          </div>
          <label htmlFor="tc-ts" className="sr-only">Unix timestamp</label>
          <input
            id="tc-ts"
            inputMode="numeric"
            value={tsInput}
            onChange={(e) => onTsChange(e.target.value)}
            placeholder={unit === "seconds" ? "1735689600" : "1735689600000"}
            className="w-full min-h-12 rounded-xl border border-border bg-card px-3 font-mono text-base focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {autoDetected && (
            <p className="text-xs text-primary" aria-live="polite">
              Auto-switched to {autoDetected} based on the value length.
            </p>
          )}

          {parsed ? (
            <dl className="rounded-xl border border-border bg-card p-3 text-sm space-y-2" aria-live="polite">
              <Row k={`Local (${tz})`} v={parsed.toLocaleString(undefined, { dateStyle: "full", timeStyle: "medium" })} onCopy={(v) => copy("p-local", v)} copied={copied === "p-local"} />
              <Row k="UTC" v={parsed.toUTCString()} onCopy={(v) => copy("p-utc", v)} copied={copied === "p-utc"} />
              <Row k="ISO 8601" v={parsed.toISOString()} mono onCopy={(v) => copy("p-iso", v)} copied={copied === "p-iso"} />
              <Row k="Relative" v={formatRelative(parsed, now)} onCopy={(v) => copy("p-rel", v)} copied={copied === "p-rel"} />
            </dl>
          ) : tsInput ? (
            <WarnBox>That doesn't look like a valid {unit === "seconds" ? "seconds" : "millisecond"} timestamp.</WarnBox>
          ) : null}
        </section>

        <section className="soft-card p-5 sm:p-6 space-y-3">
          <div className="font-display text-lg">Date → Timestamp</div>
          <label htmlFor="tc-date" className="sr-only">Date and time</label>
          <input
            id="tc-date"
            type="datetime-local"
            step={1}
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="w-full min-h-12 rounded-xl border border-border bg-card px-3 text-base focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {dateFromPicker && !isNaN(dateFromPicker.getTime()) ? (
            <dl className="rounded-xl border border-border bg-card p-3 text-sm space-y-2" aria-live="polite">
              <Row k="Seconds" v={String(Math.floor(dateFromPicker.getTime() / 1000))} mono onCopy={(v) => copy("d-s", v)} copied={copied === "d-s"} />
              <Row k="Milliseconds" v={String(dateFromPicker.getTime())} mono onCopy={(v) => copy("d-ms", v)} copied={copied === "d-ms"} />
              <Row k="ISO 8601 (UTC)" v={dateFromPicker.toISOString()} mono onCopy={(v) => copy("d-iso", v)} copied={copied === "d-iso"} />
            </dl>
          ) : null}
        </section>
      </div>

      <HowItWorks>
        <li>Paste a Unix timestamp on the left to see the date in your timezone, UTC and ISO format.</li>
        <li>Pick a date on the right to get the timestamp in seconds or milliseconds.</li>
        <li>Toggle Seconds / Milliseconds to match your source — switching converts the value automatically.</li>
      </HowItWorks>
    </ToolLayout>
  );
}

function Stat({ label, value, onCopy, copied, mono }: { label: string; value: string; onCopy: (v: string) => void; copied: boolean; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-between mb-1">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <button onClick={() => onCopy(value)} className="inline-flex items-center gap-1 text-xs text-primary hover:underline" aria-label={`Copy ${label}`}>
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <dd className={`${mono ? "font-mono text-sm" : "font-display text-base"} break-all`}>{value}</dd>
    </div>
  );
}

function Row({ k, v, mono, onCopy, copied }: { k: string; v: string; mono?: boolean; onCopy: (v: string) => void; copied: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className={`${mono ? "font-mono" : ""} text-right break-all`}>
        {v}{" "}
        <button onClick={() => onCopy(v)} className="ml-2 inline-flex items-center gap-1 text-xs text-primary hover:underline" aria-label={`Copy ${k}`}>
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
        </button>
      </dd>
    </div>
  );
}

function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
