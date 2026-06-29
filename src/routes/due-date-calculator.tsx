import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Baby } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/due-date-calculator")({
  head: () => ({
    meta: [
      { title: "Pregnancy Due Date Calculator — Free & Private" },
      { name: "description", content: "Find your estimated due date and current week of pregnancy from your last menstrual period or conception date." },
      { property: "og:title", content: "Due Date Calculator — Bluebird" },
      { property: "og:description", content: "Naegele's rule with conception and IVF options." },
      { property: "og:url", content: "/due-date-calculator" },
    ],
    links: [{ rel: "canonical", href: "/due-date-calculator" }],
  }),
  component: Page,
});

function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function fmt(d: Date) { return d.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" }); }

function Page() {
  const [mode, setMode] = useState<"lmp" | "conc">("lmp");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [cycle, setCycle] = useState(28);

  const data = useMemo(() => {
    const base = new Date(date + "T00:00:00");
    if (Number.isNaN(base.getTime())) return null;
    const lmp = mode === "lmp" ? base : addDays(base, -14);
    const due = addDays(lmp, 280 + (cycle - 28));
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const daysIn = Math.floor((today.getTime() - lmp.getTime()) / 86400000);
    const week = Math.floor(daysIn / 7);
    const day = daysIn % 7;
    const trimester = week < 13 ? 1 : week < 27 ? 2 : 3;
    return { due, lmp, week, day, daysIn, trimester };
  }, [mode, date, cycle]);

  return (
    <ToolLayout slug="due-date-calculator">
      <div className="soft-card p-4 sm:p-5 grid sm:grid-cols-3 gap-3">
        <div className="sm:col-span-3 flex gap-2">
          <button onClick={() => setMode("lmp")} aria-pressed={mode === "lmp"} className={["flex-1 min-h-12 rounded-xl border", mode === "lmp" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"].join(" ")}>Last period (LMP)</button>
          <button onClick={() => setMode("conc")} aria-pressed={mode === "conc"} className={["flex-1 min-h-12 rounded-xl border", mode === "conc" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"].join(" ")}>Conception date</button>
        </div>
        <div><label className="eyebrow">{mode === "lmp" ? "First day of last period" : "Conception date"}</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3" /></div>
        <div><label className="eyebrow">Average cycle (days)</label>
          <input type="number" min={20} max={45} value={cycle} onChange={(e) => setCycle(Math.max(20, Math.min(45, Number(e.target.value) || 28)))}
            className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3" /></div>
      </div>
      {data ? (
        <>
          <div className="mt-4 soft-card p-5 bg-primary-soft/30">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Baby className="size-4 text-primary" /> Estimated due date</div>
            <div className="mt-1 text-3xl font-display font-semibold">{fmt(data.due)}</div>
          </div>
          <div className="mt-4 grid sm:grid-cols-3 gap-3">
            <div className="soft-card p-4"><div className="text-xs text-muted-foreground">Currently</div><div className="text-xl font-display font-semibold">{data.daysIn > 0 ? `Week ${data.week}, day ${data.day}` : "Not started yet"}</div></div>
            <div className="soft-card p-4"><div className="text-xs text-muted-foreground">Trimester</div><div className="text-xl font-display font-semibold">{data.daysIn > 0 && data.week < 42 ? `${data.trimester}${data.trimester === 1 ? "st" : data.trimester === 2 ? "nd" : "rd"}` : "—"}</div></div>
            <div className="soft-card p-4"><div className="text-xs text-muted-foreground">First day of pregnancy used</div><div className="text-xl font-display font-semibold">{fmt(data.lmp)}</div></div>
          </div>
        </>
      ) : null}
      <HowItWorks>
        <li>Pick whether you know your last period or your conception date.</li>
        <li>Enter the date and your average cycle length.</li>
        <li>See your due date and how many weeks along you are.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
