import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Tags, Copy, Check } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/meta-tag-generator")({
  head: () => ({
    meta: [
      { title: "Meta Tag Generator — SEO + Open Graph + Twitter" },
      { name: "description", content: "Generate complete SEO, Open Graph and Twitter meta tags for any page. Live preview of Google and social cards." },
      { property: "og:title", content: "Meta Tag Generator — Bluebird" },
      { property: "og:description", content: "All your SEO and social meta tags in seconds." },
      { property: "og:url", content: "/meta-tag-generator" },
    ],
    links: [{ rel: "canonical", href: "/meta-tag-generator" }],
  }),
  component: Page,
});

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function Page() {
  const [title, setTitle] = useState("Bluebird — Free Browser Tools");
  const [desc, setDesc] = useState("70+ free, private tools for images, PDFs, code and everyday tasks. Runs entirely in your browser.");
  const [url, setUrl] = useState("https://example.com");
  const [image, setImage] = useState("https://example.com/og.jpg");
  const [author, setAuthor] = useState("");
  const [twitter, setTwitter] = useState("");
  const [keywords, setKeywords] = useState("");
  const [copied, setCopied] = useState(false);

  const html = useMemo(() => {
    const lines: string[] = [
      `<title>${esc(title)}</title>`,
      `<meta name="description" content="${esc(desc)}" />`,
    ];
    if (keywords.trim()) lines.push(`<meta name="keywords" content="${esc(keywords)}" />`);
    if (author.trim()) lines.push(`<meta name="author" content="${esc(author)}" />`);
    if (url.trim()) lines.push(`<link rel="canonical" href="${esc(url)}" />`);
    lines.push(
      `<meta name="viewport" content="width=device-width, initial-scale=1" />`,
      `<meta name="robots" content="index, follow, max-image-preview:large" />`,
      ``,
      `<!-- Open Graph -->`,
      `<meta property="og:type" content="website" />`,
      `<meta property="og:title" content="${esc(title)}" />`,
      `<meta property="og:description" content="${esc(desc)}" />`,
      ...(url.trim() ? [`<meta property="og:url" content="${esc(url)}" />`] : []),
      ...(image.trim() ? [`<meta property="og:image" content="${esc(image)}" />`] : []),
      ``,
      `<!-- Twitter -->`,
      `<meta name="twitter:card" content="${image.trim() ? "summary_large_image" : "summary"}" />`,
      `<meta name="twitter:title" content="${esc(title)}" />`,
      `<meta name="twitter:description" content="${esc(desc)}" />`,
      ...(image.trim() ? [`<meta name="twitter:image" content="${esc(image)}" />`] : []),
      ...(twitter.trim() ? [`<meta name="twitter:creator" content="@${esc(twitter.replace(/^@/, ""))}" />`] : []),
    );
    return lines.join("\n");
  }, [title, desc, url, image, keywords, author, twitter]);

  function copy() {
    navigator.clipboard.writeText(html).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  }

  const titleLen = title.length, descLen = desc.length;

  return (
    <ToolLayout slug="meta-tag-generator">
      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2"><Tags className="size-5 text-primary" /><h2 className="font-display text-lg">Page details</h2></div>
          <Field label={`Page title (${titleLen}/60)`} hint={titleLen > 60 ? "Too long — Google may truncate" : undefined}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full h-12 rounded-xl border border-border bg-card px-3 focus:outline-none focus:ring-2 focus:ring-ring" />
          </Field>
          <Field label={`Description (${descLen}/160)`} hint={descLen > 160 ? "Too long — keep under 160 characters" : undefined}>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full min-h-24 rounded-xl border border-border bg-card p-3 focus:outline-none focus:ring-2 focus:ring-ring" />
          </Field>
          <Field label="Page URL">
            <input value={url} onChange={(e) => setUrl(e.target.value)} className="w-full h-12 rounded-xl border border-border bg-card px-3 focus:outline-none focus:ring-2 focus:ring-ring" />
          </Field>
          <Field label="Share image URL (1200×630)">
            <input value={image} onChange={(e) => setImage(e.target.value)} className="w-full h-12 rounded-xl border border-border bg-card px-3 focus:outline-none focus:ring-2 focus:ring-ring" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Author (optional)">
              <input value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full h-12 rounded-xl border border-border bg-card px-3 focus:outline-none focus:ring-2 focus:ring-ring" />
            </Field>
            <Field label="Twitter handle (optional)">
              <input value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="@username" className="w-full h-12 rounded-xl border border-border bg-card px-3 focus:outline-none focus:ring-2 focus:ring-ring" />
            </Field>
          </div>
          <Field label="Keywords (comma separated, optional)">
            <input value={keywords} onChange={(e) => setKeywords(e.target.value)} className="w-full h-12 rounded-xl border border-border bg-card px-3 focus:outline-none focus:ring-2 focus:ring-ring" />
          </Field>
        </section>

        <section className="space-y-4">
          <div className="soft-card p-5 sm:p-6">
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Google result preview</div>
            <div className="space-y-1">
              <div className="text-xs text-emerald-700 dark:text-emerald-400 truncate">{url || "https://example.com"}</div>
              <div className="text-lg text-blue-700 dark:text-blue-400 truncate">{title || "Page title"}</div>
              <div className="text-sm text-muted-foreground line-clamp-2">{desc || "Page description preview…"}</div>
            </div>
          </div>
          <div className="soft-card p-5 sm:p-6">
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Social card preview</div>
            <div className="rounded-xl border border-border overflow-hidden">
              {image && <div className="aspect-[1200/630] bg-muted"><img src={image} alt="" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} className="w-full h-full object-cover" /></div>}
              <div className="p-3 bg-card">
                <div className="text-xs text-muted-foreground uppercase truncate">{(() => { try { return new URL(url).hostname; } catch { return "example.com"; } })()}</div>
                <div className="font-medium truncate">{title}</div>
                <div className="text-sm text-muted-foreground line-clamp-2">{desc}</div>
              </div>
            </div>
          </div>
          <div className="soft-card p-5 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">HTML to paste into &lt;head&gt;</div>
              <button onClick={copy} className="inline-flex items-center gap-1.5 text-sm text-primary hover:bg-primary-soft px-3 py-1.5 rounded-lg">
                {copied ? <><Check className="size-4" /> Copied</> : <><Copy className="size-4" /> Copy</>}
              </button>
            </div>
            <pre className="font-mono text-xs whitespace-pre-wrap break-words rounded-xl bg-muted/50 p-4 max-h-80 overflow-auto">{html}</pre>
          </div>
        </section>
      </div>
      <HowItWorks>
        <li>Fill in your page title, description and URL.</li>
        <li>Add a 1200×630 share image for great-looking social posts.</li>
        <li>Copy the generated HTML and paste it inside the <code>&lt;head&gt;</code> of your page.</li>
      </HowItWorks>
    </ToolLayout>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-xs text-amber-600 dark:text-amber-400 mt-1">{hint}</span>}
    </label>
  );
}
