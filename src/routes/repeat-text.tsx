import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Repeat, Copy } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/repeat-text")({
  head: () => ({
    meta: [
      { title: "Repeat Text Generator — Copy Text N Times Free" },
      { name: "description", content: "Repeat any word, line or block of text dozens or thousands of times. Choose a separator and download as TXT." },
      { property: "og:title", content: "Repeat Text Generator — Bluebird" },
      { property: "og:description", content: "Repeat text any number of times in one click." },
      { property: "og:url", content: "/repeat-text" },
    ],
    links: [{ rel: "canonical", href: "/repeat-text" }],
  }),
  component: Page,
});

const SEPS: { id: string; label: string; value: string }[] = [
  { id: "nl", label: "New line", value: "\n" },
  { id: "sp", label: "Space", value: " " },
  { id: "cm", label: "Comma", value: ", " },
  { id: "pi", label: "Pipe", value: " | " },
  { id: "none", label: "None", value: "" },
];

function Page() {
  const [text, setText] = useState("Hello");
  const [count, setCount] = useState(10);
  const [sepId, setSepId] = useState("nl");
  const [number, setNumber] = useState(false);
  const sep = SEPS.find((s) => s.id === sepId)?.value ?? "\n";
  const safeCount = Math.max(0, Math.min(50000, Math.floor(count) || 0));

  const out = useMemo(() => {
    if (!text || safeCount === 0) return "";
    const parts: string[] = new Array(safeCount);
    for (let i = 0; i < safeCount; i++) parts[i] = number ? `${i + 1}. ${text}` : text;
    return parts.join(sep);
  }, [text, safeCount, sep, number]);

  return (
    <ToolLayout slug="repeat-text">
      <div className="soft-card p-4 sm:p-5 grid sm:grid-cols-3 gap-3 items-end">
        <div className="sm:col-span-2">
          <label className="eyebrow" htmlFor="rp-text">Text to repeat</label>
          <input id="rp-text" value={text} onChange={(e) => setText(e.target.value)}
            className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3 focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="eyebrow" htmlFor="rp-count">How many times</label>
          <input id="rp-count" type="number" min={1} max={50000} value={count} onChange={(e) => setCount(Number(e.target.value))}
            className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3 focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="sm:col-span-3 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {SEPS.map((s) => (
              <button key={s.id} onClick={() => setSepId(s.id)} aria-pressed={sepId === s.id}
                className={["min-h-10 px-3 rounded-lg text-sm border",
                  sepId === s.id ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary"].join(" ")}>
                {s.label}
              </button>
            ))}
          </div>
          <label className="ml-auto flex items-center gap-2 text-sm"><input type="checkbox" checked={number} onChange={(e) => setNumber(e.target.checked)} /> Number each one</label>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <label className="eyebrow" htmlFor="rp-out">Result</label>
          <button onClick={() => navigator.clipboard.writeText(out).catch(() => {})}
            className="text-sm text-primary hover:underline inline-flex items-center gap-1.5"><Copy className="size-4" /> Copy</button>
        </div>
        <textarea id="rp-out" value={out} readOnly
          className="mt-1.5 w-full min-h-72 font-mono text-sm rounded-2xl border border-border bg-primary-soft/30 p-4" />
      </div>
      <div className="mt-3 text-sm text-muted-foreground inline-flex items-center gap-2">
        <Repeat className="size-4 text-primary" /> {out.length.toLocaleString()} characters · {safeCount.toLocaleString()} copies
      </div>
      <HowItWorks>
        <li>Type the text you want to repeat and choose how many times.</li>
        <li>Pick a separator — new line, space, comma or none.</li>
        <li>Copy the whole result with one click.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
