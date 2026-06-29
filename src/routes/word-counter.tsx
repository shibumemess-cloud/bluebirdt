import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { FileText, ClipboardPaste, Trash2, Copy, Check, Download, Upload } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/word-counter")({
  head: () => ({
    meta: [
      { title: "Word Counter — Free Online Word & Character Count" },
      {
        name: "description",
        content:
          "Count words, characters, sentences, paragraphs and reading time as you type. Free, private and runs in your browser.",
      },
      { property: "og:title", content: "Word Counter — Bluebird" },
      { property: "og:description", content: "Live word, character, sentence and reading-time counter. Free, no sign-up, fully in-browser." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/word-counter" },
    ],
    links: [{ rel: "canonical", href: "/word-counter" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird Word Counter",
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: Page,
});

const MAX_TEXT = 2_000_000; // ~2 MB of text, plenty for any document
const STORAGE_KEY = "bluebird:word-counter:draft";

export function countText(input: string) {
  const chars = input.length;
  const noSpaces = input.replace(/\s+/g, "").length;
  const wordList = input.trim() ? input.trim().split(/\s+/) : [];
  const words = wordList.length;
  const sentences = input.trim() ? (input.match(/[^.!?\n]+[.!?]+|[^.!?\n]+$/g) || []).length : 0;
  const paragraphs = input.trim() ? input.split(/\n\s*\n/).filter((p) => p.trim()).length : 0;
  const lines = input ? input.split(/\r?\n/).length : 0;
  const readingMinutes = words / 225;
  const speakingMinutes = words / 130;
  const avgWordLen = words ? wordList.reduce((s, w) => s + w.length, 0) / words : 0;
  const longest = wordList.reduce((a, b) => (b.length > a.length ? b : a), "");
  return { chars, noSpaces, words, sentences, paragraphs, lines, readingMinutes, speakingMinutes, avgWordLen, longest };
}

function fmtTime(min: number): string {
  if (!isFinite(min) || min < 1 / 60) return "0 sec";
  if (min < 1) return `${Math.round(min * 60)} sec`;
  const m = Math.floor(min);
  const s = Math.round((min - m) * 60);
  return s ? `${m} min ${s} sec` : `${m} min`;
}

function Page() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [restored, setRestored] = useState(false);
  const dropRef = useRef<HTMLDivElement | null>(null);
  const s = useMemo(() => countText(input), [input]);

  // Restore draft once
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) { setInput(saved); setRestored(true); window.setTimeout(() => setRestored(false), 2200); }
    } catch { /* ignore */ }
  }, []);

  // Persist draft (debounced)
  useEffect(() => {
    const t = window.setTimeout(() => {
      try { input ? localStorage.setItem(STORAGE_KEY, input) : localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    }, 400);
    return () => window.clearTimeout(t);
  }, [input]);

  const topWords = useMemo(() => {
    const map = new Map<string, number>();
    for (const w of input.toLowerCase().match(/[a-z0-9']+/gi) || []) {
      if (w.length < 4) continue;
      map.set(w, (map.get(w) || 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [input]);

  function setSafe(v: string) {
    setInput(v.length > MAX_TEXT ? v.slice(0, MAX_TEXT) : v);
  }

  async function paste() {
    try { setSafe(await navigator.clipboard.readText()); } catch { /* ignore */ }
  }
  async function copyStats() {
    const text = `Words: ${s.words} · Characters: ${s.chars} · Sentences: ${s.sentences} · Paragraphs: ${s.paragraphs} · Reading: ${fmtTime(s.readingMinutes)}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }
  function downloadTxt() {
    const blob = new Blob([input], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "text.txt"; a.click();
    URL.revokeObjectURL(url);
  }
  async function loadFile(f: File | null) {
    if (!f) return;
    if (!/^(text\/|application\/(json|xml|x-yaml))/.test(f.type) && !/\.(txt|md|csv|json|log|xml|yml|yaml)$/i.test(f.name)) return;
    if (f.size > MAX_TEXT) return;
    setSafe(await f.text());
  }

  return (
    <ToolLayout slug="word-counter">
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <section
          className="soft-card p-5 sm:p-6 space-y-4"
          ref={dropRef}
          onDragOver={(e) => { e.preventDefault(); }}
          onDrop={(e) => { e.preventDefault(); void loadFile(e.dataTransfer.files?.[0] || null); }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label htmlFor="wc-input" className="eyebrow">Your text {restored && <span className="ml-2 text-primary normal-case tracking-normal">· Draft restored</span>}</label>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs cursor-pointer">
                <Upload className="size-3.5" /> Load file
                <input type="file" accept=".txt,.md,.csv,.json,.log,.xml,.yml,.yaml,text/*" className="sr-only" onChange={(e) => loadFile(e.target.files?.[0] || null)} />
              </label>
              <button onClick={paste} className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs">
                <ClipboardPaste className="size-3.5" /> Paste
              </button>
              {input && (
                <button onClick={() => setInput("")} className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs">
                  <Trash2 className="size-3.5" /> Clear
                </button>
              )}
            </div>
          </div>
          <textarea
            id="wc-input"
            value={input}
            onChange={(e) => setSafe(e.target.value)}
            placeholder="Start typing, paste, or drop a .txt file here…"
            className="w-full min-h-[420px] rounded-xl border border-border bg-card p-3 text-[15px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24 self-start">
          <div className="soft-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="size-4 text-primary" />
              <div className="font-display text-lg">Live counts</div>
            </div>
            <dl className="grid grid-cols-2 gap-2 text-sm" aria-live="polite">
              <Stat label="Words" value={s.words} />
              <Stat label="Characters" value={s.chars} />
              <Stat label="No spaces" value={s.noSpaces} />
              <Stat label="Sentences" value={s.sentences} />
              <Stat label="Paragraphs" value={s.paragraphs} />
              <Stat label="Lines" value={s.lines} />
            </dl>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg bg-primary-soft p-2.5">
                <div className="text-xs text-muted-foreground">Reading time</div>
                <div className="font-display">{fmtTime(s.readingMinutes)}</div>
              </div>
              <div className="rounded-lg bg-primary-soft p-2.5">
                <div className="text-xs text-muted-foreground">Speaking time</div>
                <div className="font-display">{fmtTime(s.speakingMinutes)}</div>
              </div>
              <div className="rounded-lg border border-border bg-card p-2.5">
                <div className="text-xs text-muted-foreground">Avg word length</div>
                <div className="font-display">{s.avgWordLen ? s.avgWordLen.toFixed(1) : "0"}</div>
              </div>
              <div className="rounded-lg border border-border bg-card p-2.5 min-w-0">
                <div className="text-xs text-muted-foreground">Longest word</div>
                <div className="font-display truncate" title={s.longest || ""}>{s.longest || "—"}</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={copyStats}
                disabled={!input}
                className="inline-flex items-center justify-center gap-2 min-h-11 px-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-95 disabled:opacity-50"
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied ? "Copied" : "Copy stats"}
              </button>
              <button
                onClick={downloadTxt}
                disabled={!input}
                className="inline-flex items-center justify-center gap-2 min-h-11 px-3 rounded-xl border border-border bg-card text-sm font-medium hover:bg-primary-soft disabled:opacity-50"
              >
                <Download className="size-4" /> Save .txt
              </button>
            </div>
          </div>

          {topWords.length > 0 && (
            <div className="soft-card p-5">
              <div className="eyebrow mb-3">Top words</div>
              <ul className="space-y-1.5 text-sm">
                {topWords.map(([w, n]) => (
                  <li key={w} className="flex justify-between">
                    <span className="truncate">{w}</span>
                    <span className="text-muted-foreground">{n}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      <HowItWorks>
        <li>Type, paste, or drop a text file into the box.</li>
        <li>Counts and reading time update instantly as you write.</li>
        <li>Your draft is saved on this device only — never uploaded.</li>
      </HowItWorks>
    </ToolLayout>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-2.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-display text-lg">{value.toLocaleString()}</dd>
    </div>
  );
}
