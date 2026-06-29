import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Music2, Music } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks, ErrorBox } from "../components/ToolControls";
import {
  decodeAudioFile, audioBufferToMp3, audioBufferToWav, downloadBlob,
} from "../lib/audio-helpers";

export const Route = createFileRoute("/audio-pitch")({
  head: () => ({
    meta: [
      { title: "Audio Pitch Shifter — Change Pitch Without Speed" },
      { name: "description", content: "Shift any audio up or down by semitones — in your browser. Great for music practice and karaoke. No upload, no signup." },
      { property: "og:title", content: "Audio Pitch Shifter — Bluebird" },
      { property: "og:description", content: "Change pitch privately on your device." },
    ],
    links: [{ rel: "canonical", href: "/audio-pitch" }],
  }),
  component: Page,
});

async function shiftPitch(buffer: AudioBuffer, semitones: number): Promise<AudioBuffer> {
  // OfflineAudioContext + detune. Duration stays the same; pitch shifts.
  const off = new OfflineAudioContext(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
  const src = off.createBufferSource();
  src.buffer = buffer;
  src.detune.value = semitones * 100; // cents
  src.connect(off.destination);
  src.start();
  return await off.startRendering();
}

function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [semis, setSemis] = useState(2);
  const [format, setFormat] = useState<"mp3" | "wav">("mp3");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [out, setOut] = useState<string | null>(null);

  async function run() {
    if (!file) return;
    setBusy(true); setErr(null);
    try {
      const buffer = await decodeAudioFile(file);
      const newBuf = await shiftPitch(buffer, semis);
      const blob = format === "mp3" ? audioBufferToMp3(newBuf) : audioBufferToWav(newBuf);
      if (out) URL.revokeObjectURL(out);
      setOut(URL.createObjectURL(blob));
      downloadBlob(blob, (file.name.replace(/\.[^.]+$/, "") || "audio") + `-pitch${semis >= 0 ? "+" : ""}${semis}.${format}`);
    } catch (e: any) { setErr(e?.message || "Could not change pitch."); } finally { setBusy(false); }
  }

  return (
    <ToolLayout slug="audio-pitch">
      <div className="soft-card p-5 sm:p-6 space-y-5">
        <label className="block">
          <span className="font-medium">Choose an audio file</span>
          <input type="file" accept="audio/*" className="block mt-2 w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setOut(null); }} />
        </label>
        {err && <ErrorBox>{err}</ErrorBox>}
        <label className="block">
          <span className="text-sm font-medium">Pitch: <span className="num">{semis > 0 ? `+${semis}` : semis} semitones</span></span>
          <input type="range" min={-12} max={12} step={1} value={semis} onChange={(e) => setSemis(parseInt(e.target.value))} className="w-full mt-2" />
          <div className="flex justify-between text-xs text-muted-foreground"><span>−12 (1 octave down)</span><span>0</span><span>+12 (1 octave up)</span></div>
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm flex items-center gap-2">Save as
            <select value={format} onChange={(e) => setFormat(e.target.value as any)} className="rounded-lg border border-border bg-background px-2 py-1.5">
              <option value="mp3">MP3</option><option value="wav">WAV</option>
            </select>
          </label>
          <button onClick={run} disabled={!file || busy} className="ml-auto inline-flex items-center gap-2 min-h-12 px-5 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-60">
            <Music2 className="size-4" /> {busy ? "Shifting…" : "Shift pitch"}
          </button>
        </div>
        {out && (
          <div className="rounded-xl border border-border p-4 bg-card/50">
            <div className="text-sm font-medium mb-2 flex items-center gap-2"><Music className="size-4" /> Preview</div>
            <audio src={out} controls className="w-full" />
          </div>
        )}
      </div>
      <HowItWorks><p>Pick a song or voice clip, drag the slider to shift the pitch up or down in half‑steps, then save. The length of the audio stays the same.</p></HowItWorks>
    </ToolLayout>
  );
}
