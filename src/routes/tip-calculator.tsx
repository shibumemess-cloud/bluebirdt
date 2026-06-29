import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Receipt } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/tip-calculator")({
  head: () => ({
    meta: [
      { title: "Tip Calculator & Bill Split — Free, In Your Browser" },
      { name: "description", content: "Add a tip to any bill and split it evenly between any number of people. Round up per person, pick your currency, no sign-up." },
      { property: "og:title", content: "Tip Calculator & Bill Split — Bluebird" },
      { property: "og:description", content: "Calculate the tip and split the bill in seconds." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/tip-calculator" },
    ],
    links: [{ rel: "canonical", href: "/tip-calculator" }],
  }),
  component: Page,
});

function Page() {
  const [bill, setBill] = useState("48.50");
  const [tipPct, setTipPct] = useState(18);
  const [people, setPeople] = useState(2);
  const [roundUp, setRoundUp] = useState(false);
  const [currency, setCurrency] = useState("USD");

  const b = Math.max(0, parseFloat(bill) || 0);
  const tip = b * (tipPct / 100);
  const total = b + tip;
  const n = Math.max(1, Math.floor(people));
  const perPersonRaw = total / n;
  const perPerson = roundUp ? Math.ceil(perPersonRaw) : perPersonRaw;
  const collected = perPerson * n;

  const money = (v: number) => v.toLocaleString(undefined, { style: "currency", currency, maximumFractionDigits: 2 });
  const presets = [10, 15, 18, 20, 25];

  return (
    <ToolLayout slug="tip-calculator">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
            <div>
              <label htmlFor="tc-bill" className="eyebrow">Bill amount</label>
              <input
                id="tc-bill"
                type="number"
                inputMode="decimal"
                value={bill}
                onChange={(e) => setBill(e.target.value)}
                className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3 tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="tc-cur" className="eyebrow">Currency</label>
              <select
                id="tc-cur"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="mt-1.5 min-h-12 rounded-xl border border-border bg-card px-3"
              >
                {["USD","EUR","GBP","INR","CAD","AUD","JPY"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-end justify-between">
              <label htmlFor="tc-tip" className="eyebrow">Tip percentage</label>
              <span className="font-display tabular-nums text-lg">{tipPct}%</span>
            </div>
            <input
              id="tc-tip"
              type="range"
              min={0}
              max={40}
              value={tipPct}
              onChange={(e) => setTipPct(parseInt(e.target.value))}
              className="mt-1.5 w-full accent-[color:var(--color-primary)]"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p}
                  onClick={() => setTipPct(p)}
                  className={`min-h-9 px-3 rounded-lg border text-xs ${
                    tipPct === p ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary"
                  }`}
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="tc-ppl" className="eyebrow">Split between</label>
            <div className="mt-1.5 flex items-center gap-2">
              <button onClick={() => setPeople(Math.max(1, people - 1))} className="min-h-12 size-12 rounded-xl border border-border bg-card text-xl">−</button>
              <input
                id="tc-ppl"
                type="number"
                min={1}
                value={people}
                onChange={(e) => setPeople(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 min-h-12 rounded-xl border border-border bg-card px-3 text-center text-lg tabular-nums"
              />
              <button onClick={() => setPeople(people + 1)} className="min-h-12 size-12 rounded-xl border border-border bg-card text-xl">+</button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={roundUp} onChange={(e) => setRoundUp(e.target.checked)} className="size-4 accent-[color:var(--color-primary)]" />
            Round up per person to whole {currency}
          </label>
        </section>

        <section className="soft-card p-5 sm:p-6 space-y-4" aria-live="polite">
          <div className="flex items-center gap-2">
            <Receipt className="size-4 text-primary" />
            <div className="font-display text-lg">Result</div>
          </div>
          <div className="rounded-2xl border border-border bg-primary-soft/40 p-5 text-center">
            <div className="eyebrow">Each person pays</div>
            <div className="mt-1 text-4xl sm:text-5xl font-display tabular-nums">{money(perPerson)}</div>
            <div className="mt-1 text-xs text-muted-foreground">× {n} {n === 1 ? "person" : "people"} = {money(collected)}</div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <Stat label="Bill" value={money(b)} />
            <Stat label="Tip" value={money(tip)} />
            <Stat label="Total" value={money(total)} />
          </div>
        </section>
      </div>

      <HowItWorks>
        <li>Type the bill amount and pick a tip percentage.</li>
        <li>Choose how many people are splitting the bill.</li>
        <li>See each person's share — round up for easy cash payments.</li>
      </HowItWorks>
    </ToolLayout>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-center">
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="font-display text-base tabular-nums mt-0.5">{value}</div>
    </div>
  );
}
