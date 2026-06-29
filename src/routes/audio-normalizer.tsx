import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Gauge, Music } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks, ErrorBox } from "../components/ToolControls";
import {
  decodeAudioFile, normalizeBuffer, audioBufferToMp3, audioBufferToWav, downloadBlob,
} from "../lib/audio-helpers";

export const Route = createFileRoute("/audio-normalizer")({
  head: () => ({
    meta: [
      { title: "Audio Volume Normalizer — Make MP3 Louder Online Free" },
      { name: "description", content: "Boost quiet audio to a consistent peak level — in your browser. Great for podcasts, voice memos and music. No upload." },
      { property: "og:title", content: "Audio Volume Normalizer — Bluebird" },
      { property: "og:description", content: "Even out audio loudness privately." },
    ],
    links: [{ rel: "canonical", href: "/audio-normalizer" }],
  }),
  component: Page,
});

function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [peak, setPeak] = useState(-0.5);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [out, setOut] = useState<string | null>(null);
  const [format, setFormat] = useState<"mp3" | "wav">("mp3");

  async function run() {
    if (!file) return;
    setBusy(true); setErr(null);
    try {
      const buffer = await decodeAudioFile(file);
      const target = Math.pow(10, peak / 20);
      const norm = normalizeBuffer(buffer, target);
      const blob = format === "mp3" ? audioBufferToMp3(norm) : audioBufferToWav(norm);
      if (out) URL.revokeObjectURL(out);
      setOut(URL.createObjectURL(blob));
      downloadBlob(blob, (file.name.replace(/\.[^.]+$/, "") || "audio") + "-normalized." + format);
    } catch (e: any) { setErr(e?.message || "Could not normalize."); } finally { setBusy(false); }
  }

  return (
    <ToolLayout slug="audio-normalizer">
      <div className="soft-card p-5 sm:p-6 space-y-5">
        <label className="block">
          <span className="font-medium">Choose an audio file</span>
          <input type="file" accept="audio/*" className="block mt-2 w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setOut(null); }} />
        </label>
        {err && <ErrorBox>{err}</ErrorBox>}
        <label className="block">
          <span className="text-sm font-medium">Target peak: <span className="num">{peak.toFixed(1)} dB</span></span>
          <input type="range" min={-6} max={0} step={0.1} value={peak} onChange={(e) => setPeak(parseFloat(e.target.value))} className="w-full mt-2" />
          <p className="text-xs text-muted-foreground mt-1">−0.5 dB is a safe loud target. 0 dB is the maximum and may clip.</p>
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm flex items-center gap-2">Save as
            <select value={format} onChange={(e) => setFormat(e.target.value as any)} className="rounded-lg border border-border bg-background px-2 py-1.5">
              <option value="mp3">MP3</option><option value="wav">WAV</option>
            </select>
          </label>
          <button onClick={run} disabled={!file || busy} className="ml-auto inline-flex items-center gap-2 min-h-12 px-5 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-60">
            <Gauge className="size-4" /> {busy ? "Working…" : "Normalize"}
          </button>
        </div>
        {out && (
          <div className="rounded-xl border border-border p-4 bg-card/50">
            <div className="text-sm font-medium mb-2 flex items-center gap-2"><Music className="size-4" /> Preview</div>
            <audio src={out} controls className="w-full" />
          </div>
        )}
      </div>
      <HowItWorks><p>This finds the loudest peak in your audio and scales the whole clip so that peak hits your target level — making quiet files louder without distortion.</p></HowItWorks>
    </ToolLayout>
  );
}
