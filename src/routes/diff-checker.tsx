import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { diffLines, diffWordsWithSpace } from "diff";
import { ShieldCheck, ArrowLeftRight } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";

export const Route = createFileRoute("/diff-checker")({
  head: () => ({
    meta: [
      { title: "Diff Checker — Compare Text Online Free" },
      { name: "description", content: "Compare two blocks of text or code and see every change highlighted. Runs in your browser — no upload, no signup, fully private." },
      { property: "og:title", content: "Diff Checker — Bluebird" },
      { property: "og:description", content: "Side-by-side text and code comparison with line and word highlighting. Private, in-browser." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/diff-checker" },
    ],
    links: [{ rel: "canonical", href: "/diff-checker" }],
  }),
  component: Page,
});

const SAMPLE_A = `function greet(name) {
  console.log("Hello, " + name);
  return name;
}`;
const SAMPLE_B = `function greet(name) {
  console.log(\`Hi there, \${name}!\`);
  return name.trim();
}`;

type Mode = "line" | "word";

function Page() {
  const [a, setA] = useState(SAMPLE_A);
  const [b, setB] = useState(SAMPLE_B);
  const [mode, setMode] = useState<Mode>("line");
  const [ignoreCase, setIgnoreCase] = useState(false);

  const result = useMemo(() => {
    if (mode === "word") {
      return diffWordsWithSpace(a, b, { ignoreCase } as never) ?? [];
    }
    return diffLines(a, b) ?? [];
  }, [a, b, mode, ignoreCase]);

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    for (const part of result) {
      if (part.added) added += part.count ?? part.value.split("\n").length;
      else if (part.removed) removed += part.count ?? part.value.split("\n").length;
    }
    return { added, removed };
  }, [result]);

  function swap() {
    setA(b);
    setB(a);
  }

  return (
    <ToolLayout slug="diff-checker">
      <div className="space-y-6">
        {/* Controls */}
        <div className="soft-card p-4 sm:p-5 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex flex-wrap gap-2">
            <ModeButton active={mode === "line"} onClick={() => setMode("line")}>By line</ModeButton>
            <ModeButton active={mode === "word"} onClick={() => setMode("word")}>By word</ModeButton>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={ignoreCase}
                onChange={(e) => setIgnoreCase(e.target.checked)}
                className="size-4 accent-[color:var(--color-primary)]"
              />
              Ignore case
            </label>
            <button
              type="button"
              onClick={swap}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-4"
            >
              <ArrowLeftRight className="size-4" /> Swap sides
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-6">
            <label htmlFor="diff-a" className="text-sm font-semibold">
              Original
            </label>
            <textarea
              id="diff-a"
              value={a}
              onChange={(e) => setA(e.target.value)}
              spellCheck={false}
              className="mt-2 w-full min-h-56 font-mono text-sm rounded-2xl border border-border bg-card p-4 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="col-span-12 lg:col-span-6">
            <label htmlFor="diff-b" className="text-sm font-semibold">
              Changed
            </label>
            <textarea
              id="diff-b"
              value={b}
              onChange={(e) => setB(e.target.value)}
              spellCheck={false}
              className="mt-2 w-full min-h-56 font-mono text-sm rounded-2xl border border-border bg-card p-4 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        {/* Diff result */}
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-sm font-semibold">Differences</h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-emerald-500/70" /> +{stats.added} added
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-rose-500/70" /> −{stats.removed} removed
              </span>
            </div>
          </div>
          <div className="soft-card overflow-hidden">
            <pre className="font-mono text-sm leading-relaxed p-4 overflow-x-auto whitespace-pre-wrap break-words">
              {result.map((part, i) => {
                if (part.added) {
                  return (
                    <span
                      key={i}
                      className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 rounded px-0.5"
                    >
                      {part.value}
                    </span>
                  );
                }
                if (part.removed) {
                  return (
                    <span
                      key={i}
                      className="bg-rose-500/15 text-rose-700 dark:text-rose-300 line-through rounded px-0.5"
                    >
                      {part.value}
                    </span>
                  );
                }
                return <span key={i} className="text-muted-foreground">{part.value}</span>;
              })}
            </pre>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-border bg-primary-soft/40 px-4 py-3 text-sm">
          <ShieldCheck className="size-5 text-primary shrink-0 mt-0.5" />
          <p className="text-muted-foreground">
            Both texts stay in your browser. Diffchecker.com uploads everything you paste — Bluebird never does.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-card border border-border hover:border-primary/60",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
