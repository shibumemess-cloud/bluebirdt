import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Copy, Upload, Camera, X, ExternalLink } from "lucide-react";
import jsQR from "jsqr";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/qr-reader")({
  head: () => ({
    meta: [
      { title: "QR Code Reader — Free Online QR Scanner from Image or Camera" },
      { name: "description", content: "Scan a QR code from an image, screenshot or your camera. Decoded text, links and Wi-Fi credentials shown instantly. Private." },
      { property: "og:title", content: "QR Code Reader — Bluebird" },
      { property: "og:description", content: "Read QR codes in your browser, no app needed." },
      { property: "og:url", content: "/qr-reader" },
    ],
    links: [{ rel: "canonical", href: "/qr-reader" }],
  }),
  component: Page,
});

function decodeFromImage(img: HTMLImageElement | HTMLCanvasElement | ImageBitmap): string | null {
  const w = "width" in img ? img.width : 0;
  const h = "height" in img ? img.height : 0;
  if (!w || !h) return null;
  const canvas = document.createElement("canvas");
  const max = 1600;
  const scale = Math.min(1, max / Math.max(w, h));
  canvas.width = Math.max(1, Math.round(w * scale));
  canvas.height = Math.max(1, Math.round(h * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(img as CanvasImageSource, 0, 0, canvas.width, canvas.height);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const r = jsQR(data.data, data.width, data.height, { inversionAttempts: "attemptBoth" });
  return r ? r.data : null;
}

function looksLikeUrl(s: string) {
  return /^https?:\/\//i.test(s);
}

function Page() {
  const [text, setText] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  async function handleFile(f: File) {
    setError(null); setText(null);
    if (!f.type.startsWith("image/")) { setError("Please choose an image file (PNG, JPG, WEBP)."); return; }
    const url = URL.createObjectURL(f);
    setPreview(url);
    try {
      const bmp = await createImageBitmap(f);
      const r = decodeFromImage(bmp);
      bmp.close?.();
      if (r) setText(r);
      else setError("No QR code found in this image. Try a clearer or larger picture.");
    } catch {
      setError("Couldn't read this image.");
    }
  }

  async function startCamera() {
    setError(null); setText(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);
      tick();
    } catch {
      setError("Camera permission denied or unavailable.");
    }
  }
  function stopCamera() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  }
  function tick() {
    if (!videoRef.current || !streamRef.current) return;
    const v = videoRef.current;
    if (v.readyState === v.HAVE_ENOUGH_DATA) {
      const c = document.createElement("canvas");
      c.width = v.videoWidth; c.height = v.videoHeight;
      const ctx = c.getContext("2d");
      if (ctx) {
        ctx.drawImage(v, 0, 0, c.width, c.height);
        const data = ctx.getImageData(0, 0, c.width, c.height);
        const r = jsQR(data.data, data.width, data.height);
        if (r) {
          setText(r.data);
          stopCamera();
          return;
        }
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  }

  function onPaste(e: React.ClipboardEvent) {
    const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith("image/"));
    if (item) {
      const f = item.getAsFile();
      if (f) handleFile(f);
    }
  }

  return (
    <ToolLayout slug="qr-reader">
      <div className="grid lg:grid-cols-2 gap-4" onPaste={onPaste}>
        <div className="soft-card p-4 sm:p-5 space-y-3">
          <div className="eyebrow">Image or camera</div>

          <label className="block">
            <div className="rounded-2xl border-2 border-dashed border-border hover:border-primary bg-card p-6 text-center cursor-pointer transition">
              <Upload className="size-6 mx-auto text-primary mb-2" />
              <div className="text-sm font-medium">Drop a QR image or click to choose</div>
              <div className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP — or paste a screenshot</div>
              <input type="file" accept="image/*" className="sr-only" aria-label="Choose image"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </div>
          </label>

          {!scanning ? (
            <button onClick={startCamera}
              className="w-full min-h-11 rounded-lg border border-border bg-card hover:border-primary inline-flex items-center justify-center gap-2 text-sm">
              <Camera className="size-4" /> Scan with camera
            </button>
          ) : (
            <button onClick={stopCamera}
              className="w-full min-h-11 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive inline-flex items-center justify-center gap-2 text-sm">
              <X className="size-4" /> Stop camera
            </button>
          )}

          <div className={`rounded-xl overflow-hidden border border-border bg-black/5 ${scanning ? "" : "hidden"}`}>
            <video ref={videoRef} className="w-full h-auto" playsInline muted />
          </div>

          {preview && !scanning && (
            <div className="rounded-xl overflow-hidden border border-border bg-card">
              <img src={preview} alt="Uploaded QR preview" className="w-full h-auto max-h-64 object-contain" />
            </div>
          )}
        </div>

        <div className="soft-card p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="eyebrow">Decoded result</div>
            {text && (
              <button onClick={() => navigator.clipboard.writeText(text)}
                className="text-xs inline-flex items-center gap-1 hover:text-primary">
                <Copy className="size-3" /> Copy
              </button>
            )}
          </div>

          {error ? (
            <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm p-3">{error}</div>
          ) : text ? (
            <>
              <div className="rounded-xl border border-border bg-card p-3 break-all font-mono text-sm">{text}</div>
              {looksLikeUrl(text) && (
                <a href={text} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                  <ExternalLink className="size-4" /> Open link in new tab
                </a>
              )}
            </>
          ) : (
            <div className="text-sm text-muted-foreground">Choose an image or start the camera to see the decoded content here.</div>
          )}
        </div>
      </div>

      <HowItWorks>
        <li>Drop a screenshot, photo, or paste a QR image — or start your camera.</li>
        <li>The decoded text or link appears instantly on the right.</li>
        <li>Tap Copy to use it, or open URLs directly in a new tab.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
