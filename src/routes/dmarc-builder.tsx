import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Mail, Copy } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/dmarc-builder")({
  head: () => ({
    meta: [
      { title: "DMARC Record Builder — Free DMARC Generator" },
      { name: "description", content: "Generate a DMARC TXT record with the right policy, alignment and reporting addresses for your domain." },
      { property: "og:title", content: "DMARC Record Builder — Bluebird" },
      { property: "og:description", content: "Create a valid DMARC policy in seconds." },
    ],
    links: [{ rel: "canonical", href: "/dmarc-builder" }],
  }),
  component: Page,
});

function Page() {
  const [p, setP] = useState<"none" | "quarantine" | "reject">("none");
  const [pct, setPct] = useState(100);
  const [rua, setRua] = useState("dmarc@example.com");
  const [ruf, setRuf] = useState("");
  const [aspf, setAspf] = useState<"r" | "s">("r");
  const [adkim, setAdkim] = useState<"r" | "s">("r");
  const [sp, setSp] = useState<"" | "none" | "quarantine" | "reject">("");

  const record = useMemo(() => {
    const parts = [`v=DMARC1`, `p=${p}`];
    if (sp) parts.push(`sp=${sp}`);
    if (pct !== 100) parts.push(`pct=${pct}`);
    parts.push(`aspf=${aspf}`, `adkim=${adkim}`);
    if (rua.trim()) parts.push(`rua=mailto:${rua.trim()}`);
    if (ruf.trim()) parts.push(`ruf=mailto:${ruf.trim()}`);
    return parts.join("; ");
  }, [p, pct, rua, ruf, aspf, adkim, sp]);

  return (
    <ToolLayout slug="dmarc-builder">
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="soft-card p-4 sm:p-5 space-y-3 text-sm">
          <div>
            <span className="eyebrow">Policy (p)</span>
            <div className="mt-1.5 flex gap-2 flex-wrap">
              {(["none", "quarantine", "reject"] as const).map((v) => (
                <button key={v} onClick={() => setP(v)} className={`px-3 py-2 rounded-xl border ${p === v ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"}`}>{v}</button>
              ))}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Start with <strong>none</strong> to monitor, then move to quarantine and reject.</p>
          </div>
          <div>
            <span className="eyebrow">Subdomain policy (sp, optional)</span>
            <div className="mt-1.5 flex gap-2 flex-wrap">
              {(["", "none", "quarantine", "reject"] as const).map((v) => (
                <button key={v || "inherit"} onClick={() => setSp(v)} className={`px-3 py-2 rounded-xl border ${sp === v ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"}`}>{v || "inherit"}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="eyebrow" htmlFor="pct">Apply to % of mail</label>
            <input id="pct" type="number" min={1} max={100} value={pct} onChange={(e) => setPct(Math.max(1, Math.min(100, Number(e.target.value) || 100)))}
              className="mt-1.5 w-32 rounded-xl border border-border bg-card p-3 min-h-12" />
          </div>
          <div>
            <label className="eyebrow" htmlFor="rua">Aggregate reports to (rua)</label>
            <input id="rua" value={rua} onChange={(e) => setRua(e.target.value)} placeholder="dmarc@example.com" className="mt-1.5 w-full rounded-xl border border-border bg-card p-3 min-h-12" />
          </div>
          <div>
            <label className="eyebrow" htmlFor="ruf">Forensic reports to (ruf, optional)</label>
            <input id="ruf" value={ruf} onChange={(e) => setRuf(e.target.value)} className="mt-1.5 w-full rounded-xl border border-border bg-card p-3 min-h-12" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="eyebrow">SPF alignment</span>
              <select value={aspf} onChange={(e) => setAspf(e.target.value as "r" | "s")} className="mt-1.5 w-full rounded-xl border border-border bg-card p-3 min-h-12">
                <option value="r">Relaxed (r)</option><option value="s">Strict (s)</option>
              </select>
            </label>
            <label className="block">
              <span className="eyebrow">DKIM alignment</span>
              <select value={adkim} onChange={(e) => setAdkim(e.target.value as "r" | "s")} className="mt-1.5 w-full rounded-xl border border-border bg-card p-3 min-h-12">
                <option value="r">Relaxed (r)</option><option value="s">Strict (s)</option>
              </select>
            </label>
          </div>
        </div>
        <div className="soft-card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="eyebrow">TXT record</span>
            <button onClick={() => navigator.clipboard.writeText(record).catch(() => {})}
              className="text-sm text-primary hover:underline inline-flex items-center gap-1.5"><Copy className="size-4" /> Copy</button>
          </div>
          <pre className="mt-2 font-mono text-sm whitespace-pre-wrap break-all rounded-xl bg-primary-soft/30 p-4">{record}</pre>
          <p className="mt-3 text-xs text-muted-foreground">Publish as a TXT record at host <span className="font-mono">_dmarc</span> on your domain.</p>
        </div>
      </div>
      <HowItWorks>
        <li>Pick a policy — start with <strong>none</strong> to observe before enforcing.</li>
        <li>Add the inbox where you want aggregate reports delivered.</li>
        <li>Copy the TXT record into the <span className="font-mono">_dmarc</span> host in DNS.</li>
      </HowItWorks>
      <div className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground"><Mail className="size-4 text-primary" /> Built locally — no email sending or DNS lookup.</div>
    </ToolLayout>
  );
}
