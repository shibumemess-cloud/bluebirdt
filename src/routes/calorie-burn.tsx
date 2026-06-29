import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Flame } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/calorie-burn")({
  head: () => ({
    meta: [
      { title: "Calorie Burn Calculator — How Many Calories Did I Burn?" },
      { name: "description", content: "Estimate calories burned for any activity using MET values. Walking, running, cycling, swimming, yoga and more." },
      { property: "og:title", content: "Calorie Burn Calculator — Bluebird" },
      { property: "og:description", content: "MET-based calorie burn estimates by activity." },
      { property: "og:url", content: "/calorie-burn" },
    ],
    links: [{ rel: "canonical", href: "/calorie-burn" }],
  }),
  component: Page,
});

const ACTIVITIES: { name: string; met: number }[] = [
  { name: "Walking (slow)", met: 2.8 }, { name: "Walking (brisk)", met: 4.3 },
  { name: "Running 8 km/h", met: 8.3 }, { name: "Running 12 km/h", met: 11.5 },
  { name: "Cycling (leisure)", met: 6.0 }, { name: "Cycling (vigorous)", met: 10.0 },
  { name: "Swimming (moderate)", met: 5.8 }, { name: "Yoga", met: 3.0 },
  { name: "Weight training", met: 5.0 }, { name: "Pilates", met: 3.0 },
  { name: "Dancing", met: 5.0 }, { name: "Hiking", met: 6.0 },
  { name: "Basketball", met: 6.5 }, { name: "Soccer", met: 7.0 },
  { name: "Tennis", met: 7.3 }, { name: "Jump rope", met: 11.8 },
  { name: "Rowing", met: 7.0 }, { name: "Stairs", met: 8.8 },
  { name: "Housework", met: 3.3 }, { name: "Gardening", met: 4.0 },
];

function Page() {
  const [weight, setWeight] = useState(70);
  const [unit, setUnit] = useState<"kg" | "lb">("kg");
  const [minutes, setMinutes] = useState(30);
  const [act, setAct] = useState(ACTIVITIES[2].name);

  const result = useMemo(() => {
    const kg = unit === "kg" ? weight : weight * 0.453592;
    const met = ACTIVITIES.find((a) => a.name === act)?.met ?? 0;
    const cals = (met * 3.5 * kg / 200) * minutes;
    return { kg, met, cals, perHour: minutes > 0 ? (cals / minutes) * 60 : 0 };
  }, [weight, unit, minutes, act]);

  return (
    <ToolLayout slug="calorie-burn">
      <div className="soft-card p-4 sm:p-5 grid sm:grid-cols-3 gap-3">
        <div>
          <label className="eyebrow" htmlFor="cb-w">Body weight</label>
          <div className="mt-1.5 flex gap-2">
            <input id="cb-w" type="number" min={1} value={weight} onChange={(e) => setWeight(Number(e.target.value) || 0)} className="flex-1 min-h-12 rounded-xl border border-border bg-card px-3" />
            <div className="flex">
              <button onClick={() => setUnit("kg")} aria-pressed={unit === "kg"} className={["min-h-12 px-3 border rounded-l-xl", unit === "kg" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"].join(" ")}>kg</button>
              <button onClick={() => setUnit("lb")} aria-pressed={unit === "lb"} className={["min-h-12 px-3 border rounded-r-xl -ml-px", unit === "lb" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"].join(" ")}>lb</button>
            </div>
          </div>
        </div>
        <div>
          <label className="eyebrow" htmlFor="cb-min">Minutes</label>
          <input id="cb-min" type="number" min={1} value={minutes} onChange={(e) => setMinutes(Math.max(1, Number(e.target.value) || 1))}
            className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3" />
        </div>
        <div>
          <label className="eyebrow" htmlFor="cb-act">Activity</label>
          <select id="cb-act" value={act} onChange={(e) => setAct(e.target.value)}
            className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3">
            {ACTIVITIES.map((a) => <option key={a.name} value={a.name}>{a.name} (MET {a.met})</option>)}
          </select>
        </div>
      </div>
      <div className="mt-4 grid sm:grid-cols-2 gap-3">
        <div className="soft-card p-5"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Flame className="size-4 text-primary" /> Calories burned</div>
          <div className="mt-1 text-4xl font-display font-semibold">{Math.round(result.cals).toLocaleString()} <span className="text-base font-body text-muted-foreground">kcal</span></div></div>
        <div className="soft-card p-5"><div className="text-sm text-muted-foreground">Per hour</div>
          <div className="mt-1 text-3xl font-display font-semibold">{Math.round(result.perHour).toLocaleString()} <span className="text-base font-body text-muted-foreground">kcal/hr</span></div></div>
      </div>
      <HowItWorks>
        <li>Enter your body weight in kg or lb.</li>
        <li>Pick the activity and how many minutes you did it.</li>
        <li>Get the calorie estimate — based on standard MET values used by exercise scientists.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
