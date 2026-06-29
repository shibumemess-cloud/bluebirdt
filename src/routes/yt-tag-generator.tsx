import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, Check, Tags } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { Field, HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/yt-tag-generator")({
  head: () => ({
    meta: [
      { title: "YouTube Tag Generator — SEO Tags from a Keyword" },
      { name: "description", content: "Generate YouTube video tags from any keyword. Get a smart mix of exact, long-tail, related and trending modifiers — under YouTube's 500-character tag limit." },
      { property: "og:title", content: "YouTube Tag Generator — Bluebird" },
      { property: "og:description", content: "Free YouTube SEO tag generator. Build tags that stay under the 500-character limit." },
      { property: "og:url", content: "/yt-tag-generator" },
    ],
    links: [{ rel: "canonical", href: "/yt-tag-generator" }],
  }),
  component: Page,
});

const MODIFIERS = [
  "tutorial", "how to", "guide", "tips", "tricks", "beginner", "for beginners", "step by step",
  "explained", "review", "best", "top", "2026", "in 2026", "easy", "fast", "free",
  "examples", "vs", "comparison", "course", "lesson", "masterclass", "walkthrough", "demo",
];

const PREFIXES = ["best ", "top ", "easy ", "free ", "how to ", "what is "];
const SUFFIXES = [" for beginners", " explained", " tutorial", " tips", " 2026", " step by step", " guide"];

function buildTags(seed: string, niche: string): string[] {
  const s = seed.trim().toLowerCase();
  if (!s) return [];
  const out = new Set<string>();
  out.add(s);
  if (niche.trim()) out.add(`${s} ${niche.trim().toLowerCase()}`);
  PREFIXES.forEach((p) => out.add(`${p}${s}`));
  SUFFIXES.forEach((sf) => out.add(`${s}${sf}`));
  MODIFIERS.forEach((m) => out.add(`${s} ${m}`));
  if (niche.trim()) {
    const n = niche.trim().toLowerCase();
    out.add(n);
    out.add(`${n} ${s}`);
    out.add(`${n} tutorial`);
    out.add(`${n} tips`);
  }
  return Array.from(out);
}

const LIMIT = 500;

function Page() {
  const [seed, setSeed] = useState("davinci resolve");
  const [niche, setNiche] = useState("video editing");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  const tags = useMemo(() => buildTags(seed, niche), [seed, niche]);

  // Auto-fill the first time tags appear
  useMemo(() => {
    if (selected.size === 0 && tags.length > 0) {
      const next = new Set<string>();
      let len = 0;
      for (const t of tags) {
        const add = (next.size ? 1 : 0) + t.length;
        if (len + add > LIMIT) break;
        next.add(t); len += add;
      }
      setSelected(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tags.length]);

  const joined = Array.from(selected).join(",");
  const remaining = LIMIT - joined.length;
  const over = remaining < 0;

  function toggle(t: string) {
    setSelected((p) => {
      const n = new Set(p);
      n.has(t) ? n.delete(t) : n.add(t);
      return n;
    });
  }

  async function copy() {
    await navigator.clipboard.writeText(joined);
    setCopied(true); setTimeout(() => setCopied(false), 1200);
  }

  return (
    <ToolLayout slug="yt-tag-generator">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 md:col-span-7 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Main keyword">
              <input value={seed} onChange={(e) => { setSeed(e.target.value); setSelected(new Set()); }}
                className="w-full min-h-12 rounded-xl border border-border bg-card px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </Field>
            <Field label="Niche / topic (optional)">
              <input value={niche} onChange={(e) => { setNiche(e.target.value); setSelected(new Set()); }}
                className="w-full min-h-12 rounded-xl border border-border bg-card px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </Field>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="eyebrow flex items-center gap-1.5"><Tags className="size-3.5" /> {tags.length} tag ideas — tap to toggle</span>
              <div className="flex gap-2 text-sm">
                <button onClick={() => setSelected(new Set(tags))} className="text-primary hover:underline">All</button>
                <button onClick={() => setSelected(new Set())} className="text-muted-foreground hover:underline">None</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => {
                const on = selected.has(t);
                return (
                  <button key={t} onClick={() => toggle(t)}
                    className={`min-h-9 px-3 rounded-full text-sm transition-colors ${on ? "bg-primary text-primary-foreground" : "bg-card border border-border hover:border-primary/40"}`}>
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <HowItWorks>
            YouTube tags help confirm what your video is about — most of the SEO work is still done
            by the title, description and thumbnail. We blend your seed keyword with proven
            modifiers (how-to, beginner, best, vs, etc.) and stay under YouTube's hard
            <strong> 500-character total</strong> limit so nothing gets cut off.
          </HowItWorks>
        </div>

        <aside className="col-span-12 md:col-span-5 space-y-3">
          <div className="soft-card p-5">
            <div className="flex items-baseline justify-between mb-2">
              <span className="eyebrow">Your tags ({selected.size})</span>
              <span className={`text-sm font-mono font-semibold ${over ? "text-destructive" : "text-muted-foreground"}`}>
                {joined.length} / {LIMIT}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden mb-3">
              <div className={`h-full transition-all ${over ? "bg-destructive" : "bg-primary"}`} style={{ width: `${Math.min(100, (joined.length / LIMIT) * 100)}%` }} />
            </div>
            <textarea readOnly value={joined} rows={6}
              className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm font-mono focus:outline-none" />
            <button onClick={copy} disabled={!joined || over}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 min-h-11 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50">
              {copied ? <><Check className="size-4" /> Copied</> : <><Copy className="size-4" /> Copy tags</>}
            </button>
            {over && <p className="mt-2 text-xs text-destructive">Over 500 characters — YouTube will reject this. Untick a few tags.</p>}
          </div>
        </aside>
      </div>
    </ToolLayout>
  );
}
