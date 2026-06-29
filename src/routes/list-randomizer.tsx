import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Shuffle, Copy } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/list-randomizer")({
  head: () => ({
    meta: [
      { title: "List Randomizer & Picker — Shuffle a List, Pick a Winner" },
      { name: "description", content: "Shuffle any list, pick one or many random items, or draw without repeats. Free, fair, in your browser." },
      { property: "og:title", content: "List Randomizer — Bluebird" },
      { property: "og:description", content: "Shuffle or pick from any list — fair and free." },
      { property: "og:url", content: "/list-randomizer" },
    ],
    links: [{ rel: "canonical", href: "/list-randomizer" }],
  }),
  component: Page,
});

function secureShuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  const rand = new Uint32Array(a.length);
  crypto.getRandomValues(rand);
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand[i] % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Mode = "shuffle" | "pick";

function Page() {
  const [input, setInput] = useState("Alice\nBob\nCarol\nDavid\nEve\nFrank\nGrace\nHenry");
  const [mode, setMode] = useState<Mode>("shuffle");
  const [pickCount, setPickCount] = useState(1);
  const [unique, setUnique] = useState(true);
  const [trim, setTrim] = useState(true);
  const [output, setOutput] = useState<string[]>([]);

  const items = useMemo(() => {
    let parts = input.split("\n");
    if (trim) parts = parts.map((s) => s.trim()).filter(Boolean);
    return parts;
  }, [input, trim]);

  function run() {
    if (items.length === 0) { setOutput([]); return; }
    if (mode === "shuffle") setOutput(secureShuffle(items));
    else {
      const n = Math.max(1, Math.min(items.length, pickCount));
      if (unique) setOutput(secureShuffle(items).slice(0, n));
      else {
        const out: string[] = [];
        const r = new Uint32Array(n);
        crypto.getRandomValues(r);
        for (let i = 0; i < n; i++) out.push(items[r[i] % items.length]);
        setOutput(out);
      }
    }
  }

  return (
    <ToolLayout slug="list-randomizer">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Shuffle className="size-4 text-primary" />
            <div className="font-display text-lg">Your list — one per line</div>
          </div>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false}
            className="w-full min-h-56 font-mono text-sm rounded-2xl border border-border bg-card p-4 focus:outline-none focus:ring-2 focus:ring-ring" />
          <div className="text-xs text-muted-foreground">{items.length} item{items.length === 1 ? "" : "s"}</div>

          <div className="flex gap-2">
            {(["shuffle", "pick"] as Mode[]).map((m) => (
              <button key={m} onClick={() => setMode(m)} aria-pressed={mode === m}
                className={["min-h-11 px-4 rounded-xl text-sm font-medium border flex-1",
                  mode === m ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary"].join(" ")}>
                {m === "shuffle" ? "Shuffle all" : "Pick winners"}
              </button>
            ))}
          </div>

          {mode === "pick" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="lr-n" className="eyebrow">How many</label>
                <input id="lr-n" type="number" min={1} max={items.length || 1} value={pickCount}
                  onChange={(e) => setPickCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3 tabular-nums focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <label className="flex items-end pb-2 text-sm gap-2">
                <input type="checkbox" checked={unique} onChange={(e) => setUnique(e.target.checked)}
                  className="size-4 accent-[color:var(--color-primary)]" />
                No repeats
              </label>
            </div>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={trim} onChange={(e) => setTrim(e.target.checked)}
              className="size-4 accent-[color:var(--color-primary)]" />
            Trim spaces and skip blank lines
          </label>

          <button onClick={run} disabled={items.length === 0}
            className="w-full min-h-12 rounded-xl bg-primary text-primary-foreground font-semibold inline-flex items-center justify-center gap-2 hover:shadow-lift hover:-translate-y-0.5 disabled:opacity-50">
            <Shuffle className="size-4" /> {mode === "shuffle" ? "Shuffle" : `Pick ${pickCount}`}
          </button>
        </section>

        <section className="soft-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="eyebrow">Result</div>
            {output.length > 0 && (
              <button onClick={() => navigator.clipboard.writeText(output.join("\n")).catch(() => {})}
                className="text-sm text-primary hover:underline inline-flex items-center gap-1.5"><Copy className="size-4" /> Copy</button>
            )}
          </div>
          {output.length === 0 ? (
            <div className="text-sm text-muted-foreground">Pick or shuffle to see the result here.</div>
          ) : (
            <ol className="space-y-2 max-h-[28rem] overflow-y-auto">
              {output.map((o, i) => (
                <li key={i} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                  <span className="grid place-items-center size-8 rounded-full bg-primary-soft text-primary font-semibold text-sm tabular-nums shrink-0">{i + 1}</span>
                  <span className="font-medium truncate">{o}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <HowItWorks>
        <li>Paste your list — names, ideas, options, anything.</li>
        <li>Choose Shuffle to reorder, or Pick winners to draw.</li>
        <li>Built on browser cryptography — every draw is fair.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
