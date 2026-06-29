import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Moon } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/sleep-calculator")({
  head: () => ({
    meta: [
      { title: "Sleep Calculator — Best Bedtime & Wake-up Times" },
      { name: "description", content: "Find the best times to fall asleep or wake up using 90-minute sleep cycles. Wake up refreshed at the end of a cycle." },
      { property: "og:title", content: "Sleep Cycle Calculator — Bluebird" },
      { property: "og:description", content: "Wake up at the end of a sleep cycle, not in the middle." },
      { property: "og:url", content: "/sleep-calculator" },
    ],
    links: [{ rel: "canonical", href: "/sleep-calculator" }],
  }),
  component: Page,
});

function fmt(d: Date): string {
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function Page() {
  const [mode, setMode] = useState<"wake" | "bed">("wake");
  const [time, setTime] = useState("07:00");
  const [fall, setFall] = useState(15);

  const cycles = useMemo(() => {
    const [h, m] = time.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return [];
    const base = new Date();
    base.setHours(h, m, 0, 0);
    const results: { time: Date; cycles: number; hours: number }[] = [];
    for (let c = 6; c >= 3; c--) {
      const minutes = c * 90 + (mode === "wake" ? fall : -fall);
      const d = new Date(base);
      if (mode === "wake") d.setMinutes(d.getMinutes() - minutes);
      else d.setMinutes(d.getMinutes() + minutes);
      results.push({ time: d, cycles: c, hours: (c * 90) / 60 });
    }
    return results;
  }, [time, mode, fall]);

  return (
    <ToolLayout slug="sleep-calculator">
      <div className="soft-card p-4 sm:p-5 grid sm:grid-cols-3 gap-3 items-end">
        <div className="sm:col-span-3 flex gap-2">
          <button onClick={() => setMode("wake")} aria-pressed={mode === "wake"}
            className={["min-h-11 px-4 rounded-xl text-sm font-medium border",
              mode === "wake" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"].join(" ")}>I need to wake up at…</button>
          <button onClick={() => setMode("bed")} aria-pressed={mode === "bed"}
            className={["min-h-11 px-4 rounded-xl text-sm font-medium border",
              mode === "bed" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"].join(" ")}>I'm going to bed at…</button>
        </div>
        <div>
          <label className="eyebrow" htmlFor="sc-time">{mode === "wake" ? "Wake-up time" : "Bedtime"}</label>
          <input id="sc-time" type="time" value={time} onChange={(e) => setTime(e.target.value)}
            className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3" />
        </div>
        <div className="sm:col-span-2">
          <label className="eyebrow" htmlFor="sc-fall">Minutes to fall asleep: {fall}</label>
          <input id="sc-fall" type="range" min={0} max={45} step={5} value={fall} onChange={(e) => setFall(Number(e.target.value))} className="mt-2 w-full" />
        </div>
      </div>
      <div className="mt-4 soft-card p-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Moon className="size-4 text-primary" />
          {mode === "wake" ? "Try going to bed at one of these times" : "You should aim to wake up at one of these times"}
        </div>
        <div className="mt-3 grid sm:grid-cols-2 gap-3">
          {cycles.map((c) => (
            <div key={c.cycles} className={["rounded-2xl border p-4 flex items-center justify-between",
              c.cycles === 5 ? "border-primary bg-primary-soft/30" : "border-border bg-card"].join(" ")}>
              <div>
                <div className="text-2xl font-display font-semibold">{fmt(c.time)}</div>
                <div className="text-xs text-muted-foreground">{c.hours} hours · {c.cycles} cycles</div>
              </div>
              {c.cycles === 5 ? <span className="text-xs font-medium text-primary">Recommended</span> : null}
            </div>
          ))}
        </div>
      </div>
      <HowItWorks>
        <li>Pick whether you have a wake-up time or a bedtime.</li>
        <li>Set the time, then adjust how long it usually takes you to fall asleep.</li>
        <li>Pick one of the suggested times — each lines up with the end of a 90-minute sleep cycle.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
