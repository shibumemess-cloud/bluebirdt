import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GraduationCap } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/readability-score")({
  head: () => ({
    meta: [
      { title: "Readability Score — Flesch-Kincaid & Grade Level Free" },
      { name: "description", content: "Check the Flesch Reading Ease and Flesch-Kincaid Grade Level of any text. See what age can read it comfortably." },
      { property: "og:title", content: "Readability Score — Bluebird" },
      { property: "og:description", content: "How easy is your writing to read? Get an instant grade." },
      { property: "og:url", content: "/readability-score" },
    ],
    links: [{ rel: "canonical", href: "/readability-score" }],
  }),
  component: Page,
});

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!word) return 0;
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

function ease(score: number): { label: string; tone: string } {
  if (score >= 90) return { label: "Very easy — 5th grader", tone: "text-emerald-600" };
  if (score >= 80) return { label: "Easy — 6th grade", tone: "text-emerald-600" };
  if (score >= 70) return { label: "Fairly easy — 7th grade", tone: "text-emerald-600" };
  if (score >= 60) return { label: "Plain English — 8–9th grade", tone: "text-amber-600" };
  if (score >= 50) return { label: "Fairly hard — 10–12th grade", tone: "text-amber-600" };
  if (score >= 30) return { label: "Hard — college student", tone: "text-orange-600" };
  return { label: "Very hard — college graduate", tone: "text-red-600" };
}

function Page() {
  const [text, setText] = useState("");
  const stats = useMemo(() => {
    const sentences = (text.match(/[^.!?]+[.!?]+/g) || (text.trim() ? [text] : [])).length;
    const words = text.trim() ? text.trim().split(/\s+/) : [];
    const syllables = words.reduce((s, w) => s + countSyllables(w), 0);
    const W = words.length || 1;
    const S = Math.max(1, sentences);
    const reading = 206.835 - 1.015 * (W / S) - 84.6 * (syllables / W);
    const grade = 0.39 * (W / S) + 11.8 * (syllables / W) - 15.59;
    return { sentences: S, words: words.length, syllables, reading, grade };
  }, [text]);
  const judge = ease(stats.reading);

  return (
    <ToolLayout slug="readability-score">
      <div className="grid lg:grid-cols-2 gap-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your writing to score it…"
          className="min-h-72 rounded-2xl border border-border bg-card p-4 focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="space-y-4">
          <div className="soft-card p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><GraduationCap className="size-4 text-primary" /> Flesch Reading Ease</div>
            <div className="mt-1 text-4xl font-display font-semibold">{stats.words ? stats.reading.toFixed(1) : "—"}</div>
            <div className={`mt-1 text-sm font-medium ${judge.tone}`}>{stats.words ? judge.label : "Add some text"}</div>
          </div>
          <div className="soft-card p-5">
            <div className="text-sm text-muted-foreground">Flesch-Kincaid Grade Level</div>
            <div className="mt-1 text-3xl font-display font-semibold">{stats.words ? Math.max(0, stats.grade).toFixed(1) : "—"}</div>
            <div className="mt-1 text-sm text-muted-foreground">US school grade needed to understand</div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="soft-card p-4"><div className="text-muted-foreground">Words</div><div className="font-semibold text-lg">{stats.words.toLocaleString()}</div></div>
            <div className="soft-card p-4"><div className="text-muted-foreground">Sentences</div><div className="font-semibold text-lg">{stats.sentences}</div></div>
            <div className="soft-card p-4"><div className="text-muted-foreground">Syllables</div><div className="font-semibold text-lg">{stats.syllables}</div></div>
          </div>
        </div>
      </div>
      <HowItWorks>
        <li>Paste the writing you want to test.</li>
        <li>See the Flesch Reading Ease and grade level update as you type.</li>
        <li>Aim for 60 or higher for general audiences — news, marketing, support pages.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
