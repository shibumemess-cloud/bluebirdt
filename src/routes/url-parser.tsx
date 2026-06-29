import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Link2, Copy } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/url-parser")({
  head: () => ({
    meta: [
      { title: "URL Parser — Break Any URL Into Its Parts" },
      { name: "description", content: "Paste a URL to see its protocol, host, path and query params separately — and edit them inline." },
      { property: "og:title", content: "URL Parser — Bluebird" },
      { property: "og:description", content: "Pull apart any URL in seconds." },
    ],
    links: [{ rel: "canonical", href: "/url-parser" }],
  }),
  component: Page,
});

function Page() {
  const [raw, setRaw] = useState("https://example.com/path/to/page?utm_source=newsletter&id=42#section");
  const parsed = useMemo(() => {
    try {
      const u = new URL(raw.trim());
      const params: [string, string][] = [];
      u.searchParams.forEach((v, k) => params.push([k, v]));
      return { ok: true as const, u, params };
    } catch {
      return { ok: false as const };
    }
  }, [raw]);
  return (
    <ToolLayout slug="url-parser">
      <div className="soft-card p-4 sm:p-5">
        <label className="eyebrow" htmlFor="url">URL</label>
        <input id="url" value={raw} onChange={(e) => setRaw(e.target.value)}
          className="mt-1.5 w-full font-mono text-sm rounded-xl border border-border bg-card p-3 min-h-12 focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      {parsed.ok ? (
        <div className="mt-4 grid lg:grid-cols-2 gap-4">
          <div className="soft-card p-4 sm:p-5">
            <span className="eyebrow">Parts</span>
            <dl className="mt-2 grid gap-2 text-sm">
              {([
                ["Protocol", parsed.u.protocol.replace(":", "")],
                ["Username", parsed.u.username || "—"],
                ["Password", parsed.u.password ? "•••••" : "—"],
                ["Host", parsed.u.host],
                ["Hostname", parsed.u.hostname],
                ["Port", parsed.u.port || "(default)"],
                ["Path", parsed.u.pathname],
                ["Hash", parsed.u.hash || "—"],
                ["Origin", parsed.u.origin],
              ] as [string, string][]).map(([k, v]) => (
                <div key={k} className="rounded-lg bg-primary-soft/30 p-3 flex items-center justify-between gap-3">
                  <div><dt className="text-muted-foreground">{k}</dt><dd className="font-mono break-all">{v}</dd></div>
                  <button onClick={() => navigator.clipboard.writeText(v).catch(() => {})} className="text-xs text-primary inline-flex items-center gap-1.5"><Copy className="size-3.5" /> Copy</button>
                </div>
              ))}
            </dl>
          </div>
          <div className="soft-card p-4 sm:p-5">
            <span className="eyebrow">Query parameters</span>
            {parsed.params.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">No query parameters.</p> : (
              <ul className="mt-2 grid gap-2 text-sm">
                {parsed.params.map(([k, v], i) => (
                  <li key={i} className="rounded-lg bg-primary-soft/30 p-3 flex items-start justify-between gap-3">
                    <div><div className="font-mono text-primary">{k}</div><div className="font-mono break-all">{v}</div></div>
                    <button onClick={() => navigator.clipboard.writeText(`${k}=${v}`).catch(() => {})} className="text-xs text-primary inline-flex items-center gap-1.5"><Copy className="size-3.5" /> Copy</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-4 soft-card p-4 sm:p-5 text-destructive text-sm">That doesn't look like a valid URL. Include the <span className="font-mono">https://</span> at the start.</div>
      )}
      <HowItWorks>
        <li>Paste any link, including UTM tags or auth tokens.</li>
        <li>Inspect each part separately — useful for tracking links and OAuth callbacks.</li>
      </HowItWorks>
      <div className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground"><Link2 className="size-4 text-primary" /> Parsing runs in your browser using the standard URL API.</div>
    </ToolLayout>
  );
}
