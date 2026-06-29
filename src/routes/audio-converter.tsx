import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Repeat, Music } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks, ErrorBox } from "../components/ToolControls";
import {
  decodeAudioFile, audioBufferToMp3, audioBufferToWav, downloadBlob,
} from "../lib/audio-helpers";

export const Route = createFileRoute("/audio-converter")({
  head: () => ({
    meta: [
      { title: "Audio Format Converter — MP3, WAV, OGG Online Free" },
      { name: "description", content: "Convert WAV to MP3, M4A to WAV and more — in your browser. Choose bitrate, no upload, no signup." },
      { property: "og:title", content: "Audio Format Converter — Bluebird" },
      { property: "og:description", content: "Switch audio formats without uploading anything." },
    ],
    links: [{ rel: "canonical", href: "/audio-converter" }],
  }),
  component: Page,
});

function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [format, setFormat] = useState<"mp3" | "wav">("mp3");
  const [bitrate, setBitrate] = useState(192);
  const [out, setOut] = useState<string | null>(null);

  async function run() {
    if (!file) return;
    setBusy(true); setErr(null);
    try {
      const buffer = await decodeAudioFile(file);
      const blob = format === "mp3" ? audioBufferToMp3(buffer, bitrate) : audioBufferToWav(buffer);
      if (out) URL.revokeObjectURL(out);
      setOut(URL.createObjectURL(blob));
      downloadBlob(blob, (file.name.replace(/\.[^.]+$/, "") || "audio") + "." + format);
    } catch (e: any) { setErr(e?.message || "Could not convert."); } finally { setBusy(false); }
  }

  return (
    <ToolLayout slug="audio-converter">
      <div className="soft-card p-5 sm:p-6 space-y-5">
        <label className="block">
          <span className="font-medium">Choose an audio file</span>
          <input type="file" accept="audio/*" className="block mt-2 w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setOut(null); }} />
        </label>
        {err && <ErrorBox>{err}</ErrorBox>}
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block text-sm font-medium">Convert to
            <select value={format} onChange={(e) => setFormat(e.target.value as any)} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2">
              <option value="mp3">MP3 (small files, great for sharing)</option>
              <option value="wav">WAV (uncompressed, best for editing)</option>
            </select>
          </label>
          {format === "mp3" && (
            <label className="block text-sm font-medium">Quality
              <select value={bitrate} onChange={(e) => setBitrate(parseInt(e.target.value))} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2">
                <option value={96}>96 kbps — small</option>
                <option value={128}>128 kbps — good</option>
                <option value={192}>192 kbps — high</option>
                <option value={256}>256 kbps — very high</option>
                <option value={320}>320 kbps — best</option>
              </select>
            </label>
          )}
        </div>
        <button onClick={run} disabled={!file || busy} className="inline-flex items-center gap-2 min-h-12 px-5 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-60">
          <Repeat className="size-4" /> {busy ? "Converting…" : "Convert & download"}
        </button>
        {out && (
          <div className="rounded-xl border border-border p-4 bg-card/50">
            <div className="text-sm font-medium mb-2 flex items-center gap-2"><Music className="size-4" /> Preview</div>
            <audio src={out} controls className="w-full" />
          </div>
        )}
      </div>
      <HowItWorks><p>Pick an MP3, WAV, M4A or OGG file, choose the new format and quality, then download — all on your device.</p></HowItWorks>
    </ToolLayout>
  );
}
