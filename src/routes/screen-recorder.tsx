import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Monitor, Square, Download, Mic, MicOff } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/screen-recorder")({
  head: () => ({
    meta: [
      { title: "Free Screen Recorder — Record Screen in Your Browser, No Install" },
      { name: "description", content: "Record your screen, a window or a browser tab with optional microphone. Saves locally as WebM — nothing uploads, no watermark, no signup." },
      { property: "og:title", content: "Screen Recorder — Bluebird" },
      { property: "og:description", content: "Free browser screen recorder with mic, no signup." },
      { property: "og:url", content: "/screen-recorder" },
    ],
    links: [{ rel: "canonical", href: "/screen-recorder" }],
  }),
  component: Page,
});

function fmt(s: number) {
  const m = Math.floor(s / 60), r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function Page() {
  const [recording, setRecording] = useState(false);
  const [withMic, setWithMic] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (blobUrl) URL.revokeObjectURL(blobUrl);
  }, [blobUrl]);

  async function start() {
    setError(null);
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setError("Your browser doesn't support screen recording. Try Chrome, Edge or Firefox on desktop.");
      return;
    }
    try {
      const display = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: true });
      let combined = display;
      if (withMic) {
        try {
          const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
          combined = new MediaStream([...display.getVideoTracks(), ...display.getAudioTracks(), ...mic.getAudioTracks()]);
        } catch { setError("Couldn't access the microphone — recording without it."); }
      }
      streamRef.current = combined;
      if (previewRef.current) { previewRef.current.srcObject = combined; previewRef.current.play().catch(() => {}); }

      const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus") ? "video/webm;codecs=vp9,opus" : "video/webm";
      const rec = new MediaRecorder(combined, { mimeType: mime });
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setBlobUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(blob); });
        combined.getTracks().forEach((t) => t.stop());
        if (previewRef.current) previewRef.current.srcObject = null;
      };
      display.getVideoTracks()[0].onended = () => stop();
      rec.start(1000);
      recorderRef.current = rec;
      setRecording(true);
      setSeconds(0);
      timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch (err) {
      setError(err instanceof Error && err.name === "NotAllowedError" ? "Recording was cancelled." : "Couldn't start recording.");
    }
  }

  function stop() {
    recorderRef.current?.stop();
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
    setRecording(false);
  }

  function download() {
    if (!blobUrl) return;
    const a = document.createElement("a"); a.href = blobUrl;
    a.download = `screen-recording-${Date.now()}.webm`; a.click();
  }

  return (
    <ToolLayout slug="screen-recorder">
      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-5">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={withMic} onChange={(e) => setWithMic(e.target.checked)} disabled={recording} className="size-4 accent-[color:var(--color-primary)]" />
            {withMic ? <Mic className="size-4 text-primary" /> : <MicOff className="size-4 text-muted-foreground" />}
            Record my microphone too
          </label>

          {!recording ? (
            <button onClick={start} className="w-full min-h-12 rounded-xl bg-primary text-primary-foreground font-semibold inline-flex items-center justify-center gap-2 hover:shadow-lift hover:-translate-y-0.5">
              <Monitor className="size-5" /> Start recording
            </button>
          ) : (
            <button onClick={stop} className="w-full min-h-12 rounded-xl bg-rose-600 text-white font-semibold inline-flex items-center justify-center gap-2 animate-pulse">
              <Square className="size-5 fill-white" /> Stop ({fmt(seconds)})
            </button>
          )}

          {blobUrl && !recording && (
            <button onClick={download} className="w-full min-h-12 rounded-xl border border-border bg-card text-sm font-semibold hover:border-primary inline-flex items-center justify-center gap-2">
              <Download className="size-4" /> Download .webm
            </button>
          )}

          {error && <div className="text-sm text-rose-600">{error}</div>}
          <p className="text-xs text-muted-foreground">Choose your whole screen, a window or a browser tab in the picker that appears. Recording stays on your device until you download it.</p>
        </section>

        <section className="soft-card p-3 sm:p-4">
          <div className="eyebrow px-2 pt-2">{recording ? "Live preview" : blobUrl ? "Recording ready" : "Preview"}</div>
          <div className="mt-2 rounded-xl bg-card border border-border overflow-hidden aspect-video">
            {recording ? (
              <video ref={previewRef} muted playsInline className="w-full h-full object-contain bg-black" />
            ) : blobUrl ? (
              <video src={blobUrl} controls className="w-full h-full object-contain bg-black" />
            ) : (
              <div className="grid place-items-center h-full text-muted-foreground text-sm">Press Start recording to begin.</div>
            )}
          </div>
        </section>
      </div>

      <HowItWorks>
        <li>Press Start recording — your browser will ask which screen, window or tab to capture.</li>
        <li>Do whatever you need on screen. Press Stop when finished.</li>
        <li>Preview the recording and download as a .webm video.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
