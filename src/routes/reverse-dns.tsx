import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Network, Copy } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/reverse-dns")({
  head: () => ({
    meta: [
      { title: "Reverse DNS (ARPA) Formatter — Free" },
      { name: "description", content: "Convert any IPv4 or IPv6 address into the reverse DNS (PTR / .arpa) zone name." },
      { property: "og:title", content: "Reverse DNS Formatter — Bluebird" },
      { property: "og:description", content: "Build PTR record zones from an IP address." },
    ],
    links: [{ rel: "canonical", href: "/reverse-dns" }],
  }),
  component: Page,
});

function arpa(ip: string): string | null {
  const v4 = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const parts = v4.slice(1).map(Number);
    if (parts.some((p) => p > 255)) return null;
    return parts.slice().reverse().join(".") + ".in-addr.arpa";
  }
  if (/^[0-9a-fA-F:]+$/.test(ip) && ip.includes(":")) {
    // expand IPv6
    const halves = ip.split("::");
    if (halves.length > 2) return null;
    const left = halves[0] ? halves[0].split(":") : [];
    const right = halves[1] ? halves[1].split(":") : [];
    const fill = 8 - left.length - right.length;
    if (fill < 0) return null;
    if (halves.length === 1 && fill !== 0) return null;
    const groups = [...left, ...Array(fill).fill("0"), ...right];
    if (groups.length !== 8) return null;
    const hex = groups.map((g) => g.padStart(4, "0")).join("").toLowerCase();
    if (!/^[0-9a-f]{32}$/.test(hex)) return null;
    return hex.split("").reverse().join(".") + ".ip6.arpa";
  }
  return null;
}

function Page() {
  const [ip, setIp] = useState("8.8.8.8");
  const out = useMemo(() => arpa(ip.trim()), [ip]);
  return (
    <ToolLayout slug="reverse-dns">
      <div className="soft-card p-4 sm:p-5">
        <label className="eyebrow" htmlFor="ip">IP address</label>
        <input id="ip" value={ip} onChange={(e) => setIp(e.target.value)}
          className="mt-1.5 w-full font-mono rounded-xl border border-border bg-card p-3 min-h-12 focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div className="mt-4 soft-card p-4 sm:p-5">
        {out ? (
          <div>
            <div className="flex items-center justify-between">
              <span className="eyebrow">Reverse zone</span>
              <button onClick={() => navigator.clipboard.writeText(out).catch(() => {})} className="text-sm text-primary inline-flex items-center gap-1.5"><Copy className="size-4" /> Copy</button>
            </div>
            <pre className="mt-2 font-mono text-sm whitespace-pre-wrap break-all rounded-xl bg-primary-soft/30 p-4">{out}</pre>
            <p className="mt-2 text-xs text-muted-foreground">Used to publish PTR records that map an IP back to a hostname.</p>
          </div>
        ) : (
          <p className="text-destructive text-sm">Enter a valid IPv4 or IPv6 address.</p>
        )}
      </div>
      <HowItWorks>
        <li>Paste an IPv4 or IPv6 address.</li>
        <li>We reverse the octets/nibbles and append <span className="font-mono">.in-addr.arpa</span> or <span className="font-mono">.ip6.arpa</span>.</li>
        <li>Use the result as the host for a PTR record in your reverse zone.</li>
      </HowItWorks>
      <div className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground"><Network className="size-4 text-primary" /> No DNS query is made — formatting only.</div>
    </ToolLayout>
  );
}
