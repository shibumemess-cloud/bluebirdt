import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Landmark } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/mortgage-calculator")({
  head: () => ({
    meta: [
      { title: "Mortgage Calculator — Monthly Payment, Interest & Schedule" },
      { name: "description", content: "Free mortgage calculator. See your monthly payment, total interest, payoff date and a year-by-year schedule. Extra payments supported. Runs in your browser." },
      { property: "og:title", content: "Mortgage Calculator — Bluebird" },
      { property: "og:description", content: "Estimate your monthly mortgage payment, total interest and payoff date — free, private, in your browser." },
      { property: "og:url", content: "/mortgage-calculator" },
    ],
    links: [{ rel: "canonical", href: "/mortgage-calculator" }],
  }),
  component: Page,
});

const CURRENCIES = [
  { code: "USD", symbol: "$" }, { code: "EUR", symbol: "€" }, { code: "GBP", symbol: "£" },
  { code: "INR", symbol: "₹" }, { code: "CAD", symbol: "C$" }, { code: "AUD", symbol: "A$" },
];

function fmt(n: number, sym: string) {
  if (!isFinite(n)) return "—";
  return sym + n.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

function Page() {
  const [price, setPrice] = useState(350000);
  const [down, setDown] = useState(70000);
  const [years, setYears] = useState(30);
  const [rate, setRate] = useState(6.5);
  const [tax, setTax] = useState(3600);
  const [ins, setIns] = useState(1200);
  const [extra, setExtra] = useState(0);
  const [cur, setCur] = useState("USD");
  const sym = CURRENCIES.find((c) => c.code === cur)?.symbol ?? "$";

  const result = useMemo(() => {
    const principal = Math.max(0, price - down);
    const n = years * 12;
    const r = rate / 100 / 12;
    const base = r === 0 ? principal / n : (principal * r) / (1 - Math.pow(1 + r, -n));
    const monthlyTax = tax / 12;
    const monthlyIns = ins / 12;
    const monthly = base + monthlyTax + monthlyIns;

    // Amortization with optional extra principal
    let bal = principal;
    let months = 0;
    let totalInterest = 0;
    const yearly: { year: number; principal: number; interest: number; balance: number }[] = [];
    let yp = 0, yi = 0;
    while (bal > 0.01 && months < n * 2) {
      const interest = bal * r;
      let principalPaid = base - interest + extra;
      if (principalPaid > bal) principalPaid = bal;
      bal -= principalPaid;
      totalInterest += interest;
      yp += principalPaid; yi += interest;
      months++;
      if (months % 12 === 0 || bal <= 0.01) {
        yearly.push({ year: Math.ceil(months / 12), principal: yp, interest: yi, balance: Math.max(0, bal) });
        yp = 0; yi = 0;
      }
      if (r === 0 && extra === 0 && months >= n) break;
    }
    const payoffYears = months / 12;
    return { principal, base, monthly, monthlyTax, monthlyIns, totalInterest, payoffYears, yearly };
  }, [price, down, years, rate, tax, ins, extra]);

  return (
    <ToolLayout slug="mortgage-calculator">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 md:col-span-7 space-y-5">
          <div className="soft-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <span className="eyebrow">Loan details</span>
              <select value={cur} onChange={(e) => setCur(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
                {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
              </select>
            </div>
            <NumField label="Home price" value={price} onChange={setPrice} sym={sym} step={1000} />
            <NumField label="Down payment" value={down} onChange={setDown} sym={sym} step={1000} hint={`${price > 0 ? ((down / price) * 100).toFixed(1) : 0}% of price`} />
            <div className="grid grid-cols-2 gap-4">
              <NumField label="Term (years)" value={years} onChange={setYears} step={1} />
              <NumField label="Interest rate" value={rate} onChange={setRate} step={0.05} suffix="%" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <NumField label="Property tax / year" value={tax} onChange={setTax} sym={sym} step={100} />
              <NumField label="Home insurance / year" value={ins} onChange={setIns} sym={sym} step={100} />
            </div>
            <NumField label="Extra monthly payment" value={extra} onChange={setExtra} sym={sym} step={50} hint="Optional — paid straight to principal." />
          </div>
          <HowItWorks>
            Monthly payment uses the standard amortization formula P × r ÷ (1 − (1 + r)<sup>−n</sup>), then adds your
            property tax and insurance, divided into monthly amounts. Extra payments are subtracted from the loan
            balance each month — so you pay less interest and finish sooner.
          </HowItWorks>
        </div>

        <aside className="col-span-12 md:col-span-5">
          <div className="soft-card p-5 sm:p-6 sticky top-24">
            <span className="eyebrow">Monthly payment</span>
            <div className="font-display text-4xl sm:text-5xl mt-1 num">{fmt(result.monthly, sym)}</div>
            <div className="text-sm text-muted-foreground mt-1">Principal + interest + tax + insurance</div>
            <dl className="mt-5 space-y-2 text-sm">
              <Row k="Principal & interest" v={fmt(result.base, sym)} />
              <Row k="Property tax" v={fmt(result.monthlyTax, sym)} />
              <Row k="Insurance" v={fmt(result.monthlyIns, sym)} />
              <div className="border-t border-border my-3" />
              <Row k="Loan amount" v={fmt(result.principal, sym)} />
              <Row k="Total interest" v={fmt(result.totalInterest, sym)} />
              <Row k="Payoff in" v={`${result.payoffYears.toFixed(1)} years`} />
            </dl>
          </div>
          {result.yearly.length > 0 && (
            <div className="soft-card p-5 sm:p-6 mt-4">
              <span className="eyebrow">Yearly schedule</span>
              <div className="mt-3 max-h-72 overflow-auto -mx-2">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase text-muted-foreground sticky top-0 bg-card">
                    <tr><th className="text-left px-2 py-1.5">Year</th><th className="text-right px-2 py-1.5">Principal</th><th className="text-right px-2 py-1.5">Interest</th><th className="text-right px-2 py-1.5">Balance</th></tr>
                  </thead>
                  <tbody>
                    {result.yearly.map((y) => (
                      <tr key={y.year} className="border-t border-border/60">
                        <td className="px-2 py-1.5 num">{y.year}</td>
                        <td className="px-2 py-1.5 num text-right">{fmt(y.principal, sym)}</td>
                        <td className="px-2 py-1.5 num text-right">{fmt(y.interest, sym)}</td>
                        <td className="px-2 py-1.5 num text-right">{fmt(y.balance, sym)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </aside>
      </div>
    </ToolLayout>
  );
}

function NumField({ label, value, onChange, sym, suffix, hint, step = 1 }: { label: string; value: number; onChange: (n: number) => void; sym?: string; suffix?: string; hint?: string; step?: number }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="mt-1.5 relative">
        {sym && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground num">{sym}</span>}
        <input type="number" inputMode="decimal" min={0} step={step} value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className={`w-full min-h-12 rounded-xl border border-border bg-background px-3 ${sym ? "pl-8" : ""} ${suffix ? "pr-10" : ""} num text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none`} />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{suffix}</span>}
      </div>
      {hint && <span className="block text-xs text-muted-foreground mt-1">{hint}</span>}
    </label>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex items-baseline justify-between gap-3"><dt className="text-muted-foreground">{k}</dt><dd className="font-medium num">{v}</dd></div>;
}

// Suppress unused-import warning for icon reference picked by registry
void Landmark;
