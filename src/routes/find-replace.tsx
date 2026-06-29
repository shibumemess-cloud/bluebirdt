import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Copy } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/find-replace")({
  head: () => ({
    meta: [
      { title: "Find and Replace — Multi-line Text & Regex Free" },
      { name: "description", content: "Find and replace words, phrases or regex patterns across long blocks of text. Live preview and replacement count." },
      { property: "og:title", content: "Find and Replace — Bluebird" },
      { property: "og:description", content: "Bulk find-and-replace with optional regex." },
      { property: "og:url", content: "/find-replace" },
    ],
    links: [{ rel: "canonical", href: "/find-replace" }],
  }),
  component: Page,
});

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function Page() {
  const [text, setText] = useState("The quick brown fox jumps over the lazy dog. The dog barks.");
  const [find, setFind] = useState("dog");
  const [replace, setReplace] = useState("cat");
  const [regex, setRegex] = useState(false);
  const [ci, setCi] = useState(false);
  const [whole, setWhole] = useState(false);

  const { out, count, error } = useMemo(() => {
    if (!find) return { out: text, count: 0, error: null as string | null };
    try {
      let pattern = regex ? find : escapeRe(find);
      if (whole && !regex) pattern = `\\b${pattern}\\b`;
      const re = new RegExp(pattern, "g" + (ci ? "i" : ""));
      let n = 0;
      const o = text.replace(re, (...args) => { n++; return regex ? replace.replace(/\$(\d+)/g, (_, g) => args[Number(g)] || "") : replace; });
      return { out: o, count: n, error: null };
    } catch (e) {
      return { out: text, count: 0, error: (e as Error).message };
    }
  }, [text, find, replace, regex, ci, whole]);

  return (
    <ToolLayout slug="find-replace">
      <div className="soft-card p-4 sm:p-5 grid sm:grid-cols-2 gap-3">
        <div>
          <label className="eyebrow" htmlFor="fr-find">Find</label>
          <input id="fr-find" value={find} onChange={(e) => setFind(e.target.value)}
            className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3 font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="eyebrow" htmlFor="fr-rep">Replace with</label>
          <input id="fr-rep" value={replace} onChange={(e) => setReplace(e.target.value)}
            className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3 font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="sm:col-span-2 flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={regex} onChange={(e) => setRegex(e.target.checked)} /> Regular expression</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={ci} onChange={(e) => setCi(e.target.checked)} /> Case insensitive</label>
          <label className="flex items-center gap-2"><input type="checkbox" disabled={regex} checked={whole && !regex} onChange={(e) => setWhole(e.target.checked)} /> Whole words only</label>
        </div>
        {error ? <div className="sm:col-span-2 text-sm text-red-600">Regex error: {error}</div> : null}
      </div>
      <div className="mt-4 grid lg:grid-cols-2 gap-4">
        <div>
          <label className="eyebrow" htmlFor="fr-in">Original</label>
          <textarea id="fr-in" value={text} onChange={(e) => setText(e.target.value)}
            className="mt-1.5 w-full min-h-72 font-mono text-sm rounded-2xl border border-border bg-card p-4 focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="eyebrow" htmlFor="fr-out">Result</label>
            <button onClick={() => navigator.clipboard.writeText(out).catch(() => {})}
              className="text-sm text-primary hover:underline inline-flex items-center gap-1.5"><Copy className="size-4" /> Copy</button>
          </div>
          <textarea id="fr-out" value={out} readOnly
            className="mt-1.5 w-full min-h-72 font-mono text-sm rounded-2xl border border-border bg-primary-soft/30 p-4" />
        </div>
      </div>
      <div className="mt-3 text-sm text-muted-foreground inline-flex items-center gap-2">
        <Search className="size-4 text-primary" /> Made {count} {count === 1 ? "replacement" : "replacements"}
      </div>
      <HowItWorks>
        <li>Paste your text on the left.</li>
        <li>Type what to find and what to replace it with. Turn on regex for advanced patterns.</li>
        <li>Copy the cleaned result — your original text stays unchanged.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
