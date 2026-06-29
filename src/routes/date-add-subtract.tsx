import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarDays, Copy } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/date-add-subtract")({
  head: () => ({
    meta: [
      { title: "Date Calculator — Add or Subtract Days, Weeks, Months" },
      { name: "description", content: "Pick a date and add or subtract days, weeks, months or years. Great for due dates, deadlines and planning." },
      { property: "og:title", content: "Date Calculator — Bluebird" },
      { property: "og:description", content: "Add or subtract time from any date." },
      { property: "og:url", content: "/date-add-subtract" },
    ],
    links: [{ rel: "canonical", href: "/date-add-subtract" }],
  }),
  component: Page,
});

function isoToday() { return new Date().toISOString().slice(0, 10); }

function Page() {
  const [date, setDate] = useState(isoToday());
  const [op, setOp] = useState<"add" | "sub">("add");
  const [days, setDays] = useState(0);
  const [weeks, setWeeks] = useState(0);
  const [months, setMonths] = useState(0);
  const [years, setYears] = useState(0);
  const [skipWeekend, setSkipWeekend] = useState(false);

  const result = useMemo(() => {
    const d = new Date(date + "T00:00:00");
    if (Number.isNaN(d.getTime())) return null;
    const sign = op === "add" ? 1 : -1;
    d.setFullYear(d.getFullYear() + sign * years);
    d.setMonth(d.getMonth() + sign * months);
    let totalDays = sign * (days + weeks * 7);
    if (skipWeekend && totalDays !== 0) {
      const step = totalDays > 0 ? 1 : -1;
      let remaining = Math.abs(totalDays);
      while (remaining > 0) {
        d.setDate(d.getDate() + step);
        const day = d.getDay();
        if (day !== 0 && day !== 6) remaining--;
      }
    } else {
      d.setDate(d.getDate() + totalDays);
    }
    return d;
  }, [date, op, days, weeks, months, years, skipWeekend]);

  const formatted = result ? result.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "";
  const iso = result ? result.toISOString().slice(0, 10) : "";

  return (
    <ToolLayout slug="date-add-subtract">
      <div className="soft-card p-4 sm:p-5 grid sm:grid-cols-2 gap-3">
        <div><label className="eyebrow" htmlFor="da-date">Start date</label>
          <input id="da-date" type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3" /></div>
        <div className="flex gap-2 items-end">
          <button onClick={() => setOp("add")} aria-pressed={op === "add"}
            className={["min-h-12 flex-1 px-4 rounded-xl text-sm font-medium border",
              op === "add" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"].join(" ")}>Add</button>
          <button onClick={() => setOp("sub")} aria-pressed={op === "sub"}
            className={["min-h-12 flex-1 px-4 rounded-xl text-sm font-medium border",
              op === "sub" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"].join(" ")}>Subtract</button>
        </div>
      </div>
      <div className="mt-4 soft-card p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Years", v: years, set: setYears },
          { label: "Months", v: months, set: setMonths },
          { label: "Weeks", v: weeks, set: setWeeks },
          { label: "Days", v: days, set: setDays },
        ].map((f) => (
          <div key={f.label}>
            <label className="eyebrow">{f.label}</label>
            <input type="number" min={0} value={f.v} onChange={(e) => f.set(Math.max(0, Number(e.target.value) || 0))}
              className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3" />
          </div>
        ))}
        <label className="col-span-2 sm:col-span-4 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={skipWeekend} onChange={(e) => setSkipWeekend(e.target.checked)} /> Count business days only (skip weekends)
        </label>
      </div>
      <div className="mt-4 soft-card p-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays className="size-4 text-primary" /> Result</div>
        <div className="mt-1 text-3xl font-display font-semibold">{formatted || "—"}</div>
        <div className="mt-1 text-sm text-muted-foreground">{iso}</div>
        <button onClick={() => iso && navigator.clipboard.writeText(formatted).catch(() => {})}
          className="mt-3 min-h-11 px-4 rounded-xl border border-border hover:border-primary inline-flex items-center gap-1.5 text-sm"><Copy className="size-4" /> Copy date</button>
      </div>
      <HowItWorks>
        <li>Pick the date you're starting from.</li>
        <li>Type how many years, months, weeks or days to add or subtract.</li>
        <li>See the resulting date — toggle weekends-only for business-day math.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
