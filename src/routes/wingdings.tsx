import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, ArrowDownUp } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/wingdings")({
  head: () => ({
    meta: [
      { title: "Wingdings Translator — Free English ⇄ Wingdings Online" },
      { name: "description", content: "Translate text to Wingdings symbols and back. Visual reference for every letter and digit. Copy and share instantly." },
      { property: "og:title", content: "Wingdings Translator — Bluebird" },
      { property: "og:description", content: "Convert any text to Wingdings symbols in a click." },
      { property: "og:url", content: "/wingdings" },
    ],
    links: [{ rel: "canonical", href: "/wingdings" }],
  }),
  component: Page,
});

// Wingdings glyphs mapped to ASCII. Using Unicode symbols that visually mirror the classic font,
// since the actual Wingdings glyphs live at Private Use Area code points only renderable with the font.
const MAP: Record<string, string> = {
  a: "♋", b: "♌", c: "♍", d: "♎", e: "♏", f: "♐", g: "♑", h: "♒", i: "♓",
  j: "🙰", k: "🙵", l: "●", m: "❍", n: "■", o: "□", p: "◆", q: "❖", r: "✦",
  s: "✶", t: "✴", u: "✹", v: "✯", w: "⌖", x: "⓪", y: "①", z: "②",
  A: "✌", B: "👌", C: "👍", D: "👎", E: "☜", F: "☞", G: "☝", H: "☟", I: "✋",
  J: "☺", K: "😐", L: "☹", M: "💣", N: "☠", O: "⚐", P: "⚑", Q: "✈", R: "☼",
  S: "💧", T: "❄", U: "✞", V: "✠", W: "✡", X: "☪", Y: "☯", Z: "ॐ",
  "0": "⓿", "1": "❶", "2": "❷", "3": "❸", "4": "❹", "5": "❺", "6": "❻", "7": "❼", "8": "❽", "9": "❾",
  " ": " ", "\n": "\n",
};

const REVERSE: Record<string, string> = Object.fromEntries(Object.entries(MAP).map(([k, v]) => [v, k]));

function toWing(s: string) {
  return Array.from(s).map((c) => MAP[c] ?? c).join("");
}
function fromWing(s: string) {
  return Array.from(s).map((c) => REVERSE[c] ?? c).join("");
}

function Page() {
  const [mode, setMode] = useState<"to" | "from">("to");
  const [input, setInput] = useState("Hello Bluebird");
  const output = useMemo(() => (mode === "to" ? toWing(input) : fromWing(input)), [mode, input]);

  return (
    <ToolLayout slug="wingdings">
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="soft-card p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="eyebrow">{mode === "to" ? "English" : "Wingdings"}</div>
            <button onClick={() => { setMode((m) => (m === "to" ? "from" : "to")); setInput(output); }}
              className="min-h-10 px-3 rounded-lg border border-border bg-card hover:border-primary inline-flex items-center gap-2 text-sm">
              <ArrowDownUp className="size-4" /> Swap
            </button>
          </div>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={8}
            aria-label="Input text"
            className="w-full rounded-xl border border-border bg-card p-3 text-lg focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="soft-card p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="eyebrow">{mode === "to" ? "Wingdings" : "English"}</div>
            <button onClick={() => navigator.clipboard.writeText(output)} disabled={!output}
              className="min-h-10 px-3 rounded-lg border border-border bg-card hover:border-primary inline-flex items-center gap-2 text-sm disabled:opacity-50">
              <Copy className="size-4" /> Copy
            </button>
          </div>
          <div aria-live="polite" className="min-h-[12rem] rounded-xl border border-border bg-card p-3 text-2xl whitespace-pre-wrap leading-relaxed">
            {output || <span className="text-muted-foreground text-base">Output appears here.</span>}
          </div>
        </div>
      </div>

      <div className="soft-card p-4 sm:p-5 mt-5">
        <div className="eyebrow mb-3">Symbol chart</div>
        <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-12 gap-2 text-center">
          {Object.entries(MAP).filter(([k]) => k.trim()).map(([k, v]) => (
            <div key={k} className="rounded-lg border border-border bg-card p-2">
              <div className="text-xl">{v}</div>
              <div className="text-[10px] text-muted-foreground font-mono">{k}</div>
            </div>
          ))}
        </div>
      </div>

      <HowItWorks>
        <li>Type your message — symbols appear instantly.</li>
        <li>Tap Copy to share on Discord, Twitter, anywhere.</li>
        <li>Hit Swap to decode Wingdings symbols back to letters.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
