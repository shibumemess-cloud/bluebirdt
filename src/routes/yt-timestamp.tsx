import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, Check, Plus, X } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { Field, HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/yt-timestamp")({
  head: () => ({
    meta: [
      { title: "YouTube Timestamp Link Generator — Share a moment" },
      { name: "description", content: "Create a YouTube link that jumps straight to a specific moment — type the time in seconds or hh:mm:ss and share." },
      { property: "og:title", content: "YouTube Timestamp Link Generator — Bluebird" },
      { property: "og:description", content: "Link to any second of a YouTube video in one tap." },
      { property: "og:url", content: "/yt-timestamp" },
    ],
    links: [{ rel: "canonical", href: "/yt-timestamp" }],
  }),
  component: Page,
});

function parseId(s: string): string | null {
  if (/^[a-zA-Z0-9_-]{11}$/.test(s.trim())) return s.trim();
  const m = s.match(/(?:v=|\/embed\/|\/shorts\/|youtu\.be\/|\/live\/|\/v\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function toSeconds(t: string): number {
  if (/^\d+$/.test(t.trim())) return parseInt(t, 10);
  const parts = t.split(":").map((p) => parseInt(p, 10) || 0);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

function formatHMS(total: number): string {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

type Stamp = { time: string; label: string };

function Page() {
  const [input, setInput] = useState("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  const [stamps, setStamps] = useState<Stamp[]>([
    { time: "0:00", label: "Intro" },
    { time: "1:30", label: "Main point" },
  ]);
  const [copied, setCopied] = useState<number | null>(null);
  const [copiedDesc, setCopiedDesc] = useState(false);

  const id = useMemo(() => parseId(input), [input]);

  function update(i: number, patch: Partial<Stamp>) {
    setStamps((arr) => arr.map((s, k) => (k === i ? { ...s, ...patch } : s)));
  }
  function add() { setStamps((a) => [...a, { time: "0:00", label: "" }]); }
  function remove(i: number) { setStamps((a) => a.filter((_, k) => k !== i)); }

  async function copyOne(idx: number, value: string) {
    try { await navigator.clipboard.writeText(value); setCopied(idx); setTimeout(() => setCopied(null), 1200); } catch { /* */ }
  }

  const description = useMemo(() => {
    return stamps
      .map((s) => `${formatHMS(toSeconds(s.time))} ${s.label}`.trim())
      .join("\n");
  }, [stamps]);

  async function copyDesc() {
    try { await navigator.clipboard.writeText(description); setCopiedDesc(true); setTimeout(() => setCopiedDesc(false), 1200); } catch { /* */ }
  }

  return (
    <ToolLayout slug="yt-timestamp">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 md:col-span-7 space-y-5">
          <Field label="YouTube link or video ID">
            <input value={input} onChange={(e) => setInput(e.target.value)}
              className="w-full min-h-12 rounded-xl border border-border bg-card px-4 text-base font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </Field>

          <Field label="Timestamps" hint="Type the time in seconds or hh:mm:ss (1:30 or 0:01:30).">
            <div className="space-y-2">
              {stamps.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={s.time} onChange={(e) => update(i, { time: e.target.value })} placeholder="0:00"
                    className="w-28 min-h-12 rounded-xl border border-border bg-card px-3 text-base font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <input value={s.label} onChange={(e) => update(i, { label: e.target.value })} placeholder="Label (optional)"
                    className="flex-1 min-h-12 rounded-xl border border-border bg-card px-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <button type="button" onClick={() => remove(i)} className="size-12 grid place-items-center rounded-xl border border-border bg-card hover:border-destructive/50 text-muted-foreground" aria-label="Remove">
                    <X className="size-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={add} className="inline-flex items-center gap-1.5 min-h-11 px-4 rounded-xl border border-dashed border-border bg-card hover:border-primary/40 text-sm font-medium">
                <Plus className="size-4" /> Add timestamp
              </button>
            </div>
          </Field>

          <HowItWorks>
            We add <code className="font-mono">&amp;t=Ns</code> to your link so YouTube jumps to that moment.
            You can also paste the full description block into your own YouTube video — YouTube auto-links them.
          </HowItWorks>
        </div>

        <aside className="col-span-12 md:col-span-5 space-y-3">
          {!id ? (
            <div className="soft-card p-5 text-center text-muted-foreground">Paste a YouTube link to see timestamp links.</div>
          ) : (
            <>
              {stamps.map((s, i) => {
                const sec = toSeconds(s.time);
                const link = `https://youtu.be/${id}?t=${sec}`;
                return (
                  <div key={i} className="rounded-xl border border-border bg-card p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm">{formatHMS(sec)}{s.label ? ` · ${s.label}` : ""}</span>
                      <button type="button" onClick={() => copyOne(i, link)} className="min-h-9 px-3 rounded-lg border border-border bg-background hover:border-primary/40 inline-flex items-center gap-1 text-xs font-medium">
                        {copied === i ? <><Check className="size-3.5 text-primary" /> Copied</> : <><Copy className="size-3.5" /> Copy link</>}
                      </button>
                    </div>
                    <code className="block mt-1 text-xs font-mono text-muted-foreground truncate">{link}</code>
                  </div>
                );
              })}
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Chapters / description block</span>
                  <button type="button" onClick={copyDesc} className="min-h-9 px-3 rounded-lg border border-border bg-background hover:border-primary/40 inline-flex items-center gap-1 text-xs font-medium">
                    {copiedDesc ? <><Check className="size-3.5 text-primary" /> Copied</> : <><Copy className="size-3.5" /> Copy</>}
                  </button>
                </div>
                <pre className="mt-2 text-xs font-mono whitespace-pre-wrap bg-background rounded-lg p-3 border border-border">{description}</pre>
              </div>
            </>
          )}
        </aside>
      </div>
    </ToolLayout>
  );
}
