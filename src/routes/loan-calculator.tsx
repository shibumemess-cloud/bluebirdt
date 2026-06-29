import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Landmark } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks, WarnBox } from "../components/ToolControls";

export const Route = createFileRoute("/loan-calculator")({
  head: () => ({
    meta: [
      { title: "Loan & EMI Calculator — Monthly Payment, Interest & Schedule" },
      { name: "description", content: "Free loan calculator. Enter the loan amount, annual rate and term to see your monthly payment, total interest and full amortisation schedule." },
      { property: "og:title", content: "Loan & EMI Calculator — Bluebird" },
      { property: "og:description", content: "Estimate monthly payment, total interest and full schedule for any amortising loan." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/loan-calculator" },
    ],
    links: [{ rel: "canonical", href: "/loan-calculator" }],
  }),
  component: Page,
});

function money(n: number, currency: string) {
  if (!isFinite(n)) return "—";
  return n.toLocaleString(undefined, { style: "currency", currency, maximumFractionDigits: 2 });
}

function Page() {
  const [amount, setAmount] = useState("250000");
  const [rate, setRate] = useState("7.5");
  const [years, setYears] = useState("20");
  const [currency, setCurrency] = useState("USD");
  const [showSchedule, setShowSchedule] = useState(false);

  const result = useMemo(() => {
    const P = parseFloat(amount);
    const r = parseFloat(rate) / 100 / 12;
    const n = Math.round(parseFloat(years) * 12);
    if (!isFinite(P) || P <= 0 || !isFinite(r) || r < 0 || !isFinite(n) || n <= 0) {
      return { ok: false as const, err: "Enter a positive amount, rate and term." };
    }
    const emi = r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = emi * n;
    const interest = total - P;
    return { ok: true as const, emi, total, interest, P, r, n };
  }, [amount, rate, years]);

  const schedule = useMemo(() => {
    if (!result.ok || !showSchedule) return [] as { i: number; principal: number; interest: number; balance: number }[];
    const rows: { i: number; principal: number; interest: number; balance: number }[] = [];
    let bal = result.P;
    for (let i = 1; i <= result.n; i++) {
      const interest = bal * result.r;
      const principal = result.emi - interest;
      bal = Math.max(0, bal - principal);
      rows.push({ i, principal, interest, balance: bal });
    }
    return rows;
  }, [result, showSchedule]);

  return (
    <ToolLayout slug="loan-calculator">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
            <div>
              <label htmlFor="ln-amt" className="eyebrow">Loan amount</label>
              <input
                id="ln-amt"
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3 tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="ln-cur" className="eyebrow">Currency</label>
              <select
                id="ln-cur"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="mt-1.5 min-h-12 rounded-xl border border-border bg-card px-3"
              >
                {["USD","EUR","GBP","INR","CAD","AUD","JPY"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="ln-rate" className="eyebrow">Annual interest rate (%)</label>
            <input
              id="ln-rate"
              type="number"
              inputMode="decimal"
              step="0.01"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3 tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="ln-years" className="eyebrow">Term (years)</label>
            <input
              id="ln-years"
              type="number"
              inputMode="decimal"
              step="0.5"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3 tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {!result.ok && <WarnBox>{result.err}</WarnBox>}
        </section>

        <section className="soft-card p-5 sm:p-6 space-y-4" aria-live="polite">
          <div className="flex items-center gap-2">
            <Landmark className="size-4 text-primary" />
            <div className="font-display text-lg">Result</div>
          </div>
          {result.ok && (
            <>
              <div className="rounded-2xl border border-border bg-primary-soft/40 p-5 text-center">
                <div className="eyebrow">Monthly payment</div>
                <div className="mt-1 text-3xl sm:text-4xl font-display tabular-nums">{money(result.emi, currency)}</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Stat label="Total paid" value={money(result.total, currency)} />
                <Stat label="Total interest" value={money(result.interest, currency)} />
                <Stat label="Months" value={String(result.n)} />
                <Stat label="Principal" value={money(result.P, currency)} />
              </div>
              <button
                onClick={() => setShowSchedule((v) => !v)}
                className="min-h-11 w-full rounded-xl border border-border bg-card hover:border-primary hover:text-primary text-sm font-medium"
              >
                {showSchedule ? "Hide" : "Show"} amortisation schedule
              </button>
              {showSchedule && (
                <div className="max-h-80 overflow-auto rounded-xl border border-border">
                  <table className="w-full text-xs tabular-nums">
                    <thead className="sticky top-0 bg-card">
                      <tr className="text-left">
                        <th className="p-2">#</th>
                        <th className="p-2">Principal</th>
                        <th className="p-2">Interest</th>
                        <th className="p-2">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedule.map((row) => (
                        <tr key={row.i} className="border-t border-border">
                          <td className="p-2">{row.i}</td>
                          <td className="p-2">{money(row.principal, currency)}</td>
                          <td className="p-2">{money(row.interest, currency)}</td>
                          <td className="p-2">{money(row.balance, currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <HowItWorks>
        <li>Type the loan amount, annual rate and term.</li>
        <li>See your monthly payment, total interest and total cost.</li>
        <li>Open the schedule to see every instalment broken into principal and interest.</li>
      </HowItWorks>
    </ToolLayout>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="font-display text-base tabular-nums mt-0.5">{value}</div>
    </div>
  );
}
