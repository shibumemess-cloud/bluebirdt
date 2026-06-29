import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Wifi } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/mac-lookup")({
  head: () => ({
    meta: [
      { title: "MAC Address Vendor Lookup — Free OUI Search" },
      { name: "description", content: "Paste a MAC address to identify its vendor from the IEEE OUI prefix — works offline in your browser." },
      { property: "og:title", content: "MAC Address Vendor Lookup — Bluebird" },
      { property: "og:description", content: "Find the manufacturer behind any MAC address." },
    ],
    links: [{ rel: "canonical", href: "/mac-lookup" }],
  }),
  component: Page,
});

// Compact bundled OUI list — most common consumer vendors.
const OUI: Record<string, string> = {
  "001A11": "Google",
  "F4F5D8": "Google",
  "3C5AB4": "Google",
  "DCA632": "Raspberry Pi",
  "B827EB": "Raspberry Pi",
  "E45F01": "Raspberry Pi",
  "AC1F6B": "Super Micro",
  "001CB3": "Apple",
  "F0DBF8": "Apple",
  "A4B197": "Apple",
  "F0189845": "Apple",
  "001E52": "Apple",
  "00A040": "Apple",
  "002500": "Apple",
  "001124": "Cisco",
  "001517": "Intel",
  "00059A": "Cisco",
  "001AA0": "Dell",
  "F8B156": "Dell",
  "001321": "Hewlett Packard",
  "3C970E": "Hewlett Packard",
  "1C6F65": "Giga-Byte",
  "0024E8": "Dell",
  "0050BA": "D-Link",
  "0007E9": "Intel",
  "0017FA": "Microsoft",
  "00125A": "Microsoft",
  "DC4A3E": "Hewlett Packard",
  "B025AA": "Microsoft",
  "001EC2": "Apple",
  "60FB42": "Apple",
  "F0F61C": "Apple",
  "001D7E": "Cisco-Linksys",
  "001E58": "Cisco-Linksys",
  "001A70": "Cisco-Linksys",
  "84B153": "Apple",
  "C82A14": "Apple",
  "BC52B7": "Apple",
  "001E8C": "ASUSTek",
  "001A92": "ASUSTek",
  "F46D04": "ASUSTek",
  "00248C": "ASUSTek",
  "001E2A": "Netgear",
  "00146C": "Netgear",
  "10DDB1": "Apple",
  "5C0947": "Apple",
  "001A2B": "Ayecom Technology",
  "0021CC": "Flextronics",
  "F0D5BF": "Garmin",
  "002314": "Intel",
  "001C25": "Hon Hai Precision",
  "F40F24": "Apple",
  "70DE​E2": "Apple",
};

function normalize(mac: string) {
  return mac.replace(/[^0-9a-fA-F]/g, "").toUpperCase();
}

function isValid(hex: string) {
  return /^[0-9A-F]{12}$/.test(hex);
}

function Page() {
  const [mac, setMac] = useState("B8:27:EB:12:34:56");
  const r = useMemo(() => {
    const hex = normalize(mac);
    if (!isValid(hex)) return { ok: false as const };
    const oui = hex.slice(0, 6);
    const vendor = OUI[oui] ?? "Unknown vendor (not in offline list)";
    return {
      ok: true as const,
      formatted: hex.match(/.{2}/g)!.join(":"),
      oui,
      vendor,
      type: hex[1] && (parseInt(hex[1], 16) & 1) ? "Multicast" : "Unicast",
      admin: hex[1] && (parseInt(hex[1], 16) & 2) ? "Locally administered" : "Globally unique",
    };
  }, [mac]);
  return (
    <ToolLayout slug="mac-lookup">
      <div className="soft-card p-4 sm:p-5">
        <label className="eyebrow" htmlFor="mac">MAC address</label>
        <input id="mac" value={mac} onChange={(e) => setMac(e.target.value)}
          className="mt-1.5 w-full font-mono text-base rounded-xl border border-border bg-card p-3 min-h-12 focus:outline-none focus:ring-2 focus:ring-ring" />
        <p className="mt-2 text-xs text-muted-foreground">Accepts colons, dashes, dots or no separators.</p>
      </div>
      <div className="mt-4 soft-card p-4 sm:p-5">
        {r.ok ? (
          <dl className="grid sm:grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg bg-primary-soft/30 p-3"><dt className="text-muted-foreground">Formatted</dt><dd className="font-mono">{r.formatted}</dd></div>
            <div className="rounded-lg bg-primary-soft/30 p-3"><dt className="text-muted-foreground">Vendor (OUI)</dt><dd className="font-medium">{r.vendor}</dd></div>
            <div className="rounded-lg bg-primary-soft/30 p-3"><dt className="text-muted-foreground">OUI prefix</dt><dd className="font-mono">{r.oui}</dd></div>
            <div className="rounded-lg bg-primary-soft/30 p-3"><dt className="text-muted-foreground">Cast</dt><dd>{r.type} · {r.admin}</dd></div>
          </dl>
        ) : (
          <p className="text-destructive text-sm">A MAC address has 12 hex characters (e.g. <span className="font-mono">B8:27:EB:12:34:56</span>).</p>
        )}
      </div>
      <HowItWorks>
        <li>Paste a MAC address — separators are optional.</li>
        <li>We check the first 3 bytes (OUI) against a built-in vendor list.</li>
        <li>For the full IEEE database, the offline list covers common consumer hardware.</li>
      </HowItWorks>
      <div className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground"><Wifi className="size-4 text-primary" /> Vendor lookup is offline — no network request is made.</div>
    </ToolLayout>
  );
}
