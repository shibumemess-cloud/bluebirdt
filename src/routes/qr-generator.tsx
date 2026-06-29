import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import {
  Download,
  QrCode as QrIcon,
  Wifi,
  Link as LinkIcon,
  Mail,
  MessageSquare,
  User,
  Type,
  Copy,
  Check,
  Share2,
  Printer,
  Eye,
  EyeOff,
  AlertTriangle,
  ImageDown,
} from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { Field, ErrorBox, EmptyState, HowItWorks, WarnBox } from "../components/ToolControls";
import {
  buildWifiPayload,
  buildVCard,
  normalizeUrl,
  contrastRatio,
} from "../lib/image-tool-helpers";
import ogImage from "../assets/og/og-qr.jpg";

export const Route = createFileRoute("/qr-generator")({
  head: () => ({
    meta: [
      { title: "QR Code Generator — Free, Custom Colors, Wi-Fi & vCard" },
      {
        name: "description",
        content:
          "Make a styled QR code for a link, Wi-Fi network, contact card, email or text — with your own colors and optional logo. Free, in-browser, no sign-up.",
      },
      { property: "og:title", content: "QR Code Generator — Bluebird" },
      { property: "og:description", content: "Free QR generator with custom colors, logo, Wi-Fi and vCard support. Runs in your browser." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/qr-generator" },
      { property: "og:image", content: ogImage },
      { name: "twitter:image", content: ogImage },
    ],
    links: [{ rel: "canonical", href: "/qr-generator" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird QR Code Generator",
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          description: "Free in-browser QR code generator with logo, color and Wi-Fi support.",
        }),
      },
    ],
  }),
  component: Page,
});

type Kind = "url" | "text" | "wifi" | "vcard" | "email" | "sms";
type Level = "L" | "M" | "Q" | "H";
type ExportSize = 256 | 512 | 1024 | 2048;

const KINDS: { id: Kind; label: string; Icon: typeof LinkIcon; hint: string }[] = [
  { id: "url", label: "Link", Icon: LinkIcon, hint: "Open a website" },
  { id: "wifi", label: "Wi-Fi", Icon: Wifi, hint: "Join a network" },
  { id: "vcard", label: "Contact", Icon: User, hint: "Save contact card" },
  { id: "text", label: "Text", Icon: Type, hint: "Show a message" },
  { id: "email", label: "Email", Icon: Mail, hint: "Compose an email" },
  { id: "sms", label: "SMS", Icon: MessageSquare, hint: "Send a text" },
];

const PRESETS: { name: string; fg: string; bg: string }[] = [
  { name: "Classic", fg: "#000000", bg: "#FFFFFF" },
  { name: "Bluebird", fg: "#0F2A6B", bg: "#FFFFFF" },
  { name: "Sky", fg: "#1E66F5", bg: "#F1F6FF" },
  { name: "Forest", fg: "#1B4332", bg: "#F4FBF4" },
  { name: "Plum", fg: "#3A0CA3", bg: "#FFF7FB" },
  { name: "Inverted", fg: "#FFFFFF", bg: "#0F2A6B" },
];

