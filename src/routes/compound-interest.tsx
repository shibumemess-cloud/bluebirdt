import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/compound-interest")({
  head: () => ({
    meta: [
      { title: "Compound Interest Calculator — Savings & Investment Growth" },
      { name: "description", content: "See how your money grows with compound interest and regular contributions. Year-by-year breakdown, free, in your browser." },
      { property: "og:title", content: "Compound Interest Calculator — Bluebird" },
      { property: "og:description", content: "See your savings grow with monthly contributions." },
      { property: "og:url", content: "/compound-interest" },
    ],
    links: [{ rel: "canonical", href: "/compound-interest" }],
  }),
  component: Page,
});

const FREQ: { label: string; n: number }[] = [
  { label: "Yearly", n: 1 },
  { label: "Quarterly", n: 4 },
  { label: "Monthly", n: 12 },
  { label: "Daily", n: 365 },
];

function Page() {
  const [principal, setPrincipal] = useState("1000");
  const [rate, setRate] = useState("8");
  const [years, setYears] = useState("10");
  const [freq, setFreq] = useState(12);
  const [contrib, setContrib] = useState("100");
  const [currency, setCurrency] = useState("USD");

  const data = useMemo(() => {
    const P = Math.max(0, parseFloat(principal) || 0);
    const r = Math.max(0, parseFloat(rate) || 0) / 100;
    const t = Math.max(0, parseInt(years) || 0);
    const n = freq;
    const PMT = Math.max(0, parseFloat(contrib) || 0); // monthly contribution

    const rows: { year: number; balance: number; contributed: number; interest: number }[] = [];
    let balance = P;
    let totalContrib = P;
    for (let y = 1; y <= t; y++) {
      const periodsThisYear = n;
      for (let p = 0; p < periodsThisYear; p++) {
        balance *= 1 + r / n;
        // Add yearly contribution * 12 / n each period (PMT is monthly)
        const periodContrib = (PMT * 12) / n;
        balance += periodContrib;
        totalContrib += periodContrib;
      }
      rows.push({ year: y, balance, contributed: totalContrib, interest: balance - totalContrib });
    }
    const final = rows[rows.length - 1] ?? { year: 0, balance: P, contributed: P, interest: 0 };
    return { rows, final };
  }, [principal, rate, years, freq, contrib]);

  const money = (v: number) => v.toLocaleString(undefined, { style: "currency", currency, maximumFractionDigits: 0 });

  return (
    <ToolLayout slug="compound-interest">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
            <Field id="ci-p" label="Starting amount" value={principal} setValue={setPrincipal} />
            <div>
              <label htmlFor="ci-cur" className="eyebrow">Currency</label>
              <select id="ci-cur" value={currency} onChange={(e) => setCurrency(e.target.value)}
                className="mt-1.5 min-h-12 rounded-xl border border-border bg-card px-3">
                {["USD","EUR","GBP","INR","CAD","AUD","JPY"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <Field id="ci-pmt" label="Monthly contribution" value={contrib} setValue={setContrib} />
          <div className="grid sm:grid-cols-2 gap-3">
            <Field id="ci-r" label="Annual interest rate (%)" value={rate} setValue={setRate} />
            <Field id="ci-y" label="Number of years" value={years} setValue={setYears} />
          </div>
          <div>
            <div className="eyebrow mb-2">Compounding frequency</div>
            <div className="flex flex-wrap gap-2">
              {FREQ.map((f) => (
                <button key={f.n} onClick={() => setFreq(f.n)} aria-pressed={freq === f.n}
                  className={["min-h-10 px-3 rounded-lg text-sm border",
                    freq === f.n ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary"].join(" ")}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="soft-card p-5 sm:p-6 space-y-4" aria-live="polite">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" />
            <div className="font-display text-lg">Future value</div>
          </div>
          <div className="rounded-2xl border border-border bg-primary-soft/40 p-5 text-center">
            <div className="eyebrow">After {years} years</div>
            <div className="mt-1 font-display text-4xl sm:text-5xl tabular-nums">{money(data.final.balance)}</div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Stat k="You contributed" v={money(data.final.contributed)} />
            <Stat k="Interest earned" v={money(data.final.interest)} />
          </div>
          {data.rows.length > 0 && (
            <details className="rounded-xl border border-border bg-card/60 p-3 text-sm">
              <summary className="cursor-pointer font-semibold">Year-by-year breakdown</summary>
              <div className="mt-3 max-h-72 overflow-y-auto">
                <table className="w-full text-xs tabular-nums">
                  <thead className="text-muted-foreground text-left">
                    <tr><th className="py-1">Year</th><th>Balance</th><th>Contributed</th><th>Interest</th></tr>
                  </thead>
                  <tbody>
                    {data.rows.map((r) => (
                      <tr key={r.year} className="border-t border-border">
                        <td className="py-1">{r.year}</td>
                        <td>{money(r.balance)}</td>
                        <td>{money(r.contributed)}</td>
                        <td>{money(r.interest)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}
        </section>
      </div>

      <HowItWorks>
        <li>Enter your starting amount and a monthly contribution.</li>
        <li>Type an annual interest rate and how long you'll save.</li>
        <li>Pick how often interest compounds — monthly is most common.</li>
      </HowItWorks>
    </ToolLayout>
  );
}

function Field({ id, label, value, setValue }: { id: string; label: string; value: string; setValue: (v: string) => void }) {
  return (
    <div>
      <label htmlFor={id} className="eyebrow">{label}</label>
      <input id={id} type="number" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)}
        className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3 tabular-nums focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
  );
}
function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-xs text-muted-foreground">{k}</div>
      <div className="font-display tabular-nums text-base mt-0.5">{v}</div>
    </div>
  );
}
