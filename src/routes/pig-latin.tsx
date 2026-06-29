import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, ArrowDownUp } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/pig-latin")({
  head: () => ({
    meta: [
      { title: "Pig Latin Translator — Free Online English ⇄ Pig Latin" },
      { name: "description", content: "Translate English to Pig Latin (and back) instantly. Handles punctuation, capitalisation and consonant clusters. No signup." },
      { property: "og:title", content: "Pig Latin Translator — Bluebird" },
      { property: "og:description", content: "Fast, accurate Pig Latin in your browser." },
      { property: "og:url", content: "/pig-latin" },
    ],
    links: [{ rel: "canonical", href: "/pig-latin" }],
  }),
  component: Page,
});

const VOWELS = "aeiouAEIOU";

function toPigLatin(text: string): string {
  return text.replace(/[A-Za-z]+/g, (word) => {
    if (VOWELS.includes(word[0])) return word + "way";
    let i = 0;
    while (i < word.length && !VOWELS.includes(word[i])) i++;
    if (i === word.length) return word + "ay";
    const head = word.slice(0, i);
    const tail = word.slice(i);
    const result = tail + head + "ay";
    if (word[0] === word[0].toUpperCase()) {
      return result[0].toUpperCase() + result.slice(1).toLowerCase();
    }
    return result.toLowerCase();
  });
}

function fromPigLatin(text: string): string {
  return text.replace(/[A-Za-z]+/g, (word) => {
    const lower = word.toLowerCase();
    const isCap = word[0] === word[0].toUpperCase();
    let base = lower;
    if (lower.endsWith("way")) base = lower.slice(0, -3);
    else if (lower.endsWith("ay")) {
      const core = lower.slice(0, -2);
      // last consonant cluster came from the front
      let i = core.length;
      while (i > 0 && !VOWELS.includes(core[i - 1])) i--;
      base = core.slice(i) + core.slice(0, i);
    }
    return isCap ? base[0].toUpperCase() + base.slice(1) : base;
  });
}

function Page() {
  const [mode, setMode] = useState<"to" | "from">("to");
  const [input, setInput] = useState("Hello friend, welcome to Bluebird!");
  const output = useMemo(() => (mode === "to" ? toPigLatin(input) : fromPigLatin(input)), [mode, input]);

  return (
    <ToolLayout slug="pig-latin">
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="soft-card p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="eyebrow">{mode === "to" ? "English" : "Pig Latin"}</div>
            <button onClick={() => { setMode((m) => (m === "to" ? "from" : "to")); setInput(output); }}
              className="min-h-10 px-3 rounded-lg border border-border bg-card hover:border-primary inline-flex items-center gap-2 text-sm">
              <ArrowDownUp className="size-4" /> Swap
            </button>
          </div>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={10}
            aria-label="Input text"
            className="w-full rounded-xl border border-border bg-card p-3 focus:outline-none focus:ring-2 focus:ring-ring leading-relaxed" />
        </div>
        <div className="soft-card p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="eyebrow">{mode === "to" ? "Pig Latin" : "English"}</div>
            <button onClick={() => navigator.clipboard.writeText(output)} disabled={!output}
              className="min-h-10 px-3 rounded-lg border border-border bg-card hover:border-primary inline-flex items-center gap-2 text-sm disabled:opacity-50">
              <Copy className="size-4" /> Copy
            </button>
          </div>
          <div aria-live="polite" className="min-h-[16rem] rounded-xl border border-border bg-card p-3 whitespace-pre-wrap leading-relaxed">
            {output || <span className="text-muted-foreground">Translated text appears here.</span>}
          </div>
        </div>
      </div>

      <div className="soft-card p-4 sm:p-5 mt-5">
        <div className="eyebrow mb-2">The rules</div>
        <ul className="text-sm space-y-1 list-disc pl-5">
          <li>Words starting with a vowel — add <strong>way</strong> (egg → eggway).</li>
          <li>Words starting with consonants — move the consonant cluster to the end and add <strong>ay</strong> (street → eetstray).</li>
          <li>Capitalisation and punctuation are preserved automatically.</li>
        </ul>
      </div>

      <HowItWorks>
        <li>Type or paste your text on the left.</li>
        <li>The translation updates instantly on the right.</li>
        <li>Tap Swap to translate Pig Latin back to English.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
