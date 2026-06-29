import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Mic, Square as StopIcon, Download, Trash2, Play, Pause } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks, WarnBox } from "../components/ToolControls";

export const Route = createFileRoute("/audio-recorder")({
  head: () => ({
    meta: [
      { title: "Voice Recorder — Free Online Microphone Recorder" },
      { name: "description", content: "Record voice memos, interviews and notes in your browser. Live level meter, pause and resume, save as WebM. No signup, no uploads." },
      { property: "og:title", content: "Voice Recorder — Bluebird" },
      { property: "og:description", content: "Private mic recording — stays on your device." },
      { property: "og:url", content: "/audio-recorder" },
    ],
    links: [{ rel: "canonical", href: "/audio-recorder" }],
  }),
  component: Page,
});

type Clip = { url: string; size: number; duration: number; ts: number };

function fmt(s: number) {
  const m = Math.floor(s / 60); const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, "0")}`;
}

function Page() {
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [level, setLevel] = useState(0);
  const [clips, setClips] = useState<Clip[]>([]);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const acRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number>(0);
  const tStartRef = useRef(0);
  const tAccRef = useRef(0);

  useEffect(() => () => {
    cleanup();
    clips.forEach((c) => URL.revokeObjectURL(c.url));
  }, []); // eslint-disable-line

  function cleanup() {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    acRef.current?.close().catch(() => {});
    acRef.current = null;
  }

  async function start() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      streamRef.current = stream;
      const ac = new (window.AudioContext || (window as any).webkitAudioContext)();
      acRef.current = ac;
      const src = ac.createMediaStreamSource(stream);
      const analyser = ac.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser);
      const buf = new Uint8Array(analyser.frequencyBinCount);
      const loop = () => {
        analyser.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; sum += v * v; }
        setLevel(Math.min(1, Math.sqrt(sum / buf.length) * 2));
        rafRef.current = requestAnimationFrame(loop);
      };
      loop();

      const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((m) => MediaRecorder.isTypeSupported(m)) || "";
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        const url = URL.createObjectURL(blob);
        const dur = tAccRef.current + (performance.now() - tStartRef.current) / 1000;
        setClips((c) => [{ url, size: blob.size, duration: dur, ts: Date.now() }, ...c]);
        tAccRef.current = 0; setElapsed(0); setLevel(0);
        cleanup();
      };
      rec.start(250);
      recRef.current = rec;
      tStartRef.current = performance.now();
      tAccRef.current = 0;
      setRecording(true); setPaused(false);
      const tick = setInterval(() => {
        if (!recRef.current || recRef.current.state === "inactive") { clearInterval(tick); return; }
        if (recRef.current.state === "recording") {
          setElapsed(tAccRef.current + (performance.now() - tStartRef.current) / 1000);
        }
      }, 200);
    } catch (e: any) {
      setError(e.name === "NotAllowedError" ? "Microphone access was blocked. Allow it in your browser settings and try again." : (e.message || "Could not start recording."));
    }
  }
  function togglePause() {
    const r = recRef.current; if (!r) return;
    if (r.state === "recording") {
      tAccRef.current += (performance.now() - tStartRef.current) / 1000;
      r.pause(); setPaused(true);
    } else if (r.state === "paused") {
      tStartRef.current = performance.now();
      r.resume(); setPaused(false);
    }
  }
  function stop() {
    const r = recRef.current; if (!r) return;
    if (r.state !== "inactive") r.stop();
    setRecording(false); setPaused(false);
  }
  function download(c: Clip) {
    const a = document.createElement("a");
    a.href = c.url; a.download = `recording-${c.ts}.webm`; a.click();
  }
  function remove(i: number) {
    setClips((arr) => { URL.revokeObjectURL(arr[i].url); return arr.filter((_, k) => k !== i); });
  }

  return (
    <ToolLayout slug="audio-recorder">
      <div className="space-y-5">
        {error && <WarnBox>{error}</WarnBox>}

        <div className="soft-card p-5 sm:p-6 text-center space-y-5">
          <div className="font-display text-5xl sm:text-6xl tabular-nums">{fmt(elapsed)}</div>
          <div className="h-3 rounded-full bg-muted overflow-hidden" aria-hidden>
            <div className="h-full bg-primary transition-[width] duration-100" style={{ width: `${Math.round(level * 100)}%` }} />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {!recording ? (
              <button onClick={start}
                className="min-h-14 px-6 rounded-2xl bg-primary text-primary-foreground font-semibold inline-flex items-center gap-2 text-lg">
                <Mic className="size-5" /> Start recording
              </button>
            ) : (
              <>
                <button onClick={togglePause}
                  className="min-h-12 px-5 rounded-xl border border-border bg-card hover:border-primary inline-flex items-center gap-2">
                  {paused ? <><Play className="size-4" /> Resume</> : <><Pause className="size-4" /> Pause</>}
                </button>
                <button onClick={stop}
                  className="min-h-12 px-5 rounded-xl bg-rose-600 text-white font-semibold inline-flex items-center gap-2">
                  <StopIcon className="size-5" /> Stop
                </button>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Recordings stay on this device — nothing is uploaded.</p>
        </div>

        <div className="soft-card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="eyebrow">Recordings</div>
            <div className="text-xs text-muted-foreground tabular-nums">{clips.length}</div>
          </div>
          {clips.length === 0 ? (
            <p className="text-sm text-muted-foreground">Your recordings will appear here.</p>
          ) : (
            <ul className="space-y-3">
              {clips.map((c, i) => (
                <li key={c.ts} className="rounded-xl border border-border bg-card p-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Recording {clips.length - i}</span>
                    <span className="text-muted-foreground tabular-nums">{fmt(c.duration)} · {(c.size / 1024).toFixed(0)} KB</span>
                  </div>
                  <audio src={c.url} controls className="w-full" />
                  <div className="flex gap-2">
                    <button onClick={() => download(c)}
                      className="min-h-10 px-3 rounded-lg border border-border bg-card hover:border-primary inline-flex items-center gap-2 text-sm">
                      <Download className="size-4" /> Download
                    </button>
                    <button onClick={() => remove(i)}
                      className="min-h-10 px-3 rounded-lg border border-border bg-card hover:border-primary text-rose-600 inline-flex items-center gap-2 text-sm">
                      <Trash2 className="size-4" /> Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <HowItWorks>
        <li>Tap Start recording and allow microphone access.</li>
        <li>Pause and resume any time — the timer keeps track.</li>
        <li>Stop to add the clip to your list, then download or delete.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
