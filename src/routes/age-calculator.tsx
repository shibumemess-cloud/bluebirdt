import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Cake } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks, WarnBox } from "../components/ToolControls";

export const Route = createFileRoute("/age-calculator")({
  head: () => ({
    meta: [
      { title: "Age Calculator — Years, Months, Days Between Two Dates" },
      {
        name: "description",
        content:
          "Find your exact age or the time between any two dates — years, months, days, total weeks, hours and minutes. Free, in-browser, no sign-up.",
      },
      { property: "og:title", content: "Age Calculator — Bluebird" },
      { property: "og:description", content: "Calculate exact age and time between two dates in years, months and days." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/age-calculator" },
    ],
    links: [{ rel: "canonical", href: "/age-calculator" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird Age Calculator",
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: Page,
});

export function diffParts(from: Date, to: Date) {
  let start = from;
  let end = to;
  let sign = 1;
  if (end < start) { [start, end] = [end, start]; sign = -1; }
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();
  if (days < 0) {
    months -= 1;
    const prev = new Date(end.getFullYear(), end.getMonth(), 0);
    days += prev.getDate();
  }
  if (months < 0) { years -= 1; months += 12; }
  const ms = end.getTime() - start.getTime();
  return {
    sign,
    years, months, days,
    totalDays: Math.floor(ms / 86_400_000),
    totalWeeks: Math.floor(ms / (86_400_000 * 7)),
    totalHours: Math.floor(ms / 3_600_000),
    totalMinutes: Math.floor(ms / 60_000),
  };
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function nextBirthday(birth: Date, today: Date) {
  const year = today.getFullYear();
  let next = new Date(year, birth.getMonth(), birth.getDate());
  if (next < today) next = new Date(year + 1, birth.getMonth(), birth.getDate());
  const days = Math.ceil((next.getTime() - today.getTime()) / 86_400_000);
  return { date: next, days };
}

function Page() {
  const [from, setFrom] = useState("2000-01-01");
  const [to, setTo] = useState(todayStr());

  const result = useMemo(() => {
    const a = new Date(from);
    const b = new Date(to);
    if (isNaN(a.getTime()) || isNaN(b.getTime())) return { ok: false as const, err: "Pick two valid dates." };
    const d = diffParts(a, b);
    const bday = nextBirthday(a, new Date());
    return { ok: true as const, d, bday, a };
  }, [from, to]);

  return (
    <ToolLayout slug="age-calculator">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-5">
          <div>
            <label htmlFor="age-from" className="eyebrow">Date of birth (or start date)</label>
            <input
              id="age-from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label htmlFor="age-to" className="eyebrow">Age at (end date)</label>
            <input
              id="age-to"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            onClick={() => setTo(todayStr())}
            className="min-h-10 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs"
          >
            Use today
          </button>
          {!result.ok && <WarnBox>{result.err}</WarnBox>}
        </section>

        <section className="soft-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Cake className="size-4 text-primary" />
            <div className="font-display text-lg">Result</div>
          </div>

          {result.ok ? (
            <>
              <div className="rounded-2xl border border-border bg-primary-soft/40 p-5 text-center">
                <div className="text-3xl sm:text-4xl font-display tabular-nums">
                  {result.d.years} <span className="text-muted-foreground text-base">years</span>{" "}
                  {result.d.months} <span className="text-muted-foreground text-base">months</span>{" "}
                  {result.d.days} <span className="text-muted-foreground text-base">days</span>
                </div>
                {result.d.sign < 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">End date is before start date.</div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <Stat label="Total days" value={result.d.totalDays.toLocaleString()} />
                <Stat label="Total weeks" value={result.d.totalWeeks.toLocaleString()} />
                <Stat label="Total hours" value={result.d.totalHours.toLocaleString()} />
                <Stat label="Total minutes" value={result.d.totalMinutes.toLocaleString()} />
              </div>

              <div className="rounded-xl border border-border bg-card p-3 text-sm">
                <span className="text-muted-foreground">Next birthday: </span>
                <span className="font-medium">{result.bday.date.toLocaleDateString()}</span>
                <span className="text-muted-foreground"> — in {result.bday.days} day{result.bday.days === 1 ? "" : "s"}</span>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Pick two dates to see the result.
            </div>
          )}
        </section>
      </div>

      <HowItWorks>
        <li>Pick the date of birth (or any start date).</li>
        <li>Pick the end date — defaults to today.</li>
        <li>See exact years, months and days, plus totals and your next birthday.</li>
      </HowItWorks>
    </ToolLayout>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-2">
      <div className="text-muted-foreground">{label}</div>
      <div className="font-display text-base tabular-nums">{value}</div>
    </div>
  );
}
