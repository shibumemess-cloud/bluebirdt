import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Waves, Music } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks, ErrorBox } from "../components/ToolControls";
import {
  decodeAudioFile, crossfadeBuffers, audioBufferToMp3, audioBufferToWav, downloadBlob,
} from "../lib/audio-helpers";

export const Route = createFileRoute("/audio-crossfade")({
  head: () => ({
    meta: [
      { title: "Audio Crossfade — Smoothly Join Two MP3s Online Free" },
      { name: "description", content: "Blend the end of one audio clip into the start of another with an adjustable crossfade. In your browser, no upload, no signup." },
      { property: "og:title", content: "Audio Crossfade — Bluebird" },
      { property: "og:description", content: "Smooth audio transitions privately." },
    ],
    links: [{ rel: "canonical", href: "/audio-crossfade" }],
  }),
  component: Page,
});

function Page() {
  const [a, setA] = useState<File | null>(null);
  const [b, setB] = useState<File | null>(null);
  const [fade, setFade] = useState(3);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [out, setOut] = useState<string | null>(null);
  const [format, setFormat] = useState<"mp3" | "wav">("mp3");

  async function run() {
    if (!a || !b) return;
    setBusy(true); setErr(null);
    try {
      const bufA = await decodeAudioFile(a);
      const bufB = await decodeAudioFile(b);
      if (bufA.sampleRate !== bufB.sampleRate) {
        setErr(`Sample rates don't match (${bufA.sampleRate} vs ${bufB.sampleRate}). Convert both files to the same rate first.`);
        return;
      }
      const merged = crossfadeBuffers(bufA, bufB, fade);
      const blob = format === "mp3" ? audioBufferToMp3(merged) : audioBufferToWav(merged);
      if (out) URL.revokeObjectURL(out);
      setOut(URL.createObjectURL(blob));
      downloadBlob(blob, "crossfade." + format);
    } catch (e: any) { setErr(e?.message || "Could not crossfade."); } finally { setBusy(false); }
  }

  return (
    <ToolLayout slug="audio-crossfade">
      <div className="soft-card p-5 sm:p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="font-medium">First clip</span>
            <input type="file" accept="audio/*" className="block mt-2 w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground" onChange={(e) => setA(e.target.files?.[0] ?? null)} />
          </label>
          <label className="block">
            <span className="font-medium">Second clip</span>
            <input type="file" accept="audio/*" className="block mt-2 w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground" onChange={(e) => setB(e.target.files?.[0] ?? null)} />
          </label>
        </div>
        {err && <ErrorBox>{err}</ErrorBox>}
        <label className="block">
          <span className="text-sm font-medium">Crossfade length: <span className="num">{fade.toFixed(1)} sec</span></span>
          <input type="range" min={0.2} max={10} step={0.1} value={fade} onChange={(e) => setFade(parseFloat(e.target.value))} className="w-full mt-2" />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm flex items-center gap-2">Save as
            <select value={format} onChange={(e) => setFormat(e.target.value as any)} className="rounded-lg border border-border bg-background px-2 py-1.5">
              <option value="mp3">MP3</option><option value="wav">WAV</option>
            </select>
          </label>
          <button onClick={run} disabled={!a || !b || busy} className="ml-auto inline-flex items-center gap-2 min-h-12 px-5 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-60">
            <Waves className="size-4" /> {busy ? "Blending…" : "Crossfade & download"}
          </button>
        </div>
        {out && (
          <div className="rounded-xl border border-border p-4 bg-card/50">
            <div className="text-sm font-medium mb-2 flex items-center gap-2"><Music className="size-4" /> Preview</div>
            <audio src={out} controls className="w-full" />
          </div>
        )}
      </div>
      <HowItWorks><p>Pick two clips, choose how long the blend should be, then save. The first clip fades out while the second fades in — a classic DJ transition.</p></HowItWorks>
    </ToolLayout>
  );
}
