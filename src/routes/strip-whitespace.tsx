import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlignLeft, Copy } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/strip-whitespace")({
  head: () => ({
    meta: [
      { title: "Whitespace Remover — Clean Extra Spaces & Lines Free" },
      { name: "description", content: "Trim lines, collapse double spaces, remove blank lines and zap tabs. Paste text and clean it instantly." },
      { property: "og:title", content: "Whitespace Remover — Bluebird" },
      { property: "og:description", content: "Clean spaces, tabs and blank lines from any text." },
      { property: "og:url", content: "/strip-whitespace" },
    ],
    links: [{ rel: "canonical", href: "/strip-whitespace" }],
  }),
  component: Page,
});

function Page() {
  const [text, setText] = useState("Hello   world  \n\n\n   foo\tbar\t\tbaz   \n");
  const [trim, setTrim] = useState(true);
  const [collapse, setCollapse] = useState(true);
  const [dropBlank, setDropBlank] = useState(true);
  const [tabs, setTabs] = useState(true);
  const [allSpaces, setAllSpaces] = useState(false);

  const out = useMemo(() => {
    let s = text;
    if (tabs) s = s.replace(/\t/g, " ");
    if (collapse) s = s.replace(/[ ]{2,}/g, " ");
    if (trim) s = s.split("\n").map((l) => l.replace(/[ \t]+$/g, "").replace(/^[ \t]+/g, "")).join("\n");
    if (dropBlank) s = s.replace(/\n\s*\n+/g, "\n");
    if (allSpaces) s = s.replace(/\s+/g, "");
    return s;
  }, [text, trim, collapse, dropBlank, tabs, allSpaces]);

  return (
    <ToolLayout slug="strip-whitespace">
      <div className="soft-card p-4 sm:p-5 flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={trim} onChange={(e) => setTrim(e.target.checked)} /> Trim each line</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={collapse} onChange={(e) => setCollapse(e.target.checked)} /> Collapse double spaces</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={dropBlank} onChange={(e) => setDropBlank(e.target.checked)} /> Remove blank lines</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={tabs} onChange={(e) => setTabs(e.target.checked)} /> Tabs to spaces</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={allSpaces} onChange={(e) => setAllSpaces(e.target.checked)} /> Remove all whitespace</label>
      </div>
      <div className="mt-4 grid lg:grid-cols-2 gap-4">
        <div>
          <label className="eyebrow" htmlFor="sw-in">Original</label>
          <textarea id="sw-in" value={text} onChange={(e) => setText(e.target.value)}
            className="mt-1.5 w-full min-h-72 font-mono text-sm rounded-2xl border border-border bg-card p-4 focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="eyebrow" htmlFor="sw-out">Cleaned</label>
            <button onClick={() => navigator.clipboard.writeText(out).catch(() => {})}
              className="text-sm text-primary hover:underline inline-flex items-center gap-1.5"><Copy className="size-4" /> Copy</button>
          </div>
          <textarea id="sw-out" value={out} readOnly
            className="mt-1.5 w-full min-h-72 font-mono text-sm rounded-2xl border border-border bg-primary-soft/30 p-4" />
        </div>
      </div>
      <div className="mt-3 text-sm text-muted-foreground inline-flex items-center gap-2">
        <AlignLeft className="size-4 text-primary" /> Saved {Math.max(0, text.length - out.length).toLocaleString()} characters
      </div>
      <HowItWorks>
        <li>Paste your messy text.</li>
        <li>Pick which kind of whitespace to clean.</li>
        <li>Copy the tidy result.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
