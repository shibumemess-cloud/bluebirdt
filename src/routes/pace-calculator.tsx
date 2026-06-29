import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Timer } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/pace-calculator")({
  head: () => ({
    meta: [
      { title: "Pace Calculator — Running Pace, Time & Distance Free" },
      { name: "description", content: "Find pace, time or finish target for any distance. Switch between min/km and min/mile. Includes 5K, 10K, half and full marathon splits." },
      { property: "og:title", content: "Pace Calculator — Bluebird" },
      { property: "og:description", content: "Calculate running pace, time or distance instantly." },
      { property: "og:url", content: "/pace-calculator" },
    ],
    links: [{ rel: "canonical", href: "/pace-calculator" }],
  }),
  component: Page,
});

function fmtPace(secondsPerUnit: number): string {
  if (!isFinite(secondsPerUnit) || secondsPerUnit <= 0) return "—";
  const m = Math.floor(secondsPerUnit / 60);
  const s = Math.round(secondsPerUnit % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
function fmtTime(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
}

const SPLITS_KM = [{ n: "5K", km: 5 }, { n: "10K", km: 10 }, { n: "Half marathon", km: 21.0975 }, { n: "Marathon", km: 42.195 }];

function Page() {
  const [distance, setDistance] = useState(5);
  const [unit, setUnit] = useState<"km" | "mi">("km");
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);

  const data = useMemo(() => {
    const totalSec = hours * 3600 + minutes * 60 + seconds;
    const km = unit === "km" ? distance : distance * 1.609344;
    const mi = unit === "mi" ? distance : distance / 1.609344;
    const paceKm = km > 0 ? totalSec / km : 0;
    const paceMi = mi > 0 ? totalSec / mi : 0;
    const speedKmh = totalSec > 0 ? (km / totalSec) * 3600 : 0;
    return { paceKm, paceMi, speedKmh, speedMph: speedKmh / 1.609344, totalSec };
  }, [distance, unit, hours, minutes, seconds]);

  return (
    <ToolLayout slug="pace-calculator">
      <div className="soft-card p-4 sm:p-5 grid sm:grid-cols-4 gap-3">
        <div className="sm:col-span-2">
          <label className="eyebrow" htmlFor="pc-dist">Distance</label>
          <div className="mt-1.5 flex gap-2">
            <input id="pc-dist" type="number" min={0} step={0.01} value={distance} onChange={(e) => setDistance(Number(e.target.value) || 0)}
              className="flex-1 min-h-12 rounded-xl border border-border bg-card px-3" />
            <div className="flex">
              <button onClick={() => setUnit("km")} aria-pressed={unit === "km"} className={["min-h-12 px-3 border rounded-l-xl", unit === "km" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"].join(" ")}>km</button>
              <button onClick={() => setUnit("mi")} aria-pressed={unit === "mi"} className={["min-h-12 px-3 border rounded-r-xl -ml-px", unit === "mi" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"].join(" ")}>mi</button>
            </div>
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="eyebrow">Finish time</label>
          <div className="mt-1.5 flex gap-2 items-center">
            <input aria-label="hours" type="number" min={0} value={hours} onChange={(e) => setHours(Math.max(0, Number(e.target.value) || 0))} className="w-full min-h-12 rounded-xl border border-border bg-card px-3" />
            <span>:</span>
            <input aria-label="minutes" type="number" min={0} max={59} value={minutes} onChange={(e) => setMinutes(Math.max(0, Number(e.target.value) || 0))} className="w-full min-h-12 rounded-xl border border-border bg-card px-3" />
            <span>:</span>
            <input aria-label="seconds" type="number" min={0} max={59} value={seconds} onChange={(e) => setSeconds(Math.max(0, Number(e.target.value) || 0))} className="w-full min-h-12 rounded-xl border border-border bg-card px-3" />
          </div>
          <div className="mt-1 text-xs text-muted-foreground">hh : mm : ss</div>
        </div>
      </div>
      <div className="mt-4 grid sm:grid-cols-4 gap-3">
        <div className="soft-card p-4"><div className="text-xs text-muted-foreground">Pace per km</div><div className="text-2xl font-display font-semibold">{fmtPace(data.paceKm)}</div></div>
        <div className="soft-card p-4"><div className="text-xs text-muted-foreground">Pace per mile</div><div className="text-2xl font-display font-semibold">{fmtPace(data.paceMi)}</div></div>
        <div className="soft-card p-4"><div className="text-xs text-muted-foreground">Speed</div><div className="text-2xl font-display font-semibold">{data.speedKmh.toFixed(2)} <span className="text-sm">km/h</span></div></div>
        <div className="soft-card p-4"><div className="text-xs text-muted-foreground">Speed</div><div className="text-2xl font-display font-semibold">{data.speedMph.toFixed(2)} <span className="text-sm">mph</span></div></div>
      </div>
      <div className="mt-4 soft-card p-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Timer className="size-4 text-primary" /> Finish times at this pace</div>
        <div className="mt-3 grid sm:grid-cols-4 gap-3">
          {SPLITS_KM.map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-card p-4">
              <div className="text-xs text-muted-foreground">{s.n}</div>
              <div className="text-xl font-display font-semibold">{fmtTime(data.paceKm * s.km)}</div>
            </div>
          ))}
        </div>
      </div>
      <HowItWorks>
        <li>Type the distance you ran or plan to run.</li>
        <li>Enter your finish time as hours, minutes, seconds.</li>
        <li>See pace and speed in both km and miles, plus 5K / 10K / half / marathon splits.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
