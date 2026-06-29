import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Play, Square, Bell } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/metronome")({
  head: () => ({
    meta: [
      { title: "Online Metronome — Free BPM Click Track, No Signup" },
      { name: "description", content: "A clean, accurate online metronome from 30 to 300 BPM with time signatures and accented beats. Works offline once loaded." },
      { property: "og:title", content: "Online Metronome — Bluebird" },
      { property: "og:description", content: "Practice with a precise in-browser metronome." },
    ],
    links: [{ rel: "canonical", href: "/metronome" }],
  }),
  component: Page,
});

function Page() {
  const [bpm, setBpm] = useState(100);
  const [beats, setBeats] = useState(4);
  const [playing, setPlaying] = useState(false);
  const [beat, setBeat] = useState(0);
  const ctxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const nextNoteRef = useRef(0);
  const currentBeatRef = useRef(0);

  useEffect(() => () => stop(), []);

  function scheduleClick(time: number, accent: boolean) {
    const ctx = ctxRef.current!;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.frequency.value = accent ? 1500 : 900;
    env.gain.setValueAtTime(0, time);
    env.gain.linearRampToValueAtTime(0.6, time + 0.001);
    env.gain.exponentialRampToValueAtTime(0.0001, time + 0.06);
    osc.connect(env).connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.07);
  }

  function start() {
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
    const ctx = new Ctx();
    ctxRef.current = ctx;
    currentBeatRef.current = 0;
    nextNoteRef.current = ctx.currentTime + 0.1;
    setPlaying(true);

    const lookahead = () => {
      const ctx = ctxRef.current; if (!ctx) return;
      const interval = 60 / bpm;
      while (nextNoteRef.current < ctx.currentTime + 0.1) {
        const cb = currentBeatRef.current;
        scheduleClick(nextNoteRef.current, cb === 0);
        const fireBeat = cb;
        const fireTime = nextNoteRef.current;
        const delay = Math.max(0, (fireTime - ctx.currentTime) * 1000);
        window.setTimeout(() => setBeat(fireBeat), delay);
        currentBeatRef.current = (cb + 1) % beats;
        nextNoteRef.current += interval;
      }
      timerRef.current = window.setTimeout(lookahead, 25);
    };
    lookahead();
  }
  function stop() {
    if (timerRef.current) { window.clearTimeout(timerRef.current); timerRef.current = null; }
    ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
    setPlaying(false);
    setBeat(0);
  }

  // Restart when bpm/beats change while playing
  useEffect(() => { if (playing) { stop(); start(); } /* eslint-disable-next-line */ }, [bpm, beats]);

  return (
    <ToolLayout slug="metronome">
      <div className="soft-card p-5 sm:p-6 space-y-6">
        <div className="grid place-items-center gap-3">
          <div className="text-6xl sm:text-7xl font-display num">{bpm}</div>
          <div className="text-sm text-muted-foreground">beats per minute</div>
        </div>
        <input type="range" min={30} max={300} step={1} value={bpm} onChange={(e) => setBpm(parseInt(e.target.value))} className="w-full" />
        <div className="flex flex-wrap gap-2 justify-center">
          {[{ label: "Largo", bpm: 50 }, { label: "Adagio", bpm: 70 }, { label: "Andante", bpm: 90 }, { label: "Moderato", bpm: 110 }, { label: "Allegro", bpm: 140 }, { label: "Presto", bpm: 180 }].map((p) => (
            <button key={p.label} onClick={() => setBpm(p.bpm)} className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-muted">{p.label} · {p.bpm}</button>
          ))}
        </div>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <label className="text-sm flex items-center gap-2">Time signature
            <select value={beats} onChange={(e) => setBeats(parseInt(e.target.value))} className="rounded-lg border border-border bg-background px-2 py-1.5">
              {[2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n}/4</option>)}
            </select>
          </label>
        </div>
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: beats }).map((_, i) => (
            <div key={i} className={`size-5 sm:size-6 rounded-full transition ${playing && beat === i ? (i === 0 ? "bg-primary scale-125" : "bg-foreground scale-110") : "bg-muted"}`} />
          ))}
        </div>
        <div className="flex justify-center">
          {playing ? (
            <button onClick={stop} className="inline-flex items-center gap-2 min-h-12 px-6 rounded-xl bg-destructive text-destructive-foreground font-medium"><Square className="size-4" /> Stop</button>
          ) : (
            <button onClick={start} className="inline-flex items-center gap-2 min-h-12 px-6 rounded-xl bg-primary text-primary-foreground font-medium"><Play className="size-4" /> Start</button>
          )}
        </div>
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-2"><Bell className="size-3" /> The first beat of each bar is accented.</p>
      </div>
      <HowItWorks><p>Pick a tempo (or tap a preset), choose your time signature, and press Start. The first beat is higher‑pitched so you can feel the bar.</p></HowItWorks>
    </ToolLayout>
  );
}
