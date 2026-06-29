import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Tag } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/discount-calculator")({
  head: () => ({
    meta: [
      { title: "Discount Calculator — Sale Price, Savings & Stacked Coupons" },
      { name: "description", content: "Calculate the final sale price and how much you save from a percentage discount. Stack two discounts and add tax — all in your browser." },
      { property: "og:title", content: "Discount Calculator — Bluebird" },
      { property: "og:description", content: "Sale price and savings, with stacked discounts and tax." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/discount-calculator" },
    ],
    links: [{ rel: "canonical", href: "/discount-calculator" }],
  }),
  component: Page,
});

function Page() {
  const [price, setPrice] = useState("199.99");
  const [d1, setD1] = useState("20");
  const [stack, setStack] = useState(false);
  const [d2, setD2] = useState("10");
  const [tax, setTax] = useState("0");
  const [currency, setCurrency] = useState("USD");

  const p = Math.max(0, parseFloat(price) || 0);
  const r1 = Math.min(100, Math.max(0, parseFloat(d1) || 0)) / 100;
  const r2 = stack ? Math.min(100, Math.max(0, parseFloat(d2) || 0)) / 100 : 0;
  const t = Math.max(0, parseFloat(tax) || 0) / 100;

  const afterFirst = p * (1 - r1);
  const afterSecond = afterFirst * (1 - r2);
  const withTax = afterSecond * (1 + t);
  const effective = p === 0 ? 0 : (1 - afterSecond / p) * 100;
  const saved = p - afterSecond;

  const money = (v: number) => v.toLocaleString(undefined, { style: "currency", currency, maximumFractionDigits: 2 });

  return (
    <ToolLayout slug="discount-calculator">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
            <div>
              <label htmlFor="dc-p" className="eyebrow">Original price</label>
              <input id="dc-p" type="number" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)}
                className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3 tabular-nums focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label htmlFor="dc-cur" className="eyebrow">Currency</label>
              <select id="dc-cur" value={currency} onChange={(e) => setCurrency(e.target.value)}
                className="mt-1.5 min-h-12 rounded-xl border border-border bg-card px-3">
                {["USD","EUR","GBP","INR","CAD","AUD","JPY"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="dc-d1" className="eyebrow">Discount (%)</label>
            <input id="dc-d1" type="number" inputMode="decimal" value={d1} onChange={(e) => setD1(e.target.value)}
              className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3 tabular-nums focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={stack} onChange={(e) => setStack(e.target.checked)} className="size-4 accent-[color:var(--color-primary)]" />
            Stack a second discount on top
          </label>

          {stack && (
            <div>
              <label htmlFor="dc-d2" className="eyebrow">Second discount (%)</label>
              <input id="dc-d2" type="number" inputMode="decimal" value={d2} onChange={(e) => setD2(e.target.value)}
                className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3 tabular-nums focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          )}

          <div>
            <label htmlFor="dc-tax" className="eyebrow">Tax rate (%) — optional</label>
            <input id="dc-tax" type="number" inputMode="decimal" value={tax} onChange={(e) => setTax(e.target.value)}
              className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3 tabular-nums focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </section>

        <section className="soft-card p-5 sm:p-6 space-y-4" aria-live="polite">
          <div className="flex items-center gap-2">
            <Tag className="size-4 text-primary" />
            <div className="font-display text-lg">Result</div>
          </div>
          <div className="rounded-2xl border border-border bg-primary-soft/40 p-5 text-center">
            <div className="eyebrow">Sale price{t > 0 ? " (incl. tax)" : ""}</div>
            <div className="mt-1 text-4xl sm:text-5xl font-display tabular-nums">{money(withTax)}</div>
            <div className="mt-1 text-sm text-muted-foreground">You save {money(saved)} ({effective.toFixed(1)}% off)</div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Stat label="Original" value={money(p)} />
            <Stat label="After discount" value={money(afterSecond)} />
            {stack && <Stat label="After 1st only" value={money(afterFirst)} />}
            {t > 0 && <Stat label="Tax added" value={money(withTax - afterSecond)} />}
          </div>
        </section>
      </div>

      <HowItWorks>
        <li>Enter the original price.</li>
        <li>Type the discount — stack a second one if your coupon allows.</li>
        <li>Add a tax rate if you want — the final price updates instantly.</li>
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
