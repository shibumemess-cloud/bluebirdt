import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";

export const Route = createFileRoute("/regex-tester")({
  head: () => ({
    meta: [
      { title: "Regex Tester — Test Regular Expressions Online Free" },
      { name: "description", content: "Test JavaScript regular expressions with live highlighting, capture groups and flag toggles. Runs in your browser — no signup, no upload." },
      { property: "og:title", content: "Regex Tester — Bluebird" },
      { property: "og:description", content: "Live regex tester with capture groups and flag toggles. Fully private, in your browser." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/regex-tester" },
    ],
    links: [{ rel: "canonical", href: "/regex-tester" }],
  }),
  component: Page,
});

const SAMPLE_PATTERN = "\\b([A-Z][a-z]+)\\s([A-Z][a-z]+)\\b";
const SAMPLE_TEXT =
  "Ada Lovelace wrote the first program. Grace Hopper built the first compiler. Linus Torvalds created Linux in 1991.";

type Flag = "g" | "i" | "m" | "s" | "u" | "y";
const ALL_FLAGS: { id: Flag; label: string; hint: string }[] = [
  { id: "g", label: "g", hint: "Global — find all matches" },
  { id: "i", label: "i", hint: "Case-insensitive" },
  { id: "m", label: "m", hint: "Multiline — ^ and $ per line" },
  { id: "s", label: "s", hint: "Dot matches newlines" },
  { id: "u", label: "u", hint: "Unicode" },
  { id: "y", label: "y", hint: "Sticky — match from lastIndex" },
];

type Match = { start: number; end: number; text: string; groups: string[] };

function runRegex(pattern: string, flags: string, text: string): { matches: Match[]; error?: string } {
  if (!pattern) return { matches: [] };
  let re: RegExp;
  try {
    const safeFlags = flags.includes("g") ? flags : flags + "g"; // need g to iterate
    re = new RegExp(pattern, safeFlags);
  } catch (e) {
    return { matches: [], error: (e as Error).message };
  }
  const matches: Match[] = [];
  let m: RegExpExecArray | null;
  let safety = 0;
  while ((m = re.exec(text)) !== null) {
    if (m[0].length === 0) {
      re.lastIndex++; // avoid infinite loop on empty matches
      continue;
    }
    matches.push({
      start: m.index,
      end: m.index + m[0].length,
      text: m[0],
      groups: m.slice(1).map((g) => g ?? ""),
    });
    if (++safety > 10_000) break;
  }
  return { matches };
}

function Page() {
  const [pattern, setPattern] = useState(SAMPLE_PATTERN);
  const [flags, setFlags] = useState<Set<Flag>>(new Set(["g"]));
  const [text, setText] = useState(SAMPLE_TEXT);

  const { matches, error } = useMemo(
    () => runRegex(pattern, [...flags].join(""), text),
    [pattern, flags, text],
  );

  function toggle(flag: Flag) {
    const next = new Set(flags);
    if (next.has(flag)) next.delete(flag);
    else next.add(flag);
    setFlags(next);
  }

  return (
    <ToolLayout slug="regex-tester">
      <div className="space-y-6">
        {/* Pattern + flags */}
        <div className="soft-card p-4 sm:p-5 space-y-4">
          <div>
            <label htmlFor="rx-pattern" className="text-sm font-semibold">
              Regular expression
            </label>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary/40">
              <span className="font-mono text-muted-foreground">/</span>
              <input
                id="rx-pattern"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                spellCheck={false}
                className="flex-1 font-mono text-sm bg-transparent focus:outline-none"
                placeholder="\\bword\\b"
              />
              <span className="font-mono text-muted-foreground">/</span>
              <span className="font-mono text-primary text-sm">{[...flags].join("")}</span>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold mb-2">Flags</div>
            <div className="flex flex-wrap gap-2">
              {ALL_FLAGS.map((f) => {
                const active = flags.has(f.id);
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => toggle(f.id)}
                    aria-pressed={active}
                    title={f.hint}
                    className={[
                      "rounded-lg border px-3 py-1.5 text-sm font-mono transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card hover:border-primary/60",
                    ].join(" ")}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
              <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Text + matches */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="rx-text" className="text-sm font-semibold">
                Test text
              </label>
              <div className="text-xs text-muted-foreground">
                {matches.length} match{matches.length === 1 ? "" : "es"}
              </div>
            </div>
            <textarea
              id="rx-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              spellCheck={false}
              className="w-full min-h-56 font-mono text-sm rounded-2xl border border-border bg-card p-4 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <Highlighted text={text} matches={matches} />
          </div>

          <aside className="col-span-12 lg:col-span-5 space-y-3">
            <div className="text-sm font-semibold">Matches &amp; capture groups</div>
            {matches.length === 0 ? (
              <div className="soft-card p-6 text-center text-sm text-muted-foreground">
                No matches yet. Try a different pattern or test text.
              </div>
            ) : (
              <div className="space-y-2 max-h-[28rem] overflow-y-auto pr-1">
                {matches.map((m, i) => (
                  <div key={i} className="soft-card p-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Match {i + 1}</span>
                      <span className="font-mono">[{m.start}–{m.end}]</span>
                    </div>
                    <div className="mt-1 font-mono text-sm break-all">{m.text}</div>
                    {m.groups.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {m.groups.map((g, j) => (
                          <li key={j} className="text-xs">
                            <span className="text-muted-foreground">${j + 1}: </span>
                            <span className="font-mono">{g || <em className="opacity-60">empty</em>}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-start gap-3 rounded-xl border border-border bg-primary-soft/40 px-4 py-3 text-sm">
              <ShieldCheck className="size-5 text-primary shrink-0 mt-0.5" />
              <p className="text-muted-foreground">
                Patterns run through the browser's native <code className="font-mono">RegExp</code> engine. Nothing is sent to a server.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </ToolLayout>
  );
}

function Highlighted({ text, matches }: { text: string; matches: Match[] }) {
  if (matches.length === 0) {
    return (
      <div className="soft-card p-4 font-mono text-sm whitespace-pre-wrap break-words">
        {text || <span className="text-muted-foreground">Preview appears here…</span>}
      </div>
    );
  }
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  matches.forEach((m, i) => {
    if (cursor < m.start) parts.push(text.slice(cursor, m.start));
    parts.push(
      <mark
        key={i}
        className="rounded px-0.5 bg-primary/20 text-foreground"
      >
        {text.slice(m.start, m.end)}
      </mark>,
    );
    cursor = m.end;
  });
  if (cursor < text.length) parts.push(text.slice(cursor));
  return (
    <div className="soft-card p-4 font-mono text-sm whitespace-pre-wrap break-words leading-relaxed">
      {parts}
    </div>
  );
}
