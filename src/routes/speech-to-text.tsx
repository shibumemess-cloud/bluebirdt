import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Mic, Square as StopIcon, Copy, Download, Trash2 } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks, WarnBox } from "../components/ToolControls";

export const Route = createFileRoute("/speech-to-text")({
  head: () => ({
    meta: [
      { title: "Speech to Text — Free Online Voice Typing" },
      { name: "description", content: "Talk and watch your words appear. Free voice-to-text in your browser — no signup, no uploads. Copy or download the transcript." },
      { property: "og:title", content: "Speech to Text — Bluebird" },
      { property: "og:description", content: "Voice typing with live transcription. Private and free." },
      { property: "og:url", content: "/speech-to-text" },
    ],
    links: [{ rel: "canonical", href: "/speech-to-text" }],
  }),
  component: Page,
});

const LANGS = [
  ["en-US", "English (US)"], ["en-GB", "English (UK)"], ["en-IN", "English (India)"],
  ["es-ES", "Spanish"], ["fr-FR", "French"], ["de-DE", "German"], ["it-IT", "Italian"],
  ["pt-BR", "Portuguese (BR)"], ["hi-IN", "Hindi"], ["ja-JP", "Japanese"],
  ["ko-KR", "Korean"], ["zh-CN", "Chinese (Simplified)"], ["ar-SA", "Arabic"],
  ["ru-RU", "Russian"], ["nl-NL", "Dutch"],
] as const;

function Page() {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [lang, setLang] = useState("en-US");
  const [text, setText] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<any>(null);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) setSupported(false);
  }, []);

  function start() {
    setError(null);
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = lang;
    rec.onresult = (e: any) => {
      let finalChunk = "";
      let interimChunk = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalChunk += r[0].transcript;
        else interimChunk += r[0].transcript;
      }
      if (finalChunk) setText((t) => (t ? t + " " : "") + finalChunk.trim());
      setInterim(interimChunk);
    };
    rec.onerror = (e: any) => setError(e.error === "not-allowed" ? "Microphone access was blocked. Allow it in your browser settings and try again." : `Recognition error: ${e.error}`);
    rec.onend = () => { setListening(false); setInterim(""); };
    try { rec.start(); setListening(true); recRef.current = rec; }
    catch (err: any) { setError(err.message || "Could not start recognition."); }
  }
  function stop() { try { recRef.current?.stop(); } catch {} setListening(false); }
  function copy() { navigator.clipboard.writeText(text); }
  function download() {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "transcript.txt"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <ToolLayout slug="speech-to-text">
      <div className="space-y-5">
        {!supported && (
          <WarnBox>
            Your browser doesn't support speech recognition. Try the latest Chrome, Edge, or Safari on desktop.
          </WarnBox>
        )}
        {error && <WarnBox>{error}</WarnBox>}

        <div className="soft-card p-4 sm:p-5 grid sm:grid-cols-[1fr_auto] gap-3 items-end">
          <label className="block">
            <span className="eyebrow block mb-1.5">Language</span>
            <select value={lang} onChange={(e) => setLang(e.target.value)} disabled={listening}
              className="min-h-11 w-full rounded-xl border border-border bg-card px-3 focus:outline-none focus:ring-2 focus:ring-ring">
              {LANGS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          {!listening ? (
            <button onClick={start} disabled={!supported}
              className="min-h-12 px-5 rounded-xl bg-primary text-primary-foreground font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50">
              <Mic className="size-5" /> Start talking
            </button>
          ) : (
            <button onClick={stop}
              className="min-h-12 px-5 rounded-xl bg-rose-600 text-white font-semibold inline-flex items-center justify-center gap-2">
              <StopIcon className="size-5" /> Stop
            </button>
          )}
        </div>

        <div className="soft-card p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="eyebrow flex items-center gap-2">
              {listening && <span className="size-2 rounded-full bg-rose-500 animate-pulse" aria-hidden />}
              {listening ? "Listening…" : "Transcript"}
            </div>
            <div className="text-xs text-muted-foreground tabular-nums">{words} words</div>
          </div>
          <div aria-live="polite" className="min-h-[12rem] rounded-xl border border-border bg-card p-3 text-base leading-relaxed whitespace-pre-wrap">
            {text}
            {interim && <span className="text-muted-foreground"> {interim}</span>}
            {!text && !interim && <span className="text-muted-foreground">Your words will appear here as you speak.</span>}
          </div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5}
            aria-label="Edit transcript"
            className="w-full rounded-xl border border-border bg-card p-3 focus:outline-none focus:ring-2 focus:ring-ring" />
          <div className="flex flex-wrap gap-2">
            <button onClick={copy} disabled={!text}
              className="min-h-11 px-4 rounded-xl border border-border bg-card hover:border-primary inline-flex items-center gap-2 disabled:opacity-50">
              <Copy className="size-4" /> Copy
            </button>
            <button onClick={download} disabled={!text}
              className="min-h-11 px-4 rounded-xl border border-border bg-card hover:border-primary inline-flex items-center gap-2 disabled:opacity-50">
              <Download className="size-4" /> Download .txt
            </button>
            <button onClick={() => { setText(""); setInterim(""); }} disabled={!text}
              className="min-h-11 px-4 rounded-xl border border-border bg-card hover:border-primary inline-flex items-center gap-2 disabled:opacity-50">
              <Trash2 className="size-4" /> Clear
            </button>
          </div>
        </div>
      </div>

      <HowItWorks>
        <li>Choose your language and tap Start talking.</li>
        <li>Allow microphone access when your browser asks.</li>
        <li>Words appear live — edit, copy or download when done.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