function hexToRgb(hex: string) {
  const m = hex.replace("#", "").match(/^([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  if (!m) return { r: 0, g: 0, b: 0 };
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

function Page() {
  const [kind, setKind] = useState<Kind>("url");
  const [fg, setFg] = useState("#0F2A6B");
  const [bg, setBg] = useState("#FFFFFF");
  const [level, setLevel] = useState<Level>("M");
  const [margin, setMargin] = useState(2);
  const [logo, setLogo] = useState<File | null>(null);
  const [exportSize, setExportSize] = useState<ExportSize>(1024);
  const [error, setError] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [showWifiPwd, setShowWifiPwd] = useState(false);

  // Per-kind fields
  const [url, setUrl] = useState("https://bluebird.tools");
  const [text, setText] = useState("Hello from Bluebird!");
  const [wifi, setWifi] = useState({ ssid: "", password: "", auth: "WPA" as "WPA" | "WEP" | "nopass", hidden: false });
  const [vcard, setVcard] = useState({ name: "", org: "", title: "", phone: "", email: "", url: "" });
  const [email, setEmail] = useState({ to: "", subject: "", body: "" });
  const [sms, setSms] = useState({ to: "", body: "" });

  const payload = useMemo(() => {
    switch (kind) {
      case "url": return normalizeUrl(url);
      case "text": return text;
      case "wifi": return wifi.ssid ? buildWifiPayload(wifi) : "";
      case "vcard": return vcard.name ? buildVCard(vcard) : "";
      case "email": {
        if (!email.to) return "";
        const params = new URLSearchParams();
        if (email.subject) params.set("subject", email.subject);
        if (email.body) params.set("body", email.body);
        const q = params.toString();
        return `mailto:${email.to}${q ? `?${q}` : ""}`;
      }
      case "sms": {
        if (!sms.to) return "";
        return `SMSTO:${sms.to}:${sms.body}`;
      }
    }
  }, [kind, url, text, wifi, vcard, email, sms]);

  // Approximate capacity in characters at chosen ECC (alphanumeric basis).
  // Real numbers depend on encoding; this gives an honest fullness meter.
  const capacityAtLevel: Record<Level, number> = { L: 4296, M: 3391, Q: 2420, H: 1852 };
  const filledPct = Math.min(100, Math.round((payload.length / capacityAtLevel[level]) * 100));

  // Foreground/background contrast — QR scanners want ≥ ~3:1, prefer ≥ 4:1
  const fgRgb = hexToRgb(fg);
  const bgRgb = hexToRgb(bg);
  const ratio = contrastRatio(
    { hex: fg, ...fgRgb },
    { hex: bg, ...bgRgb },
  );
  const lowContrast = ratio < 3;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const [pngBlob, setPngBlob] = useState<Blob | null>(null);
  const [svgString, setSvgString] = useState<string | null>(null);

  // Render live whenever inputs change. Renders at exportSize so downloads are
  // crisp; preview img scales it down for display.
  useEffect(() => {
    let cancelled = false;
    setError(null);
    if (!payload) { setPngUrl(null); setPngBlob(null); setSvgString(null); return; }

    const opts = {
      errorCorrectionLevel: level,
      margin,
      color: { dark: fg, light: bg },
      width: exportSize,
    } as const;

    (async () => {
      try {
        const canvas = canvasRef.current ?? document.createElement("canvas");
        canvasRef.current = canvas;
        await QRCode.toCanvas(canvas, payload, opts);

        if (logo) {
          const img = new Image();
          img.src = URL.createObjectURL(logo);
          await img.decode();
          const ctx = canvas.getContext("2d")!;
          const W = canvas.width;
          const size = Math.round(W * 0.22);
          const pad = Math.round(size * 0.12);
          const cx = (W - size) / 2;
          const cy = (W - size) / 2;
          ctx.fillStyle = bg;
          ctx.fillRect(cx - pad, cy - pad, size + pad * 2, size + pad * 2);
          ctx.drawImage(img, cx, cy, size, size);
          URL.revokeObjectURL(img.src);
        }

        if (cancelled) return;
        const blob: Blob = await new Promise((res, rej) =>
          canvas.toBlob((b) => (b ? res(b) : rej(new Error("encode"))), "image/png"),
        );
        if (cancelled) return;
        setPngBlob(blob);
        setPngUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(blob); });

        const svg = await QRCode.toString(payload, { ...opts, type: "svg" });
        if (!cancelled) setSvgString(svg);
      } catch (e) {
        if (!cancelled) {
          setError(
            (e as Error)?.message?.includes("too big")
              ? "That content is too long for a QR code. Try a shorter link, lower the error correction, or shorten the message."
              : "Couldn't make a QR code from that input.",
          );
          setPngUrl(null); setPngBlob(null); setSvgString(null);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [payload, fg, bg, level, margin, logo, exportSize]);

  const svgUrl = useMemo(() => {
    if (!svgString) return null;
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    return URL.createObjectURL(blob);
  }, [svgString]);
  useEffect(() => () => { if (svgUrl) URL.revokeObjectURL(svgUrl); }, [svgUrl]);

  // Build a JPG version on the fly from the live canvas (white-padded).
  async function downloadJpg() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const flat = document.createElement("canvas");
    flat.width = canvas.width;
    flat.height = canvas.height;
    const ctx = flat.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, flat.width, flat.height);
    ctx.drawImage(canvas, 0, 0);
    const blob: Blob = await new Promise((res, rej) =>
      flat.toBlob((b) => (b ? res(b) : rej(new Error("encode"))), "image/jpeg", 0.95),
    );
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u; a.download = "bluebird-qr.jpg"; a.click();
    setTimeout(() => URL.revokeObjectURL(u), 1000);
  }

  async function copyPng() {
    if (!pngBlob) return;
    try {
      // ClipboardItem may not exist (Safari < 13.1, Firefox flag off)
      if (typeof ClipboardItem === "undefined") throw new Error("no clipboard image");
      await navigator.clipboard.write([new ClipboardItem({ "image/png": pngBlob })]);
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 1500);
    } catch {
      setError("Your browser doesn't allow copying images. Try the download buttons instead.");
    }
  }

  async function copyText() {
    if (!payload) return;
    try {
      await navigator.clipboard.writeText(payload);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 1500);
    } catch { /* ignore */ }
  }

  async function shareQr() {
    if (!pngBlob) return;
    const file = new File([pngBlob], "bluebird-qr.png", { type: "image/png" });
    const data: ShareData = { files: [file], title: "QR code", text: payload };
    if (navigator.canShare?.(data)) {
      try { await navigator.share(data); } catch { /* dismissed */ }
    }
  }
  const canShare =
    typeof navigator !== "undefined" &&
    typeof navigator.canShare === "function" &&
    pngBlob !== null &&
    navigator.canShare({ files: [new File([new Blob([])], "x.png", { type: "image/png" })] });

  function printQr() {
    if (!pngUrl) return;
    const w = window.open("", "_blank", "noopener,noreferrer");
    if (!w) return;
    w.document.write(`<!doctype html><title>Print QR</title><style>
      html,body{margin:0;height:100%;display:grid;place-items:center;background:#fff;font-family:ui-sans-serif,system-ui}
      img{width:60mm;height:60mm;image-rendering:pixelated}
      p{margin-top:6mm;color:#475569;font-size:11pt}
      @media print{ p{display:none} }
    </style><img src="${pngUrl}" alt="QR"/><p>Tap to print, then close this tab.</p>
    <script>window.addEventListener('load',()=>window.print())</script>`);
    w.document.close();
  }

  function applyPreset(p: { fg: string; bg: string }) {
    setFg(p.fg); setBg(p.bg);
  }

  const activeKind = KINDS.find((k) => k.id === kind)!;

  return (
    <ToolLayout slug="qr-generator">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        {/* PREVIEW — on mobile it comes first so users always see what they're making */}
        <aside className="col-span-12 md:col-span-5 md:order-2">
          <div className="md:sticky md:top-24">
            {pngUrl ? (
              <div
                className="soft-card p-5 sm:p-6 flex flex-col animate-[pop_.4s_cubic-bezier(0.22,1,0.36,1)_both]"
                role="region"
                aria-label="QR code preview"
              >
                <div className="flex items-center gap-2">
                  <QrIcon className="size-4 text-primary" aria-hidden />
                  <span className="eyebrow">Live preview</span>
                </div>
                <div className="font-display text-xl sm:text-2xl mt-1">{activeKind.label} QR code</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Updates the moment you change anything. Point any phone camera at it to test.
                </p>

                <div
                  className="mt-4 rounded-xl border border-border p-4 grid place-items-center"
                  style={{ background: bg }}
                >
                  <img
                    src={pngUrl}
                    alt={`QR code containing ${activeKind.label.toLowerCase()} content`}
                    className="w-full max-w-[240px] sm:max-w-[260px] h-auto"
                  />
                </div>

                {/* Primary downloads */}
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <a
                    href={pngUrl}
                    download="bluebird-qr.png"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-3 font-semibold min-h-12 hover:shadow-lift hover:-translate-y-0.5"
                  >
                    <Download className="size-4" aria-hidden /> PNG
                  </a>
                  {svgUrl && (
                    <a
                      href={svgUrl}
                      download="bluebird-qr.svg"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 font-semibold min-h-12 hover:bg-primary-soft"
                    >
                      <Download className="size-4" aria-hidden /> SVG
                    </a>
                  )}
                </div>

                {/* Secondary actions */}
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={downloadJpg}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium min-h-11 hover:bg-primary-soft"
                  >
                    <ImageDown className="size-4" aria-hidden /> JPG
                  </button>
                  <button
                    type="button"
                    onClick={copyPng}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium min-h-11 hover:bg-primary-soft"
                    aria-label="Copy QR image to clipboard"
                  >
                    {copiedImage ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
                    {copiedImage ? "Copied" : "Copy image"}
                  </button>
                  <button
                    type="button"
                    onClick={copyText}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium min-h-11 hover:bg-primary-soft"
                    aria-label="Copy QR payload text"
                  >
                    {copiedText ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
                    {copiedText ? "Copied" : "Copy text"}
                  </button>
                  <button
                    type="button"
                    onClick={printQr}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium min-h-11 hover:bg-primary-soft"
                  >
                    <Printer className="size-4" aria-hidden /> Print
                  </button>
                  {canShare && (
                    <button
                      type="button"
                      onClick={shareQr}
                      className="col-span-2 inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium min-h-11 hover:bg-primary-soft"
                    >
                      <Share2 className="size-4" aria-hidden /> Share…
                    </button>
                  )}
                </div>

                {/* Export size */}
                <fieldset className="mt-4">
                  <legend className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    PNG / JPG size
                  </legend>
                  <div className="grid grid-cols-4 gap-1.5">
                    {([256, 512, 1024, 2048] as ExportSize[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setExportSize(s)}
                        aria-pressed={exportSize === s}
                        className={[
                          "rounded-lg border px-2 py-2 text-xs font-semibold num transition",
                          exportSize === s
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-muted-foreground hover:text-primary",
                        ].join(" ")}
                      >
                        {s}px
                      </button>
                    ))}
                  </div>
                </fieldset>

                <p className="mt-3 text-xs text-muted-foreground">
                  Tip: print at 2 cm or larger so it scans from arm's length.
                </p>
              </div>
            ) : (
              <EmptyState text="Fill in your link or message. The QR code will appear here as you type." />
            )}
          </div>
        </aside>

        {/* CONTROLS */}
        <div className="col-span-12 md:col-span-7 md:order-1 space-y-6">
          {/* Kind picker */}
          <fieldset>
            <legend className="text-sm font-semibold mb-2">What's in your QR code?</legend>
            <div
              role="radiogroup"
              aria-label="QR content type"
              className="grid grid-cols-3 sm:grid-cols-6 gap-2"
            >
              {KINDS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={kind === id}
                  onClick={() => setKind(id)}
                  className={[
                    "flex flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-medium transition min-h-[72px]",
                    kind === id
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border bg-card text-muted-foreground hover:text-primary hover:border-primary",
                  ].join(" ")}
                >
                  <Icon className="size-5" aria-hidden />
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{activeKind.hint}.</p>
          </fieldset>

          {/* Content fields */}
          <div className="soft-card p-5 space-y-4">
            {kind === "url" && (
              <Field label="Link (URL)" hint="We'll add https:// automatically if you forget.">
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  type="url"
                  inputMode="url"
                  placeholder="example.com"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm min-h-11"
                />
              </Field>
            )}
            {kind === "text" && (
              <Field label="Text" hint="Plain text — shown as-is on the scanner's phone.">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm"
                />
              </Field>
            )}
            {kind === "wifi" && (
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Network name (SSID)">
                  <input
                    value={wifi.ssid}
                    onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })}
                    autoComplete="off"
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm min-h-11"
                  />
                </Field>
                <Field label="Security">
                  <select
                    value={wifi.auth}
                    onChange={(e) => setWifi({ ...wifi, auth: e.target.value as typeof wifi.auth })}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm min-h-11"
                  >
                    <option value="WPA">WPA / WPA2 / WPA3</option>
                    <option value="WEP">WEP (older)</option>
                    <option value="nopass">No password (open)</option>
                  </select>
                </Field>
                {wifi.auth !== "nopass" && (
                  <Field label="Password">
                    <div className="relative">
                      <input
                        value={wifi.password}
                        onChange={(e) => setWifi({ ...wifi, password: e.target.value })}
                        type={showWifiPwd ? "text" : "password"}
                        autoComplete="off"
                        className="w-full rounded-lg border border-border bg-card px-3 py-2.5 pr-11 text-sm min-h-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowWifiPwd((v) => !v)}
                        aria-label={showWifiPwd ? "Hide password" : "Show password"}
                        aria-pressed={showWifiPwd}
                        className="absolute inset-y-0 right-0 grid place-items-center w-11 text-muted-foreground hover:text-primary"
                      >
                        {showWifiPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </Field>
                )}
                <Field label="Hidden network?">
                  <label className="inline-flex items-center gap-2 text-sm min-h-11">
                    <input
                      type="checkbox"
                      className="size-5"
                      checked={wifi.hidden}
                      onChange={(e) => setWifi({ ...wifi, hidden: e.target.checked })}
                    />
                    Yes — SSID isn't broadcast
                  </label>
                </Field>
              </div>
            )}
            {kind === "vcard" && (
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full name">
                  <input value={vcard.name} onChange={(e) => setVcard({ ...vcard, name: e.target.value })} autoComplete="name"
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm min-h-11" />
                </Field>
                <Field label="Organization">
                  <input value={vcard.org} onChange={(e) => setVcard({ ...vcard, org: e.target.value })} autoComplete="organization"
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm min-h-11" />
                </Field>
                <Field label="Job title">
                  <input value={vcard.title} onChange={(e) => setVcard({ ...vcard, title: e.target.value })} autoComplete="organization-title"
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm min-h-11" />
                </Field>
                <Field label="Phone">
                  <input value={vcard.phone} onChange={(e) => setVcard({ ...vcard, phone: e.target.value })}
                    type="tel" inputMode="tel" autoComplete="tel"
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm min-h-11" />
                </Field>
                <Field label="Email">
                  <input value={vcard.email} onChange={(e) => setVcard({ ...vcard, email: e.target.value })}
                    type="email" inputMode="email" autoComplete="email"
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm min-h-11" />
                </Field>
                <Field label="Website">
                  <input value={vcard.url} onChange={(e) => setVcard({ ...vcard, url: e.target.value })}
                    type="url" inputMode="url" autoComplete="url"
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm min-h-11" />
                </Field>
              </div>
            )}
            {kind === "email" && (
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="To">
                  <input value={email.to} onChange={(e) => setEmail({ ...email, to: e.target.value })}
                    type="email" inputMode="email" placeholder="name@example.com"
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm min-h-11" />
                </Field>
                <Field label="Subject">
                  <input value={email.subject} onChange={(e) => setEmail({ ...email, subject: e.target.value })}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm min-h-11" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Message">
                    <textarea value={email.body} onChange={(e) => setEmail({ ...email, body: e.target.value })}
                      rows={3} className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm" />
                  </Field>
                </div>
              </div>
            )}
            {kind === "sms" && (
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Phone number">
                  <input value={sms.to} onChange={(e) => setSms({ ...sms, to: e.target.value })}
                    type="tel" inputMode="tel" placeholder="+1 555 0100"
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm min-h-11" />
                </Field>
                <Field label="Message">
                  <input value={sms.body} onChange={(e) => setSms({ ...sms, body: e.target.value })}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm min-h-11" />
                </Field>
              </div>
            )}

            {/* Payload meter */}
            {payload && (
              <div className="rounded-lg bg-primary-soft/50 border border-border px-3 py-2.5 text-xs flex items-center gap-3" aria-live="polite">
                <span className="font-semibold text-foreground num shrink-0">{payload.length} chars</span>
                <div className="flex-1 h-1.5 rounded-full bg-card overflow-hidden">
                  <div
                    className={["h-full transition-all", filledPct > 90 ? "bg-[color:var(--color-danger,#dc2626)]" : "bg-primary"].join(" ")}
                    style={{ width: `${Math.max(3, filledPct)}%` }}
                  />
                </div>
                <span className="text-muted-foreground shrink-0 num">{filledPct}% full at ECC {level}</span>
              </div>
            )}
          </div>

          {/* Style */}
          <div className="soft-card p-5 space-y-5">
            {/* Color presets */}
            <fieldset>
              <legend className="text-sm font-semibold mb-2">Color preset</legend>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => {
                  const active = p.fg.toUpperCase() === fg.toUpperCase() && p.bg.toUpperCase() === bg.toUpperCase();
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => applyPreset(p)}
                      aria-pressed={active}
                      aria-label={`${p.name} colors`}
                      className={[
                        "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition min-h-10",
                        active ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary",
                      ].join(" ")}
                    >
                      <span className="inline-flex">
                        <span className="size-4 rounded-l-full border border-border" style={{ background: p.fg }} aria-hidden />
                        <span className="size-4 rounded-r-full border-y border-r border-border" style={{ background: p.bg }} aria-hidden />
                      </span>
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Foreground" hint="The dark squares.">
                <div className="flex items-center gap-3">
                  <input type="color" value={fg} onChange={(e) => setFg(e.target.value.toUpperCase())}
                    aria-label="Foreground color"
                    className="size-11 rounded-lg border border-border bg-card cursor-pointer" />
                  <input
                    type="text"
                    value={fg}
                    onChange={(e) => setFg(e.target.value)}
                    spellCheck={false}
                    aria-label="Foreground hex"
                    className="flex-1 min-w-0 rounded-lg border border-border bg-card px-3 py-2 text-sm num uppercase"
                  />
                </div>
              </Field>
              <Field label="Background" hint="The light squares.">
                <div className="flex items-center gap-3">
                  <input type="color" value={bg} onChange={(e) => setBg(e.target.value.toUpperCase())}
                    aria-label="Background color"
                    className="size-11 rounded-lg border border-border bg-card cursor-pointer" />
                  <input
                    type="text"
                    value={bg}
                    onChange={(e) => setBg(e.target.value)}
                    spellCheck={false}
                    aria-label="Background hex"
                    className="flex-1 min-w-0 rounded-lg border border-border bg-card px-3 py-2 text-sm num uppercase"
                  />
                </div>
              </Field>
            </div>

            {lowContrast && (
              <WarnBox>
                <strong>Low contrast ({ratio.toFixed(1)}:1).</strong> Many scanners need at least
                3:1. Try a darker foreground or lighter background.
              </WarnBox>
            )}

            <fieldset>
              <legend className="text-sm font-semibold mb-1.5">Error correction</legend>
              <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label="Error correction level">
                {(["L", "M", "Q", "H"] as Level[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    role="radio"
                    aria-checked={level === l}
                    onClick={() => setLevel(l)}
                    className={[
                      "rounded-lg border px-2 py-2.5 text-xs font-semibold transition min-h-11",
                      level === l ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-card text-muted-foreground hover:text-primary",
                    ].join(" ")}
                  >
                    {l} · {l === "L" ? "7%" : l === "M" ? "15%" : l === "Q" ? "25%" : "30%"}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Higher levels still scan when part of the code is covered (a logo, smudge or tear).
              </p>
            </fieldset>

            <Field label={`Quiet zone · ${margin} modules`} hint="White space around the code so scanners find it quickly.">
              <input
                type="range" min={0} max={8} value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                aria-label="Quiet zone in modules"
                className="w-full"
              />
            </Field>

            <Field label="Center logo (optional)" hint="Use a small square PNG. Set error correction to H for best results.">
              <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
                aria-label="Choose center logo image"
                className="w-full text-sm" />
              {logo && (
                <button type="button" onClick={() => setLogo(null)}
                  className="mt-2 text-xs text-primary hover:underline min-h-8">Remove logo</button>
              )}
            </Field>
          </div>

          {error && <ErrorBox>{error}</ErrorBox>}

          <HowItWorks>
            Your text is encoded into a QR matrix with the qrcode library, then painted onto a canvas in
            your browser. Wi-Fi, vCard and email codes follow standard formats every modern phone
            understands. Nothing is sent over the network.
            <span className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
              <AlertTriangle className="size-3.5 mt-0.5 shrink-0" aria-hidden />
              For Wi-Fi codes: Android scans natively; iPhone needs iOS 11+ and the Camera app.
            </span>
          </HowItWorks>
        </div>
      </div>
    </ToolLayout>
  );
}
