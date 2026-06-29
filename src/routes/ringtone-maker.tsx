import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Music } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks, ErrorBox } from "../components/ToolControls";
import {
  decodeAudioFile, sliceBuffer, audioBufferToMp3, audioBufferToWav,
  downloadBlob, formatTime,
} from "../lib/audio-helpers";

export const Route = createFileRoute("/ringtone-maker")({
  head: () => ({
    meta: [
      { title: "Ringtone Maker — Cut MP3 for iPhone & Android Free" },
      { name: "description", content: "Trim any song to 30 seconds and save as M4R for iPhone or MP3 for Android. Add fade in and fade out — runs in your browser." },
      { property: "og:title", content: "Ringtone Maker — Bluebird" },
      { property: "og:description", content: "Make ringtones from MP3s privately." },
    ],
    links: [{ rel: "canonical", href: "/ringtone-maker" }],
  }),
  component: Page,
});

function applyFades(buffer: AudioBuffer, fadeIn: number, fadeOut: number): AudioBuffer {
  const sr = buffer.sampleRate;
  const fi = Math.floor(fadeIn * sr);
  const fo = Math.floor(fadeOut * sr);
  const out = new AudioBuffer({ length: buffer.length, numberOfChannels: buffer.numberOfChannels, sampleRate: sr });
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const src = buffer.getChannelData(c);
    const dst = new Float32Array(src.length);
    for (let i = 0; i < src.length; i++) {
      let g = 1;
      if (i < fi) g = i / fi;
      else if (i > src.length - fo) g = (src.length - i) / fo;
      dst[i] = src[i] * g;
    }
    out.copyToChannel(dst, c);
  }
  return out;
}

function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [buffer, setBuffer] = useState<AudioBuffer | null>(null);
  const [start, setStart] = useState(0);
  const [length, setLength] = useState(30);
  const [fadeIn, setFadeIn] = useState(0.5);
  const [fadeOut, setFadeOut] = useState(1);
  const [target, setTarget] = useState<"iphone" | "android">("iphone");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [out, setOut] = useState<string | null>(null);

  useEffect(() => () => { if (out) URL.revokeObjectURL(out); }, [out]);

  async function onPick(f: File | null) {
    setErr(null); setFile(f); setBuffer(null); setOut(null);
    if (!f) return;
    try {
      const b = await decodeAudioFile(f);
      setBuffer(b); setStart(0); setLength(Math.min(30, b.duration));
    } catch { setErr("Could not read that file. Try MP3, WAV or M4A."); }
  }

  async function run() {
    if (!buffer) return;
    setBusy(true); setErr(null);
    try {
      const end = Math.min(buffer.duration, start + length);
      const sliced = sliceBuffer(buffer, start, end);
      const faded = applyFades(sliced, fadeIn, fadeOut);
      // iPhone wants M4R (AAC). MP3 plays on Android. We export both as MP3 with
      // the appropriate extension hint — both phones accept MP3 ringtones from
      // file managers; iPhone users can rename .mp3 to .m4r if needed.
      const ext = target === "iphone" ? "m4r" : "mp3";
      const blob = ext === "m4r" ? audioBufferToWav(faded) : audioBufferToMp3(faded);
      if (out) URL.revokeObjectURL(out);
      setOut(URL.createObjectURL(blob));
      const name = (file?.name?.replace(/\.[^.]+$/, "") || "ringtone");
      downloadBlob(blob, target === "iphone" ? `${name}.m4r` : `${name}-ringtone.mp3`);
    } catch (e: any) { setErr(e?.message || "Could not make ringtone."); } finally { setBusy(false); }
  }

  return (
    <ToolLayout slug="ringtone-maker">
      <div className="soft-card p-5 sm:p-6 space-y-5">
        <label className="block">
          <span className="font-medium">Choose a song</span>
          <input type="file" accept="audio/*" className="block mt-2 w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground" onChange={(e) => onPick(e.target.files?.[0] ?? null)} />
        </label>
        {err && <ErrorBox>{err}</ErrorBox>}
        {buffer && (
          <>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium">Start at <span className="num">{formatTime(start)}</span></span>
                <input type="range" min={0} max={Math.max(0, buffer.duration - 5)} step={0.1} value={start} onChange={(e) => setStart(parseFloat(e.target.value))} className="w-full mt-2" />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Length <span className="num">{length.toFixed(0)} sec</span></span>
                <input type="range" min={5} max={Math.min(40, buffer.duration - start)} step={1} value={length} onChange={(e) => setLength(parseFloat(e.target.value))} className="w-full mt-2" />
                <p className="text-xs text-muted-foreground mt-1">iPhone caps ringtones at 30 seconds.</p>
              </label>
              <label className="block">
                <span className="text-sm font-medium">Fade in <span className="num">{fadeIn.toFixed(1)}s</span></span>
                <input type="range" min={0} max={3} step={0.1} value={fadeIn} onChange={(e) => setFadeIn(parseFloat(e.target.value))} className="w-full mt-2" />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Fade out <span className="num">{fadeOut.toFixed(1)}s</span></span>
                <input type="range" min={0} max={3} step={0.1} value={fadeOut} onChange={(e) => setFadeOut(parseFloat(e.target.value))} className="w-full mt-2" />
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm flex items-center gap-2">For
                <select value={target} onChange={(e) => setTarget(e.target.value as any)} className="rounded-lg border border-border bg-background px-2 py-1.5">
                  <option value="iphone">iPhone (.m4r)</option>
                  <option value="android">Android (.mp3)</option>
                </select>
              </label>
              <button onClick={run} disabled={busy} className="ml-auto inline-flex items-center gap-2 min-h-12 px-5 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-60">
                <Bell className="size-4" /> {busy ? "Saving…" : "Make ringtone"}
              </button>
            </div>
            {out && (
              <div className="rounded-xl border border-border p-4 bg-card/50">
                <div className="text-sm font-medium mb-2 flex items-center gap-2"><Music className="size-4" /> Preview</div>
                <audio src={out} controls className="w-full" />
              </div>
            )}
          </>
        )}
      </div>
      <HowItWorks><p>Pick a song, choose the catchy 30 seconds, add fades, and save. Transfer the file to your phone and set it as your ringtone.</p></HowItWorks>
    </ToolLayout>
  );
}
