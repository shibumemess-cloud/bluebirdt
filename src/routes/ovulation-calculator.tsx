import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarHeart } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/ovulation-calculator")({
  head: () => ({
    meta: [
      { title: "Ovulation Calculator — Fertile Window & Next Period" },
      { name: "description", content: "Find your fertile window, likely ovulation day and next three periods. Free and private — nothing is sent anywhere." },
      { property: "og:title", content: "Ovulation Calculator — Bluebird" },
      { property: "og:description", content: "Fertile window and next-period dates in one click." },
      { property: "og:url", content: "/ovulation-calculator" },
    ],
    links: [{ rel: "canonical", href: "/ovulation-calculator" }],
  }),
  component: Page,
});

function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function fmt(d: Date) { return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }); }

function Page() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [cycle, setCycle] = useState(28);
  const [luteal, setLuteal] = useState(14);

  const data = useMemo(() => {
    const base = new Date(date + "T00:00:00");
    if (Number.isNaN(base.getTime())) return null;
    const ovulation = addDays(base, cycle - luteal);
    const fertileStart = addDays(ovulation, -5);
    const fertileEnd = addDays(ovulation, 1);
    const periods = [1, 2, 3].map((i) => addDays(base, cycle * i));
    return { ovulation, fertileStart, fertileEnd, periods };
  }, [date, cycle, luteal]);

  return (
    <ToolLayout slug="ovulation-calculator">
      <div className="soft-card p-4 sm:p-5 grid sm:grid-cols-3 gap-3">
        <div><label className="eyebrow">First day of last period</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3" /></div>
        <div><label className="eyebrow">Average cycle (days)</label>
          <input type="number" min={20} max={45} value={cycle} onChange={(e) => setCycle(Math.max(20, Math.min(45, Number(e.target.value) || 28)))}
            className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3" /></div>
        <div><label className="eyebrow">Luteal phase (days)</label>
          <input type="number" min={10} max={16} value={luteal} onChange={(e) => setLuteal(Math.max(10, Math.min(16, Number(e.target.value) || 14)))}
            className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3" /></div>
      </div>
      {data ? (
        <>
          <div className="mt-4 soft-card p-5 bg-primary-soft/30">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><CalendarHeart className="size-4 text-primary" /> Most fertile window</div>
            <div className="mt-1 text-2xl font-display font-semibold">{fmt(data.fertileStart)} — {fmt(data.fertileEnd)}</div>
            <div className="mt-1 text-sm">Likely ovulation: <span className="font-medium">{fmt(data.ovulation)}</span></div>
          </div>
          <div className="mt-4 soft-card p-5">
            <div className="text-sm text-muted-foreground">Next three periods</div>
            <ul className="mt-2 space-y-1 text-base">
              {data.periods.map((p, i) => <li key={i}>{i + 1}. {fmt(p)}</li>)}
            </ul>
          </div>
        </>
      ) : null}
      <HowItWorks>
        <li>Enter the first day of your last period.</li>
        <li>Adjust cycle and luteal phase length if you know them — defaults work for most.</li>
        <li>See your fertile window, ovulation day and the next three periods.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
