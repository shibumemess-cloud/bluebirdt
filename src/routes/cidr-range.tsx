import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Network, Copy } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/cidr-range")({
  head: () => ({
    meta: [
      { title: "CIDR to IP Range — Free Subnet Range Calculator" },
      { name: "description", content: "Enter a CIDR like 10.0.0.0/24 to get the network, broadcast, first/last host and total addresses." },
      { property: "og:title", content: "CIDR to IP Range — Bluebird" },
      { property: "og:description", content: "Convert any CIDR block to its IP range in one click." },
    ],
    links: [{ rel: "canonical", href: "/cidr-range" }],
  }),
  component: Page,
});

function ipToNum(ip: string) {
  return ip.split(".").reduce((a, o) => a * 256 + Number(o), 0);
}
function numToIp(n: number) {
  return [24, 16, 8, 0].map((s) => (n >>> s) & 255).join(".");
}

function parseCidr(s: string) {
  const m = s.trim().match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)\/(\d{1,2})$/);
  if (!m) return null;
  const parts = m.slice(1, 5).map(Number);
  const bits = Number(m[5]);
  if (parts.some((p) => p > 255) || bits > 32) return null;
  const ip = ipToNum(parts.join("."));
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  const network = (ip & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const total = 2 ** (32 - bits);
  const hosts = bits >= 31 ? total : total - 2;
  return {
    network: numToIp(network),
    broadcast: numToIp(broadcast),
    first: numToIp(bits >= 31 ? network : network + 1),
    last: numToIp(bits >= 31 ? broadcast : broadcast - 1),
    mask: numToIp(mask),
    total,
    hosts,
  };
}

function Page() {
  const [cidr, setCidr] = useState("192.168.1.0/24");
  const r = useMemo(() => parseCidr(cidr), [cidr]);
  return (
    <ToolLayout slug="cidr-range">
      <div className="soft-card p-4 sm:p-5">
        <label className="eyebrow" htmlFor="cidr">CIDR notation</label>
        <input id="cidr" value={cidr} onChange={(e) => setCidr(e.target.value)}
          className="mt-1.5 w-full font-mono text-base rounded-xl border border-border bg-card p-3 min-h-12 focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div className="mt-4 soft-card p-4 sm:p-5">
        {r ? (
          <dl className="grid sm:grid-cols-2 gap-2 text-sm">
            {([
              ["Network", r.network],
              ["Broadcast", r.broadcast],
              ["First host", r.first],
              ["Last host", r.last],
              ["Subnet mask", r.mask],
              ["Total addresses", r.total.toLocaleString()],
              ["Usable hosts", r.hosts.toLocaleString()],
            ] as [string, string][]).map(([k, v]) => (
              <div key={k} className="rounded-lg bg-primary-soft/30 p-3 flex items-center justify-between gap-3">
                <div><dt className="text-muted-foreground">{k}</dt><dd className="font-mono">{v}</dd></div>
                <button onClick={() => navigator.clipboard.writeText(String(v)).catch(() => {})}
                  className="text-primary hover:underline inline-flex items-center gap-1.5 text-xs"><Copy className="size-3.5" /> Copy</button>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-destructive text-sm">Use the format <span className="font-mono">10.0.0.0/24</span>.</p>
        )}
      </div>
      <HowItWorks>
        <li>Type any IPv4 CIDR block, like <span className="font-mono">10.0.0.0/16</span>.</li>
        <li>See the network, broadcast and host range instantly.</li>
        <li>Copy any value to use in your firewall or VPC config.</li>
      </HowItWorks>
      <div className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground"><Network className="size-4 text-primary" /> All math runs locally — nothing leaves your browser.</div>
    </ToolLayout>
  );
}
