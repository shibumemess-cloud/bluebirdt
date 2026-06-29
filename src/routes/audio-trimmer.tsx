import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Scissors, Download, Music } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks, ErrorBox } from "../components/ToolControls";
import {
  decodeAudioFile, sliceBuffer, audioBufferToWav, audioBufferToMp3,
  downloadBlob, formatTime,
} from "../lib/audio-helpers";

export const Route = createFileRoute("/audio-trimmer")({
  head: () => ({
    meta: [
      { title: "Audio Trimmer — Cut MP3 & WAV Online Free" },
      { name: "description", content: "Trim MP3, WAV, M4A and OGG files right in your browser. Pick start and end, preview, then download. No upload, no signup." },
      { property: "og:title", content: "Audio Trimmer — Bluebird" },
      { property: "og:description", content: "Cut audio files in your browser — free, private, no signup." },
    ],
    links: [{ rel: "canonical", href: "/audio-trimmer" }],
  }),
  component: Page,
});

function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [buffer, setBuffer] = useState<AudioBuffer | null>(null);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [format, setFormat] = useState<"mp3" | "wav">("mp3");
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  async function onPick(f: File | null) {
    setErr(null); setFile(f); setBuffer(null); setPreviewUrl(null);
    if (!f) return;
    try {
      const b = await decodeAudioFile(f);
      setBuffer(b); setStart(0); setEnd(b.duration);
    } catch (e) { setErr("Could not read that audio file. Try MP3, WAV, M4A or OGG."); }
  }

  async function run() {
    if (!buffer) return;
    setBusy(true); setErr(null);
    try {
      const sliced = sliceBuffer(buffer, start, Math.max(start + 0.05, end));
      const blob = format === "mp3" ? audioBufferToMp3(sliced) : audioBufferToWav(sliced);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(blob));
      downloadBlob(blob, (file?.name?.replace(/\.[^.]+$/, "") || "audio") + "-trim." + format);
    } catch (e: any) { setErr(e?.message || "Could not trim."); } finally { setBusy(false); }
  }

  return (
    <ToolLayout slug="audio-trimmer">
      <div className="soft-card p-5 sm:p-6 space-y-5">
        <label className="block">
          <span className="font-medium">Choose an audio file</span>
          <input type="file" accept="audio/*" className="block mt-2 w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground" onChange={(e) => onPick(e.target.files?.[0] ?? null)} />
        </label>
        {err && <ErrorBox>{err}</ErrorBox>}
        {buffer && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium">Start ({formatTime(start)})</span>
                <input type="range" min={0} max={buffer.duration} step={0.01} value={start} onChange={(e) => setStart(Math.min(parseFloat(e.target.value), end - 0.05))} className="w-full mt-2" />
              </label>
              <label className="block">
                <span className="text-sm font-medium">End ({formatTime(end)})</span>
                <input type="range" min={0} max={buffer.duration} step={0.01} value={end} onChange={(e) => setEnd(Math.max(parseFloat(e.target.value), start + 0.05))} className="w-full mt-2" />
              </label>
            </div>
            <p className="text-sm text-muted-foreground">Selection: <span className="num">{formatTime(end - start)}</span> of <span className="num">{formatTime(buffer.duration)}</span></p>
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm flex items-center gap-2">Save as
                <select value={format} onChange={(e) => setFormat(e.target.value as any)} className="rounded-lg border border-border bg-background px-2 py-1.5">
                  <option value="mp3">MP3</option><option value="wav">WAV</option>
                </select>
              </label>
              <button onClick={run} disabled={busy} className="ml-auto inline-flex items-center gap-2 min-h-12 px-5 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-60">
                <Scissors className="size-4" /> {busy ? "Trimming…" : "Trim & download"}
              </button>
            </div>
            {previewUrl && (
              <div className="rounded-xl border border-border p-4 bg-card/50">
                <div className="text-sm font-medium mb-2 flex items-center gap-2"><Music className="size-4" /> Preview</div>
                <audio ref={audioRef} src={previewUrl} controls className="w-full" />
                <a href={previewUrl} download className="mt-2 inline-flex items-center gap-1 text-sm text-primary"><Download className="size-4" /> Download again</a>
              </div>
            )}
          </div>
        )}
      </div>
      <HowItWorks>
        <p>Choose an audio file, drag the start and end sliders to the part you want, then save. Everything happens in your browser — your audio is never uploaded.</p>
      </HowItWorks>
    </ToolLayout>
  );
}
