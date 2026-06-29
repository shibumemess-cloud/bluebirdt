import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookOpen } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/reading-time")({
  head: () => ({
    meta: [
      { title: "Reading Time Estimator — Words to Minutes Free" },
      { name: "description", content: "Paste any text and instantly see how long it takes to read at slow, average and fast reading speeds." },
      { property: "og:title", content: "Reading Time Estimator — Bluebird" },
      { property: "og:description", content: "How long will it take to read this? Get an instant estimate." },
      { property: "og:url", content: "/reading-time" },
    ],
    links: [{ rel: "canonical", href: "/reading-time" }],
  }),
  component: Page,
});

function fmt(min: number): string {
  if (min < 1) return `${Math.max(1, Math.round(min * 60))} sec`;
  if (min < 60) return `${Math.round(min)} min`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

function Page() {
  const [text, setText] = useState("");
  const [wpm, setWpm] = useState(225);

  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    return {
      words,
      chars,
      slow: words / 150,
      avg: words / wpm,
      fast: words / 300,
      speak: words / 130,
    };
  }, [text, wpm]);

  return (
    <ToolLayout slug="reading-time">
      <div className="grid lg:grid-cols-2 gap-4">
        <div>
          <label htmlFor="rt-in" className="eyebrow">Your text</label>
          <textarea
            id="rt-in"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste an article, email, post or chapter…"
            className="mt-1.5 w-full min-h-72 rounded-2xl border border-border bg-card p-4 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="space-y-4">
          <div className="soft-card p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="size-4 text-primary" /> Estimated reading time
            </div>
            <div className="mt-1 text-4xl font-display font-semibold">{fmt(stats.avg)}</div>
            <div className="mt-1 text-sm text-muted-foreground">at {wpm} words per minute · {stats.words.toLocaleString()} words</div>
          </div>
          <div className="soft-card p-5">
            <label className="eyebrow" htmlFor="rt-wpm">Reading speed: {wpm} wpm</label>
            <input id="rt-wpm" type="range" min={120} max={400} step={5} value={wpm} onChange={(e) => setWpm(Number(e.target.value))} className="mt-2 w-full" />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>Slow 120</span><span>Avg 225</span><span>Fast 400</span></div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="soft-card p-4"><div className="text-muted-foreground">Slow reader</div><div className="font-semibold text-lg">{fmt(stats.slow)}</div></div>
            <div className="soft-card p-4"><div className="text-muted-foreground">Fast reader</div><div className="font-semibold text-lg">{fmt(stats.fast)}</div></div>
            <div className="soft-card p-4"><div className="text-muted-foreground">Read aloud</div><div className="font-semibold text-lg">{fmt(stats.speak)}</div></div>
            <div className="soft-card p-4"><div className="text-muted-foreground">Characters</div><div className="font-semibold text-lg">{stats.chars.toLocaleString()}</div></div>
          </div>
        </div>
      </div>
      <HowItWorks>
        <li>Paste your text in the box on the left.</li>
        <li>Move the speed slider to match how fast you read.</li>
        <li>See the reading time update live, plus a read-aloud estimate.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
