import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Network, CheckCircle2, XCircle } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/ip-validator")({
  head: () => ({
    meta: [
      { title: "IP Address Validator — Check IPv4 and IPv6 Free" },
      { name: "description", content: "Paste any IP address to check if it's a valid IPv4 or IPv6 — with class, private/public and loopback details." },
      { property: "og:title", content: "IP Address Validator — Bluebird" },
      { property: "og:description", content: "Validate IPv4 and IPv6 addresses instantly in your browser." },
    ],
    links: [{ rel: "canonical", href: "/ip-validator" }],
  }),
  component: Page,
});

function classify(ip: string) {
  const v4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const m = ip.match(v4);
  if (m) {
    const parts = m.slice(1).map(Number);
    if (parts.some((p) => p > 255)) return { ok: false, msg: "Each octet must be 0–255." };
    const [a, b] = parts;
    const cls = a < 128 ? "A" : a < 192 ? "B" : a < 224 ? "C" : a < 240 ? "D (multicast)" : "E (reserved)";
    const isPrivate =
      a === 10 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a === 127;
    return {
      ok: true,
      type: "IPv4",
      details: [
        ["Class", cls],
        ["Scope", a === 127 ? "Loopback" : isPrivate ? "Private" : "Public"],
        ["Binary", parts.map((p) => p.toString(2).padStart(8, "0")).join(".")],
        ["Hex", parts.map((p) => p.toString(16).padStart(2, "0")).join(":")],
      ] as [string, string][],
    };
  }
  // IPv6: simple validation
  if (/^[0-9a-fA-F:]+$/.test(ip) && ip.includes(":")) {
    const groups = ip.split("::");
    if (groups.length > 2) return { ok: false, msg: "Only one '::' allowed." };
    const left = groups[0] ? groups[0].split(":") : [];
    const right = groups[1] ? groups[1].split(":") : [];
    const total = left.length + right.length;
    if ((groups.length === 1 && total !== 8) || (groups.length === 2 && total > 7)) return { ok: false, msg: "Wrong number of groups." };
    if (![...left, ...right].every((g) => /^[0-9a-fA-F]{1,4}$/.test(g))) return { ok: false, msg: "Each group must be 1–4 hex characters." };
    const isLoopback = ip === "::1";
    const isLinkLocal = ip.toLowerCase().startsWith("fe80");
    return {
      ok: true,
      type: "IPv6",
      details: [
        ["Scope", isLoopback ? "Loopback" : isLinkLocal ? "Link-local" : "Global"],
        ["Compressed", ip.toLowerCase()],
      ] as [string, string][],
    };
  }
  return { ok: false, msg: "Not a recognised IPv4 or IPv6 address." };
}

function Page() {
  const [ip, setIp] = useState("192.168.1.1");
  const r = useMemo(() => classify(ip.trim()), [ip]);
  return (
    <ToolLayout slug="ip-validator">
      <div className="soft-card p-4 sm:p-5">
        <label className="eyebrow" htmlFor="ip">IP address</label>
        <input id="ip" value={ip} onChange={(e) => setIp(e.target.value)}
          className="mt-1.5 w-full font-mono text-base rounded-xl border border-border bg-card p-3 min-h-12 focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div className="mt-4 soft-card p-4 sm:p-5">
        {r.ok ? (
          <div>
            <div className="inline-flex items-center gap-2 text-success font-semibold"><CheckCircle2 className="size-5" /> Valid {r.type}</div>
            <dl className="mt-3 grid sm:grid-cols-2 gap-2 text-sm">
              {(r.details ?? []).map(([k, v]) => (
                <div key={k} className="rounded-lg bg-primary-soft/30 p-3"><dt className="text-muted-foreground">{k}</dt><dd className="font-mono break-all">{v}</dd></div>
              ))}
            </dl>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 text-destructive"><XCircle className="size-5" /> {r.msg}</div>
        )}
      </div>
      <HowItWorks>
        <li>Paste any IPv4 or IPv6 address.</li>
        <li>See whether it's valid, public or private, and its class.</li>
        <li>Copy the binary or hex breakdown for your notes.</li>
      </HowItWorks>
      <div className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground"><Network className="size-4 text-primary" /> Runs entirely in your browser — no DNS lookup.</div>
    </ToolLayout>
  );
}
