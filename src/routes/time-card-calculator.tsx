import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Clock, Plus, Trash2 } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/time-card-calculator")({
  head: () => ({
    meta: [
      { title: "Time Card Calculator — Hours Worked, Breaks & Pay" },
      { name: "description", content: "Add clock-in and clock-out times for a whole week, subtract breaks, and see total hours and pay. Free and private." },
      { property: "og:title", content: "Time Card Calculator — Bluebird" },
      { property: "og:description", content: "Add up weekly hours with breaks and hourly pay." },
      { property: "og:url", content: "/time-card-calculator" },
    ],
    links: [{ rel: "canonical", href: "/time-card-calculator" }],
  }),
  component: Page,
});

type Row = { id: number; day: string; start: string; end: string; breakMin: number };
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function diffHours(start: string, end: string, breakMin: number): number {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  mins -= breakMin;
  return Math.max(0, mins / 60);
}

function Page() {
  const [rows, setRows] = useState<Row[]>(() => DAYS.map((d, i) => ({ id: i, day: d, start: "09:00", end: "17:00", breakMin: 30 })));
  const [rate, setRate] = useState(20);
  const [currency, setCurrency] = useState("$");

  const totals = useMemo(() => {
    const perRow = rows.map((r) => diffHours(r.start, r.end, r.breakMin));
    const total = perRow.reduce((a, b) => a + b, 0);
    const reg = Math.min(40, total);
    const ot = Math.max(0, total - 40);
    return { perRow, total, reg, ot, pay: reg * rate + ot * rate * 1.5 };
  }, [rows, rate]);

  const update = (id: number, patch: Partial<Row>) => setRows((rs) => rs.map((r) => r.id === id ? { ...r, ...patch } : r));
  const add = () => setRows((rs) => [...rs, { id: Date.now(), day: "—", start: "09:00", end: "17:00", breakMin: 0 }]);
  const remove = (id: number) => setRows((rs) => rs.filter((r) => r.id !== id));

  return (
    <ToolLayout slug="time-card-calculator">
      <div className="soft-card p-4 sm:p-5 grid sm:grid-cols-3 gap-3">
        <div><label className="eyebrow" htmlFor="tc-rate">Hourly pay</label>
          <input id="tc-rate" type="number" min={0} step={0.5} value={rate} onChange={(e) => setRate(Number(e.target.value) || 0)}
            className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3" /></div>
        <div><label className="eyebrow" htmlFor="tc-cur">Currency symbol</label>
          <input id="tc-cur" value={currency} onChange={(e) => setCurrency(e.target.value)}
            className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3" /></div>
      </div>
      <div className="mt-4 soft-card p-2 sm:p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-muted-foreground">
            <th className="p-2">Day</th><th className="p-2">In</th><th className="p-2">Out</th><th className="p-2">Break (min)</th><th className="p-2 text-right">Hours</th><th></th>
          </tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-2"><input value={r.day} onChange={(e) => update(r.id, { day: e.target.value })} className="w-20 min-h-10 rounded-lg border border-border bg-card px-2" /></td>
                <td className="p-2"><input type="time" value={r.start} onChange={(e) => update(r.id, { start: e.target.value })} className="min-h-10 rounded-lg border border-border bg-card px-2" /></td>
                <td className="p-2"><input type="time" value={r.end} onChange={(e) => update(r.id, { end: e.target.value })} className="min-h-10 rounded-lg border border-border bg-card px-2" /></td>
                <td className="p-2"><input type="number" min={0} value={r.breakMin} onChange={(e) => update(r.id, { breakMin: Number(e.target.value) || 0 })} className="w-20 min-h-10 rounded-lg border border-border bg-card px-2" /></td>
                <td className="p-2 text-right font-mono">{totals.perRow[i].toFixed(2)}</td>
                <td className="p-2 text-right"><button onClick={() => remove(r.id)} className="text-muted-foreground hover:text-red-600"><Trash2 className="size-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={add} className="mt-3 min-h-11 px-4 rounded-xl border border-border hover:border-primary inline-flex items-center gap-1.5 text-sm"><Plus className="size-4" /> Add day</button>
      </div>
      <div className="mt-4 grid sm:grid-cols-4 gap-3">
        <div className="soft-card p-4"><div className="text-xs text-muted-foreground">Total hours</div><div className="text-2xl font-display font-semibold">{totals.total.toFixed(2)}</div></div>
        <div className="soft-card p-4"><div className="text-xs text-muted-foreground">Regular hours</div><div className="text-2xl font-display font-semibold">{totals.reg.toFixed(2)}</div></div>
        <div className="soft-card p-4"><div className="text-xs text-muted-foreground">Overtime (1.5×)</div><div className="text-2xl font-display font-semibold">{totals.ot.toFixed(2)}</div></div>
        <div className="soft-card p-4"><div className="text-xs text-muted-foreground">Estimated pay</div><div className="text-2xl font-display font-semibold">{currency}{totals.pay.toFixed(2)}</div></div>
      </div>
      <div className="mt-3 text-sm text-muted-foreground inline-flex items-center gap-2">
        <Clock className="size-4 text-primary" /> Overtime auto-applies after 40 hours/week
      </div>
      <HowItWorks>
        <li>Set your hourly pay and currency.</li>
        <li>Type the time you clocked in and out each day, plus break minutes.</li>
        <li>Totals, overtime and estimated pay update as you type.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
