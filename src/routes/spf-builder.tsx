import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Server, Copy } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/spf-builder")({
  head: () => ({
    meta: [
      { title: "SPF Record Builder — Free SPF Generator" },
      { name: "description", content: "Build a valid SPF TXT record step by step. Add IPs, includes and choose a strict or soft policy." },
      { property: "og:title", content: "SPF Record Builder — Bluebird" },
      { property: "og:description", content: "Generate the SPF DNS record for your domain in seconds." },
    ],
    links: [{ rel: "canonical", href: "/spf-builder" }],
  }),
  component: Page,
});

function Page() {
  const [ip4, setIp4] = useState("203.0.113.10");
  const [ip6, setIp6] = useState("");
  const [includes, setIncludes] = useState("_spf.google.com");
  const [a, setA] = useState(true);
  const [mx, setMx] = useState(true);
  const [policy, setPolicy] = useState<"~all" | "-all" | "?all">("-all");

  const record = useMemo(() => {
    const parts: string[] = ["v=spf1"];
    if (a) parts.push("a");
    if (mx) parts.push("mx");
    ip4.split(/[,\s]+/).filter(Boolean).forEach((v) => parts.push(`ip4:${v}`));
    ip6.split(/[,\s]+/).filter(Boolean).forEach((v) => parts.push(`ip6:${v}`));
    includes.split(/[,\s]+/).filter(Boolean).forEach((v) => parts.push(`include:${v}`));
    parts.push(policy);
    return parts.join(" ");
  }, [a, mx, ip4, ip6, includes, policy]);

  const warn = record.length > 255 ? "Records over 255 characters must be split into multiple strings in DNS." : "";

  return (
    <ToolLayout slug="spf-builder">
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="soft-card p-4 sm:p-5 space-y-3 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={a} onChange={(e) => setA(e.target.checked)} /> Allow the domain's <span className="font-mono">A</span> record to send</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={mx} onChange={(e) => setMx(e.target.checked)} /> Allow the domain's <span className="font-mono">MX</span> servers to send</label>
          <div>
            <label className="eyebrow" htmlFor="ip4">IPv4 senders (space or comma separated)</label>
            <input id="ip4" value={ip4} onChange={(e) => setIp4(e.target.value)} className="mt-1.5 w-full font-mono rounded-xl border border-border bg-card p-3 min-h-12" />
          </div>
          <div>
            <label className="eyebrow" htmlFor="ip6">IPv6 senders</label>
            <input id="ip6" value={ip6} onChange={(e) => setIp6(e.target.value)} className="mt-1.5 w-full font-mono rounded-xl border border-border bg-card p-3 min-h-12" />
          </div>
          <div>
            <label className="eyebrow" htmlFor="inc">Includes (e.g. providers)</label>
            <input id="inc" value={includes} onChange={(e) => setIncludes(e.target.value)} className="mt-1.5 w-full font-mono rounded-xl border border-border bg-card p-3 min-h-12" />
          </div>
          <div>
            <span className="eyebrow">Policy</span>
            <div className="mt-1.5 flex gap-2 flex-wrap">
              {([
                ["-all", "Strict (-all)"],
                ["~all", "Soft fail (~all)"],
                ["?all", "Neutral (?all)"],
              ] as [typeof policy, string][]).map(([v, l]) => (
                <button key={v} onClick={() => setPolicy(v)}
                  className={`px-3 py-2 rounded-xl border text-sm ${policy === v ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"}`}>{l}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="soft-card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="eyebrow">TXT record</span>
            <button onClick={() => navigator.clipboard.writeText(record).catch(() => {})}
              className="text-sm text-primary hover:underline inline-flex items-center gap-1.5"><Copy className="size-4" /> Copy</button>
          </div>
          <pre className="mt-2 font-mono text-sm whitespace-pre-wrap break-all rounded-xl bg-primary-soft/30 p-4">{record}</pre>
          <p className="mt-2 text-xs text-muted-foreground">Length: {record.length} chars{warn && ` · ${warn}`}</p>
          <p className="mt-3 text-xs text-muted-foreground">Publish as a TXT record on the root of your domain (host <span className="font-mono">@</span>).</p>
        </div>
      </div>
      <HowItWorks>
        <li>Add the IPs and services that send mail for you.</li>
        <li>Pick a policy — start soft (~all) and tighten to strict (-all).</li>
        <li>Copy the TXT record into your DNS provider.</li>
      </HowItWorks>
      <div className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground"><Server className="size-4 text-primary" /> Built locally — no calls to your DNS provider.</div>
    </ToolLayout>
  );
}
