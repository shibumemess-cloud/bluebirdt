import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Scale, ArrowLeftRight } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/unit-converter")({
  head: () => ({
    meta: [
      { title: "Unit Converter — Length, Weight, Volume, Speed & More" },
      { name: "description", content: "Free unit converter for length, weight, volume, area, speed, time and data. Metric and imperial, accurate to six significant figures." },
      { property: "og:title", content: "Unit Converter — Bluebird" },
      { property: "og:description", content: "Convert any unit instantly — both ways, in your browser." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/unit-converter" },
    ],
    links: [{ rel: "canonical", href: "/unit-converter" }],
  }),
  component: Page,
});

// All units stored as factor to a base unit per category.
type Unit = { id: string; label: string; factor: number };
type Category = { id: string; label: string; base: string; units: Unit[] };

const CATEGORIES: Category[] = [
  {
    id: "length", label: "Length", base: "m",
    units: [
      { id: "mm", label: "Millimeter (mm)", factor: 0.001 },
      { id: "cm", label: "Centimeter (cm)", factor: 0.01 },
      { id: "m", label: "Meter (m)", factor: 1 },
      { id: "km", label: "Kilometer (km)", factor: 1000 },
      { id: "in", label: "Inch (in)", factor: 0.0254 },
      { id: "ft", label: "Foot (ft)", factor: 0.3048 },
      { id: "yd", label: "Yard (yd)", factor: 0.9144 },
      { id: "mi", label: "Mile (mi)", factor: 1609.344 },
      { id: "nmi", label: "Nautical mile", factor: 1852 },
    ],
  },
  {
    id: "weight", label: "Weight", base: "kg",
    units: [
      { id: "mg", label: "Milligram (mg)", factor: 0.000001 },
      { id: "g", label: "Gram (g)", factor: 0.001 },
      { id: "kg", label: "Kilogram (kg)", factor: 1 },
      { id: "t", label: "Metric ton (t)", factor: 1000 },
      { id: "oz", label: "Ounce (oz)", factor: 0.0283495231 },
      { id: "lb", label: "Pound (lb)", factor: 0.45359237 },
      { id: "st", label: "Stone (st)", factor: 6.35029318 },
    ],
  },
  {
    id: "volume", label: "Volume", base: "l",
    units: [
      { id: "ml", label: "Milliliter (ml)", factor: 0.001 },
      { id: "l", label: "Liter (l)", factor: 1 },
      { id: "m3", label: "Cubic meter (m³)", factor: 1000 },
      { id: "tsp", label: "Teaspoon (US)", factor: 0.00492892 },
      { id: "tbsp", label: "Tablespoon (US)", factor: 0.01478676 },
      { id: "floz", label: "Fluid ounce (US)", factor: 0.0295735 },
      { id: "cup", label: "Cup (US)", factor: 0.236588 },
      { id: "pt", label: "Pint (US)", factor: 0.473176 },
      { id: "qt", label: "Quart (US)", factor: 0.946353 },
      { id: "gal", label: "Gallon (US)", factor: 3.78541 },
      { id: "galuk", label: "Gallon (UK)", factor: 4.54609 },
    ],
  },
  {
    id: "area", label: "Area", base: "m2",
    units: [
      { id: "mm2", label: "mm²", factor: 0.000001 },
      { id: "cm2", label: "cm²", factor: 0.0001 },
      { id: "m2", label: "m²", factor: 1 },
      { id: "ha", label: "Hectare (ha)", factor: 10000 },
      { id: "km2", label: "km²", factor: 1_000_000 },
      { id: "in2", label: "in²", factor: 0.00064516 },
      { id: "ft2", label: "ft²", factor: 0.09290304 },
      { id: "yd2", label: "yd²", factor: 0.83612736 },
      { id: "acre", label: "Acre", factor: 4046.8564224 },
      { id: "mi2", label: "mi²", factor: 2_589_988.110336 },
    ],
  },
  {
    id: "speed", label: "Speed", base: "mps",
    units: [
      { id: "mps", label: "Meter/second (m/s)", factor: 1 },
      { id: "kph", label: "Kilometer/hour (km/h)", factor: 1 / 3.6 },
      { id: "mph", label: "Mile/hour (mph)", factor: 0.44704 },
      { id: "fps", label: "Foot/second (ft/s)", factor: 0.3048 },
      { id: "knot", label: "Knot (kn)", factor: 0.514444 },
    ],
  },
  {
    id: "time", label: "Time", base: "s",
    units: [
      { id: "ms", label: "Millisecond (ms)", factor: 0.001 },
      { id: "s", label: "Second (s)", factor: 1 },
      { id: "min", label: "Minute (min)", factor: 60 },
      { id: "h", label: "Hour (h)", factor: 3600 },
      { id: "d", label: "Day (d)", factor: 86400 },
      { id: "wk", label: "Week (wk)", factor: 604800 },
      { id: "mo", label: "Month (30d)", factor: 2_592_000 },
      { id: "yr", label: "Year (365d)", factor: 31_536_000 },
    ],
  },
  {
    id: "data", label: "Data", base: "B",
    units: [
      { id: "B", label: "Byte (B)", factor: 1 },
      { id: "KB", label: "Kilobyte (KB, 1000)", factor: 1000 },
      { id: "MB", label: "Megabyte (MB, 1000²)", factor: 1_000_000 },
      { id: "GB", label: "Gigabyte (GB, 1000³)", factor: 1_000_000_000 },
      { id: "TB", label: "Terabyte (TB, 1000⁴)", factor: 1_000_000_000_000 },
      { id: "KiB", label: "Kibibyte (KiB, 1024)", factor: 1024 },
      { id: "MiB", label: "Mebibyte (MiB)", factor: 1024 * 1024 },
      { id: "GiB", label: "Gibibyte (GiB)", factor: 1024 ** 3 },
      { id: "TiB", label: "Tebibyte (TiB)", factor: 1024 ** 4 },
    ],
  },
];

