import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { Copy, Check, Download } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { Field, HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/yt-subscribe-link")({
  head: () => ({
    meta: [
      { title: "YouTube Subscribe Link Generator — One-click subscribe" },
      { name: "description", content: "Turn any YouTube channel URL or @handle into a link that opens the subscribe confirmation pop-up — with a downloadable QR code." },
      { property: "og:title", content: "YouTube Subscribe Link Generator — Bluebird" },
      { property: "og:description", content: "Make a one-click subscribe link and QR code for your channel." },
      { property: "og:url", content: "/yt-subscribe-link" },
    ],
    links: [{ rel: "canonical", href: "/yt-subscribe-link" }],
  }),
  component: Page,
});

function buildChannelUrl(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  // @handle
  if (s.startsWith("@")) return `https://www.youtube.com/${s}`;
  // bare handle without @
  if (/^[a-zA-Z0-9._-]{3,30}$/.test(s) && !s.includes("/")) return `https://www.youtube.com/@${s}`;
  try {
    const url = new URL(s.includes("://") ? s : `https://${s}`);
    if (url.hostname.endsWith("youtube.com")) {
      return `https://www.youtube.com${url.pathname.replace(/\/+$/, "")}`;
    }
  } catch { /* */ }
  return null;
}

function Page() {
  const [input, setInput] = useState("@MrBeast");
  const [copied, setCopied] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const base = useMemo(() => buildChannelUrl(input), [input]);
  const subscribeUrl = base ? `${base}?sub_confirmation=1` : "";

  useEffect(() => {
    if (!subscribeUrl || !canvasRef.current) { setQrUrl(null); return; }
    QRCode.toCanvas(canvasRef.current, subscribeUrl, { width: 320, margin: 2, color: { dark: "#0f172a", light: "#ffffff" } }).then(() => {
      setQrUrl(canvasRef.current?.toDataURL("image/png") || null);
    }).catch(() => setQrUrl(null));
  }, [subscribeUrl]);

  async function copy() {
    if (!subscribeUrl) return;
    try { await navigator.clipboard.writeText(subscribeUrl); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch { /* */ }
  }

  function downloadQR() {
    if (!qrUrl) return;
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = "subscribe-qr.png";
    a.click();
  }

  return (
    <ToolLayout slug="yt-subscribe-link">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 md:col-span-7 space-y-5">
          <Field label="Channel URL or @handle" hint="Examples: @MrBeast · youtube.com/@bluebirdtools · youtube.com/channel/UCxxxxxxxxxxxxx">
            <input value={input} onChange={(e) => setInput(e.target.value)}
              className="w-full min-h-12 rounded-xl border border-border bg-card px-4 text-base font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </Field>

          {!base && input.trim() && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 p-3 text-sm">
              Couldn't read that as a channel link. Try starting with <code>@</code> or a full YouTube URL.
            </div>
          )}

          {subscribeUrl && (
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Subscribe link</div>
              <div className="mt-1 flex items-center gap-2">
                <code className="flex-1 truncate font-mono text-sm">{subscribeUrl}</code>
                <button type="button" onClick={copy} className="min-h-10 px-3 rounded-lg border border-border bg-background hover:border-primary/40 inline-flex items-center gap-1.5 text-sm font-medium">
                  {copied ? <><Check className="size-4 text-primary" /> Copied</> : <><Copy className="size-4" /> Copy</>}
                </button>
              </div>
              <a href={subscribeUrl} target="_blank" rel="noreferrer noopener"
                className="mt-3 inline-flex items-center min-h-11 px-4 rounded-xl bg-primary text-primary-foreground hover:opacity-90 text-sm font-semibold">
                Test the link
              </a>
            </div>
          )}

          <HowItWorks>
            Adding <code className="font-mono">?sub_confirmation=1</code> to any YouTube channel URL pops up
            the subscribe dialog the moment someone visits it — perfect for "Subscribe" buttons on your
            website, video end-screens or business cards. The QR code on the right opens the same pop-up
            when scanned with a phone.
          </HowItWorks>
        </div>

        <aside className="col-span-12 md:col-span-5">
          <div className="soft-card p-5 sm:p-6 text-center">
            <span className="eyebrow">Scan to subscribe</span>
            <div className="mt-3 inline-block p-3 rounded-2xl bg-white border border-border">
              <canvas ref={canvasRef} className={subscribeUrl ? "" : "opacity-30"} />
            </div>
            <div className="mt-4">
              <button type="button" onClick={downloadQR} disabled={!qrUrl}
                className="inline-flex items-center gap-2 min-h-11 px-4 rounded-xl border border-border bg-card hover:border-primary/40 text-sm font-semibold disabled:opacity-50">
                <Download className="size-4" /> Download PNG
              </button>
            </div>
          </div>
        </aside>
      </div>
    </ToolLayout>
  );
}
