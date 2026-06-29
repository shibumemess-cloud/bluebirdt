import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Filter, Copy } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/dedupe-lines")({
  head: () => ({
    meta: [
      { title: "Remove Duplicate Lines — Free Online Deduper" },
      { name: "description", content: "Remove duplicate lines from any list. Option to ignore case, trim whitespace, count duplicates and keep order." },
      { property: "og:title", content: "Remove Duplicate Lines — Bluebird" },
      { property: "og:description", content: "Clean up lists by removing duplicates." },
      { property: "og:url", content: "/dedupe-lines" },
    ],
    links: [{ rel: "canonical", href: "/dedupe-lines" }],
  }),
  component: Page,
});

function Page() {
  const [text, setText] = useState("apple\nBanana\napple\ncherry\nbanana");
  const [ci, setCi] = useState(true);
  const [trim, setTrim] = useState(true);
  const [keepFirst, setKeepFirst] = useState(true);
  const [showCounts, setShowCounts] = useState(false);

  const { out, removed } = useMemo(() => {
    const raw = text.split("\n");
    const norm = raw.map((l) => (trim ? l.trim() : l));
    const key = (i: number) => (ci ? norm[i].toLowerCase() : norm[i]);
    const counts = new Map<string, number>();
    norm.forEach((_, i) => counts.set(key(i), (counts.get(key(i)) || 0) + 1));
    const seen = new Set<string>();
    const result: string[] = [];
    const indices = keepFirst ? [...raw.keys()] : [...raw.keys()].reverse();
    for (const i of indices) {
      const k = key(i);
      if (seen.has(k)) continue;
      seen.add(k);
      const line = norm[i];
      result.push(showCounts ? `${line} (${counts.get(k)})` : line);
    }
    if (!keepFirst) result.reverse();
    return { out: result.join("\n"), removed: raw.length - result.length };
  }, [text, ci, trim, keepFirst, showCounts]);

  return (
    <ToolLayout slug="dedupe-lines">
      <div className="soft-card p-4 sm:p-5 flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={ci} onChange={(e) => setCi(e.target.checked)} /> Ignore case</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={trim} onChange={(e) => setTrim(e.target.checked)} /> Trim spaces</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={keepFirst} onChange={(e) => setKeepFirst(e.target.checked)} /> Keep first occurrence</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={showCounts} onChange={(e) => setShowCounts(e.target.checked)} /> Show duplicate count</label>
      </div>
      <div className="mt-4 grid lg:grid-cols-2 gap-4">
        <div>
          <label className="eyebrow" htmlFor="dd-in">Input</label>
          <textarea id="dd-in" value={text} onChange={(e) => setText(e.target.value)}
            className="mt-1.5 w-full min-h-72 font-mono text-sm rounded-2xl border border-border bg-card p-4 focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="eyebrow" htmlFor="dd-out">Unique lines</label>
            <button onClick={() => navigator.clipboard.writeText(out).catch(() => {})}
              className="text-sm text-primary hover:underline inline-flex items-center gap-1.5"><Copy className="size-4" /> Copy</button>
          </div>
          <textarea id="dd-out" value={out} readOnly
            className="mt-1.5 w-full min-h-72 font-mono text-sm rounded-2xl border border-border bg-primary-soft/30 p-4" />
        </div>
      </div>
      <div className="mt-3 text-sm text-muted-foreground inline-flex items-center gap-2">
        <Filter className="size-4 text-primary" /> Removed {removed} duplicate {removed === 1 ? "line" : "lines"}
      </div>
      <HowItWorks>
        <li>Paste a list — one item per line.</li>
        <li>Toggle options to fine-tune what counts as a duplicate.</li>
        <li>Copy the cleaned-up list with one click.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
