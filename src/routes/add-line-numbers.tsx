import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ListOrdered, Copy } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/add-line-numbers")({
  head: () => ({
    meta: [
      { title: "Add Line Numbers to Text — Free Online" },
      { name: "description", content: "Prefix every line with a number. Choose start number, padding, separator and whether to number blank lines." },
      { property: "og:title", content: "Add Line Numbers — Bluebird" },
      { property: "og:description", content: "Number any text or code in one click." },
      { property: "og:url", content: "/add-line-numbers" },
    ],
    links: [{ rel: "canonical", href: "/add-line-numbers" }],
  }),
  component: Page,
});

function Page() {
  const [text, setText] = useState("apple\nbanana\n\ncherry");
  const [start, setStart] = useState(1);
  const [step, setStep] = useState(1);
  const [sep, setSep] = useState(": ");
  const [pad, setPad] = useState(true);
  const [numberBlanks, setNumberBlanks] = useState(false);

  const out = useMemo(() => {
    const lines = text.split("\n");
    const max = start + (lines.length - 1) * step;
    const width = String(Math.max(1, max)).length;
    let n = start;
    return lines.map((l) => {
      if (!numberBlanks && l.trim() === "") return l;
      const label = pad ? String(n).padStart(width, " ") : String(n);
      n += step;
      return `${label}${sep}${l}`;
    }).join("\n");
  }, [text, start, step, sep, pad, numberBlanks]);

  return (
    <ToolLayout slug="add-line-numbers">
      <div className="soft-card p-4 sm:p-5 grid sm:grid-cols-4 gap-3 items-end">
        <div><label className="eyebrow" htmlFor="ln-start">Start</label>
          <input id="ln-start" type="number" value={start} onChange={(e) => setStart(Number(e.target.value) || 0)}
            className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3" /></div>
        <div><label className="eyebrow" htmlFor="ln-step">Step</label>
          <input id="ln-step" type="number" min={1} value={step} onChange={(e) => setStep(Math.max(1, Number(e.target.value) || 1))}
            className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3" /></div>
        <div><label className="eyebrow" htmlFor="ln-sep">Separator</label>
          <input id="ln-sep" value={sep} onChange={(e) => setSep(e.target.value)}
            className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3 font-mono" /></div>
        <div className="flex flex-col gap-1 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={pad} onChange={(e) => setPad(e.target.checked)} /> Pad with spaces</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={numberBlanks} onChange={(e) => setNumberBlanks(e.target.checked)} /> Number blank lines</label>
        </div>
      </div>
      <div className="mt-4 grid lg:grid-cols-2 gap-4">
        <div>
          <label className="eyebrow" htmlFor="ln-in">Input</label>
          <textarea id="ln-in" value={text} onChange={(e) => setText(e.target.value)}
            className="mt-1.5 w-full min-h-72 font-mono text-sm rounded-2xl border border-border bg-card p-4 focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="eyebrow" htmlFor="ln-out">Numbered</label>
            <button onClick={() => navigator.clipboard.writeText(out).catch(() => {})}
              className="text-sm text-primary hover:underline inline-flex items-center gap-1.5"><Copy className="size-4" /> Copy</button>
          </div>
          <textarea id="ln-out" value={out} readOnly
            className="mt-1.5 w-full min-h-72 font-mono text-sm rounded-2xl border border-border bg-primary-soft/30 p-4" />
        </div>
      </div>
      <div className="mt-3 text-sm text-muted-foreground inline-flex items-center gap-2">
        <ListOrdered className="size-4 text-primary" /> {text.split("\n").length} lines
      </div>
      <HowItWorks>
        <li>Paste any text or code.</li>
        <li>Choose the start number, step and separator (the bit between number and text).</li>
        <li>Copy the numbered version.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
