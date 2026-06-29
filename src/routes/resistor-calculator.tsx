import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/resistor-calculator")({
  head: () => ({
    meta: [
      { title: "Resistor Color Code Calculator — 4, 5 & 6 Band" },
      { name: "description", content: "Decode resistor colour bands to resistance, tolerance and temperature coefficient. Supports 4, 5 and 6-band resistors." },
      { property: "og:title", content: "Resistor Color Code Calculator — Bluebird" },
      { property: "og:description", content: "Decode resistor bands instantly." },
      { property: "og:url", content: "/resistor-calculator" },
    ],
    links: [{ rel: "canonical", href: "/resistor-calculator" }],
  }),
  component: Page,
});

type Color = { name: string; hex: string; digit: number | null; mult: number | null; tol: number | null; tc: number | null };

const COLORS: Color[] = [
  { name: "Black",   hex: "#0b0b0b", digit: 0, mult: 1,           tol: null, tc: 250 },
  { name: "Brown",   hex: "#6b3a17", digit: 1, mult: 10,          tol: 1,    tc: 100 },
  { name: "Red",     hex: "#c0271a", digit: 2, mult: 100,         tol: 2,    tc: 50 },
  { name: "Orange",  hex: "#e0681a", digit: 3, mult: 1_000,       tol: null, tc: 15 },
  { name: "Yellow",  hex: "#e8c317", digit: 4, mult: 10_000,      tol: null, tc: 25 },
  { name: "Green",   hex: "#1f7a3a", digit: 5, mult: 100_000,     tol: 0.5,  tc: 20 },
  { name: "Blue",    hex: "#1a4fb8", digit: 6, mult: 1_000_000,   tol: 0.25, tc: 10 },
  { name: "Violet",  hex: "#6a2bb8", digit: 7, mult: 10_000_000,  tol: 0.1,  tc: 5 },
  { name: "Grey",    hex: "#7c7c7c", digit: 8, mult: 100_000_000, tol: 0.05, tc: 1 },
  { name: "White",   hex: "#f3f3f3", digit: 9, mult: 1_000_000_000, tol: null, tc: null },
  { name: "Gold",    hex: "#c9a23a", digit: null, mult: 0.1,      tol: 5,    tc: null },
  { name: "Silver",  hex: "#bcbcbc", digit: null, mult: 0.01,     tol: 10,   tc: null },
];

const byName = (n: string) => COLORS.find((c) => c.name === n)!;

function format(ohms: number): string {
  if (ohms >= 1e9) return `${+(ohms / 1e9).toPrecision(4)} GΩ`;
  if (ohms >= 1e6) return `${+(ohms / 1e6).toPrecision(4)} MΩ`;
  if (ohms >= 1e3) return `${+(ohms / 1e3).toPrecision(4)} kΩ`;
  if (ohms >= 1) return `${+ohms.toPrecision(4)} Ω`;
  return `${+(ohms * 1000).toPrecision(4)} mΩ`;
}

function Page() {
  const [bands, setBands] = useState<4 | 5 | 6>(4);
  const [b1, setB1] = useState("Brown");
  const [b2, setB2] = useState("Black");
  const [b3, setB3] = useState("Red");
  const [b4, setB4] = useState("Red");
  const [b5, setB5] = useState("Gold");
  const [b6, setB6] = useState("Brown");

  const result = useMemo(() => {
    const digits = bands === 4 ? [byName(b1).digit, byName(b2).digit] : [byName(b1).digit, byName(b2).digit, byName(b3).digit];
    if (digits.some((d) => d === null)) return null;
    const multColor = bands === 4 ? byName(b3) : byName(b4);
    const tolColor = bands === 4 ? byName(b4) : byName(b5);
    if (multColor.mult === null) return null;
    const raw = parseInt(digits.join(""), 10);
    const ohms = raw * multColor.mult;
    const tol = tolColor.tol;
    const tc = bands === 6 ? byName(b6).tc : null;
    return { ohms, tol, tc };
  }, [bands, b1, b2, b3, b4, b5, b6]);

  const Select = ({ value, onChange, filter, label }: { value: string; onChange: (v: string) => void; filter: (c: Color) => boolean; label: string }) => (
    <label className="text-sm flex-1 min-w-[120px]">
      <div className="eyebrow mb-1">{label}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}
        className="w-full min-h-12 px-3 rounded-lg border border-border bg-card">
        {COLORS.filter(filter).map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
      </select>
      <div className="mt-2 h-3 rounded" style={{ backgroundColor: byName(value).hex }} />
    </label>
  );

  const text = result ? `${format(result.ohms)}${result.tol !== null ? ` ±${result.tol}%` : ""}${result.tc !== null ? `, ${result.tc} ppm/°C` : ""}` : "";

  return (
    <ToolLayout slug="resistor-calculator">
      <div className="soft-card p-4 sm:p-5 mb-5 flex flex-wrap gap-3 items-center">
        <div className="eyebrow">Bands</div>
        {[4, 5, 6].map((n) => (
          <button key={n} onClick={() => setBands(n as 4 | 5 | 6)}
            className={`min-h-10 px-4 rounded-lg border text-sm ${bands === n ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary"}`}>
            {n}-band
          </button>
        ))}
      </div>

      <div className="soft-card p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap gap-3">
          <Select value={b1} onChange={setB1} filter={(c) => c.digit !== null && c.digit !== 0} label="Band 1" />
          <Select value={b2} onChange={setB2} filter={(c) => c.digit !== null} label="Band 2" />
          {bands >= 5 && <Select value={b3} onChange={setB3} filter={(c) => c.digit !== null} label="Band 3" />}
          <Select value={bands === 4 ? b3 : b4} onChange={bands === 4 ? setB3 : setB4} filter={(c) => c.mult !== null} label="Multiplier" />
          <Select value={bands === 4 ? b4 : b5} onChange={bands === 4 ? setB4 : setB5} filter={(c) => c.tol !== null} label="Tolerance" />
          {bands === 6 && <Select value={b6} onChange={setB6} filter={(c) => c.tc !== null} label="Temp coef" />}
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-4 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="eyebrow">Resistance</div>
            <div className="text-3xl font-display text-primary tabular-nums">{text || "—"}</div>
          </div>
          <button onClick={() => navigator.clipboard.writeText(text)} disabled={!text}
            className="min-h-11 px-4 rounded-lg border border-border bg-card hover:border-primary inline-flex items-center gap-2 text-sm disabled:opacity-50">
            <Copy className="size-4" /> Copy
          </button>
        </div>
      </div>

      <HowItWorks>
        <li>Pick whether your resistor has 4, 5 or 6 colour bands.</li>
        <li>Match each dropdown to the bands you see, left to right.</li>
        <li>The resistance, tolerance and (for 6-band) temperature coefficient appear instantly.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
