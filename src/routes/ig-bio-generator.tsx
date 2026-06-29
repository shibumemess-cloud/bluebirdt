import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { Field, HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/ig-bio-generator")({
  head: () => ({
    meta: [
      { title: "Instagram Bio Generator — Free Fancy Fonts & Symbols" },
      { name: "description", content: "Build a stylish Instagram bio with fancy Unicode fonts, dividers and symbols. Live preview, one-tap copy. 150-character counter built in." },
      { property: "og:title", content: "Instagram Bio Generator — Bluebird" },
      { property: "og:description", content: "Design a beautiful Instagram bio in seconds." },
      { property: "og:url", content: "/ig-bio-generator" },
    ],
    links: [{ rel: "canonical", href: "/ig-bio-generator" }],
  }),
  component: Page,
});

// Unicode mappers.
function fromRange(lo: number, up: number, dg?: number) {
  const arr: string[] = [];
  for (let i = 0; i < 26; i++) arr.push(String.fromCodePoint(lo + i));
  for (let i = 0; i < 26; i++) arr.push(String.fromCodePoint(up + i));
  let digits = "";
  if (dg) for (let i = 0; i < 10; i++) digits += String.fromCodePoint(dg + i);
  return { letters: arr.join(""), digits };
}
function makeMap(letters: string, digits = ""): (c: string) => string {
  const lc = letters.slice(0, 26), uc = letters.slice(26, 52);
  return (c) => {
    if (c >= "a" && c <= "z") return lc[c.charCodeAt(0) - 97] || c;
    if (c >= "A" && c <= "Z") return uc[c.charCodeAt(0) - 65] || c;
    if (c >= "0" && c <= "9" && digits) return digits[c.charCodeAt(0) - 48] || c;
    return c;
  };
}
function apply(s: string, map: (c: string) => string) {
  return Array.from(s).map(map).join("");
}

const STYLES: { id: string; label: string; transform: (s: string) => string }[] = [
  { id: "plain", label: "Plain", transform: (s) => s },
  { id: "bold", label: "Bold", transform: (s) => {
    const { letters, digits } = fromRange(0x1d41a, 0x1d400, 0x1d7ce);
    return apply(s, makeMap(letters, digits));
  } },
  { id: "italic", label: "Italic", transform: (s) => {
    const { letters } = fromRange(0x1d44e, 0x1d434);
    return apply(s, (c) => (c === "h" ? "ℎ" : makeMap(letters)(c)));
  } },
  { id: "script", label: "Script", transform: (s) => {
    const { letters } = fromRange(0x1d4b6, 0x1d49c);
    return apply(s, makeMap(letters));
  } },
  { id: "smallcaps", label: "Small caps", transform: (s) => {
    const map: Record<string, string> = { a:"ᴀ",b:"ʙ",c:"ᴄ",d:"ᴅ",e:"ᴇ",f:"ꜰ",g:"ɢ",h:"ʜ",i:"ɪ",j:"ᴊ",k:"ᴋ",l:"ʟ",m:"ᴍ",n:"ɴ",o:"ᴏ",p:"ᴘ",q:"ǫ",r:"ʀ",s:"s",t:"ᴛ",u:"ᴜ",v:"ᴠ",w:"ᴡ",x:"x",y:"ʏ",z:"ᴢ" };
    return Array.from(s.toLowerCase()).map((c) => map[c] || c).join("");
  } },
  { id: "monospace", label: "Monospace", transform: (s) => {
    const { letters, digits } = fromRange(0x1d68a, 0x1d670, 0x1d7f6);
    return apply(s, makeMap(letters, digits));
  } },
];

const SYMBOLS = ["·","•","✦","✧","✿","❀","♡","☆","★","→","↳","꒰","꒱","◜","◝","┊","˙","ㅤ","✨","✩","♪","♫","☼","☾","☁︎","✎","✰","✺"];
const DIVIDERS = [
  "•·.·´¯`·.·•",
  "꒰ ⋆ ꒱",
  "·˚ ༘",
  "✿ ೃ⁀➷",
  "─────",
  "─── ✦ ───",
  "·──────·",
  "✧.* ·˚",
];

const MAX = 150;

