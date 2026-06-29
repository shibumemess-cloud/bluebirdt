import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Apple } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/macro-calculator")({
  head: () => ({
    meta: [
      { title: "Macro Calculator — Daily Protein, Carbs & Fat Free" },
      { name: "description", content: "Get personalised daily macros for cutting, maintenance or muscle gain. Uses Mifflin-St Jeor BMR and activity level." },
      { property: "og:title", content: "Macro Calculator — Bluebird" },
      { property: "og:description", content: "Daily calories and macros tailored to your goal." },
      { property: "og:url", content: "/macro-calculator" },
    ],
    links: [{ rel: "canonical", href: "/macro-calculator" }],
  }),
  component: Page,
});

const ACTIVITY = [
  { id: "sed", label: "Sedentary (little exercise)", v: 1.2 },
  { id: "light", label: "Light (1–3 days/wk)", v: 1.375 },
  { id: "mod", label: "Moderate (3–5 days/wk)", v: 1.55 },
  { id: "high", label: "Active (6–7 days/wk)", v: 1.725 },
  { id: "vh", label: "Very active (physical job)", v: 1.9 },
];

const GOALS = [
  { id: "cut", label: "Lose fat", mod: -0.2, p: 2.2, f: 0.8 },
  { id: "maint", label: "Maintain", mod: 0, p: 1.8, f: 1.0 },
  { id: "gain", label: "Build muscle", mod: 0.1, p: 2.0, f: 1.0 },
];

function Page() {
  const [sex, setSex] = useState<"m" | "f">("m");
  const [age, setAge] = useState(30);
  const [unit, setUnit] = useState<"metric" | "us">("metric");
  const [heightCm, setHeightCm] = useState(175);
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(9);
  const [weight, setWeight] = useState(70);
  const [activity, setActivity] = useState("mod");
  const [goal, setGoal] = useState("maint");

  const data = useMemo(() => {
    const kg = unit === "metric" ? weight : weight * 0.453592;
    const cm = unit === "metric" ? heightCm : (heightFt * 12 + heightIn) * 2.54;
    const bmr = 10 * kg + 6.25 * cm - 5 * age + (sex === "m" ? 5 : -161);
    const act = ACTIVITY.find((a) => a.id === activity)!.v;
    const tdee = bmr * act;
    const g = GOALS.find((x) => x.id === goal)!;
    const cals = Math.round(tdee * (1 + g.mod));
    const protein = Math.round(g.p * kg);
    const fat = Math.round(g.f * kg);
    const carbCals = Math.max(0, cals - protein * 4 - fat * 9);
    const carbs = Math.round(carbCals / 4);
    return { bmr: Math.round(bmr), tdee: Math.round(tdee), cals, protein, fat, carbs };
  }, [sex, age, unit, heightCm, heightFt, heightIn, weight, activity, goal]);

  return (
    <ToolLayout slug="macro-calculator">
      <div className="soft-card p-4 sm:p-5 grid sm:grid-cols-2 gap-3">
        <div className="flex gap-2">
          <button onClick={() => setSex("m")} aria-pressed={sex === "m"} className={["flex-1 min-h-12 rounded-xl border", sex === "m" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"].join(" ")}>Male</button>
          <button onClick={() => setSex("f")} aria-pressed={sex === "f"} className={["flex-1 min-h-12 rounded-xl border", sex === "f" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"].join(" ")}>Female</button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setUnit("metric")} aria-pressed={unit === "metric"} className={["flex-1 min-h-12 rounded-xl border", unit === "metric" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"].join(" ")}>Metric</button>
          <button onClick={() => setUnit("us")} aria-pressed={unit === "us"} className={["flex-1 min-h-12 rounded-xl border", unit === "us" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"].join(" ")}>US</button>
        </div>
        <div><label className="eyebrow" htmlFor="mc-age">Age</label>
          <input id="mc-age" type="number" min={10} max={120} value={age} onChange={(e) => setAge(Number(e.target.value) || 0)} className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3" /></div>
        <div><label className="eyebrow">Weight ({unit === "metric" ? "kg" : "lb"})</label>
          <input type="number" min={1} value={weight} onChange={(e) => setWeight(Number(e.target.value) || 0)} className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3" /></div>
        {unit === "metric" ? (
          <div className="sm:col-span-2"><label className="eyebrow">Height (cm)</label>
            <input type="number" min={50} value={heightCm} onChange={(e) => setHeightCm(Number(e.target.value) || 0)} className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3" /></div>
        ) : (
          <div className="sm:col-span-2 grid grid-cols-2 gap-3">
            <div><label className="eyebrow">Height (ft)</label>
              <input type="number" min={0} value={heightFt} onChange={(e) => setHeightFt(Number(e.target.value) || 0)} className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3" /></div>
            <div><label className="eyebrow">Height (in)</label>
              <input type="number" min={0} max={11} value={heightIn} onChange={(e) => setHeightIn(Number(e.target.value) || 0)} className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3" /></div>
          </div>
        )}
        <div><label className="eyebrow" htmlFor="mc-act">Activity</label>
          <select id="mc-act" value={activity} onChange={(e) => setActivity(e.target.value)} className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3">
            {ACTIVITY.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
          </select></div>
        <div><label className="eyebrow" htmlFor="mc-goal">Goal</label>
          <select id="mc-goal" value={goal} onChange={(e) => setGoal(e.target.value)} className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3">
            {GOALS.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
          </select></div>
      </div>
      <div className="mt-4 grid sm:grid-cols-4 gap-3">
        <div className="soft-card p-4"><div className="text-xs text-muted-foreground">Daily calories</div><div className="text-2xl font-display font-semibold">{data.cals.toLocaleString()}</div></div>
        <div className="soft-card p-4 bg-primary-soft/30"><div className="text-xs text-muted-foreground">Protein</div><div className="text-2xl font-display font-semibold">{data.protein} g</div></div>
        <div className="soft-card p-4 bg-primary-soft/30"><div className="text-xs text-muted-foreground">Carbs</div><div className="text-2xl font-display font-semibold">{data.carbs} g</div></div>
        <div className="soft-card p-4 bg-primary-soft/30"><div className="text-xs text-muted-foreground">Fat</div><div className="text-2xl font-display font-semibold">{data.fat} g</div></div>
      </div>
      <div className="mt-3 text-sm text-muted-foreground inline-flex items-center gap-2">
        <Apple className="size-4 text-primary" /> BMR {data.bmr.toLocaleString()} kcal · TDEE {data.tdee.toLocaleString()} kcal
      </div>
      <HowItWorks>
        <li>Enter your age, sex, height and weight.</li>
        <li>Pick how active you usually are and your goal.</li>
        <li>See suggested daily calories and a balanced protein-carb-fat split.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
