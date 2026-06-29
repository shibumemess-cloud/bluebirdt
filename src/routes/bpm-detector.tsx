import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Activity } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks, ErrorBox } from "../components/ToolControls";
import { decodeAudioFile } from "../lib/audio-helpers";
import { analyze } from "web-audio-beat-detector";

export const Route = createFileRoute("/bpm-detector")({
  head: () => ({
    meta: [
      { title: "BPM Detector — Find Tempo of Any Song Online Free" },
      { name: "description", content: "Drop in an MP3 or WAV and we'll estimate its tempo in beats per minute — runs entirely in your browser. No upload." },
      { property: "og:title", content: "BPM Detector — Bluebird" },
      { property: "og:description", content: "Find song tempo without uploading." },
    ],
    links: [{ rel: "canonical", href: "/bpm-detector" }],
  }),
  component: Page,
});

function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [bpm, setBpm] = useState<number | null>(null);

  async function run() {
    if (!file) return;
    setBusy(true); setErr(null); setBpm(null);
    try {
      const buffer = await decodeAudioFile(file);
      const t = await analyze(buffer);
      setBpm(Math.round(t * 10) / 10);
    } catch (e: any) {
      setErr("Could not find a steady beat in this clip. Try a different song or a 30+ second sample.");
    } finally { setBusy(false); }
  }

  return (
    <ToolLayout slug="bpm-detector">
      <div className="soft-card p-5 sm:p-6 space-y-5">
        <label className="block">
          <span className="font-medium">Choose a song or audio file</span>
          <input type="file" accept="audio/*" className="block mt-2 w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setBpm(null); }} />
        </label>
        {err && <ErrorBox>{err}</ErrorBox>}
        <button onClick={run} disabled={!file || busy} className="inline-flex items-center gap-2 min-h-12 px-5 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-60">
          <Activity className="size-4" /> {busy ? "Listening…" : "Detect BPM"}
        </button>
        {bpm !== null && (
          <div className="rounded-xl border border-border bg-card/50 p-6 text-center">
            <div className="text-sm text-muted-foreground mb-1">Estimated tempo</div>
            <div className="text-5xl sm:text-6xl font-display num">{bpm}</div>
            <div className="text-sm text-muted-foreground mt-1">beats per minute</div>
            <div className="text-xs text-muted-foreground mt-3">Half‑time: <span className="num">{Math.round(bpm / 2 * 10) / 10}</span> · Double‑time: <span className="num">{Math.round(bpm * 2 * 10) / 10}</span></div>
          </div>
        )}
      </div>
      <HowItWorks><p>Pick a track and we'll measure the gap between beats to guess the tempo. Works best on songs with a clear drum or bass pulse.</p></HowItWorks>
    </ToolLayout>
  );
}
