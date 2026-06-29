import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ToolLayout } from "../components/ToolLayout";
import { Field, HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/yt-title-counter")({
  head: () => ({
    meta: [
      { title: "YouTube Title & Description Character Counter" },
      { name: "description", content: "Count characters for YouTube titles, descriptions, tags and Shorts captions — with best-practice limits and a search preview." },
      { property: "og:title", content: "YouTube Title & Description Counter — Bluebird" },
      { property: "og:description", content: "Stay inside YouTube's character limits for titles, descriptions and tags." },
      { property: "og:url", content: "/yt-title-counter" },
    ],
    links: [{ rel: "canonical", href: "/yt-title-counter" }],
  }),
  component: Page,
});

const LIMITS = { title: 100, titleSweet: 70, desc: 5000, descAboveFold: 157, tags: 500, shorts: 100 };

function Bar({ value, limit, label, sweet }: { value: number; limit: number; label: string; sweet?: number }) {
  const pct = Math.min(100, (value / limit) * 100);
  const state = value > limit ? "over" : sweet && value > sweet ? "warn" : "ok";
  const color = state === "over" ? "bg-destructive" : state === "warn" ? "bg-amber-500" : "bg-primary";
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold">{label}</span>
        <span className={`text-sm font-mono ${state === "over" ? "text-destructive font-bold" : "text-muted-foreground"}`}>
          {value} / {limit}
        </span>
      </div>
      <div className="mt-1.5 h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      {sweet && state !== "over" && (
        <p className="mt-1 text-xs text-muted-foreground">Sweet spot under {sweet} so it isn't cut off in search results.</p>
      )}
      {state === "over" && <p className="mt-1 text-xs text-destructive font-medium">Over the limit — YouTube won't accept this.</p>}
    </div>
  );
}

function Page() {
  const [title, setTitle] = useState("How to Edit Faster in DaVinci Resolve — 7 Quick Wins");
  const [desc, setDesc] = useState("In this tutorial we break down seven editing shortcuts that will save you hours every week.\n\nTimestamps:\n0:00 Intro\n1:30 Shortcut 1");
  const [tags, setTags] = useState("video editing, davinci resolve, tutorial, editing tips, beginner");

  const tagList = useMemo(() => tags.split(",").map((t) => t.trim()).filter(Boolean), [tags]);
  const tagChars = tags.replace(/\s*,\s*/g, ",").length;
  const descLines = desc.split("\n").length;
  const descWords = desc.trim() ? desc.trim().split(/\s+/).length : 0;

  return (
    <ToolLayout slug="yt-title-counter">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 md:col-span-7 space-y-5">
          <Field label="Video title">
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full min-h-12 rounded-xl border border-border bg-card px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </Field>
          <Bar value={title.length} limit={LIMITS.title} sweet={LIMITS.titleSweet} label="Title" />

          <Field label="Description">
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={8}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </Field>
          <Bar value={desc.length} limit={LIMITS.desc} label="Description" />
          <div className="text-xs text-muted-foreground">{descWords} words · {descLines} lines · first {LIMITS.descAboveFold} chars show above the "Show more" fold</div>

          <Field label="Tags" hint="Comma-separated. YouTube counts the full string including commas.">
            <textarea value={tags} onChange={(e) => setTags(e.target.value)} rows={3}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </Field>
          <Bar value={tagChars} limit={LIMITS.tags} label={`Tags (${tagList.length})`} />

          <HowItWorks>
            YouTube caps titles at 100 characters, descriptions at 5,000 and the tag field at 500. We also
            show the 157-character "above the fold" cut-off — viewers see this part before tapping
            <em> Show more</em>. Put your hook, links and timestamps near the top.
          </HowItWorks>
        </div>

        <aside className="col-span-12 md:col-span-5">
          <div className="soft-card p-5 sm:p-6 space-y-4">
            <div>
              <span className="eyebrow">Search preview</span>
              <div className="mt-2 p-4 rounded-xl border border-border bg-card">
                <div className="text-[15px] font-semibold text-primary line-clamp-2">{title || "Your title appears here"}</div>
                <div className="text-xs text-muted-foreground mt-1">youtube.com › watch</div>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{desc.slice(0, LIMITS.descAboveFold) || "Your description preview appears here."}</p>
              </div>
            </div>
            <div>
              <span className="eyebrow">Tag chips</span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tagList.length === 0 && <span className="text-sm text-muted-foreground">Tags appear here.</span>}
                {tagList.map((t, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">#{t.replace(/\s+/g, "")}</span>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </ToolLayout>
  );
}
