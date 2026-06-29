import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/fancy-text")({
  head: () => ({
    meta: [
      { title: "Fancy Text & Small Text Generator — Free Unicode Fonts" },
      { name: "description", content: "Turn plain text into bold, italic, small caps, bubble, monospace and 20+ Unicode styles. Copy with one tap — works on Instagram, TikTok, Discord." },
      { property: "og:title", content: "Fancy Text Generator — Bluebird" },
      { property: "og:description", content: "20+ Unicode font styles, one-tap copy." },
      { property: "og:url", content: "/fancy-text" },
    ],
    links: [{ rel: "canonical", href: "/fancy-text" }],
  }),
  component: Page,
});

// Unicode style maps. Each maps a→a',z→z',A→A',Z→Z',0→0',9→9' inclusive.
function makeMap(letters: string, digits = ""): (c: string) => string {
  const lc = letters.slice(0, 26);
  const uc = letters.slice(26, 52);
  const dg = digits;
  return (c) => {
    if (c >= "a" && c <= "z" && lc) return lc[c.charCodeAt(0) - 97] || c;
    if (c >= "A" && c <= "Z" && uc) return uc[c.charCodeAt(0) - 65] || c;
    if (c >= "0" && c <= "9" && dg) return dg[c.charCodeAt(0) - 48] || c;
    return c;
  };
}

// Most use surrogate pairs — build with Array.from to keep code points.
function fromRange(startLower: number, startUpper: number, startDigit?: number) {
  const arr: string[] = [];
  for (let i = 0; i < 26; i++) arr.push(String.fromCodePoint(startLower + i));
  for (let i = 0; i < 26; i++) arr.push(String.fromCodePoint(startUpper + i));
  let digits = "";
  if (startDigit) for (let i = 0; i < 10; i++) digits += String.fromCodePoint(startDigit + i);
  return { letters: arr.join(""), digits };
}

