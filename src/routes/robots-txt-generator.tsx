import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bot, Copy, Check, Plus, Trash2 } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/robots-txt-generator")({
  head: () => ({
    meta: [
      { title: "Robots.txt Generator — Allow, Disallow, Sitemap" },
      { name: "description", content: "Build a clean robots.txt file with custom rules per user agent. Includes sitemap, crawl delay, and best-practice presets." },
      { property: "og:title", content: "Robots.txt Generator — Bluebird" },
      { property: "og:description", content: "Generate a search-engine-ready robots.txt in seconds." },
      { property: "og:url", content: "/robots-txt-generator" },
    ],
    links: [{ rel: "canonical", href: "/robots-txt-generator" }],
  }),
  component: Page,
});

interface Group { agent: string; allow: string; disallow: string; crawlDelay: string }

function Page() {
  const [sitemap, setSitemap] = useState("https://example.com/sitemap.xml");
  const [host, setHost] = useState("");
  const [groups, setGroups] = useState<Group[]>([{ agent: "*", allow: "/", disallow: "", crawlDelay: "" }]);
  const [copied, setCopied] = useState(false);

  const text = useMemo(() => {
    const out: string[] = [];
    groups.forEach((g, i) => {
      if (i > 0) out.push("");
      out.push(`User-agent: ${g.agent || "*"}`);
      g.disallow.split("\n").map((l) => l.trim()).filter(Boolean).forEach((l) => out.push(`Disallow: ${l}`));
      g.allow.split("\n").map((l) => l.trim()).filter(Boolean).forEach((l) => out.push(`Allow: ${l}`));
      if (g.crawlDelay.trim()) out.push(`Crawl-delay: ${g.crawlDelay.trim()}`);
    });
    if (host.trim()) { out.push("", `Host: ${host.trim()}`); }
    if (sitemap.trim()) {
      out.push("");
      sitemap.split("\n").map((l) => l.trim()).filter(Boolean).forEach((s) => out.push(`Sitemap: ${s}`));
    }
    return out.join("\n");
  }, [groups, sitemap, host]);

  function update(i: number, patch: Partial<Group>) {
    setGroups((g) => g.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  }
  function remove(i: number) { setGroups((g) => g.filter((_, idx) => idx !== i)); }
  function add() { setGroups((g) => [...g, { agent: "Googlebot", allow: "", disallow: "", crawlDelay: "" }]); }

  function preset(kind: "allow-all" | "block-all" | "wp") {
    if (kind === "allow-all") setGroups([{ agent: "*", allow: "/", disallow: "", crawlDelay: "" }]);
    if (kind === "block-all") setGroups([{ agent: "*", allow: "", disallow: "/", crawlDelay: "" }]);
    if (kind === "wp") setGroups([{ agent: "*", allow: "/wp-admin/admin-ajax.php", disallow: "/wp-admin/\n/wp-login.php\n/?s=\n/search/", crawlDelay: "" }]);
  }

  function copy() {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  }
  function download() {
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "robots.txt";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  return (
    <ToolLayout slug="robots-txt-generator">
      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2"><Bot className="size-5 text-primary" /><h2 className="font-display text-lg">Rules</h2></div>
            <div className="flex gap-1 text-xs">
              <button onClick={() => preset("allow-all")} className="px-3 py-1.5 rounded-lg border border-border hover:bg-primary-soft">Allow all</button>
              <button onClick={() => preset("block-all")} className="px-3 py-1.5 rounded-lg border border-border hover:bg-primary-soft">Block all</button>
              <button onClick={() => preset("wp")} className="px-3 py-1.5 rounded-lg border border-border hover:bg-primary-soft">WordPress</button>
            </div>
          </div>
          {groups.map((g, i) => (
            <div key={i} className="rounded-2xl border border-border p-4 space-y-3 bg-card">
              <div className="flex items-center gap-2">
                <label className="flex-1">
                  <span className="block text-xs font-medium text-muted-foreground mb-1">User-agent</span>
                  <input value={g.agent} onChange={(e) => update(i, { agent: e.target.value })} placeholder="* or Googlebot" className="w-full h-11 rounded-lg border border-border bg-background px-3 focus:outline-none focus:ring-2 focus:ring-ring" />
                </label>
                {groups.length > 1 && (
                  <button onClick={() => remove(i)} aria-label="Remove group" className="mt-5 p-2 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10">
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <label>
                  <span className="block text-xs font-medium text-muted-foreground mb-1">Disallow (one path per line)</span>
                  <textarea value={g.disallow} onChange={(e) => update(i, { disallow: e.target.value })} placeholder="/admin/" className="w-full min-h-24 rounded-lg border border-border bg-background p-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
                </label>
                <label>
                  <span className="block text-xs font-medium text-muted-foreground mb-1">Allow (one path per line)</span>
                  <textarea value={g.allow} onChange={(e) => update(i, { allow: e.target.value })} placeholder="/" className="w-full min-h-24 rounded-lg border border-border bg-background p-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
                </label>
              </div>
              <label className="block max-w-xs">
                <span className="block text-xs font-medium text-muted-foreground mb-1">Crawl-delay (seconds, optional)</span>
                <input value={g.crawlDelay} onChange={(e) => update(i, { crawlDelay: e.target.value })} inputMode="numeric" className="w-full h-11 rounded-lg border border-border bg-background px-3 focus:outline-none focus:ring-2 focus:ring-ring" />
              </label>
            </div>
          ))}
          <button onClick={add} className="inline-flex items-center gap-2 border border-dashed border-border hover:bg-primary-soft px-4 py-2.5 rounded-xl font-medium min-h-12 w-full justify-center">
            <Plus className="size-4" /> Add another user-agent
          </button>
          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            <label>
              <span className="block text-sm font-medium mb-1.5">Sitemap URL(s)</span>
              <textarea value={sitemap} onChange={(e) => setSitemap(e.target.value)} className="w-full min-h-20 rounded-xl border border-border bg-card p-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
            </label>
            <label>
              <span className="block text-sm font-medium mb-1.5">Host (optional)</span>
              <input value={host} onChange={(e) => setHost(e.target.value)} placeholder="example.com" className="w-full h-12 rounded-xl border border-border bg-card px-3 focus:outline-none focus:ring-2 focus:ring-ring" />
            </label>
          </div>
        </section>

        <section className="soft-card p-5 sm:p-6 space-y-3 lg:sticky lg:top-24 h-fit">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg">robots.txt</h2>
            <div className="flex gap-2">
              <button onClick={copy} className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-border hover:bg-primary-soft">
                {copied ? <><Check className="size-4" /> Copied</> : <><Copy className="size-4" /> Copy</>}
              </button>
              <button onClick={download} className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">Download</button>
            </div>
          </div>
          <pre className="font-mono text-xs whitespace-pre-wrap break-words rounded-xl bg-muted/50 p-4 min-h-64 max-h-[32rem] overflow-auto">{text}</pre>
          <p className="text-xs text-muted-foreground">Upload the file to the root of your site so it lives at <code>/robots.txt</code>.</p>
        </section>
      </div>
      <HowItWorks>
        <li>Add a rule group for each crawler you want to control.</li>
        <li>List paths to Allow or Disallow — one per line.</li>
        <li>Copy or download the file and place it at your site root.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
