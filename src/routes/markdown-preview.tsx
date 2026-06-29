import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { Copy, Check, Download, Trash2, Eye, Code2, Columns2 } from "lucide-react";

import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/markdown-preview")({
  head: () => ({
    meta: [
      { title: "Markdown Preview — Free Live Markdown Editor & Viewer" },
      { name: "description", content: "Write Markdown and see a live preview side-by-side. GitHub flavored, copy as HTML, download .md or .html. Free, private, no sign-up." },
      { property: "og:title", content: "Markdown Preview — Bluebird" },
      { property: "og:description", content: "Free live Markdown editor and previewer with GFM, copy HTML and download." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/markdown-preview" },
    ],
    links: [{ rel: "canonical", href: "/markdown-preview" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird Markdown Preview",
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: Page,
});

type View = "split" | "editor" | "preview";
const DRAFT_KEY = "bb-md-draft-v1";
const VIEW_KEY = "bb-md-view-v1";

const SAMPLE = `# Hello, Markdown 👋

Write on the **left**, see it rendered on the **right** — instantly.

## What you can use

- Headings, **bold**, _italic_, ~~strike~~
- [Links](https://example.com) and images
- Tables, task lists, code blocks

| Feature | Supported |
| --- | --- |
| GFM | yes |
| Tables | yes |
| Task lists | yes |

\`\`\`js
function hello(name) {
  return \`hi, \${name}\`;
}
\`\`\`

- [x] Live preview
- [ ] Your first note
`;

marked.setOptions({ gfm: true, breaks: false });

function renderMarkdown(src: string): string {
  if (typeof window === "undefined") return "";
  const raw = marked.parse(src, { async: false }) as string;
  const purify = (DOMPurify as unknown as { sanitize?: (s: string, o?: object) => string; default?: { sanitize: (s: string, o?: object) => string } });
  const sanitize = typeof purify.sanitize === "function" ? purify.sanitize : purify.default?.sanitize;
  return sanitize ? sanitize(raw, { USE_PROFILES: { html: true } }) : raw;
}

function countWords(s: string): number {
  return s.trim() ? s.trim().split(/\s+/).length : 0;
}

function Page() {
  const [md, setMd] = useState("");
  const [view, setView] = useState<View>("split");
  const [copied, setCopied] = useState<"html" | "md" | null>(null);

  useEffect(() => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      setMd(draft ?? SAMPLE);
      const v = localStorage.getItem(VIEW_KEY);
      if (v === "split" || v === "editor" || v === "preview") setView(v);
    } catch { setMd(SAMPLE); }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      try { localStorage.setItem(DRAFT_KEY, md); } catch { /* ignore */ }
    }, 300);
    return () => window.clearTimeout(id);
  }, [md]);

  useEffect(() => {
    try { localStorage.setItem(VIEW_KEY, view); } catch { /* ignore */ }
  }, [view]);

  const html = useMemo(() => renderMarkdown(md), [md]);
  const wc = countWords(md);
  const cc = md.length;

  async function copy(what: "html" | "md") {
    const value = what === "html" ? html : md;
    await navigator.clipboard.writeText(value);
    setCopied(what);
    window.setTimeout(() => setCopied(null), 1400);
  }

  function download(ext: "md" | "html") {
    const blob = new Blob([ext === "md" ? md : `<!doctype html><meta charset="utf-8"><title>Markdown export</title>\n${html}`], {
      type: ext === "md" ? "text/markdown" : "text/html",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bluebird-note.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const showEditor = view !== "preview";
  const showPreview = view !== "editor";

  return (
    <ToolLayout slug="markdown-preview">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div role="radiogroup" aria-label="View mode" className="inline-flex p-1 rounded-xl bg-muted">
          <ViewBtn current={view} value="editor" set={setView} Icon={Code2} label="Editor" />
          <ViewBtn current={view} value="split" set={setView} Icon={Columns2} label="Split" />
          <ViewBtn current={view} value="preview" set={setView} Icon={Eye} label="Preview" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => copy("md")} className="inline-flex items-center gap-1.5 min-h-10 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs">
            {copied === "md" ? <Check className="size-3.5" /> : <Copy className="size-3.5" />} Copy Markdown
          </button>
          <button onClick={() => copy("html")} className="inline-flex items-center gap-1.5 min-h-10 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs">
            {copied === "html" ? <Check className="size-3.5" /> : <Copy className="size-3.5" />} Copy HTML
          </button>
          <button onClick={() => download("md")} className="inline-flex items-center gap-1.5 min-h-10 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs">
            <Download className="size-3.5" /> .md
          </button>
          <button onClick={() => download("html")} className="inline-flex items-center gap-1.5 min-h-10 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs">
            <Download className="size-3.5" /> .html
          </button>
          <button onClick={() => setMd("")} className="inline-flex items-center gap-1.5 min-h-10 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs">
            <Trash2 className="size-3.5" /> Clear
          </button>
        </div>
      </div>

      <div className={`grid gap-6 ${view === "split" ? "lg:grid-cols-2" : "grid-cols-1"}`}>
        {showEditor && (
          <section className="soft-card p-4 sm:p-5">
            <label htmlFor="md-in" className="eyebrow">Markdown</label>
            <textarea
              id="md-in"
              value={md}
              onChange={(e) => setMd(e.target.value)}
              spellCheck={false}
              className="mt-2 w-full min-h-[60vh] rounded-xl border border-border bg-card p-3 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="mt-2 text-xs text-muted-foreground num">
              {wc} {wc === 1 ? "word" : "words"} · {cc} {cc === 1 ? "char" : "chars"}
            </p>
          </section>
        )}
        {showPreview && (
          <section className="soft-card p-4 sm:p-5">
            <div className="eyebrow mb-2">Preview</div>
            <article
              className="prose-bb min-h-[60vh] overflow-auto"
              aria-live="polite"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </section>
        )}
      </div>

      <HowItWorks>
        <li>Type or paste Markdown on the left. Your work auto-saves on this device.</li>
        <li>Watch the live preview render with GitHub-flavored Markdown — tables, task lists, code blocks.</li>
        <li>Copy the rendered HTML, or download a clean .md or .html file.</li>
      </HowItWorks>
    </ToolLayout>
  );
}

function ViewBtn({
  current, value, set, Icon, label,
}: {
  current: View; value: View; set: (v: View) => void; Icon: React.ComponentType<{ className?: string }>; label: string;
}) {
  const on = current === value;
  return (
    <button
      role="radio"
      aria-checked={on}
      onClick={() => set(value)}
      className={`inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg text-xs font-medium ${on ? "bg-card shadow-soft text-foreground" : "text-muted-foreground hover:text-foreground"}`}
    >
      <Icon className="size-3.5" /> {label}
    </button>
  );
}
