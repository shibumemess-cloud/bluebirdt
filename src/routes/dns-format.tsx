import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Server, Copy } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/dns-format")({
  head: () => ({
    meta: [
      { title: "DNS Record Formatter — A, AAAA, MX, TXT, CNAME" },
      { name: "description", content: "Format A, AAAA, CNAME, MX, TXT and SRV records into clean zone-file lines you can paste into your DNS provider." },
      { property: "og:title", content: "DNS Record Formatter — Bluebird" },
      { property: "og:description", content: "Generate zone-file lines for common DNS record types." },
    ],
    links: [{ rel: "canonical", href: "/dns-format" }],
  }),
  component: Page,
});

type Kind = "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "SRV";

function Page() {
  const [kind, setKind] = useState<Kind>("A");
  const [host, setHost] = useState("@");
  const [ttl, setTtl] = useState(3600);
  const [value, setValue] = useState("203.0.113.10");
  const [prio, setPrio] = useState(10);
  const [weight, setWeight] = useState(5);
  const [port, setPort] = useState(443);
  const [target, setTarget] = useState("server.example.com.");

  const line = useMemo(() => {
    const h = host.trim() || "@";
    const base = `${h.padEnd(20)} ${ttl}\tIN\t${kind}\t`;
    if (kind === "MX") return base + `${prio} ${value.trim() || "mail.example.com."}`;
    if (kind === "TXT") return base + `"${value.replace(/"/g, '\\"')}"`;
    if (kind === "SRV") return base + `${prio} ${weight} ${port} ${target.trim()}`;
    return base + value.trim();
  }, [kind, host, ttl, value, prio, weight, port, target]);

  return (
    <ToolLayout slug="dns-format">
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="soft-card p-4 sm:p-5 space-y-3 text-sm">
          <div className="flex flex-wrap gap-2">
            {(["A", "AAAA", "CNAME", "MX", "TXT", "SRV"] as Kind[]).map((k) => (
              <button key={k} onClick={() => setKind(k)} className={`px-3 py-2 rounded-xl border ${kind === k ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"}`}>{k}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className="eyebrow">Host</span>
              <input value={host} onChange={(e) => setHost(e.target.value)} className="mt-1.5 w-full rounded-xl border border-border bg-card p-3 min-h-12 font-mono" />
            </label>
            <label>
              <span className="eyebrow">TTL (sec)</span>
              <input type="number" value={ttl} onChange={(e) => setTtl(Number(e.target.value) || 3600)} className="mt-1.5 w-full rounded-xl border border-border bg-card p-3 min-h-12 font-mono" />
            </label>
          </div>
          {kind === "SRV" ? (
            <>
              <div className="grid grid-cols-3 gap-3">
                <label><span className="eyebrow">Priority</span><input type="number" value={prio} onChange={(e) => setPrio(Number(e.target.value))} className="mt-1.5 w-full rounded-xl border border-border bg-card p-3 min-h-12 font-mono" /></label>
                <label><span className="eyebrow">Weight</span><input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="mt-1.5 w-full rounded-xl border border-border bg-card p-3 min-h-12 font-mono" /></label>
                <label><span className="eyebrow">Port</span><input type="number" value={port} onChange={(e) => setPort(Number(e.target.value))} className="mt-1.5 w-full rounded-xl border border-border bg-card p-3 min-h-12 font-mono" /></label>
              </div>
              <label className="block"><span className="eyebrow">Target</span>
                <input value={target} onChange={(e) => setTarget(e.target.value)} className="mt-1.5 w-full rounded-xl border border-border bg-card p-3 min-h-12 font-mono" />
              </label>
            </>
          ) : (
            <>
              {kind === "MX" && (
                <label><span className="eyebrow">Priority</span><input type="number" value={prio} onChange={(e) => setPrio(Number(e.target.value))} className="mt-1.5 w-full rounded-xl border border-border bg-card p-3 min-h-12 font-mono" /></label>
              )}
              <label className="block">
                <span className="eyebrow">{kind === "TXT" ? "Text value" : kind === "CNAME" ? "Target hostname" : "Address / target"}</span>
                {kind === "TXT" ? (
                  <textarea value={value} onChange={(e) => setValue(e.target.value)} className="mt-1.5 w-full min-h-24 rounded-xl border border-border bg-card p-3 font-mono text-sm" />
                ) : (
                  <input value={value} onChange={(e) => setValue(e.target.value)} className="mt-1.5 w-full rounded-xl border border-border bg-card p-3 min-h-12 font-mono" />
                )}
              </label>
            </>
          )}
        </div>
        <div className="soft-card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Zone-file line</span>
            <button onClick={() => navigator.clipboard.writeText(line).catch(() => {})} className="text-sm text-primary inline-flex items-center gap-1.5"><Copy className="size-4" /> Copy</button>
          </div>
          <pre className="mt-2 font-mono text-sm whitespace-pre-wrap break-all rounded-xl bg-primary-soft/30 p-4">{line}</pre>
          <p className="mt-3 text-xs text-muted-foreground">Most DNS providers also accept individual fields — copy each value into the matching form box.</p>
        </div>
      </div>
      <HowItWorks>
        <li>Pick the record type.</li>
        <li>Fill the host, TTL and value (and priority/port for MX/SRV).</li>
        <li>Copy the formatted line or each field into your DNS panel.</li>
      </HowItWorks>
      <div className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground"><Server className="size-4 text-primary" /> Formatting only — no DNS calls or lookups.</div>
    </ToolLayout>
  );
}
