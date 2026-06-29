import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FlipHorizontal, Copy } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/text-reverser")({
  head: () => ({
    meta: [
      { title: "Text Reverser — Reverse Words, Letters & Lines Free" },
      { name: "description", content: "Reverse any text by character, word, or line. Works on emoji and accented letters. Free, instant, in your browser." },
      { property: "og:title", content: "Text Reverser — Bluebird" },
      { property: "og:description", content: "Reverse text by character, word or line." },
      { property: "og:url", content: "/text-reverser" },
    ],
    links: [{ rel: "canonical", href: "/text-reverser" }],
  }),
  component: Page,
});

type Mode = "chars" | "words" | "lines";

function reverseText(text: string, mode: Mode): string {
  if (mode === "chars") return Array.from(text).reverse().join("");
  if (mode === "words") return text.split(/(\s+)/).reverse().join("");
  return text.split("\n").reverse().join("\n");
}

function Page() {
  const [text, setText] = useState("The quick brown fox jumps over the lazy dog.");
  const [mode, setMode] = useState<Mode>("chars");
  const out = useMemo(() => reverseText(text, mode), [text, mode]);

  return (
    <ToolLayout slug="text-reverser">
      <div className="soft-card p-4 sm:p-5 flex flex-wrap gap-2">
        {(["chars", "words", "lines"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={[
              "min-h-11 px-4 rounded-xl text-sm font-medium border transition-colors",
              mode === m ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary",
            ].join(" ")}
          >
            By {m === "chars" ? "character" : m === "words" ? "word" : "line"}
          </button>
        ))}
      </div>

      <div className="mt-4 grid lg:grid-cols-2 gap-4">
        <div>
          <label htmlFor="tr-in" className="eyebrow">Original</label>
          <textarea
            id="tr-in"
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            className="mt-1.5 w-full min-h-56 font-mono text-sm rounded-2xl border border-border bg-card p-4 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="tr-out" className="eyebrow">Reversed</label>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(out).catch(() => {})}
              className="text-sm text-primary hover:underline inline-flex items-center gap-1.5"
            >
              <Copy className="size-4" /> Copy
            </button>
          </div>
          <textarea
            id="tr-out"
            value={out}
            readOnly
            spellCheck={false}
            className="mt-1.5 w-full min-h-56 font-mono text-sm rounded-2xl border border-border bg-primary-soft/30 p-4"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <FlipHorizontal className="size-4 text-primary" />
        {text.length.toLocaleString()} characters · {text.split(/\s+/).filter(Boolean).length.toLocaleString()} words
      </div>

      <HowItWorks>
        <li>Type or paste any text on the left.</li>
        <li>Pick whether to reverse characters, words or lines.</li>
        <li>Copy the result on the right.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