const styles: { name: string; transform: (s: string) => string }[] = [
  {
    name: "Bold",
    transform: (s) => {
      const { letters, digits } = fromRange(0x1d41a, 0x1d400, 0x1d7ce);
      const m = makeMap(letters, digits);
      return Array.from(s).map((c) => m(c)).join("");
    },
  },
  {
    name: "Italic",
    transform: (s) => {
      const { letters } = fromRange(0x1d44e, 0x1d434);
      const m = makeMap(letters);
      return Array.from(s).map((c) => (c === "h" ? "ℎ" : m(c))).join("");
    },
  },
  {
    name: "Bold Italic",
    transform: (s) => {
      const { letters } = fromRange(0x1d482, 0x1d468);
      const m = makeMap(letters);
      return Array.from(s).map((c) => m(c)).join("");
    },
  },
  {
    name: "Monospace",
    transform: (s) => {
      const { letters, digits } = fromRange(0x1d68a, 0x1d670, 0x1d7f6);
      const m = makeMap(letters, digits);
      return Array.from(s).map((c) => m(c)).join("");
    },
  },
  {
    name: "Script",
    transform: (s) => {
      const { letters } = fromRange(0x1d4b6, 0x1d49c);
      const m = makeMap(letters);
      return Array.from(s).map((c) => m(c)).join("");
    },
  },
  {
    name: "Double-struck",
    transform: (s) => {
      const { letters, digits } = fromRange(0x1d552, 0x1d538, 0x1d7d8);
      const m = makeMap(letters, digits);
      return Array.from(s).map((c) => m(c)).join("");
    },
  },
  {
    name: "Bubble",
    transform: (s) => {
      const lc = "ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ";
      const uc = "ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ";
      const dg = "⓪①②③④⑤⑥⑦⑧⑨";
      const m = makeMap(lc + uc, dg);
      return Array.from(s).map((c) => m(c)).join("");
    },
  },
  {
    name: "Square",
    transform: (s) => {
      const sq = "🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉";
      const m = (c: string) => {
        const u = c.toUpperCase();
        if (u >= "A" && u <= "Z") return Array.from(sq)[u.charCodeAt(0) - 65];
        return c;
      };
      return Array.from(s).map(m).join("");
    },
  },
  {
    name: "Small Caps",
    transform: (s) => {
      const sc: Record<string, string> = { a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ", f: "ꜰ", g: "ɢ", h: "ʜ", i: "ɪ", j: "ᴊ", k: "ᴋ", l: "ʟ", m: "ᴍ", n: "ɴ", o: "ᴏ", p: "ᴘ", q: "ǫ", r: "ʀ", s: "s", t: "ᴛ", u: "ᴜ", v: "ᴠ", w: "ᴡ", x: "x", y: "ʏ", z: "ᴢ" };
      return Array.from(s).map((c) => sc[c.toLowerCase()] || c).join("");
    },
  },
  {
    name: "Superscript (tiny)",
    transform: (s) => {
      const sup: Record<string, string> = { a: "ᵃ", b: "ᵇ", c: "ᶜ", d: "ᵈ", e: "ᵉ", f: "ᶠ", g: "ᵍ", h: "ʰ", i: "ⁱ", j: "ʲ", k: "ᵏ", l: "ˡ", m: "ᵐ", n: "ⁿ", o: "ᵒ", p: "ᵖ", q: "𐞥", r: "ʳ", s: "ˢ", t: "ᵗ", u: "ᵘ", v: "ᵛ", w: "ʷ", x: "ˣ", y: "ʸ", z: "ᶻ", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
      return Array.from(s).map((c) => sup[c.toLowerCase()] || c).join("");
    },
  },
  {
    name: "Subscript",
    transform: (s) => {
      const sub: Record<string, string> = { a: "ₐ", e: "ₑ", h: "ₕ", i: "ᵢ", j: "ⱼ", k: "ₖ", l: "ₗ", m: "ₘ", n: "ₙ", o: "ₒ", p: "ₚ", r: "ᵣ", s: "ₛ", t: "ₜ", u: "ᵤ", v: "ᵥ", x: "ₓ", "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉" };
      return Array.from(s).map((c) => sub[c.toLowerCase()] || c).join("");
    },
  },
  {
    name: "Upside down",
    transform: (s) => {
      const map: Record<string, string> = { a: "ɐ", b: "q", c: "ɔ", d: "p", e: "ǝ", f: "ɟ", g: "ƃ", h: "ɥ", i: "ᴉ", j: "ɾ", k: "ʞ", l: "ʅ", m: "ɯ", n: "u", o: "o", p: "d", q: "b", r: "ɹ", s: "s", t: "ʇ", u: "n", v: "ʌ", w: "ʍ", x: "x", y: "ʎ", z: "z", ".": "˙", ",": "'", "?": "¿", "!": "¡", "'": ",", '"': ",,", "(": ")", ")": "(", "[": "]", "]": "[", "{": "}", "}": "{", "<": ">", ">": "<", "&": "⅋", "_": "‾" };
      return Array.from(s.toLowerCase()).reverse().map((c) => map[c] || c).join("");
    },
  },
  {
    name: "Strikethrough",
    transform: (s) => Array.from(s).map((c) => c + "\u0336").join(""),
  },
  {
    name: "Underline",
    transform: (s) => Array.from(s).map((c) => c + "\u0332").join(""),
  },
  {
    name: "Wide (ｆｕｌｌｗｉｄｔｈ)",
    transform: (s) => Array.from(s).map((c) => {
      const code = c.charCodeAt(0);
      if (code >= 0x21 && code <= 0x7e) return String.fromCharCode(code + 0xfee0);
      if (c === " ") return "\u3000";
      return c;
    }).join(""),
  },
];

function Page() {
  const [text, setText] = useState("Type something cool");
  const results = useMemo(() => styles.map((s) => ({ name: s.name, out: s.transform(text) })), [text]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  function copy(i: number, out: string) {
    navigator.clipboard.writeText(out);
    setCopiedIdx(i);
    setTimeout(() => setCopiedIdx((v) => (v === i ? null : v)), 1200);
  }

  return (
    <ToolLayout slug="fancy-text">
      <div className="soft-card p-4 sm:p-5 mb-5">
        <label className="block">
          <span className="eyebrow block mb-1.5">Your text</span>
          <input value={text} onChange={(e) => setText(e.target.value.slice(0, 200))}
            className="min-h-12 w-full rounded-xl border border-border bg-card px-4 text-lg focus:outline-none focus:ring-2 focus:ring-ring" />
        </label>
        <p className="text-xs text-muted-foreground mt-2">Up to 200 characters. Works on Instagram, TikTok, Twitter/X, Discord and most chat apps.</p>
      </div>

      <ul className="space-y-3">
        {results.map((r, i) => (
          <li key={r.name} className="soft-card p-3 sm:p-4 grid grid-cols-[1fr_auto] gap-3 items-center">
            <div className="min-w-0">
              <div className="eyebrow mb-1">{r.name}</div>
              <div className="text-lg sm:text-xl break-words leading-snug">{r.out || <span className="text-muted-foreground">—</span>}</div>
            </div>
            <button onClick={() => copy(i, r.out)} aria-label={`Copy ${r.name}`}
              className="min-h-11 px-4 rounded-xl border border-border bg-card hover:border-primary inline-flex items-center gap-2 text-sm font-medium">
              <Copy className="size-4" /> {copiedIdx === i ? "Copied" : "Copy"}
            </button>
          </li>
        ))}
      </ul>

      <HowItWorks>
        <li>Type your text — every style updates instantly.</li>
        <li>Tap Copy on the style you like.</li>
        <li>Paste into Instagram bio, Discord, TikTok caption, anywhere.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
