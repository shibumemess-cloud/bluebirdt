import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Combine, X } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks, ErrorBox } from "../components/ToolControls";
import {
  decodeAudioFile, concatBuffers, audioBufferToMp3, audioBufferToWav,
  downloadBlob, formatTime,
} from "../lib/audio-helpers";

export const Route = createFileRoute("/audio-merger")({
  head: () => ({
    meta: [
      { title: "Audio Merger — Join MP3 & WAV Files Online Free" },
      { name: "description", content: "Combine multiple MP3, WAV, M4A and OGG files into one — in the right order, in your browser. No upload, no signup." },
      { property: "og:title", content: "Audio Merger — Bluebird" },
      { property: "og:description", content: "Join audio files in your browser — free and private." },
    ],
    links: [{ rel: "canonical", href: "/audio-merger" }],
  }),
  component: Page,
});

type Item = { file: File; buffer: AudioBuffer };

function Page() {
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [format, setFormat] = useState<"mp3" | "wav">("mp3");

  async function add(files: FileList | null) {
    if (!files) return;
    setErr(null);
    try {
      const next: Item[] = [];
      for (const f of Array.from(files)) {
        const buffer = await decodeAudioFile(f);
        next.push({ file: f, buffer });
      }
      setItems((cur) => [...cur, ...next]);
    } catch { setErr("One of those files could not be read."); }
  }

  function move(i: number, dir: -1 | 1) {
    setItems((cur) => {
      const j = i + dir;
      if (j < 0 || j >= cur.length) return cur;
      const n = cur.slice();
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  }

  async function run() {
    if (items.length < 2) { setErr("Add at least two files."); return; }
    setBusy(true); setErr(null);
    try {
      const merged = concatBuffers(items.map((i) => i.buffer));
      const blob = format === "mp3" ? audioBufferToMp3(merged) : audioBufferToWav(merged);
      downloadBlob(blob, "merged." + format);
    } catch (e: any) { setErr(e?.message || "Could not merge."); } finally { setBusy(false); }
  }

  const total = items.reduce((s, i) => s + i.buffer.duration, 0);

  return (
    <ToolLayout slug="audio-merger">
      <div className="soft-card p-5 sm:p-6 space-y-5">
        <label className="block">
          <span className="font-medium">Add audio files (you can pick several)</span>
          <input type="file" accept="audio/*" multiple className="block mt-2 w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground" onChange={(e) => add(e.target.files)} />
        </label>
        {err && <ErrorBox>{err}</ErrorBox>}
        {items.length > 0 && (
          <ul className="space-y-2">
            {items.map((it, i) => (
              <li key={i} className="flex items-center gap-2 rounded-lg border border-border bg-card/50 px-3 py-2">
                <span className="text-xs num w-6 text-muted-foreground">{i + 1}.</span>
                <span className="flex-1 truncate text-sm">{it.file.name}</span>
                <span className="text-xs num text-muted-foreground">{formatTime(it.buffer.duration)}</span>
                <button onClick={() => move(i, -1)} className="text-xs px-2 py-1 hover:bg-muted rounded">↑</button>
                <button onClick={() => move(i, 1)} className="text-xs px-2 py-1 hover:bg-muted rounded">↓</button>
                <button onClick={() => setItems((c) => c.filter((_, j) => j !== i))} aria-label="Remove" className="p-1 hover:bg-muted rounded"><X className="size-4" /></button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap items-center gap-3">
          {items.length > 0 && <span className="text-sm text-muted-foreground">Total <span className="num">{formatTime(total)}</span></span>}
          <label className="text-sm flex items-center gap-2 ml-auto">Save as
            <select value={format} onChange={(e) => setFormat(e.target.value as any)} className="rounded-lg border border-border bg-background px-2 py-1.5">
              <option value="mp3">MP3</option><option value="wav">WAV</option>
            </select>
          </label>
          <button onClick={run} disabled={busy || items.length < 2} className="inline-flex items-center gap-2 min-h-12 px-5 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-60">
            <Combine className="size-4" /> {busy ? "Merging…" : "Merge & download"}
          </button>
        </div>
      </div>
      <HowItWorks><p>Add two or more audio files, drag them into the order you want, pick a format, then download the joined clip.</p></HowItWorks>
    </ToolLayout>
  );
}
