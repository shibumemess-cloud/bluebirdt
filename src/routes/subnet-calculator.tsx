import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/subnet-calculator")({
  head: () => ({
    meta: [
      { title: "Subnet Calculator — Free IPv4 CIDR & Network Mask Tool" },
      { name: "description", content: "Calculate IPv4 subnet, network address, broadcast, host range, mask and wildcard from any IP and CIDR. Instant and private." },
      { property: "og:title", content: "Subnet Calculator — Bluebird" },
      { property: "og:description", content: "IPv4 CIDR subnetting in your browser." },
      { property: "og:url", content: "/subnet-calculator" },
    ],
    links: [{ rel: "canonical", href: "/subnet-calculator" }],
  }),
  component: Page,
});

function parseIp(s: string): number | null {
  const m = s.trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return null;
  let n = 0;
  for (let i = 1; i <= 4; i++) {
    const o = Number(m[i]);
    if (o < 0 || o > 255) return null;
    n = (n * 256) + o;
  }
  return n >>> 0;
}
function toIp(n: number) {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
}
function toBinary(n: number) {
  const s = n.toString(2).padStart(32, "0");
  return s.match(/.{8}/g)!.join(".");
}

function ipClass(n: number) {
  const first = (n >>> 24) & 255;
  if (first < 128) return "A";
  if (first < 192) return "B";
  if (first < 224) return "C";
  if (first < 240) return "D (multicast)";
  return "E (reserved)";
}
function isPrivate(n: number) {
  const a = (n >>> 24) & 255, b = (n >>> 16) & 255;
  return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

function Page() {
  const [ip, setIp] = useState("192.168.1.10");
  const [cidr, setCidr] = useState(24);

  const data = useMemo(() => {
    const n = parseIp(ip);
    if (n === null) return null;
    if (cidr < 0 || cidr > 32) return null;
    const mask = cidr === 0 ? 0 : (0xFFFFFFFF << (32 - cidr)) >>> 0;
    const wild = (~mask) >>> 0;
    const network = (n & mask) >>> 0;
    const broadcast = (network | wild) >>> 0;
    const total = cidr === 32 ? 1 : cidr === 31 ? 2 : 2 ** (32 - cidr);
    const usable = cidr >= 31 ? total : Math.max(0, total - 2);
    const first = cidr >= 31 ? network : (network + 1) >>> 0;
    const last = cidr >= 31 ? broadcast : (broadcast - 1) >>> 0;
    return { mask, wild, network, broadcast, total, usable, first, last, n };
  }, [ip, cidr]);

  const copy = (v: string) => navigator.clipboard.writeText(v);

  const Row = ({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) => (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        <span className={`${mono ? "font-mono" : ""} text-sm truncate`}>{value}</span>
        <button onClick={() => copy(value)} aria-label={`Copy ${label}`} className="text-muted-foreground hover:text-primary shrink-0">
          <Copy className="size-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <ToolLayout slug="subnet-calculator">
      <div className="soft-card p-4 sm:p-5 grid sm:grid-cols-[1fr_140px] gap-3 items-end">
        <label className="text-sm">
          <div className="eyebrow mb-1">IPv4 address</div>
          <input value={ip} onChange={(e) => setIp(e.target.value)} placeholder="192.168.1.10"
            aria-label="IPv4 address"
            className="w-full min-h-12 px-3 rounded-lg border border-border bg-card font-mono" />
        </label>
        <label className="text-sm">
          <div className="eyebrow mb-1">CIDR /prefix</div>
          <input type="number" min={0} max={32} value={cidr} onChange={(e) => setCidr(Number(e.target.value))}
            aria-label="CIDR prefix"
            className="w-full min-h-12 px-3 rounded-lg border border-border bg-card font-mono" />
        </label>
      </div>

      {!data ? (
        <div role="alert" className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive p-3 text-sm">
          Enter a valid IPv4 address and a CIDR between 0 and 32.
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-3 mt-5">
          <div className="soft-card p-4 space-y-2">
            <div className="eyebrow mb-1">Network</div>
            <Row label="Network address" value={`${toIp(data.network)}/${cidr}`} />
            <Row label="Broadcast" value={toIp(data.broadcast)} />
            <Row label="Subnet mask" value={toIp(data.mask)} />
            <Row label="Wildcard mask" value={toIp(data.wild)} />
            <Row label="First host" value={toIp(data.first)} />
            <Row label="Last host" value={toIp(data.last)} />
          </div>
          <div className="soft-card p-4 space-y-2">
            <div className="eyebrow mb-1">Info</div>
            <Row label="Total addresses" value={data.total.toLocaleString()} mono={false} />
            <Row label="Usable hosts" value={data.usable.toLocaleString()} mono={false} />
            <Row label="Class" value={ipClass(data.n)} mono={false} />
            <Row label="Type" value={isPrivate(data.n) ? "Private (RFC 1918)" : "Public"} mono={false} />
            <div className="rounded-lg border border-border bg-card px-3 py-2">
              <div className="text-xs text-muted-foreground mb-1">Network in binary</div>
              <div className="font-mono text-xs break-all">{toBinary(data.network)}</div>
            </div>
            <div className="rounded-lg border border-border bg-card px-3 py-2">
              <div className="text-xs text-muted-foreground mb-1">Mask in binary</div>
              <div className="font-mono text-xs break-all">{toBinary(data.mask)}</div>
            </div>
          </div>
        </div>
      )}

      <HowItWorks>
        <li>Type any IPv4 address — for example 10.0.5.42.</li>
        <li>Set the CIDR prefix (0–32) or use a common one like /24.</li>
        <li>See the network, broadcast, mask, host range and class instantly.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
