import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, ArrowDownUp, Volume2 } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/nato-phonetic")({
  head: () => ({
    meta: [
      { title: "NATO Phonetic Alphabet Translator — Free Online" },
      { name: "description", content: "Convert any text to the NATO phonetic alphabet (Alpha, Bravo, Charlie…) and back. Read it aloud, copy or share — perfect for spelling on calls." },
      { property: "og:title", content: "NATO Phonetic Alphabet — Bluebird" },
      { property: "og:description", content: "Spell anything clearly with NATO phonetics." },
      { property: "og:url", content: "/nato-phonetic" },
    ],
    links: [{ rel: "canonical", href: "/nato-phonetic" }],
  }),
  component: Page,
});

const NATO: Record<string, string> = {
  a: "Alfa", b: "Bravo", c: "Charlie", d: "Delta", e: "Echo", f: "Foxtrot", g: "Golf",
  h: "Hotel", i: "India", j: "Juliett", k: "Kilo", l: "Lima", m: "Mike", n: "November",
  o: "Oscar", p: "Papa", q: "Quebec", r: "Romeo", s: "Sierra", t: "Tango", u: "Uniform",
  v: "Victor", w: "Whiskey", x: "X-ray", y: "Yankee", z: "Zulu",
  "0": "Zero", "1": "One", "2": "Two", "3": "Three", "4": "Four",
  "5": "Five", "6": "Six", "7": "Seven", "8": "Eight", "9": "Nine",
};
const REV: Record<string, string> = Object.fromEntries(Object.entries(NATO).map(([k, v]) => [v.toLowerCase(), k.toUpperCase()]));

function toNato(s: string) {
  const tokens = Array.from(s);
  const out: string[] = [];
  for (const c of tokens) {
    const w = NATO[c.toLowerCase()];
    if (w) out.push(w);
    else if (c === " ") out.push("(space)");
    else if (c === "\n") out.push("\n");
    else if (/\S/.test(c)) out.push(c);
  }
  return out.join(" ");
}
function fromNato(s: string) {
  return s.split(/\s+/).map((w) => REV[w.toLowerCase()] || w).join("");
}

function Page() {
  const [mode, setMode] = useState<"to" | "from">("to");
  const [input, setInput] = useState("Bluebird 42");
  const output = useMemo(() => (mode === "to" ? toNato(input) : fromNato(input)), [mode, input]);

  function speak() {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(output);
    u.rate = 0.85;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }

  return (
    <ToolLayout slug="nato-phonetic">
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="soft-card p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="eyebrow">{mode === "to" ? "Text" : "NATO words"}</div>
            <button onClick={() => { setMode((m) => (m === "to" ? "from" : "to")); setInput(output); }}
              className="min-h-10 px-3 rounded-lg border border-border bg-card hover:border-primary inline-flex items-center gap-2 text-sm">
              <ArrowDownUp className="size-4" /> Swap
            </button>
          </div>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={8}
            aria-label="Input"
            className="w-full rounded-xl border border-border bg-card p-3 text-lg focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="soft-card p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="eyebrow">{mode === "to" ? "NATO" : "Text"}</div>
            <div className="flex gap-2">
              {mode === "to" && (
                <button onClick={speak} disabled={!output}
                  className="min-h-10 px-3 rounded-lg border border-border bg-card hover:border-primary inline-flex items-center gap-2 text-sm disabled:opacity-50">
                  <Volume2 className="size-4" /> Speak
                </button>
              )}
              <button onClick={() => navigator.clipboard.writeText(output)} disabled={!output}
                className="min-h-10 px-3 rounded-lg border border-border bg-card hover:border-primary inline-flex items-center gap-2 text-sm disabled:opacity-50">
                <Copy className="size-4" /> Copy
              </button>
            </div>
          </div>
          <div aria-live="polite" className="min-h-[12rem] rounded-xl border border-border bg-card p-3 whitespace-pre-wrap leading-relaxed">
            {output || <span className="text-muted-foreground">Translation appears here.</span>}
          </div>
        </div>
      </div>

      <div className="soft-card p-4 sm:p-5 mt-5">
        <div className="eyebrow mb-3">Full alphabet</div>
        <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-9 gap-2">
          {Object.entries(NATO).map(([k, v]) => (
            <div key={k} className="rounded-lg border border-border bg-card p-2 text-center">
              <div className="font-display text-lg uppercase">{k}</div>
              <div className="text-xs text-muted-foreground">{v}</div>
            </div>
          ))}
        </div>
      </div>

      <HowItWorks>
        <li>Type anything you need to spell out on a call.</li>
        <li>Tap Speak to hear it pronounced clearly.</li>
        <li>Use Swap to decode NATO words back to text.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
