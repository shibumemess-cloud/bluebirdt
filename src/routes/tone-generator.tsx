import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Activity, Download, Play, Square } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";
import { audioBufferToMp3, audioBufferToWav, downloadBlob } from "../lib/audio-helpers";

export const Route = createFileRoute("/tone-generator")({
  head: () => ({
    meta: [
      { title: "Online Tone Generator — Sine, Square, Triangle & Saw" },
      { name: "description", content: "Generate pure tones from 20 Hz to 20 kHz for tuning, testing speakers and hearing checks. Sine, square, triangle and saw waves." },
      { property: "og:title", content: "Tone Generator — Bluebird" },
      { property: "og:description", content: "Make pure tones in your browser." },
    ],
    links: [{ rel: "canonical", href: "/tone-generator" }],
  }),
  component: Page,
});

function generateTone(freq: number, seconds: number, wave: OscillatorType, volume: number) {
  const sr = 44100;
  const len = Math.floor(seconds * sr);
  const buf = new AudioBuffer({ length: len, numberOfChannels: 1, sampleRate: sr });
  const data = buf.getChannelData(0);
  const twoPi = 2 * Math.PI;
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    let v = 0;
    const x = (twoPi * freq * t) % twoPi;
    if (wave === "sine") v = Math.sin(x);
    else if (wave === "square") v = x < Math.PI ? 1 : -1;
    else if (wave === "triangle") v = 2 * Math.abs(2 * ((freq * t) % 1) - 1) - 1;
    else v = 2 * ((freq * t) % 1) - 1; // sawtooth
    data[i] = v * volume;
  }
  return buf;
}

function Page() {
  const [freq, setFreq] = useState(440);
  const [wave, setWave] = useState<OscillatorType>("sine");
  const [volume, setVolume] = useState(0.3);
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  function play() {
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = wave; osc.frequency.value = freq;
    g.gain.value = volume;
    osc.connect(g).connect(ctx.destination);
    osc.start();
    ctxRef.current = ctx; oscRef.current = osc; gainRef.current = g;
    setPlaying(true);
  }
  function stop() {
    try { oscRef.current?.stop(); } catch {}
    ctxRef.current?.close().catch(() => {});
    setPlaying(false);
  }
  function update(next: { freq?: number; wave?: OscillatorType; volume?: number }) {
    if (next.freq !== undefined) setFreq(next.freq);
    if (next.wave !== undefined) setWave(next.wave);
    if (next.volume !== undefined) setVolume(next.volume);
    if (oscRef.current && gainRef.current && ctxRef.current) {
      if (next.freq !== undefined) oscRef.current.frequency.setValueAtTime(next.freq, ctxRef.current.currentTime);
      if (next.wave !== undefined) oscRef.current.type = next.wave;
      if (next.volume !== undefined) gainRef.current.gain.setValueAtTime(next.volume, ctxRef.current.currentTime);
    }
  }
  function download(format: "mp3" | "wav") {
    const buf = generateTone(freq, 5, wave, volume);
    const blob = format === "mp3" ? audioBufferToMp3(buf) : audioBufferToWav(buf);
    downloadBlob(blob, `tone-${freq}hz-${wave}.${format}`);
  }

  return (
    <ToolLayout slug="tone-generator">
      <div className="soft-card p-5 sm:p-6 space-y-5">
        <label className="block">
          <span className="text-sm font-medium">Frequency: <span className="num">{freq.toLocaleString()} Hz</span></span>
          <input type="range" min={20} max={20000} step={1} value={freq} onChange={(e) => update({ freq: parseInt(e.target.value) })} className="w-full mt-2" />
          <div className="flex gap-2 mt-2 flex-wrap text-xs">
            {[100, 440, 1000, 4000, 8000].map((f) => (
              <button key={f} onClick={() => update({ freq: f })} className="px-2 py-1 rounded border border-border hover:bg-muted">{f} Hz</button>
            ))}
          </div>
        </label>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium">Wave shape</span>
            <select value={wave} onChange={(e) => update({ wave: e.target.value as OscillatorType })} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2">
              <option value="sine">Sine — pure smooth tone</option>
              <option value="square">Square — buzzy, harmonic</option>
              <option value="triangle">Triangle — soft and woody</option>
              <option value="sawtooth">Sawtooth — bright and full</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Volume: <span className="num">{Math.round(volume * 100)}%</span></span>
            <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(e) => update({ volume: parseFloat(e.target.value) })} className="w-full mt-2" />
          </label>
        </div>
        <div className="flex flex-wrap gap-3">
          {playing ? (
            <button onClick={stop} className="inline-flex items-center gap-2 min-h-12 px-5 rounded-xl bg-destructive text-destructive-foreground font-medium"><Square className="size-4" /> Stop</button>
          ) : (
            <button onClick={play} className="inline-flex items-center gap-2 min-h-12 px-5 rounded-xl bg-primary text-primary-foreground font-medium"><Play className="size-4" /> Play</button>
          )}
          <button onClick={() => download("mp3")} className="inline-flex items-center gap-2 min-h-12 px-4 rounded-xl border border-border hover:bg-muted"><Download className="size-4" /> Save 5s MP3</button>
          <button onClick={() => download("wav")} className="inline-flex items-center gap-2 min-h-12 px-4 rounded-xl border border-border hover:bg-muted"><Download className="size-4" /> Save 5s WAV</button>
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-2"><Activity className="size-3" /> Start at a low volume — high frequencies can be loud.</p>
      </div>
      <HowItWorks><p>Pick a frequency and wave shape, then press Play. Useful for tuning instruments (A4 = 440 Hz), testing headphones, or simple hearing checks.</p></HowItWorks>
    </ToolLayout>
  );
}
