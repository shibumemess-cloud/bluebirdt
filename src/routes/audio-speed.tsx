import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FastForward, Music } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks, ErrorBox, WarnBox } from "../components/ToolControls";
import {
  decodeAudioFile, changeRate, audioBufferToMp3, audioBufferToWav, downloadBlob,
} from "../lib/audio-helpers";

export const Route = createFileRoute("/audio-speed")({
  head: () => ({
    meta: [
      { title: "Audio Speed Changer — Speed Up or Slow Down MP3 Online" },
      { name: "description", content: "Change the speed of any audio file from 0.25x to 4x — in your browser. Save as MP3 or WAV. No upload, no signup." },
      { property: "og:title", content: "Audio Speed Changer — Bluebird" },
      { property: "og:description", content: "Speed up or slow down audio privately." },
    ],
    links: [{ rel: "canonical", href: "/audio-speed" }],
  }),
  component: Page,
});

function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [speed, setSpeed] = useState(1.5);
  const [format, setFormat] = useState<"mp3" | "wav">("mp3");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [out, setOut] = useState<string | null>(null);

  async function run() {
    if (!file) return;
    setBusy(true); setErr(null);
    try {
      const buffer = await decodeAudioFile(file);
      const newBuf = await changeRate(buffer, speed);
      const blob = format === "mp3" ? audioBufferToMp3(newBuf) : audioBufferToWav(newBuf);
      if (out) URL.revokeObjectURL(out);
      setOut(URL.createObjectURL(blob));
      downloadBlob(blob, (file.name.replace(/\.[^.]+$/, "") || "audio") + `-${speed}x.${format}`);
    } catch (e: any) { setErr(e?.message || "Could not change speed."); } finally { setBusy(false); }
  }

  return (
    <ToolLayout slug="audio-speed">
      <div className="soft-card p-5 sm:p-6 space-y-5">
        <label className="block">
          <span className="font-medium">Choose an audio file</span>
          <input type="file" accept="audio/*" className="block mt-2 w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setOut(null); }} />
        </label>
        {err && <ErrorBox>{err}</ErrorBox>}
        <label className="block">
          <span className="text-sm font-medium">Speed: <span className="num">{speed.toFixed(2)}x</span></span>
          <input type="range" min={0.25} max={4} step={0.05} value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} className="w-full mt-2" />
          <div className="flex justify-between text-xs text-muted-foreground"><span>0.25x</span><span>1x</span><span>4x</span></div>
        </label>
        <WarnBox>This speed change also shifts pitch (faster = higher voice). For pitch‑only changes, use the Pitch Shifter tool.</WarnBox>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm flex items-center gap-2">Save as
            <select value={format} onChange={(e) => setFormat(e.target.value as any)} className="rounded-lg border border-border bg-background px-2 py-1.5">
              <option value="mp3">MP3</option><option value="wav">WAV</option>
            </select>
          </label>
          <button onClick={run} disabled={!file || busy} className="ml-auto inline-flex items-center gap-2 min-h-12 px-5 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-60">
            <FastForward className="size-4" /> {busy ? "Working…" : "Change speed"}
          </button>
        </div>
        {out && (
          <div className="rounded-xl border border-border p-4 bg-card/50">
            <div className="text-sm font-medium mb-2 flex items-center gap-2"><Music className="size-4" /> Preview</div>
            <audio src={out} controls className="w-full" />
          </div>
        )}
      </div>
      <HowItWorks><p>Pick a file, drag the speed slider, then save. Useful for slowing down lessons, speeding up podcasts, or making fun voice effects.</p></HowItWorks>
    </ToolLayout>
  );
}
