import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/date-difference")({
  head: () => ({
    meta: [
      { title: "Date Difference Calculator — Days Between Dates" },
      { name: "description", content: "Find the exact days, weeks, months and years between any two dates. Add or subtract days from a date too." },
      { property: "og:title", content: "Date Difference Calculator — Bluebird" },
      { property: "og:description", content: "Days, weeks, months between any two dates." },
      { property: "og:url", content: "/date-difference" },
    ],
    links: [{ rel: "canonical", href: "/date-difference" }],
  }),
  component: Page,
});

function todayIso(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function diff(a: Date, b: Date) {
  const start = a < b ? a : b;
  const end = a < b ? b : a;
  const ms = end.getTime() - start.getTime();
  const totalDays = Math.floor(ms / 86400000);

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();
  if (days < 0) {
    months -= 1;
    const prev = new Date(end.getFullYear(), end.getMonth(), 0);
    days += prev.getDate();
  }
  if (months < 0) { years -= 1; months += 12; }

  return {
    totalDays,
    totalWeeks: Math.floor(totalDays / 7),
    totalHours: Math.floor(ms / 3600000),
    totalMinutes: Math.floor(ms / 60000),
    breakdown: { years, months, days, extraWeeks: Math.floor(days / 7), extraDays: days % 7 },
    direction: a < b ? "future" : a > b ? "past" : "same",
  };
}

function Page() {
  const [from, setFrom] = useState(todayIso());
  const [to, setTo] = useState(todayIso(30));
  const [addBase, setAddBase] = useState(todayIso());
  const [addDays, setAddDays] = useState(30);

  const result = useMemo(() => {
    const a = new Date(from + "T00:00:00");
    const b = new Date(to + "T00:00:00");
    if (isNaN(a.getTime()) || isNaN(b.getTime())) return null;
    return diff(a, b);
  }, [from, to]);

  const added = useMemo(() => {
    const d = new Date(addBase + "T00:00:00");
    if (isNaN(d.getTime())) return "";
    d.setDate(d.getDate() + addDays);
    return d.toDateString();
  }, [addBase, addDays]);

  return (
    <ToolLayout slug="date-difference">
      <div className="grid lg:grid-cols-2 gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-primary" />
            <div className="font-display text-lg">Days between two dates</div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="dd-from" className="eyebrow">From</label>
              <input id="dd-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)}
                className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3 focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label htmlFor="dd-to" className="eyebrow">To</label>
              <input id="dd-to" type="date" value={to} onChange={(e) => setTo(e.target.value)}
                className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3 focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>

          {result && (
            <div className="rounded-2xl border border-border bg-primary-soft/40 p-5 text-center" aria-live="polite">
              <div className="font-display text-5xl tabular-nums">{result.totalDays.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground mt-1">total days {result.direction === "future" ? "from now" : result.direction === "past" ? "ago" : "(same day)"}</div>
              <div className="mt-3 text-sm">
                {result.breakdown.years > 0 && <span>{result.breakdown.years}y </span>}
                {result.breakdown.months > 0 && <span>{result.breakdown.months}mo </span>}
                {result.breakdown.days > 0 && <span>{result.breakdown.days}d</span>}
                {result.totalDays === 0 && "Same day"}
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
                <Stat k="Weeks" v={result.totalWeeks.toLocaleString()} />
                <Stat k="Hours" v={result.totalHours.toLocaleString()} />
                <Stat k="Minutes" v={result.totalMinutes.toLocaleString()} />
              </div>
            </div>
          )}
        </section>

        <section className="soft-card p-5 sm:p-6 space-y-4">
          <div className="font-display text-lg">Add or subtract days</div>
          <div className="grid grid-cols-[1fr_120px] gap-3">
            <div>
              <label htmlFor="dd-base" className="eyebrow">Starting date</label>
              <input id="dd-base" type="date" value={addBase} onChange={(e) => setAddBase(e.target.value)}
                className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3 focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label htmlFor="dd-days" className="eyebrow">Days (±)</label>
              <input id="dd-days" type="number" value={addDays} onChange={(e) => setAddDays(parseInt(e.target.value) || 0)}
                className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3 tabular-nums focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-primary-soft/40 p-5 text-center">
            <div className="eyebrow">Result</div>
            <div className="mt-1 font-display text-2xl">{added}</div>
          </div>
        </section>
      </div>

      <HowItWorks>
        <li>Pick a From and To date — the difference updates instantly.</li>
        <li>Or pick a starting date and add or subtract days to jump in time.</li>
        <li>All math happens locally — nothing is sent anywhere.</li>
      </HowItWorks>
    </ToolLayout>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-2">
      <div className="text-xs text-muted-foreground">{k}</div>
      <div className="font-display tabular-nums mt-0.5">{v}</div>
    </div>
  );
}
