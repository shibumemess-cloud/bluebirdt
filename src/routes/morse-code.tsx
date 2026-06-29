import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Radio, Copy } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/morse-code")({
  head: () => ({
    meta: [
      { title: "Morse Code Translator — Text to Morse & Back" },
      { name: "description", content: "Translate text to Morse code and Morse back to text. Letters, digits and punctuation. Free, instant, private." },
      { property: "og:title", content: "Morse Code Translator — Bluebird" },
      { property: "og:description", content: "Text ↔ Morse code, instantly in your browser." },
      { property: "og:url", content: "/morse-code" },
    ],
    links: [{ rel: "canonical", href: "/morse-code" }],
  }),
  component: Page,
});

const MAP: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....",
  I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.",
  Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
  "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--",
  "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...",
  ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", "_": "..--.-",
  '"': ".-..-.", "@": ".--.-.",
};
const INV: Record<string, string> = Object.fromEntries(Object.entries(MAP).map(([k, v]) => [v, k]));

function toMorse(t: string) {
  return t.toUpperCase().split("\n").map(line =>
    line.split(/\s+/).filter(Boolean).map(word =>
      Array.from(word).map(ch => MAP[ch] ?? "").filter(Boolean).join(" ")
    ).join(" / ")
  ).join("\n");
}
function fromMorse(t: string) {
  return t.split("\n").map(line =>
    line.split(/\s*\/\s*/).map(word =>
      word.trim().split(/\s+/).map(c => INV[c] ?? "").join("")
    ).join(" ")
  ).join("\n");
}

type Dir = "encode" | "decode";

function Page() {
  const [dir, setDir] = useState<Dir>("encode");
  const [input, setInput] = useState("Hello World");
  const output = useMemo(() => (dir === "encode" ? toMorse(input) : fromMorse(input)), [dir, input]);

  function swap() {
    setInput(output);
    setDir(dir === "encode" ? "decode" : "encode");
  }

  return (
    <ToolLayout slug="morse-code">
      <div className="soft-card p-4 sm:p-5 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex gap-2">
          <button onClick={() => setDir("encode")} aria-pressed={dir === "encode"}
            className={["min-h-11 px-4 rounded-xl text-sm font-medium border",
              dir === "encode" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary"].join(" ")}>
            Text → Morse
          </button>
          <button onClick={() => setDir("decode")} aria-pressed={dir === "decode"}
            className={["min-h-11 px-4 rounded-xl text-sm font-medium border",
              dir === "decode" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary"].join(" ")}>
            Morse → Text
          </button>
        </div>
        <button onClick={swap} className="text-sm text-primary hover:underline">Swap sides</button>
      </div>

      <div className="mt-4 grid lg:grid-cols-2 gap-4">
        <div>
          <label htmlFor="mc-in" className="eyebrow">{dir === "encode" ? "Text" : "Morse code"}</label>
          <textarea id="mc-in" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false}
            className="mt-1.5 w-full min-h-56 font-mono text-sm rounded-2xl border border-border bg-card p-4 focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="mc-out" className="eyebrow">{dir === "encode" ? "Morse code" : "Text"}</label>
            <button onClick={() => navigator.clipboard.writeText(output).catch(() => {})}
              className="text-sm text-primary hover:underline inline-flex items-center gap-1.5"><Copy className="size-4" /> Copy</button>
          </div>
          <textarea id="mc-out" value={output} readOnly spellCheck={false}
            className="mt-1.5 w-full min-h-56 font-mono text-sm rounded-2xl border border-border bg-primary-soft/30 p-4" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Radio className="size-4 text-primary" />
        Word separator: <code className="px-1 rounded bg-card border border-border">/</code> · Letter separator: a space
      </div>

      <HowItWorks>
        <li>Choose whether you're encoding text or decoding Morse.</li>
        <li>Type or paste — output updates live.</li>
        <li>Letters are separated by spaces, words by <code>/</code>.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
