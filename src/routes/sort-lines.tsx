import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowDownAZ, Copy } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/sort-lines")({
  head: () => ({
    meta: [
      { title: "Sort Lines — Alphabetical, Length, Reverse Free" },
      { name: "description", content: "Sort a list of lines A→Z, Z→A, by length or randomly. Optionally trim, ignore case, and drop blanks." },
      { property: "og:title", content: "Sort Lines — Bluebird" },
      { property: "og:description", content: "Sort any list of lines in seconds." },
      { property: "og:url", content: "/sort-lines" },
    ],
    links: [{ rel: "canonical", href: "/sort-lines" }],
  }),
  component: Page,
});

type Mode = "az" | "za" | "len-asc" | "len-desc" | "random" | "reverse" | "numeric";

function Page() {
  const [text, setText] = useState("banana\napple\ncherry\ndate");
  const [mode, setMode] = useState<Mode>("az");
  const [ci, setCi] = useState(true);
  const [trim, setTrim] = useState(true);
  const [dropBlank, setDropBlank] = useState(true);

  const out = useMemo(() => {
    let lines = text.split("\n");
    if (trim) lines = lines.map((l) => l.trim());
    if (dropBlank) lines = lines.filter((l) => l.length > 0);
    const cmp = (a: string, b: string) => {
      const A = ci ? a.toLowerCase() : a;
      const B = ci ? b.toLowerCase() : b;
      return A < B ? -1 : A > B ? 1 : 0;
    };
    if (mode === "az") lines.sort(cmp);
    else if (mode === "za") lines.sort((a, b) => -cmp(a, b));
    else if (mode === "len-asc") lines.sort((a, b) => a.length - b.length);
    else if (mode === "len-desc") lines.sort((a, b) => b.length - a.length);
    else if (mode === "numeric") lines.sort((a, b) => parseFloat(a) - parseFloat(b));
    else if (mode === "reverse") lines.reverse();
    else if (mode === "random") {
      for (let i = lines.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [lines[i], lines[j]] = [lines[j], lines[i]];
      }
    }
    return lines.join("\n");
  }, [text, mode, ci, trim, dropBlank]);

  const modes: { id: Mode; label: string }[] = [
    { id: "az", label: "A → Z" }, { id: "za", label: "Z → A" },
    { id: "len-asc", label: "Shortest first" }, { id: "len-desc", label: "Longest first" },
    { id: "numeric", label: "Numeric" }, { id: "reverse", label: "Reverse order" }, { id: "random", label: "Shuffle" },
  ];

  return (
    <ToolLayout slug="sort-lines">
      <div className="soft-card p-4 sm:p-5 flex flex-wrap gap-2">
        {modes.map((m) => (
          <button key={m.id} onClick={() => setMode(m.id)} aria-pressed={mode === m.id}
            className={["min-h-11 px-4 rounded-xl text-sm font-medium border transition-colors",
              mode === m.id ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary"].join(" ")}>
            {m.label}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={ci} onChange={(e) => setCi(e.target.checked)} /> Ignore case</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={trim} onChange={(e) => setTrim(e.target.checked)} /> Trim spaces</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={dropBlank} onChange={(e) => setDropBlank(e.target.checked)} /> Drop blank lines</label>
      </div>
      <div className="mt-4 grid lg:grid-cols-2 gap-4">
        <div>
          <label className="eyebrow" htmlFor="sl-in">Input lines</label>
          <textarea id="sl-in" value={text} onChange={(e) => setText(e.target.value)}
            className="mt-1.5 w-full min-h-72 font-mono text-sm rounded-2xl border border-border bg-card p-4 focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="eyebrow" htmlFor="sl-out">Sorted</label>
            <button onClick={() => navigator.clipboard.writeText(out).catch(() => {})}
              className="text-sm text-primary hover:underline inline-flex items-center gap-1.5"><Copy className="size-4" /> Copy</button>
          </div>
          <textarea id="sl-out" value={out} readOnly
            className="mt-1.5 w-full min-h-72 font-mono text-sm rounded-2xl border border-border bg-primary-soft/30 p-4" />
        </div>
      </div>
      <div className="mt-3 text-sm text-muted-foreground inline-flex items-center gap-2">
        <ArrowDownAZ className="size-4 text-primary" /> {out.split("\n").filter(Boolean).length} lines
      </div>
      <HowItWorks>
        <li>Paste your list — one item per line.</li>
        <li>Pick a sort order. Toggle ignore case, trim and blank-line removal.</li>
        <li>Copy the sorted list with one click.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
