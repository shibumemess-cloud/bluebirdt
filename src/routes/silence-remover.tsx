import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Scissors, Music } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks, ErrorBox } from "../components/ToolControls";
import {
  decodeAudioFile, removeSilence, audioBufferToMp3, audioBufferToWav,
  downloadBlob, formatTime,
} from "../lib/audio-helpers";

export const Route = createFileRoute("/silence-remover")({
  head: () => ({
    meta: [
      { title: "Silence Remover — Auto-Cut Quiet Parts from Audio" },
      { name: "description", content: "Automatically remove long quiet parts from voice recordings, podcasts and interviews. In your browser, no upload." },
      { property: "og:title", content: "Silence Remover — Bluebird" },
      { property: "og:description", content: "Trim out silence privately." },
    ],
    links: [{ rel: "canonical", href: "/silence-remover" }],
  }),
  component: Page,
});

function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [threshold, setThreshold] = useState(0.02);
  const [minGap, setMinGap] = useState(0.4);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [out, setOut] = useState<string | null>(null);
  const [info, setInfo] = useState<{ before: number; after: number } | null>(null);
  const [format, setFormat] = useState<"mp3" | "wav">("mp3");

  async function run() {
    if (!file) return;
    setBusy(true); setErr(null);
    try {
      const buffer = await decodeAudioFile(file);
      const cleaned = removeSilence(buffer, threshold, minGap);
      const blob = format === "mp3" ? audioBufferToMp3(cleaned) : audioBufferToWav(cleaned);
      if (out) URL.revokeObjectURL(out);
      setOut(URL.createObjectURL(blob));
      setInfo({ before: buffer.duration, after: cleaned.duration });
      downloadBlob(blob, (file.name.replace(/\.[^.]+$/, "") || "audio") + "-trimmed." + format);
    } catch (e: any) { setErr(e?.message || "Could not process."); } finally { setBusy(false); }
  }

  return (
    <ToolLayout slug="silence-remover">
      <div className="soft-card p-5 sm:p-6 space-y-5">
        <label className="block">
          <span className="font-medium">Choose an audio file</span>
          <input type="file" accept="audio/*" className="block mt-2 w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setOut(null); setInfo(null); }} />
        </label>
        {err && <ErrorBox>{err}</ErrorBox>}
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium">Silence sensitivity: <span className="num">{(threshold * 100).toFixed(1)}%</span></span>
            <input type="range" min={0.005} max={0.1} step={0.005} value={threshold} onChange={(e) => setThreshold(parseFloat(e.target.value))} className="w-full mt-2" />
            <p className="text-xs text-muted-foreground mt-1">Higher = cuts louder background noise too.</p>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Minimum gap to cut: <span className="num">{minGap.toFixed(2)} sec</span></span>
            <input type="range" min={0.1} max={3} step={0.05} value={minGap} onChange={(e) => setMinGap(parseFloat(e.target.value))} className="w-full mt-2" />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm flex items-center gap-2">Save as
            <select value={format} onChange={(e) => setFormat(e.target.value as any)} className="rounded-lg border border-border bg-background px-2 py-1.5">
              <option value="mp3">MP3</option><option value="wav">WAV</option>
            </select>
          </label>
          <button onClick={run} disabled={!file || busy} className="ml-auto inline-flex items-center gap-2 min-h-12 px-5 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-60">
            <Scissors className="size-4" /> {busy ? "Cutting…" : "Remove silence"}
          </button>
        </div>
        {info && <p className="text-sm text-muted-foreground">Was <span className="num">{formatTime(info.before)}</span> · now <span className="num">{formatTime(info.after)}</span> · saved <span className="num">{Math.round((1 - info.after / info.before) * 100)}%</span></p>}
        {out && (
          <div className="rounded-xl border border-border p-4 bg-card/50">
            <div className="text-sm font-medium mb-2 flex items-center gap-2"><Music className="size-4" /> Preview</div>
            <audio src={out} controls className="w-full" />
          </div>
        )}
      </div>
      <HowItWorks><p>This finds quiet stretches in your audio and removes the long ones. Adjust the sensitivity if your room is noisy, or the minimum gap to keep natural pauses.</p></HowItWorks>
    </ToolLayout>
  );
}
