import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, Download, RefreshCw, Trash2, Aperture, FlipHorizontal } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks, WarnBox } from "../components/ToolControls";

export const Route = createFileRoute("/webcam-capture")({
  head: () => ({
    meta: [
      { title: "Webcam Photo Booth — Free Online Camera & Snapshot" },
      { name: "description", content: "Take photos with your webcam right in the browser. Mirror, switch cameras, countdown timer. Nothing uploaded — saves to your device." },
      { property: "og:title", content: "Webcam Photo Booth — Bluebird" },
      { property: "og:description", content: "Snap webcam photos privately. No signup, no uploads." },
      { property: "og:url", content: "/webcam-capture" },
    ],
    links: [{ rel: "canonical", href: "/webcam-capture" }],
  }),
  component: Page,
});

type Shot = { url: string; ts: number };

function Page() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mirror, setMirror] = useState(true);
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [countdown, setCountdown] = useState(0);
  const [tick, setTick] = useState(0);
  const [shots, setShots] = useState<Shot[]>([]);
  const [active, setActive] = useState(false);

  async function startCam(face: "user" | "environment" = facing) {
    setError(null);
    try {
      stopCam();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: face, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);
    } catch (e: any) {
      setError(e.name === "NotAllowedError" ? "Camera access was blocked. Allow it in your browser settings and try again." : (e.message || "Could not start the camera."));
      setActive(false);
    }
  }
  function stopCam() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setActive(false);
  }
  useEffect(() => () => stopCam(), []);
  useEffect(() => () => { shots.forEach((s) => URL.revokeObjectURL(s.url)); }, []); // eslint-disable-line

  function snapNow() {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth; c.height = v.videoHeight;
    const ctx = c.getContext("2d")!;
    if (mirror) { ctx.translate(c.width, 0); ctx.scale(-1, 1); }
    ctx.drawImage(v, 0, 0);
    c.toBlob((b) => {
      if (!b) return;
      const url = URL.createObjectURL(b);
      setShots((s) => [{ url, ts: Date.now() }, ...s].slice(0, 24));
    }, "image/jpeg", 0.92);
  }
  function takePhoto() {
    if (countdown <= 0) { snapNow(); return; }
    setTick(countdown);
    let n = countdown;
    const id = setInterval(() => {
      n -= 1;
      if (n <= 0) { clearInterval(id); setTick(0); snapNow(); }
      else setTick(n);
    }, 1000);
  }
  function download(url: string) {
    const a = document.createElement("a");
    a.href = url; a.download = `photo-${Date.now()}.jpg`; a.click();
  }
  function remove(i: number) {
    setShots((arr) => {
      URL.revokeObjectURL(arr[i].url);
      return arr.filter((_, k) => k !== i);
    });
  }

  return (
    <ToolLayout slug="webcam-capture">
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-5">
        <div className="soft-card p-4 sm:p-5 space-y-4">
          {error && <WarnBox>{error}</WarnBox>}
          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 grid place-items-center">
            <video ref={videoRef} playsInline muted
              className={["w-full h-full object-cover", mirror ? "scale-x-[-1]" : ""].join(" ")} />
            {!active && (
              <button onClick={() => startCam()} className="absolute inset-0 grid place-items-center text-white/90 hover:text-white">
                <div className="flex flex-col items-center gap-2">
                  <Camera className="size-10" />
                  <span className="font-semibold">Start camera</span>
                </div>
              </button>
            )}
            {tick > 0 && (
              <div className="absolute inset-0 grid place-items-center bg-black/30 text-white font-display text-8xl tabular-nums">{tick}</div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={takePhoto} disabled={!active}
              className="min-h-12 px-5 rounded-xl bg-primary text-primary-foreground font-semibold inline-flex items-center gap-2 disabled:opacity-50">
              <Aperture className="size-5" /> Take photo
            </button>
            <button onClick={() => setMirror((m) => !m)} aria-pressed={mirror}
              className="min-h-11 px-4 rounded-xl border border-border bg-card hover:border-primary inline-flex items-center gap-2">
              <FlipHorizontal className="size-4" /> Mirror: {mirror ? "On" : "Off"}
            </button>
            <button onClick={() => { const f = facing === "user" ? "environment" : "user"; setFacing(f); if (active) startCam(f); }}
              className="min-h-11 px-4 rounded-xl border border-border bg-card hover:border-primary inline-flex items-center gap-2">
              <RefreshCw className="size-4" /> Switch camera
            </button>
            <label className="min-h-11 px-3 rounded-xl border border-border bg-card inline-flex items-center gap-2 text-sm">
              Timer
              <select value={countdown} onChange={(e) => setCountdown(parseInt(e.target.value))}
                className="bg-transparent focus:outline-none">
                <option value={0}>Off</option>
                <option value={3}>3s</option>
                <option value={5}>5s</option>
                <option value={10}>10s</option>
              </select>
            </label>
            {active && (
              <button onClick={stopCam} className="min-h-11 px-4 rounded-xl border border-border bg-card hover:border-primary">
                Stop camera
              </button>
            )}
          </div>
        </div>

        <div className="soft-card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="eyebrow">Gallery</div>
            <div className="text-xs text-muted-foreground tabular-nums">{shots.length} photo{shots.length === 1 ? "" : "s"}</div>
          </div>
          {shots.length === 0 ? (
            <p className="text-sm text-muted-foreground">Your snapshots will appear here. They stay on this device.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {shots.map((s, i) => (
                <div key={s.ts} className="relative group rounded-xl overflow-hidden border border-border">
                  <img src={s.url} alt={`Snapshot ${i + 1}`} className="w-full aspect-square object-cover" />
                  <div className="absolute inset-x-0 bottom-0 p-1.5 flex gap-1 bg-gradient-to-t from-black/70 to-transparent">
                    <button onClick={() => download(s.url)} aria-label="Download"
                      className="flex-1 min-h-9 rounded-lg bg-white/95 text-slate-900 text-xs font-medium inline-flex items-center justify-center gap-1">
                      <Download className="size-3.5" /> Save
                    </button>
                    <button onClick={() => remove(i)} aria-label="Delete"
                      className="min-h-9 px-2 rounded-lg bg-white/95 text-rose-600 inline-flex items-center justify-center">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <HowItWorks>
        <li>Tap Start camera and allow access when your browser asks.</li>
        <li>Use the timer or take a photo instantly — flip the mirror if you prefer.</li>
        <li>Photos collect in the gallery — save the ones you like.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
