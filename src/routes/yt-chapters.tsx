import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, Check, AlertTriangle, CheckCircle2 } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { Field, HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/yt-chapters")({
  head: () => ({
    meta: [
      { title: "YouTube Chapter Generator & Validator — Fix the 0:00 Start" },
      { name: "description", content: "Format and validate YouTube chapters: must start at 0:00, be in order, and be at least 10 seconds apart. Get a clean description block, ready to paste." },
      { property: "og:title", content: "YouTube Chapter Generator — Bluebird" },
      { property: "og:description", content: "Build YouTube chapters that actually unlock — sorted, 10s+ apart, starting at 0:00." },
      { property: "og:url", content: "/yt-chapters" },
    ],
    links: [{ rel: "canonical", href: "/yt-chapters" }],
  }),
  component: Page,
});

type Row = { time: string; title: string };

function toSeconds(t: string): number | null {
  const m = t.trim().match(/^(?:(\d+):)?(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const [, h, mm, ss] = m;
  const H = h ? Number(h) : 0;
  const M = Number(mm), S = Number(ss);
  if (M > 59 || S > 59) return null;
  return H * 3600 + M * 60 + S;
}

function fmt(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
}

function Page() {
  const [rows, setRows] = useState<Row[]>([
    { time: "0:00", title: "Intro" },
    { time: "1:24", title: "The first tip" },
    { time: "3:10", title: "Why most people miss this" },
    { time: "5:45", title: "Live demo" },
    { time: "8:30", title: "Wrap up & links" },
  ]);
  const [copied, setCopied] = useState(false);

  const issues = useMemo(() => {
    const out: string[] = [];
    const parsed = rows.map((r) => ({ ...r, sec: toSeconds(r.time) }));
    if (parsed.length < 3) out.push("YouTube needs at least 3 chapters before they unlock.");
    if (parsed[0]?.sec !== 0) out.push("The first chapter must start at 0:00.");
    parsed.forEach((r, i) => {
      if (r.sec === null) out.push(`Row ${i + 1}: "${r.time}" isn't a valid time (use M:SS or H:MM:SS).`);
      if (!r.title.trim()) out.push(`Row ${i + 1}: missing a title.`);
    });
    for (let i = 1; i < parsed.length; i++) {
      const a = parsed[i - 1].sec, b = parsed[i].sec;
      if (a !== null && b !== null) {
        if (b <= a) out.push(`Row ${i + 1}: must come after ${fmt(a)}.`);
        else if (b - a < 10) out.push(`Row ${i + 1}: chapters must be at least 10 seconds apart.`);
      }
    }
    return out;
  }, [rows]);

  const block = useMemo(() => rows.map((r) => `${r.time} ${r.title.trim()}`).join("\n"), [rows]);

  function update(i: number, patch: Partial<Row>) {
    setRows((p) => p.map((r, j) => (i === j ? { ...r, ...patch } : r)));
  }
  function add() { setRows((p) => [...p, { time: "", title: "" }]); }
  function remove(i: number) { setRows((p) => p.filter((_, j) => j !== i)); }
  function sort() {
    const sorted = [...rows]
      .map((r) => ({ r, s: toSeconds(r.time) ?? -1 }))
      .sort((a, b) => a.s - b.s)
      .map((x) => x.r);
    setRows(sorted);
  }
  async function copy() {
    await navigator.clipboard.writeText(block);
    setCopied(true); setTimeout(() => setCopied(false), 1200);
  }

  return (
    <ToolLayout slug="yt-chapters">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 md:col-span-7 space-y-3">
          <Field label="Your chapters" hint="Use M:SS or H:MM:SS. The first one must be 0:00.">
            <div className="space-y-2">
              {rows.map((r, i) => (
                <div key={i} className="grid grid-cols-[6.5rem_minmax(0,1fr)_auto] gap-2">
                  <input value={r.time} onChange={(e) => update(i, { time: e.target.value })} placeholder="0:00"
                    className="min-h-11 rounded-lg border border-border bg-card px-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <input value={r.title} onChange={(e) => update(i, { title: e.target.value })} placeholder="Chapter title"
                    className="min-h-11 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <button onClick={() => remove(i)} className="min-h-11 px-3 rounded-lg border border-border text-sm text-muted-foreground hover:text-destructive hover:border-destructive/40">Remove</button>
                </div>
              ))}
            </div>
          </Field>
          <div className="flex gap-2">
            <button onClick={add} className="min-h-11 px-4 rounded-lg border border-border bg-card hover:border-primary/40 text-sm font-medium">+ Add chapter</button>
            <button onClick={sort} className="min-h-11 px-4 rounded-lg border border-border bg-card hover:border-primary/40 text-sm font-medium">Sort by time</button>
          </div>

          <HowItWorks>
            YouTube only turns timestamps into clickable chapters when (1) the first stamp is
            <code> 0:00</code>, (2) there are at least 3 chapters, and (3) each one is at least
            10 seconds after the last. We check all three live so you don't have to.
          </HowItWorks>
        </div>

        <aside className="col-span-12 md:col-span-5 space-y-3">
          <div className={`soft-card p-5 ${issues.length === 0 ? "border-l-4 border-l-primary" : "border-l-4 border-l-amber-500"}`}>
            <div className="flex items-center gap-2 mb-2">
              {issues.length === 0 ? (
                <><CheckCircle2 className="size-5 text-primary" /><span className="font-semibold">Chapters will unlock</span></>
              ) : (
                <><AlertTriangle className="size-5 text-amber-500" /><span className="font-semibold">{issues.length} issue{issues.length === 1 ? "" : "s"} to fix</span></>
              )}
            </div>
            {issues.length > 0 && (
              <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                {issues.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            )}
          </div>

          <div className="soft-card p-5">
            <div className="flex items-baseline justify-between mb-2">
              <span className="eyebrow">Paste into description</span>
              <button onClick={copy} className="text-sm text-primary inline-flex items-center gap-1 hover:underline">
                {copied ? <><Check className="size-4" /> Copied</> : <><Copy className="size-4" /> Copy</>}
              </button>
            </div>
            <pre className="text-sm font-mono whitespace-pre-wrap bg-muted rounded-lg p-3 border border-border">{block}</pre>
          </div>
        </aside>
      </div>
    </ToolLayout>
  );
}
