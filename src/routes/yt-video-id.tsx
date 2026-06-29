import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { Field, HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/yt-video-id")({
  head: () => ({
    meta: [
      { title: "YouTube Video ID Extractor — Clean any YouTube URL" },
      { name: "description", content: "Paste any YouTube link — watch, share, Shorts, embed or youtu.be — and instantly get the clean video ID and tidy URLs." },
      { property: "og:title", content: "YouTube Video ID Extractor — Bluebird" },
      { property: "og:description", content: "Get the 11-character YouTube ID from any link, plus a clean shareable URL." },
      { property: "og:url", content: "/yt-video-id" },
    ],
    links: [{ rel: "canonical", href: "/yt-video-id" }],
  }),
  component: Page,
});

function parseId(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  // Direct 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  try {
    const url = new URL(s.includes("://") ? s : `https://${s}`);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = url.pathname.split("/")[1];
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }
    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      const v = url.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
      const parts = url.pathname.split("/").filter(Boolean);
      // /embed/<id>, /shorts/<id>, /live/<id>, /v/<id>
      const idx = parts.findIndex((p) => ["embed", "shorts", "live", "v"].includes(p));
      if (idx !== -1 && parts[idx + 1] && /^[a-zA-Z0-9_-]{11}$/.test(parts[idx + 1])) return parts[idx + 1];
    }
  } catch { /* ignore */ }
  // Fallback regex
  const m = s.match(/[a-zA-Z0-9_-]{11}/);
  return m ? m[0] : null;
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch { /* */ }
  }
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className="mt-1 flex items-center gap-2">
        <code className="flex-1 truncate font-mono text-sm">{value}</code>
        <button type="button" onClick={copy} className="min-h-10 px-3 rounded-lg border border-border bg-background hover:border-primary/40 inline-flex items-center gap-1.5 text-sm font-medium">
          {copied ? <><Check className="size-4 text-primary" /> Copied</> : <><Copy className="size-4" /> Copy</>}
        </button>
      </div>
    </div>
  );
}

function Page() {
  const [input, setInput] = useState("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s");
  const id = useMemo(() => parseId(input), [input]);

  return (
    <ToolLayout slug="yt-video-id">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 md:col-span-7 space-y-6">
          <Field label="Paste a YouTube link or ID" hint="Works with watch, share, Shorts, embed, live and youtu.be URLs.">
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={4}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-base font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </Field>
          <HowItWorks>
            We parse the URL right in your browser to pull the 11-character video ID, then rebuild clean
            shareable, embed and thumbnail links. Nothing is ever sent to a server.
          </HowItWorks>
        </div>

        <aside className="col-span-12 md:col-span-5 space-y-3">
          {!id ? (
            <div className="soft-card p-5 text-center text-muted-foreground">Paste a YouTube link to see the video ID.</div>
          ) : (
            <>
              <CopyRow label="Video ID" value={id} />
              <CopyRow label="Clean watch URL" value={`https://www.youtube.com/watch?v=${id}`} />
              <CopyRow label="Short URL" value={`https://youtu.be/${id}`} />
              <CopyRow label="Embed URL" value={`https://www.youtube.com/embed/${id}`} />
              <CopyRow label="Shorts URL" value={`https://www.youtube.com/shorts/${id}`} />
              <CopyRow label="HQ Thumbnail" value={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`} />
            </>
          )}
        </aside>
      </div>
    </ToolLayout>
  );
}
