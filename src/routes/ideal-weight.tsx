import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Target } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/ideal-weight")({
  head: () => ({
    meta: [
      { title: "Ideal Weight Calculator — Robinson, Devine & BMI Range" },
      { name: "description", content: "Find your healthy weight range using Devine, Robinson, Miller and Hamwi formulas plus the BMI 18.5–24.9 range." },
      { property: "og:title", content: "Ideal Weight Calculator — Bluebird" },
      { property: "og:description", content: "Healthy weight ranges from four classic formulas plus BMI." },
      { property: "og:url", content: "/ideal-weight" },
    ],
    links: [{ rel: "canonical", href: "/ideal-weight" }],
  }),
  component: Page,
});

function Page() {
  const [sex, setSex] = useState<"m" | "f">("m");
  const [unit, setUnit] = useState<"cm" | "in">("cm");
  const [height, setHeight] = useState(175);

  const data = useMemo(() => {
    const cm = unit === "cm" ? height : height * 2.54;
    const inches = cm / 2.54;
    const extra = Math.max(0, inches - 60);
    let devine = sex === "m" ? 50 + 2.3 * extra : 45.5 + 2.3 * extra;
    let robinson = sex === "m" ? 52 + 1.9 * extra : 49 + 1.7 * extra;
    let miller = sex === "m" ? 56.2 + 1.41 * extra : 53.1 + 1.36 * extra;
    let hamwi = sex === "m" ? 48 + 2.7 * extra : 45.5 + 2.2 * extra;
    const m = cm / 100;
    const bmiLow = 18.5 * m * m;
    const bmiHigh = 24.9 * m * m;
    return { devine, robinson, miller, hamwi, bmiLow, bmiHigh };
  }, [sex, unit, height]);

  const fmt = (kg: number) => `${kg.toFixed(1)} kg · ${(kg * 2.20462).toFixed(1)} lb`;

  return (
    <ToolLayout slug="ideal-weight">
      <div className="soft-card p-4 sm:p-5 grid sm:grid-cols-3 gap-3">
        <div className="flex gap-2">
          <button onClick={() => setSex("m")} aria-pressed={sex === "m"} className={["flex-1 min-h-12 rounded-xl border", sex === "m" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"].join(" ")}>Male</button>
          <button onClick={() => setSex("f")} aria-pressed={sex === "f"} className={["flex-1 min-h-12 rounded-xl border", sex === "f" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"].join(" ")}>Female</button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setUnit("cm")} aria-pressed={unit === "cm"} className={["flex-1 min-h-12 rounded-xl border", unit === "cm" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"].join(" ")}>cm</button>
          <button onClick={() => setUnit("in")} aria-pressed={unit === "in"} className={["flex-1 min-h-12 rounded-xl border", unit === "in" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"].join(" ")}>inches</button>
        </div>
        <div><label className="eyebrow">Height ({unit})</label>
          <input type="number" min={1} value={height} onChange={(e) => setHeight(Number(e.target.value) || 0)}
            className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3" /></div>
      </div>
      <div className="mt-4 soft-card p-5 bg-primary-soft/30">
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Target className="size-4 text-primary" /> Healthy BMI range (18.5 – 24.9)</div>
        <div className="mt-1 text-3xl font-display font-semibold">{fmt(data.bmiLow)} – {fmt(data.bmiHigh)}</div>
      </div>
      <div className="mt-4 grid sm:grid-cols-2 gap-3">
        {[
          { name: "Devine (1974)", v: data.devine },
          { name: "Robinson (1983)", v: data.robinson },
          { name: "Miller (1983)", v: data.miller },
          { name: "Hamwi (1964)", v: data.hamwi },
        ].map((r) => (
          <div key={r.name} className="soft-card p-4">
            <div className="text-xs text-muted-foreground">{r.name}</div>
            <div className="text-xl font-display font-semibold">{fmt(r.v)}</div>
          </div>
        ))}
      </div>
      <HowItWorks>
        <li>Choose your sex and units, then enter your height.</li>
        <li>See your healthy weight range based on BMI plus four classic formulas.</li>
        <li>These are estimates — talk to a doctor for personal advice.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
