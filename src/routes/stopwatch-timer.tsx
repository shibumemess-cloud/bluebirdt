import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Timer, Play, Pause, RotateCcw, Flag, Bell } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/stopwatch-timer")({
  head: () => ({
    meta: [
      { title: "Online Stopwatch & Countdown Timer — Free, No Sign-up" },
      { name: "description", content: "A precise stopwatch with lap times and a countdown timer with sound alarm. Free, works offline once loaded." },
      { property: "og:title", content: "Stopwatch & Timer — Bluebird" },
      { property: "og:description", content: "Stopwatch with laps and countdown timer with alarm." },
      { property: "og:url", content: "/stopwatch-timer" },
    ],
    links: [{ rel: "canonical", href: "/stopwatch-timer" }],
  }),
  component: Page,
});

function fmt(ms: number) {
  const sign = ms < 0 ? "-" : "";
  const a = Math.abs(ms);
  const h = Math.floor(a / 3600000);
  const m = Math.floor((a % 3600000) / 60000);
  const s = Math.floor((a % 60000) / 1000);
  const cs = Math.floor((a % 1000) / 10);
  const pad = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${sign}${h > 0 ? pad(h) + ":" : ""}${pad(m)}:${pad(s)}.${pad(cs)}`;
}

function beep() {
  try {
    const AC = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
    const ctx = new AC();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = 880;
    o.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    o.start(); o.stop(ctx.currentTime + 0.6);
  } catch { /* ignore */ }
}

type Tab = "stopwatch" | "timer";

function Page() {
  const [tab, setTab] = useState<Tab>("stopwatch");
  return (
    <ToolLayout slug="stopwatch-timer">
      <div className="soft-card p-4 sm:p-5 flex gap-2 mb-6">
        {(["stopwatch", "timer"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} aria-pressed={tab === t}
            className={["min-h-11 px-5 rounded-xl text-sm font-medium border",
              tab === t ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary"].join(" ")}>
            {t === "stopwatch" ? "Stopwatch" : "Countdown timer"}
          </button>
        ))}
      </div>

      {tab === "stopwatch" ? <Stopwatch /> : <Countdown />}

      <HowItWorks>
        <li>Switch between stopwatch and countdown timer at the top.</li>
        <li>Stopwatch records laps; timer plays a soft beep when it finishes.</li>
        <li>Everything runs locally — no audio or data leaves your device.</li>
      </HowItWorks>
    </ToolLayout>
  );
}

function Stopwatch() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const startRef = useRef(0);
  const baseRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    startRef.current = performance.now();
    const tick = () => {
      setElapsed(baseRef.current + (performance.now() - startRef.current));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [running]);

  function toggle() {
    if (running) {
      baseRef.current = elapsed;
      setRunning(false);
    } else setRunning(true);
  }
  function reset() {
    setRunning(false); baseRef.current = 0; setElapsed(0); setLaps([]);
  }
  function lap() {
    setLaps((ls) => [elapsed, ...ls]);
  }

  return (
    <div className="soft-card p-6 sm:p-8 text-center">
      <Timer className="size-6 text-primary mx-auto" />
      <div className="mt-4 font-display tabular-nums text-5xl sm:text-7xl tracking-tight">{fmt(elapsed)}</div>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button onClick={toggle} className="min-h-12 px-6 rounded-xl bg-primary text-primary-foreground font-semibold inline-flex items-center gap-2 hover:shadow-lift hover:-translate-y-0.5">
          {running ? <><Pause className="size-4" /> Pause</> : <><Play className="size-4" /> Start</>}
        </button>
        <button onClick={lap} disabled={!running} className="min-h-12 px-6 rounded-xl border border-border bg-card font-medium inline-flex items-center gap-2 disabled:opacity-40">
          <Flag className="size-4" /> Lap
        </button>
        <button onClick={reset} className="min-h-12 px-6 rounded-xl border border-border bg-card font-medium inline-flex items-center gap-2">
          <RotateCcw className="size-4" /> Reset
        </button>
      </div>
      {laps.length > 0 && (
        <div className="mt-6 max-h-56 overflow-y-auto text-left">
          <table className="w-full text-sm tabular-nums">
            <tbody>
              {laps.map((l, i) => {
                const prev = laps[i + 1] ?? 0;
                return (
                  <tr key={i} className="border-t border-border">
                    <td className="py-2 px-3 text-muted-foreground">Lap {laps.length - i}</td>
                    <td className="py-2 px-3">+{fmt(l - prev)}</td>
                    <td className="py-2 px-3 text-right font-medium">{fmt(l)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Countdown() {
  const [h, setH] = useState(0);
  const [m, setM] = useState(5);
  const [s, setS] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const endRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      const r = endRef.current - performance.now();
      if (r <= 0) {
        setRemaining(0); setRunning(false); setDone(true); beep();
        return;
      }
      setRemaining(r);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [running]);

  function start() {
    const total = (h * 3600 + m * 60 + s) * 1000;
    if (total <= 0) return;
    endRef.current = performance.now() + (remaining > 0 && !done ? remaining : total);
    setDone(false);
    setRunning(true);
  }
  function pause() {
    setRunning(false);
  }
  function reset() {
    setRunning(false); setRemaining(0); setDone(false);
  }

  const display = running || remaining > 0 ? fmt(remaining) : fmt((h * 3600 + m * 60 + s) * 1000);

  return (
    <div className="soft-card p-6 sm:p-8 text-center">
      <Bell className={["size-6 mx-auto", done ? "text-primary animate-pulse" : "text-primary"].join(" ")} />
      <div className="mt-4 font-display tabular-nums text-5xl sm:text-7xl tracking-tight">{display}</div>
      {done && <div className="mt-2 text-primary font-semibold">Time's up!</div>}

      {!running && remaining === 0 && (
        <div className="mt-6 inline-grid grid-cols-3 gap-3">
          <NumInput id="ct-h" label="Hours" value={h} setValue={setH} max={23} />
          <NumInput id="ct-m" label="Minutes" value={m} setValue={setM} max={59} />
          <NumInput id="ct-s" label="Seconds" value={s} setValue={setS} max={59} />
        </div>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {!running ? (
          <button onClick={start} className="min-h-12 px-6 rounded-xl bg-primary text-primary-foreground font-semibold inline-flex items-center gap-2 hover:shadow-lift hover:-translate-y-0.5">
            <Play className="size-4" /> {remaining > 0 && !done ? "Resume" : "Start"}
          </button>
        ) : (
          <button onClick={pause} className="min-h-12 px-6 rounded-xl bg-primary text-primary-foreground font-semibold inline-flex items-center gap-2">
            <Pause className="size-4" /> Pause
          </button>
        )}
        <button onClick={reset} className="min-h-12 px-6 rounded-xl border border-border bg-card font-medium inline-flex items-center gap-2">
          <RotateCcw className="size-4" /> Reset
        </button>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {[
          { l: "1 min", h: 0, m: 1, s: 0 },
          { l: "5 min", h: 0, m: 5, s: 0 },
          { l: "10 min", h: 0, m: 10, s: 0 },
          { l: "25 min (Pomodoro)", h: 0, m: 25, s: 0 },
          { l: "1 hour", h: 1, m: 0, s: 0 },
        ].map((p) => (
          <button key={p.l} onClick={() => { reset(); setH(p.h); setM(p.m); setS(p.s); }}
            className="min-h-10 px-3 rounded-lg border border-border bg-card text-xs hover:border-primary hover:text-primary">
            {p.l}
          </button>
        ))}
      </div>
    </div>
  );
}

function NumInput({ id, label, value, setValue, max }: { id: string; label: string; value: number; setValue: (n: number) => void; max: number }) {
  return (
    <div className="text-left">
      <label htmlFor={id} className="eyebrow">{label}</label>
      <input id={id} type="number" min={0} max={max} value={value}
        onChange={(e) => setValue(Math.max(0, Math.min(max, parseInt(e.target.value) || 0)))}
        className="mt-1.5 w-24 min-h-12 rounded-xl border border-border bg-card px-3 text-center text-xl tabular-nums focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
  );
}
