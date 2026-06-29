import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Shuffle, Copy, Check, Trophy } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { Field, HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/yt-comment-picker")({
  head: () => ({
    meta: [
      { title: "YouTube Comment Picker — Random Giveaway Winner" },
      { name: "description", content: "Paste YouTube comments and pick random winners for your giveaway. Filter duplicates, require keywords, and exclude your own replies — 100% client-side." },
      { property: "og:title", content: "YouTube Comment Picker — Bluebird" },
      { property: "og:description", content: "Pick fair, random YouTube giveaway winners in your browser." },
      { property: "og:url", content: "/yt-comment-picker" },
    ],
    links: [{ rel: "canonical", href: "/yt-comment-picker" }],
  }),
  component: Page,
});

function parseComments(raw: string): string[] {
  // Accept one-per-line or paragraph-style (split on @handle lines or blank lines)
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  return lines;
}

function secureRandomInt(max: number): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}

function Page() {
  const [raw, setRaw] = useState("@filmfan I'd pick the red one!\n@coffeequeen Mine for sure\n@filmfan I'd pick the red one!\n@gamerdude Pick me, been a sub for 4 years\n@artbynina such a cool giveaway, fingers crossed\n@bookworm99 the blue one looks perfect\n@traveljen counting down to the result");
  const [winners, setWinners] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [dedupe, setDedupe] = useState(true);
  const [excludeSelf, setExcludeSelf] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const pool = useMemo(() => {
    let list = parseComments(raw);
    if (keyword.trim()) {
      const k = keyword.trim().toLowerCase();
      list = list.filter((c) => c.toLowerCase().includes(k));
    }
    if (excludeSelf.trim()) {
      const handle = excludeSelf.trim().replace(/^@/, "").toLowerCase();
      list = list.filter((c) => !c.toLowerCase().includes(`@${handle}`));
    }
    if (dedupe) {
      // Dedupe by handle (first @word) if present, else by full text
      const seen = new Set<string>();
      list = list.filter((c) => {
        const m = c.match(/@[\w.-]+/);
        const key = (m ? m[0] : c).toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
    return list;
  }, [raw, keyword, excludeSelf, dedupe]);

  function pick() {
    const n = Math.min(winners, pool.length);
    const remaining = [...pool];
    const out: string[] = [];
    for (let i = 0; i < n; i++) {
      const idx = secureRandomInt(remaining.length);
      out.push(remaining.splice(idx, 1)[0]);
    }
    setPicked(out);
    setCopied(false);
  }

  async function copy() {
    if (!picked.length) return;
    await navigator.clipboard.writeText(picked.join("\n"));
    setCopied(true); setTimeout(() => setCopied(false), 1200);
  }

  return (
    <ToolLayout slug="yt-comment-picker">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 md:col-span-7 space-y-5">
          <Field label="Paste YouTube comments" hint="One per line. Copy them straight from the comments tab.">
            <textarea value={raw} onChange={(e) => setRaw(e.target.value)} rows={10}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Number of winners">
              <input type="number" min={1} max={50} value={winners} onChange={(e) => setWinners(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
                className="w-full min-h-12 rounded-xl border border-border bg-card px-4 text-base font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </Field>
            <Field label="Must contain keyword (optional)">
              <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="e.g. #giveaway"
                className="w-full min-h-12 rounded-xl border border-border bg-card px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Exclude your @handle">
              <input value={excludeSelf} onChange={(e) => setExcludeSelf(e.target.value)} placeholder="@yourchannel"
                className="w-full min-h-12 rounded-xl border border-border bg-card px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </Field>
            <label className="flex items-center gap-2 mt-7 cursor-pointer">
              <input type="checkbox" checked={dedupe} onChange={(e) => setDedupe(e.target.checked)} className="size-5 accent-primary" />
              <span className="text-sm">One entry per person (de-dupe by @handle)</span>
            </label>
          </div>

          <button onClick={pick} disabled={pool.length === 0}
            className="inline-flex items-center gap-2 min-h-12 px-6 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50">
            <Shuffle className="size-5" /> Pick {Math.min(winners, pool.length)} winner{Math.min(winners, pool.length) === 1 ? "" : "s"}
          </button>

          <HowItWorks>
            Picks use <code>crypto.getRandomValues</code>, the browser's cryptographically secure
            random generator — every eligible entry has an equal chance. Nothing leaves your
            device. For a public draw, share your screen while you click <em>Pick winners</em>.
          </HowItWorks>
        </div>

        <aside className="col-span-12 md:col-span-5">
          <div className="soft-card p-5 sm:p-6">
            <div className="flex items-baseline justify-between mb-3">
              <span className="eyebrow">Entries in the draw</span>
              <span className="text-sm font-mono font-semibold">{pool.length}</span>
            </div>
            {picked.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Set the filters, then press <em>Pick winners</em>.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="eyebrow flex items-center gap-1.5"><Trophy className="size-3.5" /> Winners</span>
                  <button onClick={copy} className="text-sm text-primary inline-flex items-center gap-1 hover:underline">
                    {copied ? <><Check className="size-4" /> Copied</> : <><Copy className="size-4" /> Copy all</>}
                  </button>
                </div>
                <ol className="space-y-2">
                  {picked.map((c, i) => (
                    <li key={i} className="rounded-xl border border-primary/30 bg-primary/5 p-3">
                      <div className="text-xs font-mono font-bold text-primary">#{i + 1}</div>
                      <div className="text-sm mt-1 break-words">{c}</div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </aside>
      </div>
    </ToolLayout>
  );
}
