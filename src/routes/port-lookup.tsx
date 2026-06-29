import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plug } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/port-lookup")({
  head: () => ({
    meta: [
      { title: "Port Number Lookup — Common TCP/UDP Ports" },
      { name: "description", content: "Search well-known TCP and UDP port numbers and the services that use them — fully offline." },
      { property: "og:title", content: "Port Number Lookup — Bluebird" },
      { property: "og:description", content: "What runs on that port? Find out instantly." },
    ],
    links: [{ rel: "canonical", href: "/port-lookup" }],
  }),
  component: Page,
});

type Port = { port: number; proto: string; service: string; desc: string };

const PORTS: Port[] = [
  { port: 20, proto: "TCP", service: "FTP-DATA", desc: "FTP data transfer" },
  { port: 21, proto: "TCP", service: "FTP", desc: "File Transfer Protocol control" },
  { port: 22, proto: "TCP", service: "SSH", desc: "Secure shell" },
  { port: 23, proto: "TCP", service: "Telnet", desc: "Unencrypted remote login" },
  { port: 25, proto: "TCP", service: "SMTP", desc: "Outgoing mail (server-to-server)" },
  { port: 53, proto: "TCP/UDP", service: "DNS", desc: "Domain Name System" },
  { port: 67, proto: "UDP", service: "DHCP", desc: "DHCP server" },
  { port: 68, proto: "UDP", service: "DHCP", desc: "DHCP client" },
  { port: 69, proto: "UDP", service: "TFTP", desc: "Trivial FTP" },
  { port: 80, proto: "TCP", service: "HTTP", desc: "Web traffic (unencrypted)" },
  { port: 110, proto: "TCP", service: "POP3", desc: "Mail retrieval" },
  { port: 119, proto: "TCP", service: "NNTP", desc: "Usenet news" },
  { port: 123, proto: "UDP", service: "NTP", desc: "Network Time Protocol" },
  { port: 137, proto: "UDP", service: "NetBIOS-NS", desc: "NetBIOS name service" },
  { port: 138, proto: "UDP", service: "NetBIOS-DGM", desc: "NetBIOS datagram" },
  { port: 139, proto: "TCP", service: "NetBIOS-SSN", desc: "NetBIOS session" },
  { port: 143, proto: "TCP", service: "IMAP", desc: "Mail retrieval" },
  { port: 161, proto: "UDP", service: "SNMP", desc: "Network management" },
  { port: 162, proto: "UDP", service: "SNMP-TRAP", desc: "SNMP notifications" },
  { port: 179, proto: "TCP", service: "BGP", desc: "Border Gateway Protocol" },
  { port: 194, proto: "TCP", service: "IRC", desc: "Internet Relay Chat" },
  { port: 389, proto: "TCP", service: "LDAP", desc: "Directory services" },
  { port: 443, proto: "TCP", service: "HTTPS", desc: "Encrypted web traffic" },
  { port: 445, proto: "TCP", service: "SMB", desc: "Windows file sharing" },
  { port: 465, proto: "TCP", service: "SMTPS", desc: "SMTP over SSL (submission)" },
  { port: 514, proto: "UDP", service: "Syslog", desc: "System log messages" },
  { port: 515, proto: "TCP", service: "LPD", desc: "Line printer daemon" },
  { port: 587, proto: "TCP", service: "SMTP", desc: "Mail submission" },
  { port: 631, proto: "TCP", service: "IPP", desc: "Internet Printing Protocol" },
  { port: 636, proto: "TCP", service: "LDAPS", desc: "LDAP over TLS" },
  { port: 993, proto: "TCP", service: "IMAPS", desc: "IMAP over TLS" },
  { port: 995, proto: "TCP", service: "POP3S", desc: "POP3 over TLS" },
  { port: 1080, proto: "TCP", service: "SOCKS", desc: "SOCKS proxy" },
  { port: 1194, proto: "UDP", service: "OpenVPN", desc: "VPN tunnel" },
  { port: 1433, proto: "TCP", service: "MSSQL", desc: "Microsoft SQL Server" },
  { port: 1521, proto: "TCP", service: "Oracle", desc: "Oracle database" },
  { port: 1723, proto: "TCP", service: "PPTP", desc: "VPN (legacy)" },
  { port: 2049, proto: "TCP", service: "NFS", desc: "Network File System" },
  { port: 3000, proto: "TCP", service: "Dev server", desc: "Common Node.js / Rails dev port" },
  { port: 3306, proto: "TCP", service: "MySQL", desc: "MySQL database" },
  { port: 3389, proto: "TCP", service: "RDP", desc: "Windows Remote Desktop" },
  { port: 5060, proto: "UDP", service: "SIP", desc: "VoIP signalling" },
  { port: 5432, proto: "TCP", service: "PostgreSQL", desc: "PostgreSQL database" },
  { port: 5900, proto: "TCP", service: "VNC", desc: "Remote screen control" },
  { port: 5984, proto: "TCP", service: "CouchDB", desc: "CouchDB database" },
  { port: 6379, proto: "TCP", service: "Redis", desc: "Redis cache" },
  { port: 6667, proto: "TCP", service: "IRC", desc: "IRC chat server" },
  { port: 8080, proto: "TCP", service: "HTTP-alt", desc: "Alt HTTP / proxies" },
  { port: 8443, proto: "TCP", service: "HTTPS-alt", desc: "Alt HTTPS" },
  { port: 8888, proto: "TCP", service: "Dev server", desc: "Common alt dev port" },
  { port: 9000, proto: "TCP", service: "PHP-FPM", desc: "PHP FastCGI" },
  { port: 9092, proto: "TCP", service: "Kafka", desc: "Apache Kafka broker" },
  { port: 9200, proto: "TCP", service: "Elasticsearch", desc: "Elasticsearch HTTP" },
  { port: 11211, proto: "TCP", service: "Memcached", desc: "Memcached cache" },
  { port: 27017, proto: "TCP", service: "MongoDB", desc: "MongoDB database" },
];

function Page() {
  const [q, setQ] = useState("");
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return PORTS;
    return PORTS.filter((p) =>
      String(p.port) === s ||
      p.service.toLowerCase().includes(s) ||
      p.desc.toLowerCase().includes(s),
    );
  }, [q]);
  return (
    <ToolLayout slug="port-lookup">
      <div className="soft-card p-4 sm:p-5">
        <label className="eyebrow" htmlFor="q">Search by port number or service</label>
        <input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. 443 or postgres"
          className="mt-1.5 w-full rounded-xl border border-border bg-card p-3 min-h-12 focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div className="mt-4 soft-card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-primary-soft/40 text-left">
            <tr><th className="p-3">Port</th><th className="p-3">Proto</th><th className="p-3">Service</th><th className="p-3 hidden sm:table-cell">Description</th></tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={`${p.port}-${p.service}`} className="border-t border-border">
                <td className="p-3 font-mono">{p.port}</td><td className="p-3">{p.proto}</td><td className="p-3 font-medium">{p.service}</td><td className="p-3 hidden sm:table-cell text-muted-foreground">{p.desc}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No matching ports.</td></tr>}
          </tbody>
        </table>
      </div>
      <HowItWorks>
        <li>Search by number (like <span className="font-mono">443</span>) or service name (like <span className="font-mono">redis</span>).</li>
        <li>Use the result when opening firewall rules or debugging a connection.</li>
      </HowItWorks>
      <div className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground"><Plug className="size-4 text-primary" /> Bundled IANA list — works offline.</div>
    </ToolLayout>
  );
}
