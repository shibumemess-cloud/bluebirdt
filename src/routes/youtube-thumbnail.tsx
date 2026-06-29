import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PlayCircle, Download, ExternalLink, AlertCircle } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/youtube-thumbnail")({
  head: () => ({
    meta: [
      { title: "YouTube Thumbnail Downloader — HD, 4K, All Sizes" },
      { name: "description", content: "Download any YouTube video thumbnail in HD, SD or maxres. Paste the URL, pick a size, save in one click. Free." },
      { property: "og:title", content: "YouTube Thumbnail Downloader — Bluebird" },
      { property: "og:description", content: "Grab any YouTube thumbnail in every size, instantly." },
      { property: "og:url", content: "/youtube-thumbnail" },
    ],
    links: [{ rel: "canonical", href: "/youtube-thumbnail" }],
  }),
  component: Page,
});

function parseVideoId(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  // Bare 11-char id
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s.startsWith("http") ? s : `https://${s}`);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
    }
    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      const v = u.searchParams.get("v");
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v;
      const parts = u.pathname.split("/").filter(Boolean);
      // /shorts/<id>, /embed/<id>, /live/<id>, /v/<id>
      const idx = parts.findIndex((p) => ["shorts", "embed", "live", "v"].includes(p));
      if (idx >= 0 && parts[idx + 1] && /^[A-Za-z0-9_-]{11}$/.test(parts[idx + 1])) return parts[idx + 1];
    }
  } catch {
    /* ignore */
  }
  return null;
}

const SIZES: { key: string; label: string; file: string; w: number; h: number }[] = [
  { key: "maxres", label: "Max resolution (1280×720)", file: "maxresdefault.jpg", w: 1280, h: 720 },
  { key: "sd", label: "Standard (640×480)", file: "sddefault.jpg", w: 640, h: 480 },
  { key: "hq", label: "High quality (480×360)", file: "hqdefault.jpg", w: 480, h: 360 },
  { key: "mq", label: "Medium (320×180)", file: "mqdefault.jpg", w: 320, h: 180 },
  { key: "default", label: "Default (120×90)", file: "default.jpg", w: 120, h: 90 },
];

function Page() {
  const [url, setUrl] = useState("");
  const id = useMemo(() => parseVideoId(url), [url]);

  async function download(file: string) {
    if (!id) return;
    const src = `https://i.ytimg.com/vi/${id}/${file}`;
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error("Not available");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${id}-${file}`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    } catch {
      window.open(src, "_blank", "noopener");
    }
  }

  return (
    <ToolLayout slug="youtube-thumbnail">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-4">
          <label className="block">
            <span className="block text-sm font-medium mb-2">Paste a YouTube URL or video ID</span>
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 focus-within:ring-2 focus-within:ring-ring">
              <PlayCircle className="size-5 text-primary shrink-0" />
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=…"
                className="flex-1 min-w-0 h-12 bg-transparent border-0 outline-none text-base"
                spellCheck={false}
              />
            </div>
          </label>
          {!id && url.trim() && (
            <div className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400">
              <AlertCircle className="size-4 mt-0.5 shrink-0" />
              <span>That doesn't look like a YouTube link. Try a full URL or an 11-character video ID.</span>
            </div>
          )}
          <div className="text-sm text-muted-foreground">
            Works with regular videos, Shorts, embeds and <code>youtu.be</code> links.
          </div>
        </section>

        <section className="soft-card p-5 sm:p-6">
          {id ? (
            <div className="space-y-3">
              <div className="aspect-video rounded-xl overflow-hidden border border-border bg-muted">
                <img
                  src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
                  alt="YouTube thumbnail preview"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="grid gap-2">
                {SIZES.map((s) => (
                  <div key={s.key} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2">
                    <span className="text-sm min-w-0 truncate">{s.label}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={`https://i.ytimg.com/vi/${id}/${s.file}`}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary px-2 py-1.5 rounded-lg"
                        aria-label={`Open ${s.label} in a new tab`}
                      >
                        <ExternalLink className="size-4" />
                      </a>
                      <button
                        onClick={() => download(s.file)}
                        className="inline-flex items-center gap-1.5 text-sm bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-lg font-medium min-h-10"
                      >
                        <Download className="size-4" /> Save
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Not all sizes exist for every video — maxres is only generated for HD uploads.
              </p>
            </div>
          ) : (
            <div className="grid place-items-center h-full min-h-64 text-sm text-muted-foreground text-center px-6">
              Paste a YouTube link to see every thumbnail size.
            </div>
          )}
        </section>
      </div>

      <HowItWorks>
        <li>Paste the YouTube video URL or 11-character ID.</li>
        <li>Pick the size you need — from 120×90 up to 1280×720.</li>
        <li>Tap Save to download the image to your device.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
