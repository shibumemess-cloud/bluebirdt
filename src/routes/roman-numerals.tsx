import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Copy } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks, WarnBox } from "../components/ToolControls";

export const Route = createFileRoute("/roman-numerals")({
  head: () => ({
    meta: [
      { title: "Roman Numeral Converter — Number to Roman & Back" },
      { name: "description", content: "Convert numbers to Roman numerals and Roman numerals back to numbers, from 1 to 3,999. Free, instant, in your browser." },
      { property: "og:title", content: "Roman Numeral Converter — Bluebird" },
      { property: "og:description", content: "Convert any number 1–3,999 to Roman numerals and back." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/roman-numerals" },
    ],
    links: [{ rel: "canonical", href: "/roman-numerals" }],
  }),
  component: Page,
});

const PAIRS: [number, string][] = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
  [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
  [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

export function toRoman(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > 3999) return "";
  let out = "";
  let v = n;
  for (const [num, sym] of PAIRS) {
    while (v >= num) { out += sym; v -= num; }
  }
  return out;
}

export function fromRoman(s: string): number | null {
  const str = s.trim().toUpperCase();
  if (!str || !/^[MDCLXVI]+$/.test(str)) return null;
  const map: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  for (let i = 0; i < str.length; i++) {
    const v = map[str[i]];
    const next = map[str[i + 1]];
    if (next && next > v) { total += next - v; i++; } else { total += v; }
  }
  if (total < 1 || total > 3999) return null;
  // Round-trip validation rejects malformed inputs like IIII
  if (toRoman(total) !== str) return null;
  return total;
}

function Page() {
  const [num, setNum] = useState("2026");
  const [roman, setRoman] = useState("MMXXVI");

  function onNum(v: string) {
    setNum(v);
    const n = parseInt(v);
    if (!isNaN(n) && n >= 1 && n <= 3999) setRoman(toRoman(n));
    else setRoman("");
  }
  function onRoman(v: string) {
    setRoman(v.toUpperCase());
    const n = fromRoman(v);
    if (n) setNum(String(n));
    else setNum("");
  }

  const numValid = num !== "" && (() => { const n = parseInt(num); return !isNaN(n) && n >= 1 && n <= 3999; })();
  const romanValid = roman === "" || fromRoman(roman) !== null;

  const presets = [
    { n: 1, label: "1" }, { n: 4, label: "4" }, { n: 9, label: "9" },
    { n: 49, label: "49" }, { n: 1984, label: "1984" }, { n: 2026, label: "2026" }, { n: 3999, label: "3999" },
  ];

  async function copy(text: string) {
    try { await navigator.clipboard.writeText(text); } catch {}
  }

  return (
    <ToolLayout slug="roman-numerals">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-primary" />
            <div className="font-display text-lg">Type either side</div>
          </div>

          <div>
            <label htmlFor="rn-num" className="eyebrow">Number (1 – 3,999)</label>
            <div className="mt-1.5 flex gap-2">
              <input
                id="rn-num"
                type="number"
                inputMode="numeric"
                min={1}
                max={3999}
                value={num}
                onChange={(e) => onNum(e.target.value)}
                className="flex-1 min-h-12 rounded-xl border border-border bg-card px-3 text-2xl font-display tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button aria-label="Copy number" onClick={() => copy(num)} className="min-h-12 px-3 rounded-xl border border-border bg-card hover:border-primary"><Copy className="size-4" /></button>
            </div>
          </div>

          <div>
            <label htmlFor="rn-rom" className="eyebrow">Roman numeral</label>
            <div className="mt-1.5 flex gap-2">
              <input
                id="rn-rom"
                value={roman}
                onChange={(e) => onRoman(e.target.value)}
                spellCheck={false}
                autoCapitalize="characters"
                className="flex-1 min-h-12 rounded-xl border border-border bg-card px-3 text-2xl font-display uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button aria-label="Copy roman" onClick={() => copy(roman)} className="min-h-12 px-3 rounded-xl border border-border bg-card hover:border-primary"><Copy className="size-4" /></button>
            </div>
          </div>

          {!numValid && num !== "" && <WarnBox>Number must be between 1 and 3,999.</WarnBox>}
          {!romanValid && <WarnBox>That's not a valid Roman numeral.</WarnBox>}
        </section>

        <section className="soft-card p-5 sm:p-6 space-y-4">
          <div className="eyebrow">Try a preset</div>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.n}
                onClick={() => onNum(String(p.n))}
                className="min-h-11 px-4 rounded-xl border border-border bg-card hover:border-primary hover:text-primary text-sm"
              >
                {p.label} → {toRoman(p.n)}
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Quick reference:</strong> I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1000. A smaller letter before a larger one means subtract (IV = 4, IX = 9, XL = 40).
          </div>
        </section>
      </div>

      <HowItWorks>
        <li>Type a number from 1 to 3,999 to see its Roman numeral.</li>
        <li>Or type a Roman numeral to convert it back to a regular number.</li>
        <li>Tap a preset year or copy either result in one click.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
