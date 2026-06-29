import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TypeIcon, Copy } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

const TypeI = TypeIcon;

export const Route = createFileRoute("/acronym-generator")({
  head: () => ({
    meta: [
      { title: "Acronym Generator — Make Acronyms From Any Phrase" },
      { name: "description", content: "Type a phrase and instantly get acronyms — first letters, first syllables, with or without small words." },
      { property: "og:title", content: "Acronym Generator — Bluebird" },
      { property: "og:description", content: "Turn any phrase into a snappy acronym." },
      { property: "og:url", content: "/acronym-generator" },
    ],
    links: [{ rel: "canonical", href: "/acronym-generator" }],
  }),
  component: Page,
});

const SMALL = new Set(["a","an","the","of","and","or","for","to","in","on","at","by","with","from"]);

function Page() {
  const [text, setText] = useState("World Health Organization");
  const [skipSmall, setSkipSmall] = useState(true);
  const [dots, setDots] = useState(false);
  const [lower, setLower] = useState(false);

  const variants = useMemo(() => {
    const words = text.split(/\s+/).filter(Boolean);
    const useable = skipSmall ? words.filter((w) => !SMALL.has(w.toLowerCase())) : words;
    const first = useable.map((w) => w[0] || "").join("");
    const formatted = (s: string) => {
      let v = lower ? s.toLowerCase() : s.toUpperCase();
      if (dots) v = v.split("").join(".") + ".";
      return v;
    };
    const camel = useable.map((w) => w[0]?.toUpperCase() + w.slice(1).toLowerCase()).join("");
    const twoLetter = useable.map((w) => w.slice(0, 2)).join("").toUpperCase();
    return [
      { label: "First letter", value: formatted(first) },
      { label: "First two letters", value: twoLetter },
      { label: "Camel case", value: camel },
      { label: "Lowercase first letters", value: first.toLowerCase() },
    ].filter((v) => v.value);
  }, [text, skipSmall, dots, lower]);

  return (
    <ToolLayout slug="acronym-generator">
      <div className="soft-card p-4 sm:p-5 space-y-3">
        <div>
          <label className="eyebrow" htmlFor="ac-in">Your phrase</label>
          <input id="ac-in" value={text} onChange={(e) => setText(e.target.value)}
            className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3 focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={skipSmall} onChange={(e) => setSkipSmall(e.target.checked)} /> Skip small words (a, the, of…)</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={dots} onChange={(e) => setDots(e.target.checked)} /> Add dots (U.S.A.)</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={lower} onChange={(e) => setLower(e.target.checked)} /> Lowercase</label>
        </div>
      </div>
      <div className="mt-4 grid sm:grid-cols-2 gap-3">
        {variants.map((v) => (
          <div key={v.label} className="soft-card p-5 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs text-muted-foreground">{v.label}</div>
              <div className="mt-1 text-2xl font-display font-semibold break-all">{v.value || "—"}</div>
            </div>
            <button onClick={() => navigator.clipboard.writeText(v.value).catch(() => {})}
              className="shrink-0 min-h-11 px-3 rounded-xl border border-border hover:border-primary inline-flex items-center gap-1.5 text-sm"><Copy className="size-4" /> Copy</button>
          </div>
        ))}
      </div>
      <div className="mt-3 text-sm text-muted-foreground inline-flex items-center gap-2">
        <TypeI className="size-4 text-primary" /> {text.split(/\s+/).filter(Boolean).length} words
      </div>
      <HowItWorks>
        <li>Type any phrase or company name.</li>
        <li>Skip small words like "of" and "the" if you want a cleaner acronym.</li>
        <li>Tap Copy on the variation you like best.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
