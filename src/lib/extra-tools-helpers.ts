// Pure helpers for the slug / number-base / html-entities tools.
// Kept tiny and dependency-free so every transform is testable.

/* -------------------------------- Slugify --------------------------------- */

export type SlugOptions = {
  separator?: "-" | "_" | ".";
  lowercase?: boolean;
  strict?: boolean; // only [a-z0-9] + separator
  maxLength?: number;
};

export function slugify(input: string, opts: SlugOptions = {}): string {
  const sep = opts.separator ?? "-";
  const lower = opts.lowercase ?? true;
  const strict = opts.strict ?? true;
  const max = opts.maxLength ?? 0;

  let s = (input ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  if (lower) s = s.toLowerCase();
  // Replace ampersand with " and " for readability.
  s = s.replace(/&/g, " and ");
  if (strict) {
    s = s.replace(/[^a-zA-Z0-9]+/g, sep);
  } else {
    s = s.replace(/\s+/g, sep);
  }
  // Collapse repeats and trim separators.
  const sepEsc = sep.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  s = s.replace(new RegExp(`${sepEsc}+`, "g"), sep);
  s = s.replace(new RegExp(`^${sepEsc}+|${sepEsc}+$`, "g"), "");
  if (max > 0 && s.length > max) {
    s = s.slice(0, max).replace(new RegExp(`${sepEsc}+$`, "g"), "");
  }
  return s;
}

/* --------------------------- Number base converter ------------------------ */

export type Base = 2 | 8 | 10 | 16;

export function parseInBase(value: string, base: Base): { n: bigint | null; error?: string } {
  const v = value.trim().replace(/^[+]/, "");
  if (!v) return { n: null };
  const neg = v.startsWith("-");
  const body = neg ? v.slice(1) : v;
  if (!body) return { n: null, error: "Missing digits." };
  const re: Record<Base, RegExp> = {
    2: /^[01]+$/,
    8: /^[0-7]+$/,
    10: /^[0-9]+$/,
    16: /^[0-9a-fA-F]+$/,
  };
  if (!re[base].test(body)) {
    return { n: null, error: `Not valid base-${base}.` };
  }
  try {
    const n = BigInt((base === 16 ? "0x" : base === 8 ? "0o" : base === 2 ? "0b" : "") + body);
    return { n: neg ? -n : n };
  } catch (e) {
    return { n: null, error: (e as Error).message };
  }
}

export function toBase(n: bigint, base: Base): string {
  if (n < 0n) return "-" + (-n).toString(base);
  return n.toString(base);
}

/* ------------------------------ HTML entities ----------------------------- */

const NAMED: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: "\u00a0",
  copy: "©",
  reg: "®",
  trade: "™",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  laquo: "«",
  raquo: "»",
  euro: "€",
  pound: "£",
  yen: "¥",
  cent: "¢",
  sect: "§",
  para: "¶",
  middot: "·",
  bull: "•",
  deg: "°",
  plusmn: "±",
  times: "×",
  divide: "÷",
};

export function encodeHtml(input: string, opts: { mode?: "named" | "numeric" | "all" } = {}): string {
  const mode = opts.mode ?? "named";
  // Always escape the 5 dangerous chars.
  const base = input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
  if (mode === "named") return base;
  // Encode every non-ASCII (and optionally everything) as numeric.
  return Array.from(base).map((ch) => {
    const code = ch.codePointAt(0)!;
    if (mode === "all" && code > 32 && code < 127 && !"&<>\"'".includes(ch)) {
      return `&#${code};`;
    }
    if (code > 127) return `&#${code};`;
    return ch;
  }).join("");
}

export function decodeHtml(input: string): string {
  return input
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => safeFromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => safeFromCodePoint(parseInt(d, 10)))
    .replace(/&([a-zA-Z]+);/g, (m, name) => NAMED[name] ?? m);
}

function safeFromCodePoint(code: number): string {
  if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return "";
  try {
    return String.fromCodePoint(code);
  } catch {
    return "";
  }
}
