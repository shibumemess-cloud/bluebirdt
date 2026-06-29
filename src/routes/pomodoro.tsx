import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { TimerReset, Play, Pause, RotateCcw, Coffee } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/pomodoro")({
  head: () => ({
    meta: [
      { title: "Pomodoro Timer — Focus 25/5, Free Online" },
      { name: "description", content: "A clean Pomodoro timer for focused work — 25 minute sessions with 5 minute breaks. Sound alerts, no signup, no ads." },
      { property: "og:title", content: "Pomodoro Timer — Bluebird" },
      { property: "og:description", content: "Stay focused with the classic 25/5 Pomodoro technique." },
      { property: "og:url", content: "/pomodoro" },
    ],
    links: [{ rel: "canonical", href: "/pomodoro" }],
  }),
  component: Page,
});

type Mode = "focus" | "short" | "long";
const DEFAULTS: Record<Mode, number> = { focus: 25, short: 5, long: 15 };
const LABEL: Record<Mode, string> = { focus: "Focus", short: "Short break", long: "Long break" };

function beep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = 880; o.type = "sine";
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
    o.start(); o.stop(ctx.currentTime + 1.3);
    setTimeout(() => ctx.close(), 1500);
  } catch { /* ignore */ }
}

function Page() {
  const [durations, setDurations] = useState<Record<Mode, number>>(DEFAULTS);
  const [mode, setMode] = useState<Mode>("focus");
  const [remaining, setRemaining] = useState(DEFAULTS.focus * 60);
  const [running, setRunning] = useState(false);
  const [round, setRound] = useState(1);
  const [completed, setCompleted] = useState(0);
  const tickRef = useRef<number | null>(null);

  useEffect(() => { setRemaining(durations[mode] * 60); setRunning(false); }, [mode, durations]);

  useEffect(() => {
    if (!running) return;
    tickRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          beep();
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            new Notification(`${LABEL[mode]} finished`, { body: "Time for the next round." });
          }
          if (mode === "focus") {
            setCompleted((c) => c + 1);
            const next = round % 4 === 0 ? "long" : "short";
            setMode(next);
            setRound((rd) => rd + 1);
          } else {
            setMode("focus");
          }
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [running, mode, round]);

  function toggle() {
    if (!running && typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
    setRunning((r) => !r);
  }
  function reset() { setRunning(false); setRemaining(durations[mode] * 60); }

  const total = durations[mode] * 60;
  const pct = total > 0 ? ((total - remaining) / total) * 100 : 0;
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <ToolLayout slug="pomodoro">
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
        <section className="soft-card p-6 sm:p-10 flex flex-col items-center justify-center text-center">
          <div role="radiogroup" aria-label="Timer mode" className="inline-flex rounded-2xl border border-border bg-card p-1 mb-6">
            {(["focus", "short", "long"] as Mode[]).map((m) => (
              <button key={m} role="radio" aria-checked={mode === m}
                onClick={() => setMode(m)}
                className={`px-4 py-2 rounded-xl text-sm font-medium min-h-11 transition ${mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary"}`}
              >
                {LABEL[m]}
              </button>
            ))}
          </div>
          <div className="relative size-64 sm:size-80 grid place-items-center">
            <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
              <circle cx="50" cy="50" r="46" stroke="currentColor" className="text-muted/50" strokeWidth="6" fill="none" />
              <circle cx="50" cy="50" r="46" stroke="currentColor" className="text-primary transition-[stroke-dashoffset] duration-700"
                strokeWidth="6" fill="none" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 46}
                strokeDashoffset={(2 * Math.PI * 46) * (1 - pct / 100)} />
            </svg>
            <div className="font-display tabular-nums text-6xl sm:text-7xl tracking-tight" aria-live="polite">
              {mm}:{ss}
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <button onClick={toggle} className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-3 rounded-xl font-medium min-h-12">
              {running ? <><Pause className="size-4" /> Pause</> : <><Play className="size-4" /> Start</>}
            </button>
            <button onClick={reset} className="inline-flex items-center gap-2 border border-border hover:bg-primary-soft px-5 py-3 rounded-xl font-medium min-h-12">
              <RotateCcw className="size-4" /> Reset
            </button>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Round {round} · {completed} focus sessions done
          </div>
        </section>

        <section className="soft-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2"><TimerReset className="size-5 text-primary" /><h2 className="font-display text-lg">Customize</h2></div>
          {(["focus", "short", "long"] as Mode[]).map((m) => (
            <label key={m} className="block">
              <span className="flex justify-between text-sm font-medium mb-1.5"><span>{LABEL[m]}</span><span className="text-muted-foreground">{durations[m]} min</span></span>
              <input type="range" min={1} max={60} value={durations[m]} onChange={(e) => setDurations((d) => ({ ...d, [m]: +e.target.value }))} className="w-full accent-primary" />
            </label>
          ))}
          <div className="rounded-xl bg-primary-soft p-4 text-sm text-foreground/80 flex gap-3">
            <Coffee className="size-5 text-primary shrink-0 mt-0.5" />
            <div>
              The Pomodoro Technique uses 25 minute focus sprints with 5 minute breaks, plus a longer break every 4 rounds.
            </div>
          </div>
        </section>
      </div>
      <HowItWorks>
        <li>Press Start to begin a focus session.</li>
        <li>When the bell rings, take a short break — the timer switches automatically.</li>
        <li>After 4 rounds you get a longer break.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