function fmt(n: number) {
  if (!isFinite(n)) return "";
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e15 || abs < 1e-6) return n.toExponential(6);
  return Number(n.toPrecision(6)).toString();
}

function Page() {
  const [catId, setCatId] = useState("length");
  const cat = CATEGORIES.find((c) => c.id === catId)!;
  const [from, setFrom] = useState(cat.units[0].id);
  const [to, setTo] = useState(cat.units[2]?.id ?? cat.units[1].id);
  const [value, setValue] = useState("1");

  useEffect(() => {
    setFrom(cat.units[0].id);
    setTo(cat.units[2]?.id ?? cat.units[1].id);
  }, [catId]);

  const result = useMemo(() => {
    const n = parseFloat(value);
    if (!isFinite(n)) return "";
    const f = cat.units.find((u) => u.id === from)?.factor ?? 1;
    const t = cat.units.find((u) => u.id === to)?.factor ?? 1;
    return fmt((n * f) / t);
  }, [value, from, to, cat]);

  return (
    <ToolLayout slug="unit-converter">
      <div className="soft-card p-5 sm:p-6 space-y-5">
        <div>
          <div className="eyebrow mb-2">Category</div>
          <div role="radiogroup" aria-label="Category" className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                role="radio"
                aria-checked={catId === c.id}
                onClick={() => setCatId(c.id)}
                className={`min-h-11 px-4 rounded-xl border text-sm ${
                  catId === c.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:border-primary"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-[1fr_auto_1fr] items-end gap-3">
          <div>
            <label htmlFor="uc-from" className="eyebrow">From</label>
            <select id="uc-from" value={from} onChange={(e) => setFrom(e.target.value)}
              className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3">
              {cat.units.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
            </select>
            <input
              type="number"
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="mt-2 w-full min-h-12 rounded-xl border border-border bg-card px-3 text-xl font-display tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            aria-label="Swap units"
            onClick={() => { const t = from; setFrom(to); setTo(t); }}
            className="hidden sm:inline-flex size-12 items-center justify-center rounded-xl border border-border bg-card hover:border-primary mb-0.5"
          >
            <ArrowLeftRight className="size-4" />
          </button>
          <div>
            <label htmlFor="uc-to" className="eyebrow">To</label>
            <select id="uc-to" value={to} onChange={(e) => setTo(e.target.value)}
              className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3">
              {cat.units.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
            </select>
            <div className="mt-2 w-full min-h-12 rounded-xl border border-border bg-primary-soft/40 px-3 grid place-items-start sm:place-items-end">
              <div className="self-center w-full text-left sm:text-right font-display text-xl tabular-nums break-all" aria-live="polite">
                {result || "—"}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Scale className="size-3.5" /> Values are rounded to 6 significant figures.
        </div>
      </div>

      <HowItWorks>
        <li>Pick a category — length, weight, volume and more.</li>
        <li>Choose the units you have and want.</li>
        <li>Type any number to see the conversion instantly.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
