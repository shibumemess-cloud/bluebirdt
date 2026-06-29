import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Activity } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks, WarnBox } from "../components/ToolControls";

export const Route = createFileRoute("/bmi-calculator")({
  head: () => ({
    meta: [
      { title: "BMI Calculator — Metric & Imperial, Free In-Browser" },
      {
        name: "description",
        content:
          "Calculate body mass index (BMI) in metric (kg/cm) or imperial (lb/in). See your category and a healthy weight range. Free, private, in-browser.",
      },
      { property: "og:title", content: "BMI Calculator — Bluebird" },
      { property: "og:description", content: "Free BMI calculator with metric and imperial units and a healthy weight range." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/bmi-calculator" },
    ],
    links: [{ rel: "canonical", href: "/bmi-calculator" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird BMI Calculator",
          applicationCategory: "HealthApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: Page,
});

type Unit = "metric" | "imperial";

export function calcBmi(weight: number, height: number, unit: Unit) {
  if (!Number.isFinite(weight) || !Number.isFinite(height) || weight <= 0 || height <= 0) return null;
  let bmi: number;
  if (unit === "metric") {
    const m = height / 100;
    bmi = weight / (m * m);
  } else {
    bmi = (weight / (height * height)) * 703;
  }
  return Math.round(bmi * 10) / 10;
}

export function bmiCategory(bmi: number) {
  if (bmi < 18.5) return { label: "Underweight", tone: "warning" as const };
  if (bmi < 25) return { label: "Healthy weight", tone: "ok" as const };
  if (bmi < 30) return { label: "Overweight", tone: "warning" as const };
  return { label: "Obesity", tone: "alert" as const };
}

export function healthyRange(height: number, unit: Unit) {
  if (unit === "metric") {
    const m = height / 100;
    return { lo: Math.round(18.5 * m * m * 10) / 10, hi: Math.round(24.9 * m * m * 10) / 10, unit: "kg" };
  }
  return {
    lo: Math.round((18.5 * height * height) / 703 * 10) / 10,
    hi: Math.round((24.9 * height * height) / 703 * 10) / 10,
    unit: "lb",
  };
}

function Page() {
  const [unit, setUnit] = useState<Unit>("metric");
  const [weight, setWeight] = useState("70");
  const [height, setHeight] = useState("175");

  const w = Number(weight);
  const h = Number(height);
  const bmi = useMemo(() => calcBmi(w, h, unit), [w, h, unit]);
  const cat = bmi != null ? bmiCategory(bmi) : null;
  const range = h > 0 ? healthyRange(h, unit) : null;

  return (
    <ToolLayout slug="bmi-calculator">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-5">
          <div role="radiogroup" aria-label="Units" className="grid grid-cols-2 gap-2">
            {(["metric", "imperial"] as const).map((u) => (
              <button
                key={u}
                role="radio"
                aria-checked={unit === u}
                onClick={() => {
                  setUnit(u);
                  if (u === "imperial") { setWeight("154"); setHeight("69"); }
                  else { setWeight("70"); setHeight("175"); }
                }}
                className={`min-h-12 rounded-xl border px-3 ${
                  unit === u ? "border-primary bg-primary-soft" : "border-border bg-card hover:bg-primary-soft"
                }`}
              >
                {u === "metric" ? "Metric (kg, cm)" : "Imperial (lb, in)"}
              </button>
            ))}
          </div>

          <div>
            <label htmlFor="bmi-weight" className="eyebrow">Weight ({unit === "metric" ? "kg" : "lb"})</label>
            <input
              id="bmi-weight"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label htmlFor="bmi-height" className="eyebrow">Height ({unit === "metric" ? "cm" : "in"})</label>
            <input
              id="bmi-height"
              inputMode="decimal"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {bmi == null && <WarnBox>Enter a positive weight and height to see your BMI.</WarnBox>}
          <div className="text-xs text-muted-foreground">
            BMI is a rough screening tool. It doesn't account for muscle mass, age or body shape. Talk to a doctor for advice tailored to you.
          </div>
        </section>

        <section className="soft-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            <div className="font-display text-lg">Your BMI</div>
          </div>

          {bmi != null && cat ? (
            <>
              <div className="rounded-2xl border border-border bg-primary-soft/40 p-5 text-center">
                <div className="text-5xl font-display tabular-nums">{bmi}</div>
                <div className={`mt-1 text-sm font-medium ${
                  cat.tone === "ok" ? "text-primary" : cat.tone === "warning" ? "text-amber-600 dark:text-amber-400" : "text-destructive"
                }`}>{cat.label}</div>
              </div>

              <BmiBar value={bmi} />

              {range && (
                <div className="rounded-xl border border-border bg-card p-3 text-sm">
                  <span className="text-muted-foreground">Healthy range for your height: </span>
                  <span className="font-medium tabular-nums">{range.lo}–{range.hi} {range.unit}</span>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Enter your weight and height to see your BMI.
            </div>
          )}
        </section>
      </div>

      <HowItWorks>
        <li>Choose metric or imperial units.</li>
        <li>Enter your weight and height.</li>
        <li>See your BMI, category and a healthy weight range for your height.</li>
      </HowItWorks>
    </ToolLayout>
  );
}

function BmiBar({ value }: { value: number }) {
  const min = 15;
  const max = 40;
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  return (
    <div>
      <div className="relative h-3 rounded-full overflow-hidden bg-gradient-to-r from-sky-400 via-emerald-400 via-50% to-rose-500">
        <div
          aria-hidden
          className="absolute top-[-4px] h-5 w-1 rounded bg-foreground"
          style={{ left: `calc(${pct}% - 2px)` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground tabular-nums">
        <span>15</span><span>18.5</span><span>25</span><span>30</span><span>40+</span>
      </div>
    </div>
  );
}
