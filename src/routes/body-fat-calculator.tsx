import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Scale } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/body-fat-calculator")({
  head: () => ({
    meta: [
      { title: "Body Fat Percentage Calculator — US Navy Method Free" },
      { name: "description", content: "Estimate your body fat percentage with the US Navy tape-measure method. Just neck, waist and hip measurements." },
      { property: "og:title", content: "Body Fat Calculator — Bluebird" },
      { property: "og:description", content: "Tape-measure body fat with the US Navy formula." },
      { property: "og:url", content: "/body-fat-calculator" },
    ],
    links: [{ rel: "canonical", href: "/body-fat-calculator" }],
  }),
  component: Page,
});

function log10(x: number) { return Math.log(x) / Math.LN10; }

function Page() {
  const [sex, setSex] = useState<"m" | "f">("m");
  const [unit, setUnit] = useState<"cm" | "in">("cm");
  const [height, setHeight] = useState(175);
  const [waist, setWaist] = useState(85);
  const [neck, setNeck] = useState(38);
  const [hip, setHip] = useState(95);

  const data = useMemo(() => {
    const toCm = (v: number) => unit === "cm" ? v : v * 2.54;
    const H = toCm(height); const W = toCm(waist); const N = toCm(neck); const Hi = toCm(hip);
    let bf = 0;
    if (sex === "m") {
      const a = W - N;
      if (a > 0 && H > 0) bf = 495 / (1.0324 - 0.19077 * log10(a) + 0.15456 * log10(H)) - 450;
    } else {
      const a = W + Hi - N;
      if (a > 0 && H > 0) bf = 495 / (1.29579 - 0.35004 * log10(a) + 0.22100 * log10(H)) - 450;
    }
    bf = Math.max(0, Math.min(75, bf));
    let category = "—";
    if (sex === "m") {
      if (bf < 6) category = "Essential fat";
      else if (bf < 14) category = "Athletic";
      else if (bf < 18) category = "Fit";
      else if (bf < 25) category = "Average";
      else category = "Above average";
    } else {
      if (bf < 14) category = "Essential fat";
      else if (bf < 21) category = "Athletic";
      else if (bf < 25) category = "Fit";
      else if (bf < 32) category = "Average";
      else category = "Above average";
    }
    return { bf, category };
  }, [sex, unit, height, waist, neck, hip]);

  return (
    <ToolLayout slug="body-fat-calculator">
      <div className="soft-card p-4 sm:p-5 grid sm:grid-cols-2 gap-3">
        <div className="flex gap-2">
          <button onClick={() => setSex("m")} aria-pressed={sex === "m"} className={["flex-1 min-h-12 rounded-xl border", sex === "m" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"].join(" ")}>Male</button>
          <button onClick={() => setSex("f")} aria-pressed={sex === "f"} className={["flex-1 min-h-12 rounded-xl border", sex === "f" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"].join(" ")}>Female</button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setUnit("cm")} aria-pressed={unit === "cm"} className={["flex-1 min-h-12 rounded-xl border", unit === "cm" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"].join(" ")}>cm</button>
          <button onClick={() => setUnit("in")} aria-pressed={unit === "in"} className={["flex-1 min-h-12 rounded-xl border", unit === "in" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"].join(" ")}>inches</button>
        </div>
        <div><label className="eyebrow">Height ({unit})</label>
          <input type="number" min={1} value={height} onChange={(e) => setHeight(Number(e.target.value) || 0)} className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3" /></div>
        <div><label className="eyebrow">Neck ({unit})</label>
          <input type="number" min={1} value={neck} onChange={(e) => setNeck(Number(e.target.value) || 0)} className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3" /></div>
        <div><label className="eyebrow">Waist ({unit})</label>
          <input type="number" min={1} value={waist} onChange={(e) => setWaist(Number(e.target.value) || 0)} className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3" /></div>
        {sex === "f" ? (
          <div><label className="eyebrow">Hip ({unit})</label>
            <input type="number" min={1} value={hip} onChange={(e) => setHip(Number(e.target.value) || 0)} className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3" /></div>
        ) : null}
      </div>
      <div className="mt-4 soft-card p-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Scale className="size-4 text-primary" /> Estimated body fat</div>
        <div className="mt-1 text-5xl font-display font-semibold">{data.bf ? data.bf.toFixed(1) : "—"}<span className="text-2xl font-body text-muted-foreground">%</span></div>
        <div className="mt-1 text-sm font-medium text-primary">{data.bf ? data.category : "Enter your measurements"}</div>
      </div>
      <HowItWorks>
        <li>Pick male or female and your unit of measurement.</li>
        <li>Measure your neck and waist (and hip if female) with a soft tape, relaxed.</li>
        <li>See your estimated body fat percentage and category instantly.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
