import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, Check, CalendarClock } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks, WarnBox } from "../components/ToolControls";

export const Route = createFileRoute("/cron-parser")({
  head: () => ({
    meta: [
      { title: "Cron Expression Parser — Explain & Preview Next Runs Free" },
      {
        name: "description",
        content:
          "Paste a cron expression to see a plain-English description and the next upcoming run times. Supports 5-field crontab with ranges, lists and steps.",
      },
      { property: "og:title", content: "Cron Expression Parser — Bluebird" },
      { property: "og:description", content: "Translate cron schedules into plain English with a preview of upcoming runs." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/cron-parser" },
    ],
    links: [{ rel: "canonical", href: "/cron-parser" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird Cron Expression Parser",
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: Page,
});

type Field = number[];
type Parsed = { minute: Field; hour: Field; dom: Field; month: Field; dow: Field };

const NAMES = {
  month: ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  dow: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

function parseField(raw: string, min: number, max: number): Field {
  const set = new Set<number>();
  const parts = raw.split(",");
  for (const part of parts) {
    const [rangePart, stepPart] = part.split("/");
    const step = stepPart ? Number(stepPart) : 1;
    if (!Number.isFinite(step) || step <= 0) throw new Error(`Bad step "${part}"`);
    let lo = min;
    let hi = max;
    if (rangePart !== "*" && rangePart !== "") {
      if (rangePart.includes("-")) {
        const [a, b] = rangePart.split("-").map(Number);
        if (!Number.isFinite(a) || !Number.isFinite(b)) throw new Error(`Bad range "${part}"`);
        lo = a;
        hi = b;
      } else {
        const n = Number(rangePart);
        if (!Number.isFinite(n)) throw new Error(`Bad value "${part}"`);
        lo = hi = n;
      }
    }
    if (lo < min || hi > max || lo > hi) throw new Error(`Out of range "${part}"`);
    for (let v = lo; v <= hi; v += step) set.add(v);
  }
  return [...set].sort((a, b) => a - b);
}

export function parseCron(expr: string): Parsed {
  const tokens = expr.trim().split(/\s+/);
  if (tokens.length !== 5) throw new Error("Cron must have 5 fields: minute hour day-of-month month day-of-week.");
  return {
    minute: parseField(tokens[0], 0, 59),
    hour: parseField(tokens[1], 0, 23),
    dom: parseField(tokens[2], 1, 31),
    month: parseField(tokens[3], 1, 12),
    dow: parseField(tokens[4].replace(/7/g, "0"), 0, 6),
  };
}

function describeField(field: Field, total: number, label: (n: number) => string, every: string): string {
  if (field.length === total) return `every ${every}`;
  if (field.length === 1) return `at ${label(field[0])}`;
  if (field.length <= 5) return `at ${field.map(label).join(", ")}`;
  return `at ${field.length} ${every}s`;
}

export function describeCron(p: Parsed): string {
  const minute = describeField(p.minute, 60, (n) => `:${String(n).padStart(2, "0")}`, "minute");
  const hour = describeField(p.hour, 24, (n) => `${n}:00`, "hour");
  const monthAll = p.month.length === 12;
  const dowAll = p.dow.length === 7;
  const domAll = p.dom.length === 31;
  const time = `${hour}, ${minute}`;
  const days = domAll && dowAll
    ? "every day"
    : !domAll && dowAll
    ? `on day ${p.dom.join(", ")} of the month`
    : domAll && !dowAll
    ? `on ${p.dow.map((d) => NAMES.dow[d]).join(", ")}`
    : `on day ${p.dom.join(", ")} or ${p.dow.map((d) => NAMES.dow[d]).join(", ")}`;
  const months = monthAll ? "" : `, in ${p.month.map((m) => NAMES.month[m]).join(", ")}`;
  return `Runs ${time}, ${days}${months}.`;
}

export function nextRuns(p: Parsed, from: Date, count: number): Date[] {
  const out: Date[] = [];
  const cur = new Date(from.getTime());
  cur.setSeconds(0, 0);
  cur.setMinutes(cur.getMinutes() + 1);
  let safety = 0;
  const setMin = new Set(p.minute);
  const setHour = new Set(p.hour);
  const setMon = new Set(p.month);
  const setDom = new Set(p.dom);
  const setDow = new Set(p.dow);
  const domAll = p.dom.length === 31;
  const dowAll = p.dow.length === 7;
  while (out.length < count && safety < 200000) {
    safety++;
    const m = cur.getMonth() + 1;
    if (!setMon.has(m)) { cur.setMonth(cur.getMonth() + 1, 1); cur.setHours(0, 0, 0, 0); continue; }
    const dayOk = domAll && dowAll
      ? true
      : !domAll && dowAll
      ? setDom.has(cur.getDate())
      : domAll && !dowAll
      ? setDow.has(cur.getDay())
      : setDom.has(cur.getDate()) || setDow.has(cur.getDay());
    if (!dayOk) { cur.setDate(cur.getDate() + 1); cur.setHours(0, 0, 0, 0); continue; }
    if (!setHour.has(cur.getHours())) { cur.setHours(cur.getHours() + 1, 0, 0, 0); continue; }
    if (!setMin.has(cur.getMinutes())) { cur.setMinutes(cur.getMinutes() + 1, 0, 0); continue; }
    out.push(new Date(cur.getTime()));
    cur.setMinutes(cur.getMinutes() + 1);
  }
  return out;
}

const SAMPLES = [
  { expr: "*/15 * * * *", label: "Every 15 minutes" },
  { expr: "0 9 * * 1-5", label: "Weekdays at 9am" },
  { expr: "0 0 1 * *", label: "Monthly on the 1st" },
  { expr: "30 2 * * 0", label: "Sundays at 2:30am" },
  { expr: "0 */6 * * *", label: "Every 6 hours" },
];

function Page() {
  const [expr, setExpr] = useState("*/15 * * * *");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    try {
      const parsed = parseCron(expr);
      return { ok: true as const, parsed, text: describeCron(parsed), runs: nextRuns(parsed, new Date(), 8) };
    } catch (e) {
      return { ok: false as const, err: (e as Error).message };
    }
  }, [expr]);

  async function copy() {
    if (!result.ok) return;
    await navigator.clipboard.writeText(result.text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <ToolLayout slug="cron-parser">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-5">
          <label htmlFor="cron-input" className="eyebrow">Cron expression</label>
          <input
            id="cron-input"
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            placeholder="*/15 * * * *"
            className="w-full min-h-12 rounded-xl border border-border bg-card px-3 font-mono text-base focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="text-xs text-muted-foreground">
            Five fields: minute (0–59) · hour (0–23) · day of month (1–31) · month (1–12) · day of week (0–6, Sun=0).
          </div>

          <div>
            <div className="eyebrow mb-2">Try a sample</div>
            <div className="flex flex-wrap gap-2">
              {SAMPLES.map((s) => (
                <button
                  key={s.expr}
                  onClick={() => setExpr(s.expr)}
                  className="min-h-9 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs"
                >
                  <span className="font-mono mr-1.5">{s.expr}</span>
                  <span className="text-muted-foreground">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {!result.ok && <WarnBox>{result.err}</WarnBox>}
        </section>

        <section className="soft-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <CalendarClock className="size-4 text-primary" />
            <div className="font-display text-lg">In plain English</div>
          </div>

          {result.ok ? (
            <>
              <div className="rounded-xl border border-border bg-primary-soft/40 p-4 text-base">
                {result.text}
              </div>
              <button
                onClick={copy}
                className="inline-flex items-center gap-2 min-h-11 px-4 rounded-xl border border-border bg-card hover:bg-primary-soft text-sm font-medium"
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied ? "Copied" : "Copy description"}
              </button>

              <div>
                <div className="eyebrow mb-2">Next 8 runs (your time zone)</div>
                <ul className="space-y-1 text-sm font-mono">
                  {result.runs.map((d, i) => (
                    <li key={i} className="rounded-lg border border-border bg-card px-3 py-2">
                      {d.toLocaleString()}
                    </li>
                  ))}
                  {result.runs.length === 0 && (
                    <li className="text-muted-foreground">No upcoming runs found.</li>
                  )}
                </ul>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Fix the expression to see the schedule.
            </div>
          )}
        </section>
      </div>

      <HowItWorks>
        <li>Paste a 5-field cron expression or pick a sample.</li>
        <li>Read the plain-English description and check the next 8 runs.</li>
        <li>Copy the description into your README or ticket.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
