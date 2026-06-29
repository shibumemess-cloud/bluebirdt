import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, Wand2 } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/user-agent-parser")({
  head: () => ({
    meta: [
      { title: "User Agent Parser — Free Online Browser, OS & Device Detector" },
      { name: "description", content: "Paste any User-Agent string to see the browser, version, operating system, device type and engine — instantly and privately." },
      { property: "og:title", content: "User Agent Parser — Bluebird" },
      { property: "og:description", content: "Decode any User-Agent in your browser." },
      { property: "og:url", content: "/user-agent-parser" },
    ],
    links: [{ rel: "canonical", href: "/user-agent-parser" }],
  }),
  component: Page,
});

type Parsed = {
  browser: { name: string; version: string };
  engine: { name: string; version: string };
  os: { name: string; version: string };
  device: { type: string; vendor: string; model: string };
  isBot: boolean;
};

function pick(re: RegExp, s: string, i = 1): string {
  const m = s.match(re);
  return m && m[i] ? m[i] : "";
}

function parseUA(ua: string): Parsed {
  const u = ua;
  let browserName = "Unknown", browserVer = "";
  let engineName = "Unknown", engineVer = "";
  let osName = "Unknown", osVer = "";
  let deviceType = "desktop", vendor = "", model = "";

  // Bots first
  const isBot = /bot|crawler|spider|crawling|slurp|googlebot|bingbot|yandex|duckduckbot|baiduspider/i.test(u);

  // Browsers (order matters)
  if (/Edg\//i.test(u)) { browserName = "Edge"; browserVer = pick(/Edg\/([\d.]+)/i, u); }
  else if (/OPR\/|Opera/i.test(u)) { browserName = "Opera"; browserVer = pick(/(?:OPR|Opera)\/([\d.]+)/i, u); }
  else if (/Vivaldi/i.test(u)) { browserName = "Vivaldi"; browserVer = pick(/Vivaldi\/([\d.]+)/i, u); }
  else if (/Brave/i.test(u)) { browserName = "Brave"; browserVer = pick(/Brave\/([\d.]+)/i, u); }
  else if (/SamsungBrowser/i.test(u)) { browserName = "Samsung Internet"; browserVer = pick(/SamsungBrowser\/([\d.]+)/i, u); }
  else if (/Firefox|FxiOS/i.test(u)) { browserName = "Firefox"; browserVer = pick(/(?:Firefox|FxiOS)\/([\d.]+)/i, u); }
  else if (/CriOS/i.test(u)) { browserName = "Chrome (iOS)"; browserVer = pick(/CriOS\/([\d.]+)/i, u); }
  else if (/Chrome/i.test(u)) { browserName = "Chrome"; browserVer = pick(/Chrome\/([\d.]+)/i, u); }
  else if (/Safari/i.test(u)) { browserName = "Safari"; browserVer = pick(/Version\/([\d.]+)/i, u); }
  else if (/MSIE|Trident/i.test(u)) { browserName = "Internet Explorer"; browserVer = pick(/(?:MSIE |rv:)([\d.]+)/i, u); }

  // Engine
  if (/Gecko\/\d/i.test(u) && /Firefox/i.test(u)) { engineName = "Gecko"; engineVer = pick(/rv:([\d.]+)/i, u); }
  else if (/AppleWebKit/i.test(u)) {
    engineName = /Edg\//i.test(u) || /Chrome/i.test(u) ? "Blink" : "WebKit";
    engineVer = pick(/AppleWebKit\/([\d.]+)/i, u);
  } else if (/Trident/i.test(u)) { engineName = "Trident"; engineVer = pick(/Trident\/([\d.]+)/i, u); }

  // OS
  if (/Windows NT/i.test(u)) {
    osName = "Windows";
    const v = pick(/Windows NT ([\d.]+)/i, u);
    const map: Record<string, string> = { "10.0": "10/11", "6.3": "8.1", "6.2": "8", "6.1": "7", "6.0": "Vista", "5.1": "XP" };
    osVer = map[v] ?? v;
  } else if (/iPhone|iPad|iPod/i.test(u)) {
    osName = "iOS"; osVer = pick(/OS ([\d_]+)/i, u).replace(/_/g, ".");
    deviceType = /iPad/i.test(u) ? "tablet" : "mobile";
    vendor = "Apple"; model = /iPad/i.test(u) ? "iPad" : /iPod/i.test(u) ? "iPod" : "iPhone";
  } else if (/Mac OS X/i.test(u)) {
    osName = "macOS"; osVer = pick(/Mac OS X ([\d_.]+)/i, u).replace(/_/g, ".");
    vendor = "Apple";
  } else if (/Android/i.test(u)) {
    osName = "Android"; osVer = pick(/Android ([\d.]+)/i, u);
    deviceType = /Mobile/i.test(u) ? "mobile" : "tablet";
    const m = u.match(/Android[^;]*;\s*([^;)]+)\sBuild/i) || u.match(/Android[^;]*;\s*([^;)]+)\)/i);
    if (m) model = m[1].trim();
  } else if (/CrOS/i.test(u)) { osName = "Chrome OS"; }
  else if (/Linux/i.test(u)) { osName = "Linux"; }

  if (deviceType === "desktop" && /Mobi|Mobile/i.test(u)) deviceType = "mobile";

  return {
    browser: { name: browserName, version: browserVer },
    engine: { name: engineName, version: engineVer },
    os: { name: osName, version: osVer },
    device: { type: deviceType, vendor, model },
    isBot,
  };
}

