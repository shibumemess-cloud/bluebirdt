import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Binary, Copy } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/binary-translator")({
  head: () => ({
    meta: [
      { title: "Binary Translator — Text to Binary & Back Free" },
      { name: "description", content: "Convert text to binary (UTF-8) and binary back to text. Free, instant, runs in your browser." },
      { property: "og:title", content: "Binary Translator — Bluebird" },
      { property: "og:description", content: "Text ↔ binary, UTF-8 safe, instant." },
      { property: "og:url", content: "/binary-translator" },
    ],
    links: [{ rel: "canonical", href: "/binary-translator" }],
  }),
  component: Page,
});

function textToBinary(t: string): string {
  const bytes = new TextEncoder().encode(t);
  return Array.from(bytes, (b) => b.toString(2).padStart(8, "0")).join(" ");
}
function binaryToText(t: string): string {
  const groups = t.replace(/[^01]+/g, " ").trim().split(/\s+/).filter(Boolean);
  if (!groups.length) return "";
  const bytes = new Uint8Array(groups.length);
  for (let i = 0; i < groups.length; i++) {
    const n = parseInt(groups[i], 2);
    if (isNaN(n) || n > 255) return "";
    bytes[i] = n;
  }
  try { return new TextDecoder("utf-8", { fatal: false }).decode(bytes); } catch { return ""; }
}

type Dir = "encode" | "decode";

function Page() {
  const [dir, setDir] = useState<Dir>("encode");
  const [input, setInput] = useState("Hi!");
  const output = useMemo(() => (dir === "encode" ? textToBinary(input) : binaryToText(input)), [dir, input]);

  function swap() {
    setInput(output);
    setDir(dir === "encode" ? "decode" : "encode");
  }

  return (
    <ToolLayout slug="binary-translator">
      <div className="soft-card p-4 sm:p-5 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex gap-2">
          <button onClick={() => setDir("encode")} aria-pressed={dir === "encode"}
            className={["min-h-11 px-4 rounded-xl text-sm font-medium border",
              dir === "encode" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary"].join(" ")}>
            Text → Binary
          </button>
          <button onClick={() => setDir("decode")} aria-pressed={dir === "decode"}
            className={["min-h-11 px-4 rounded-xl text-sm font-medium border",
              dir === "decode" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary"].join(" ")}>
            Binary → Text
          </button>
        </div>
        <button onClick={swap} className="text-sm text-primary hover:underline">Swap sides</button>
      </div>

      <div className="mt-4 grid lg:grid-cols-2 gap-4">
        <div>
          <label htmlFor="bt-in" className="eyebrow">{dir === "encode" ? "Text" : "Binary (groups of 8)"}</label>
          <textarea id="bt-in" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false}
            className="mt-1.5 w-full min-h-56 font-mono text-sm rounded-2xl border border-border bg-card p-4 focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="bt-out" className="eyebrow">{dir === "encode" ? "Binary" : "Text"}</label>
            <button onClick={() => navigator.clipboard.writeText(output).catch(() => {})}
              className="text-sm text-primary hover:underline inline-flex items-center gap-1.5"><Copy className="size-4" /> Copy</button>
          </div>
          <textarea id="bt-out" value={output} readOnly spellCheck={false}
            className="mt-1.5 w-full min-h-56 font-mono text-sm rounded-2xl border border-border bg-primary-soft/30 p-4" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Binary className="size-4 text-primary" /> UTF-8 safe — emoji and accents work.
      </div>

      <HowItWorks>
        <li>Pick a direction — text to binary or binary to text.</li>
        <li>Type or paste your input on the left.</li>
        <li>Binary is shown as 8-bit bytes separated by spaces.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
