import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Volume2, Play, Square, Download, Pause } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/text-to-speech")({
  head: () => ({
    meta: [
      { title: "Text to Speech — Free Online Voice Reader" },
      { name: "description", content: "Turn text into natural-sounding speech with your browser's built-in voices. Adjust speed and pitch, then play or save the audio." },
      { property: "og:title", content: "Text to Speech — Bluebird" },
      { property: "og:description", content: "Free, private text-to-speech in your browser." },
      { property: "og:url", content: "/text-to-speech" },
    ],
    links: [{ rel: "canonical", href: "/text-to-speech" }],
  }),
  component: Page,
});

function Page() {
  const [text, setText] = useState("Welcome to Bluebird. Type or paste anything here, then press play to hear it read aloud.");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voice, setVoice] = useState<string>("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    if (!supported) return;
    const load = () => {
      const list = window.speechSynthesis.getVoices();
      setVoices(list);
      if (!voice && list.length) {
        const en = list.find((v) => v.lang.startsWith("en") && v.default) || list.find((v) => v.lang.startsWith("en")) || list[0];
        setVoice(en.voiceURI);
      }
    };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supported]);

  function play() {
    if (!supported || !text.trim()) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = voices.find((vc) => vc.voiceURI === voice);
    if (v) u.voice = v;
    u.rate = rate;
    u.pitch = pitch;
    u.onend = () => { setSpeaking(false); setPaused(false); };
    u.onerror = () => { setSpeaking(false); setPaused(false); };
    utterRef.current = u;
    window.speechSynthesis.speak(u);
    setSpeaking(true);
    setPaused(false);
  }
  function toggle() {
    if (!supported) return;
    if (window.speechSynthesis.paused) { window.speechSynthesis.resume(); setPaused(false); }
    else if (window.speechSynthesis.speaking) { window.speechSynthesis.pause(); setPaused(true); }
  }
  function stop() {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false); setPaused(false);
  }

  const grouped = useMemo(() => {
    const map = new Map<string, SpeechSynthesisVoice[]>();
    for (const v of voices) {
      const lang = v.lang || "Other";
      if (!map.has(lang)) map.set(lang, []);
      map.get(lang)!.push(v);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [voices]);

  return (
    <ToolLayout slug="text-to-speech">
      {!supported && (
        <div className="soft-card p-5 border-amber-500/50 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 mb-6">
          Your browser doesn't support speech synthesis. Try the latest Chrome, Edge or Safari.
        </div>
      )}
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-3">
          <label htmlFor="tts-text" className="block text-sm font-medium">Text to read</label>
          <textarea
            id="tts-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full min-h-72 rounded-2xl border border-border bg-card p-4 text-base focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="text-xs text-muted-foreground">{text.length.toLocaleString()} characters</div>
          <div className="flex flex-wrap gap-2 pt-2">
            <button onClick={play} disabled={!supported || !text.trim()} className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 px-4 py-2.5 rounded-xl font-medium min-h-12">
              <Play className="size-4" /> {speaking ? "Restart" : "Play"}
            </button>
            <button onClick={toggle} disabled={!speaking} className="inline-flex items-center gap-2 border border-border hover:bg-primary-soft disabled:opacity-50 px-4 py-2.5 rounded-xl font-medium min-h-12">
              {paused ? <Play className="size-4" /> : <Pause className="size-4" />} {paused ? "Resume" : "Pause"}
            </button>
            <button onClick={stop} disabled={!speaking} className="inline-flex items-center gap-2 border border-border hover:bg-primary-soft disabled:opacity-50 px-4 py-2.5 rounded-xl font-medium min-h-12">
              <Square className="size-4" /> Stop
            </button>
          </div>
        </section>
        <section className="soft-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Volume2 className="size-5 text-primary" />
            <h2 className="font-display text-lg">Voice & speed</h2>
          </div>
          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Voice</span>
            <select
              value={voice} onChange={(e) => setVoice(e.target.value)}
              className="w-full h-12 rounded-xl border border-border bg-card px-3 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {grouped.map(([lang, list]) => (
                <optgroup key={lang} label={lang}>
                  {list.map((v) => (<option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>))}
                </optgroup>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="flex justify-between text-sm font-medium mb-1.5"><span>Speed</span><span className="text-muted-foreground">{rate.toFixed(2)}×</span></span>
            <input type="range" min={0.5} max={2} step={0.05} value={rate} onChange={(e) => setRate(+e.target.value)} className="w-full accent-primary" />
          </label>
          <label className="block">
            <span className="flex justify-between text-sm font-medium mb-1.5"><span>Pitch</span><span className="text-muted-foreground">{pitch.toFixed(2)}</span></span>
            <input type="range" min={0} max={2} step={0.05} value={pitch} onChange={(e) => setPitch(+e.target.value)} className="w-full accent-primary" />
          </label>
          <div className="flex items-start gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
            <Download className="size-4 shrink-0 mt-0.5" />
            <span>Voices are provided by your operating system, so they sound different on Windows, Mac, iPhone and Android.</span>
          </div>
        </section>
      </div>
      <HowItWorks>
        <li>Type or paste any text into the big box.</li>
        <li>Pick a voice and tune the speed and pitch.</li>
        <li>Press Play to hear it read aloud — pause and resume anytime.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
