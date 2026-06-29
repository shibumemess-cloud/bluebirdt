import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/bionic-text")({
  head: () => ({
    meta: [
      { title: "Bionic Reading Converter — Free Bold Reader" },
      { name: "description", content: "Convert any text into bionic reading format by bolding the leading letters of every word. Copy as rich text or HTML." },
      { property: "og:title", content: "Bionic Reading Converter — Bluebird" },
      { property: "og:description", content: "Speed up reading by bolding the start of each word — free, in your browser." },
    ],
    links: [{ rel: "canonical", href: "/bionic-text" }],
  }),
  component: Page,
});

function bionicWord(word: string, ratio: number): { head: string; tail: string } {
  const len = word.length;
  if (len <= 1) return { head: word, tail: "" };
  const headLen = Math.max(1, Math.round(len * ratio));
  return { head: word.slice(0, headLen), tail: word.slice(headLen) };
}

function Page() {
  const [text, setText] = useState("Reading should feel light. The bionic format bolds the leading letters of each word so your eyes can hop from one anchor to the next.");
  const [ratio, setRatio] = useState(0.5);

  const html = useMemo(() => {
    return text.split(/(\s+)/).map((tok) => {
      if (/^\s+$/.test(tok)) return tok;
      const m = tok.match(/^(\W*)(\w+)(\W*)$/);
      if (!m) return tok;
      const { head, tail } = bionicWord(m[2], ratio);
      return `${m[1]}<b>${head}</b>${tail}${m[3]}`;
    }).join("");
  }, [text, ratio]);

  async function copyHtml() {
    try {
      const blob = new Blob([html], { type: "text/html" });
      const plain = new Blob([text], { type: "text/plain" });
      // @ts-ignore — ClipboardItem types
      await navigator.clipboard.write([new ClipboardItem({ "text/html": blob, "text/plain": plain })]);
    } catch { await navigator.clipboard.writeText(html); }
  }

  return (
    <ToolLayout slug="bionic-text">
      <div className="soft-card p-5 sm:p-6 space-y-5">
        <label className="block">
          <span className="font-medium">Your text</span>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Boldness ({Math.round(ratio * 100)}% of each word)</span>
          <input type="range" min={0.3} max={0.7} step={0.05} value={ratio} onChange={(e) => setRatio(+e.target.value)} className="w-full mt-2" />
        </label>

        <div className="rounded-2xl border border-border bg-card p-5 text-lg leading-relaxed" aria-live="polite" dangerouslySetInnerHTML={{ __html: html }} />

        <div className="flex flex-wrap gap-3">
          <button onClick={copyHtml} className="inline-flex items-center gap-2 min-h-12 px-5 rounded-xl bg-primary text-primary-foreground font-medium"><Copy className="size-4" /> Copy as rich text</button>
          <button onClick={() => navigator.clipboard.writeText(html)} className="inline-flex items-center gap-2 min-h-12 px-5 rounded-xl border border-border bg-background font-medium">Copy as HTML</button>
        </div>
      </div>
      <HowItWorks>
        <p>Paste any paragraph. We bold the first half of every word so your eye can scan faster, then let you copy the result into emails, docs or a CMS. Some readers love it, some don't — try it and see.</p>
      </HowItWorks>
    </ToolLayout>
  );
}