function Page() {
  const [ua, setUa] = useState("");
  const result = useMemo(() => ua.trim() ? parseUA(ua.trim()) : null, [ua]);

  function useMine() {
    if (typeof navigator !== "undefined") setUa(navigator.userAgent);
  }

  const Row = ({ k, v }: { k: string; v: string }) => (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2">
      <span className="text-sm text-muted-foreground">{k}</span>
      <span className="text-sm font-medium truncate">{v || "—"}</span>
    </div>
  );

  return (
    <ToolLayout slug="user-agent-parser">
      <div className="soft-card p-4 sm:p-5 space-y-3">
        <label className="block">
          <div className="eyebrow mb-1">User-Agent string</div>
          <textarea value={ua} onChange={(e) => setUa(e.target.value)} rows={4}
            placeholder="Paste a User-Agent string here, or use yours…"
            aria-label="User Agent string"
            className="w-full rounded-xl border border-border bg-card p-3 font-mono text-sm" />
        </label>
        <div className="flex flex-wrap gap-2">
          <button onClick={useMine}
            className="min-h-10 px-3 rounded-lg border border-border bg-card hover:border-primary inline-flex items-center gap-2 text-sm">
            <Wand2 className="size-4" /> Use my browser
          </button>
          <button onClick={() => navigator.clipboard.writeText(ua)} disabled={!ua}
            className="min-h-10 px-3 rounded-lg border border-border bg-card hover:border-primary inline-flex items-center gap-2 text-sm disabled:opacity-50">
            <Copy className="size-4" /> Copy
          </button>
          <button onClick={() => setUa("")} disabled={!ua}
            className="min-h-10 px-3 rounded-lg border border-border bg-card hover:border-destructive inline-flex items-center gap-2 text-sm disabled:opacity-50">
            Clear
          </button>
        </div>
      </div>

      {result && (
        <div className="grid sm:grid-cols-2 gap-3 mt-5">
          <div className="soft-card p-4 space-y-2">
            <div className="eyebrow mb-1">Browser</div>
            <Row k="Name" v={result.browser.name} />
            <Row k="Version" v={result.browser.version} />
            <Row k="Engine" v={`${result.engine.name}${result.engine.version ? " " + result.engine.version : ""}`} />
          </div>
          <div className="soft-card p-4 space-y-2">
            <div className="eyebrow mb-1">System</div>
            <Row k="Operating system" v={`${result.os.name}${result.os.version ? " " + result.os.version : ""}`} />
            <Row k="Device type" v={result.device.type} />
            <Row k="Vendor" v={result.device.vendor} />
            <Row k="Model" v={result.device.model} />
            <Row k="Bot / crawler" v={result.isBot ? "Yes" : "No"} />
          </div>
        </div>
      )}

      <HowItWorks>
        <li>Paste any User-Agent string, or tap “Use my browser”.</li>
        <li>See the browser, engine, OS and device parsed instantly.</li>
        <li>Useful for support tickets, analytics checks and bug reports.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
