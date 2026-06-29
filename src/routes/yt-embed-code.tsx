import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { Field, HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/yt-embed-code")({
  head: () => ({
    meta: [
      { title: "YouTube Embed Code Generator — Responsive iframe" },
      { name: "description", content: "Build a clean, responsive YouTube embed code with options for autoplay, mute, loop, start time, captions and privacy-enhanced mode." },
      { property: "og:title", content: "YouTube Embed Code Generator — Bluebird" },
      { property: "og:description", content: "Generate a custom YouTube iframe with one click." },
      { property: "og:url", content: "/yt-embed-code" },
    ],
    links: [{ rel: "canonical", href: "/yt-embed-code" }],
  }),
  component: Page,
});

function parseId(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  const m = s.match(/(?:v=|\/embed\/|\/shorts\/|youtu\.be\/|\/live\/|\/v\/)([a-zA-Z0-9_-]{11})/);
  if (m) return m[1];
  const fallback = s.match(/[a-zA-Z0-9_-]{11}/);
  return fallback ? fallback[0] : null;
}

function hmsToSeconds(t: string): number {
  const parts = t.split(":").map((p) => parseInt(p, 10) || 0);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="flex items-start gap-3 min-h-12 px-4 rounded-xl border border-border bg-card cursor-pointer hover:border-primary/40 py-3">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 size-4 accent-primary" />
      <span className="flex-1">
        <span className="block text-sm font-semibold">{label}</span>
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </span>
    </label>
  );
}

function Page() {
  const [input, setInput] = useState("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  const [start, setStart] = useState("0:00");
  const [autoplay, setAutoplay] = useState(false);
  const [mute, setMute] = useState(false);
  const [loop, setLoop] = useState(false);
  const [controls, setControls] = useState(true);
  const [captions, setCaptions] = useState(false);
  const [privacy, setPrivacy] = useState(true);
  const [responsive, setResponsive] = useState(true);
  const [copied, setCopied] = useState(false);

  const id = useMemo(() => parseId(input), [input]);

  const code = useMemo(() => {
    if (!id) return "";
    const host = privacy ? "www.youtube-nocookie.com" : "www.youtube.com";
    const params = new URLSearchParams();
    const s = hmsToSeconds(start);
    if (s > 0) params.set("start", String(s));
    if (autoplay) { params.set("autoplay", "1"); if (!mute) params.set("mute", "1"); }
    if (mute) params.set("mute", "1");
    if (loop) { params.set("loop", "1"); params.set("playlist", id); }
    if (!controls) params.set("controls", "0");
    if (captions) { params.set("cc_load_policy", "1"); }
    const qs = params.toString();
    const src = `https://${host}/embed/${id}${qs ? `?${qs}` : ""}`;
    const iframe = `<iframe src="${src}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
    if (responsive) {
      return `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;">\n  ${iframe.replace("<iframe ", '<iframe style="position:absolute;top:0;left:0;width:100%;height:100%;" ')}\n</div>`;
    }
    return iframe.replace("<iframe ", '<iframe width="560" height="315" ');
  }, [id, autoplay, mute, loop, controls, captions, privacy, responsive, start]);

  async function copy() {
    if (!code) return;
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch { /* */ }
  }

  return (
    <ToolLayout slug="yt-embed-code">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 md:col-span-6 space-y-5">
          <Field label="YouTube link or video ID">
            <input value={input} onChange={(e) => setInput(e.target.value)}
              className="w-full min-h-12 rounded-xl border border-border bg-card px-4 text-base font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </Field>
          <Field label="Start at" hint="Use seconds (90) or hh:mm:ss (1:30 or 0:01:30).">
            <input value={start} onChange={(e) => setStart(e.target.value)}
              className="w-40 min-h-12 rounded-xl border border-border bg-card px-4 text-base font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Toggle label="Autoplay" checked={autoplay} onChange={setAutoplay} hint="Most browsers require muted autoplay." />
            <Toggle label="Mute" checked={mute} onChange={setMute} />
            <Toggle label="Loop" checked={loop} onChange={setLoop} />
            <Toggle label="Show controls" checked={controls} onChange={setControls} />
            <Toggle label="Captions on" checked={captions} onChange={setCaptions} />
            <Toggle label="Privacy mode" checked={privacy} onChange={setPrivacy} hint="Uses youtube-nocookie.com." />
            <Toggle label="Responsive 16:9" checked={responsive} onChange={setResponsive} hint="Fills any container width." />
          </div>
          <HowItWorks>
            Choose your options and copy a ready-to-paste iframe. Privacy mode uses YouTube's
            no-cookie domain so viewers aren't tracked until they play.
          </HowItWorks>
        </div>

        <aside className="col-span-12 md:col-span-6 space-y-3">
          <div className="soft-card p-3">
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
              {id ? (
                // eslint-disable-next-line react/no-danger
                <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: code.replace(/style="[^"]*"/g, 'style="width:100%;height:100%;"').replace(/<div [^>]*>|<\/div>/g, "") }} />
              ) : (
                <div className="w-full h-full grid place-items-center text-muted-foreground text-sm">Live preview appears here</div>
              )}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Embed code</span>
              <button type="button" onClick={copy} disabled={!code} className="min-h-10 px-3 rounded-lg border border-border bg-background hover:border-primary/40 inline-flex items-center gap-1.5 text-sm font-medium disabled:opacity-50">
                {copied ? <><Check className="size-4 text-primary" /> Copied</> : <><Copy className="size-4" /> Copy</>}
              </button>
            </div>
            <pre className="mt-3 text-xs font-mono whitespace-pre-wrap break-all bg-background rounded-lg p-3 border border-border max-h-64 overflow-auto">{code || "Paste a YouTube link to generate code."}</pre>
          </div>
        </aside>
      </div>
    </ToolLayout>
  );
}
