import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Rewind, Music } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks, ErrorBox } from "../components/ToolControls";
import {
  decodeAudioFile, reverseBuffer, audioBufferToMp3, audioBufferToWav, downloadBlob,
} from "../lib/audio-helpers";

export const Route = createFileRoute("/audio-reverser")({
  head: () => ({
    meta: [
      { title: "Audio Reverser — Play MP3 Backwards Online Free" },
      { name: "description", content: "Reverse any MP3, WAV or M4A clip in your browser — fun voice effects, hidden lyrics, sound design. No upload, no signup." },
      { property: "og:title", content: "Audio Reverser — Bluebird" },
      { property: "og:description", content: "Play sounds backwards on your device." },
    ],
    links: [{ rel: "canonical", href: "/audio-reverser" }],
  }),
  component: Page,
});

function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [out, setOut] = useState<string | null>(null);
  const [format, setFormat] = useState<"mp3" | "wav">("mp3");

  async function run() {
    if (!file) return;
    setBusy(true); setErr(null);
    try {
      const buffer = await decodeAudioFile(file);
      const rev = reverseBuffer(buffer);
      const blob = format === "mp3" ? audioBufferToMp3(rev) : audioBufferToWav(rev);
      if (out) URL.revokeObjectURL(out);
      setOut(URL.createObjectURL(blob));
      downloadBlob(blob, (file.name.replace(/\.[^.]+$/, "") || "audio") + "-reversed." + format);
    } catch (e: any) { setErr(e?.message || "Could not reverse."); } finally { setBusy(false); }
  }

  return (
    <ToolLayout slug="audio-reverser">
      <div className="soft-card p-5 sm:p-6 space-y-5">
        <label className="block">
          <span className="font-medium">Choose an audio file</span>
          <input type="file" accept="audio/*" className="block mt-2 w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setOut(null); }} />
        </label>
        {err && <ErrorBox>{err}</ErrorBox>}
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm flex items-center gap-2">Save as
            <select value={format} onChange={(e) => setFormat(e.target.value as any)} className="rounded-lg border border-border bg-background px-2 py-1.5">
              <option value="mp3">MP3</option><option value="wav">WAV</option>
            </select>
          </label>
          <button onClick={run} disabled={!file || busy} className="ml-auto inline-flex items-center gap-2 min-h-12 px-5 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-60">
            <Rewind className="size-4" /> {busy ? "Reversing…" : "Reverse audio"}
          </button>
        </div>
        {out && (
          <div className="rounded-xl border border-border p-4 bg-card/50">
            <div className="text-sm font-medium mb-2 flex items-center gap-2"><Music className="size-4" /> Reversed preview</div>
            <audio src={out} controls className="w-full" />
          </div>
        )}
      </div>
      <HowItWorks><p>Pick an audio file and press Reverse. The clip plays from end to start — great for sound effects and music experiments.</p></HowItWorks>
    </ToolLayout>
  );
}
