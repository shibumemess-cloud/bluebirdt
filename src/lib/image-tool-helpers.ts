// Pure helpers shared with the image tool routes.
// Kept here (rather than inline in route files) so they're unit-testable
// without rendering React or loading the Canvas.

// ---------- color-picker ----------

export type Swatch = { hex: string; r: number; g: number; b: number };

const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function rgbToHsl(r: number, g: number, b: number) {
  const rr = r / 255, gg = g / 255, bb = b / 255;
  const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rr: h = (gg - bb) / d + (gg < bb ? 6 : 0); break;
      case gg: h = (bb - rr) / d + 2; break;
      case bb: h = (rr - gg) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function srgbToLinear(c: number) {
  const x = c / 255;
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

export function rgbToOklch(r: number, g: number, b: number) {
  const lr = srgbToLinear(r), lg = srgbToLinear(g), lb = srgbToLinear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.sqrt(a * a + bb * bb);
  let H = (Math.atan2(bb, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L: +L.toFixed(3), C: +C.toFixed(3), H: Math.round(H) };
}

export function relLuminance(r: number, g: number, b: number) {
  const f = (c: number) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrastRatio(a: Swatch, b: Swatch) {
  const la = relLuminance(a.r, a.g, a.b);
  const lb = relLuminance(b.r, b.g, b.b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

// ---------- image-resizer ----------

export type Unit = "px" | "in" | "cm";

export function fromPx(n: number, unit: Unit, dpi: number): number {
  if (unit === "in") return +(n / dpi).toFixed(2);
  if (unit === "cm") return +((n / dpi) * 2.54).toFixed(2);
  return n;
}

export function toPx(n: number, unit: Unit, dpi: number): number {
  if (unit === "in") return Math.round(n * dpi);
  if (unit === "cm") return Math.round((n / 2.54) * dpi);
  return Math.round(n);
}

// ---------- watermark ----------

// Pos is a 2-char string: row (t/m/c/b) + column (l/c/m/r). The placer only
// checks the row for top/bottom and column for left/right; anything else is
// treated as centered, so both "mc" and "cc" mean centered.
export function placement(pos: string, W: number, H: number, w: number, h: number, pad: number) {
  const cx = pos[1] === "l" ? pad + w / 2 : pos[1] === "r" ? W - pad - w / 2 : W / 2;
  const cy = pos[0] === "t" ? pad + h / 2 : pos[0] === "b" ? H - pad - h / 2 : H / 2;
  return { cx, cy };
}

// ---------- images-to-pdf ----------

export function substituteTokens(template: string, page: number, total: number): string {
  return template
    .replace(/\{page\}/gi, String(page))
    .replace(/\{total\}/gi, String(total));
}

export function hasPageToken(s: string): boolean {
  return /\{page\}|\{total\}/i.test(s);
}

// ---------- qr-generator ----------

// Escape a value for the Wi-Fi QR payload format:
//   WIFI:T:<auth>;S:<ssid>;P:<password>;H:<hidden>;;
// The MeCard-style spec reserves \ ; , : " — they MUST be backslash-escaped.
export function escapeWifi(v: string): string {
  return v.replace(/([\\;,:"])/g, "\\$1");
}

export function buildWifiPayload(opts: {
  ssid: string;
  password: string;
  auth: "WPA" | "WEP" | "nopass";
  hidden?: boolean;
}): string {
  const a = opts.auth === "nopass" ? "nopass" : opts.auth;
  const pwd = opts.auth === "nopass" ? "" : escapeWifi(opts.password);
  return `WIFI:T:${a};S:${escapeWifi(opts.ssid)};P:${pwd};H:${opts.hidden ? "true" : "false"};;`;
}

export function buildVCard(opts: {
  name: string;
  org?: string;
  title?: string;
  phone?: string;
  email?: string;
  url?: string;
}): string {
  const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:${opts.name}`];
  if (opts.org) lines.push(`ORG:${opts.org}`);
  if (opts.title) lines.push(`TITLE:${opts.title}`);
  if (opts.phone) lines.push(`TEL:${opts.phone}`);
  if (opts.email) lines.push(`EMAIL:${opts.email}`);
  if (opts.url) lines.push(`URL:${opts.url}`);
  lines.push("END:VCARD");
  return lines.join("\n");
}

// ---------- pdf-to-images ----------

// PDF.js renders pages at 72 DPI by default; multiply by (target / 72) to scale.
export function dpiToScale(dpi: number): number {
  return Math.max(0.1, dpi / 72);
}

// Friendly file name: "doc.pdf" + page 3 of 12 → "doc-p03.png"
export function pageFileName(baseName: string, page: number, total: number, ext: "png" | "jpg" | "webp"): string {
  const stem = baseName.replace(/\.pdf$/i, "").replace(/[^\w.-]+/g, "_") || "page";
  const width = Math.max(2, String(total).length);
  return `${stem}-p${String(page).padStart(width, "0")}.${ext}`;
}

// Parse a human page-range string like "1-3, 5, 8-10" into a sorted unique list,
// clamped to [1..max]. Invalid tokens are ignored so users get partial parsing.
export function parsePageRange(input: string, max: number): number[] {
  const out = new Set<number>();
  for (const raw of input.split(/[,\s]+/)) {
    if (!raw) continue;
    const range = raw.match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) {
      let a = Math.max(1, parseInt(range[1], 10));
      let b = Math.min(max, parseInt(range[2], 10));
      if (a > b) [a, b] = [b, a];
      for (let i = a; i <= b; i++) out.add(i);
    } else if (/^\d+$/.test(raw)) {
      const n = parseInt(raw, 10);
      if (n >= 1 && n <= max) out.add(n);
    }
  }
  return [...out].sort((a, b) => a - b);
}

// ---------- url normalisation (shared) ----------

// Auto-prefix bare domains with https:// so QR scans open in a browser.
// Leaves existing schemes (http, https, mailto, tel, sms, ftp, …) untouched.
export function normalizeUrl(s: string): string {
  const t = s.trim();
  if (!t) return "";
  if (/^[a-z][a-z0-9+.-]*:/i.test(t)) return t;
  // Looks like a domain (contains a dot, no whitespace) → prefix https://
  if (/^[^\s]+\.[^\s]+$/.test(t)) return `https://${t}`;
  return t;
}

// ---------- password-generator ----------

import { WORDLIST } from "./passphrase-words";

export function secureRandomInt(max: number): number {
  if (max <= 0) return 0;
  const arr = new Uint32Array(1);
  const limit = Math.floor(0xffffffff / max) * max;
  // Rejection sampling for an unbiased 0..max-1 from crypto.getRandomValues.
  while (true) {
    crypto.getRandomValues(arr);
    if (arr[0] < limit) return arr[0] % max;
  }
}

export function buildPassphrase(opts: {
  words: number;
  separator: string;
  capitalize: boolean;
  addDigit: boolean;
}): string {
  const count = Math.max(2, Math.min(12, Math.floor(opts.words)));
  const parts: string[] = [];
  for (let i = 0; i < count; i++) {
    let w = WORDLIST[secureRandomInt(WORDLIST.length)];
    if (opts.capitalize) w = w[0].toUpperCase() + w.slice(1);
    parts.push(w);
  }
  let out = parts.join(opts.separator || "-");
  if (opts.addDigit) out += String(secureRandomInt(10));
  return out;
}

export function passphraseEntropyBits(words: number, addDigit: boolean): number {
  const perWord = Math.log2(WORDLIST.length);
  return Math.round(words * perWord + (addDigit ? Math.log2(10) : 0));
}

// ---------- json-formatter ----------

// Minimal JSON → YAML converter. Handles the JSON subset (object/array/string/
// number/boolean/null) — that's all `JSON.parse` can produce, so it's enough.
export function jsonToYaml(value: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);
  if (value === null) return "null";
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  if (typeof value === "string") return yamlString(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return value
      .map((v) => {
        const rendered = jsonToYaml(v, indent + 1);
        if (v && typeof v === "object") {
          // Inline first line, indent the rest under the dash.
          return `${pad}- ${rendered.replace(/\n/g, `\n${pad}  `).trimStart()}`;
        }
        return `${pad}- ${rendered}`;
      })
      .join("\n");
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    return entries
      .map(([k, v]) => {
        const key = /^[A-Za-z_][\w-]*$/.test(k) ? k : yamlString(k);
        if (v && typeof v === "object" && (Array.isArray(v) ? v.length : Object.keys(v).length)) {
          return `${pad}${key}:\n${jsonToYaml(v, indent + 1)}`;
        }
        return `${pad}${key}: ${jsonToYaml(v, indent + 1)}`;
      })
      .join("\n");
  }
  return "null";
}

function yamlString(s: string): string {
  // Quote when the string could be misread as another scalar or contains
  // YAML-significant characters. Otherwise emit it bare for readability.
  if (s === "") return '""';
  if (/^(true|false|null|yes|no|on|off|~)$/i.test(s)) return `"${s}"`;
  if (/^-?\d/.test(s)) return `"${s}"`;
  if (/[:#&*!|>'"%@`{}[\],\n\r\t]/.test(s) || /^\s|\s$/.test(s)) {
    return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return s;
}