function Page() {
  const [lines, setLines] = useState<string[]>(["Name · Title", "City · Country", "Email me ↓"]);
  const [style, setStyle] = useState<string>("plain");
  const [prefix, setPrefix] = useState<string>("✦ ");
  const [divider, setDivider] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const transform = STYLES.find((s) => s.id === style)!.transform;
  const bio = useMemo(() => {
    const body = lines
      .map((l) => (l.trim() ? `${prefix}${transform(l)}` : ""))
      .join("\n");
    return divider ? `${body}\n${divider}` : body;
  }, [lines, prefix, divider, transform]);
  const len = Array.from(bio).length;
  const over = len > MAX;

  function setLine(i: number, v: string) {
    setLines((prev) => prev.map((l, idx) => (idx === i ? v : l)));
  }
  function addLine() { setLines((p) => [...p, ""]); }
  function removeLine(i: number) { setLines((p) => p.filter((_, idx) => idx !== i)); }

  async function copy() {
    try {
      await navigator.clipboard.writeText(bio);
      setCopied(true); setTimeout(() => setCopied(false), 1500);
    } catch { /* */ }
  }

  return (
    <ToolLayout slug="ig-bio-generator">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 md:col-span-7 space-y-6">
          <Field label="Bio lines" hint="Write each line of your bio. Empty lines are kept as breaks.">
            <div className="space-y-2">
              {lines.map((l, i) => (
                <div key={i} className="flex gap-2">
                  <input value={l} onChange={(e) => setLine(i, e.target.value)}
                    placeholder={`Line ${i + 1}`}
                    className="flex-1 min-h-12 rounded-xl border border-border bg-card px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  {lines.length > 1 && (
                    <button type="button" onClick={() => removeLine(i)}
                      className="min-h-12 px-3 rounded-xl border border-border bg-card hover:border-primary/40 text-sm">Remove</button>
                  )}
                </div>
              ))}
              {lines.length < 6 && (
                <button type="button" onClick={addLine}
                  className="min-h-11 px-4 rounded-xl border border-dashed border-border text-sm hover:border-primary/40">+ Add line</button>
              )}
            </div>
          </Field>

          <Field label="Text style">
            <div className="flex flex-wrap gap-2">
              {STYLES.map((s) => (
                <button key={s.id} type="button" onClick={() => setStyle(s.id)}
                  className={`min-h-11 px-4 rounded-full border text-sm font-medium ${style === s.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary/40"}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Line symbol" hint="A small symbol that starts each line.">
            <div className="flex flex-wrap gap-1.5">
              <button type="button" onClick={() => setPrefix("")}
                className={`min-h-10 w-10 grid place-items-center rounded-lg border text-sm ${prefix === "" ? "border-primary bg-primary/10 text-primary" : "border-border bg-card"}`}>none</button>
              {SYMBOLS.map((s) => (
                <button key={s} type="button" onClick={() => setPrefix(s + " ")}
                  className={`min-h-10 w-10 grid place-items-center rounded-lg border text-base ${prefix.trim() === s ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary/40"}`}>{s}</button>
              ))}
            </div>
          </Field>

          <Field label="Divider (optional)" hint="A decorative line under your bio.">
            <div className="flex flex-wrap gap-1.5">
              <button type="button" onClick={() => setDivider("")}
                className={`min-h-10 px-3 rounded-lg border text-sm ${divider === "" ? "border-primary bg-primary/10 text-primary" : "border-border bg-card"}`}>none</button>
              {DIVIDERS.map((d) => (
                <button key={d} type="button" onClick={() => setDivider(d)}
                  className={`min-h-10 px-3 rounded-lg border text-sm ${divider === d ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary/40"}`}>{d}</button>
              ))}
            </div>
          </Field>

          <HowItWorks>
            Your text is transformed using real Unicode characters, so the fancy fonts paste into Instagram, TikTok or
            any social profile without an image. Everything stays in your browser.
          </HowItWorks>
        </div>

        <aside className="col-span-12 md:col-span-5">
          <div className="soft-card p-5 sm:p-6 sticky top-4">
            <div className="flex items-center justify-between gap-3">
              <span className="eyebrow">Preview</span>
              <span className={`text-xs num ${over ? "text-destructive" : "text-muted-foreground"}`}>{len} / {MAX}</span>
            </div>
            <div className="mt-3 rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-gradient-to-br from-pink-400 via-fuchsia-500 to-orange-400 grid place-items-center text-white font-bold">@</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">your.handle</div>
                  <div className="text-xs text-muted-foreground">123 posts · 4.5k followers</div>
                </div>
              </div>
              <pre className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed font-sans">{bio || "Your Instagram bio will appear here…"}</pre>
            </div>
            <button type="button" onClick={copy}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3.5 font-semibold min-h-12 hover:shadow-lift hover:-translate-y-0.5">
              {copied ? <><Check className="size-4" /> Copied</> : <><Copy className="size-4" /> Copy bio</>}
            </button>
            {over && <p className="mt-2 text-xs text-destructive">Instagram bios are capped at 150 characters. Trim a line to fit.</p>}
          </div>
        </aside>
      </div>
    </ToolLayout>
  );
}
