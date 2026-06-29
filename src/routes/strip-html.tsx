import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Code2, Copy } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/strip-html")({
  head: () => ({
    meta: [
      { title: "Strip HTML Tags — Clean HTML to Plain Text Free" },
      { name: "description", content: "Paste HTML and instantly get plain text. Option to keep line breaks, links and basic formatting." },
      { property: "og:title", content: "Strip HTML Tags — Bluebird" },
      { property: "og:description", content: "Turn messy HTML into clean plain text." },
      { property: "og:url", content: "/strip-html" },
    ],
    links: [{ rel: "canonical", href: "/strip-html" }],
  }),
  component: Page,
});

function strip(html: string, keepLinks: boolean, keepBreaks: boolean): string {
  if (typeof window === "undefined") return "";
  let h = html;
  if (keepBreaks) {
    h = h.replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|li|h[1-6]|tr)>/gi, "\n");
  }
  if (keepLinks) {
    h = h.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, "$2 ($1)");
  }
  const div = document.createElement("div");
  div.innerHTML = h;
  let text = div.textContent || "";
  text = text.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  return text;
}

function Page() {
  const [html, setHtml] = useState("<h1>Hello</h1><p>This is <a href=\"https://example.com\">a link</a>.</p>");
  const [keepLinks, setKeepLinks] = useState(true);
  const [keepBreaks, setKeepBreaks] = useState(true);
  const out = useMemo(() => strip(html, keepLinks, keepBreaks), [html, keepLinks, keepBreaks]);

  return (
    <ToolLayout slug="strip-html">
      <div className="soft-card p-4 sm:p-5 flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={keepBreaks} onChange={(e) => setKeepBreaks(e.target.checked)} /> Keep line breaks</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={keepLinks} onChange={(e) => setKeepLinks(e.target.checked)} /> Keep link URLs</label>
      </div>
      <div className="mt-4 grid lg:grid-cols-2 gap-4">
        <div>
          <label className="eyebrow" htmlFor="sh-in">HTML</label>
          <textarea id="sh-in" value={html} onChange={(e) => setHtml(e.target.value)}
            className="mt-1.5 w-full min-h-72 font-mono text-sm rounded-2xl border border-border bg-card p-4 focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="eyebrow" htmlFor="sh-out">Plain text</label>
            <button onClick={() => navigator.clipboard.writeText(out).catch(() => {})}
              className="text-sm text-primary hover:underline inline-flex items-center gap-1.5"><Copy className="size-4" /> Copy</button>
          </div>
          <textarea id="sh-out" value={out} readOnly
            className="mt-1.5 w-full min-h-72 text-sm rounded-2xl border border-border bg-primary-soft/30 p-4" />
        </div>
      </div>
      <div className="mt-3 text-sm text-muted-foreground inline-flex items-center gap-2">
        <Code2 className="size-4 text-primary" /> {out.length.toLocaleString()} characters
      </div>
      <HowItWorks>
        <li>Paste any HTML — a web page source, email or rich text.</li>
        <li>Choose whether to keep line breaks and link URLs.</li>
        <li>Copy the clean plain-text version.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
