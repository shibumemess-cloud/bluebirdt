import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Disc3 } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks, ErrorBox } from "../components/ToolControls";

export const Route = createFileRoute("/audio-visualizer")({
  head: () => ({
    meta: [
      { title: "Audio Visualizer — Real-Time Waveform & Spectrum" },
      { name: "description", content: "Watch live waveforms and frequency bars from any audio file or your microphone — beautiful, smooth and fully private." },
      { property: "og:title", content: "Audio Visualizer — Bluebird" },
      { property: "og:description", content: "Live audio waveform in your browser." },
    ],
    links: [{ rel: "canonical", href: "/audio-visualizer" }],
  }),
  component: Page,
});

function Page() {
  const [mode, setMode] = useState<"file" | "mic">("file");
  const [file, setFile] = useState<File | null>(null);
  const [style, setStyle] = useState<"bars" | "wave">("bars");
  const [err, setErr] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => () => stop(), []);

  function stop() {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop()); streamRef.current = null;
    ctxRef.current?.close().catch(() => {}); ctxRef.current = null;
    setRunning(false);
  }

  async function start() {
    setErr(null); stop();
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
    const ctx = new Ctx();
    ctxRef.current = ctx;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;

    try {
      if (mode === "mic") {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        ctx.createMediaStreamSource(stream).connect(analyser);
      } else {
        if (!file || !audioRef.current) { setErr("Pick an audio file first."); return; }
        const src = ctx.createMediaElementSource(audioRef.current);
        src.connect(analyser);
        analyser.connect(ctx.destination);
        await audioRef.current.play();
      }
    } catch { setErr("Couldn't start. Allow microphone access or try another file."); return; }

    setRunning(true);
    const canvas = canvasRef.current!;
    const c = canvas.getContext("2d")!;
    const freq = new Uint8Array(analyser.frequencyBinCount);
    const time = new Uint8Array(analyser.fftSize);
    const draw = () => {
      const w = canvas.width, h = canvas.height;
      c.fillStyle = "rgba(15, 22, 41, 0.25)";
      c.fillRect(0, 0, w, h);
      if (style === "bars") {
        analyser.getByteFrequencyData(freq);
        const bars = 64;
        const bw = w / bars;
        for (let i = 0; i < bars; i++) {
          const v = freq[Math.floor(i * freq.length / bars)] / 255;
          const bh = v * h;
          const hue = 210 + i * 1.2;
          c.fillStyle = `hsl(${hue} 80% 60%)`;
          c.fillRect(i * bw + 1, h - bh, bw - 2, bh);
        }
      } else {
        analyser.getByteTimeDomainData(time);
        c.strokeStyle = "hsl(210 90% 65%)"; c.lineWidth = 2;
        c.beginPath();
        for (let i = 0; i < time.length; i++) {
          const x = (i / time.length) * w;
          const y = (time[i] / 255) * h;
          if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
        }
        c.stroke();
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
  }

  return (
    <ToolLayout slug="audio-visualizer">
      <div className="soft-card p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="inline-flex rounded-lg border border-border overflow-hidden">
            <button onClick={() => setMode("file")} className={`px-3 py-2 text-sm ${mode === "file" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>From file</button>
            <button onClick={() => setMode("mic")} className={`px-3 py-2 text-sm ${mode === "mic" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>From microphone</button>
          </div>
          <div className="inline-flex rounded-lg border border-border overflow-hidden">
            <button onClick={() => setStyle("bars")} className={`px-3 py-2 text-sm ${style === "bars" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>Bars</button>
            <button onClick={() => setStyle("wave")} className={`px-3 py-2 text-sm ${style === "wave" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>Wave</button>
          </div>
        </div>
        {mode === "file" && (
          <input type="file" accept="audio/*" className="block w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        )}
        {err && <ErrorBox>{err}</ErrorBox>}
        <canvas ref={canvasRef} width={1024} height={300} className="w-full rounded-xl bg-slate-900" />
        {mode === "file" && file && (
          <audio ref={audioRef} src={URL.createObjectURL(file)} controls className="w-full" />
        )}
        <div className="flex gap-3">
          {running ? (
            <button onClick={stop} className="inline-flex items-center gap-2 min-h-12 px-5 rounded-xl bg-destructive text-destructive-foreground font-medium">Stop</button>
          ) : (
            <button onClick={start} className="inline-flex items-center gap-2 min-h-12 px-5 rounded-xl bg-primary text-primary-foreground font-medium"><Disc3 className="size-4" /> Start visualizer</button>
          )}
        </div>
      </div>
      <HowItWorks><p>Pick a file or your microphone, then watch a live frequency or waveform display. Mic audio is never sent anywhere.</p></HowItWorks>
    </ToolLayout>
  );
}
