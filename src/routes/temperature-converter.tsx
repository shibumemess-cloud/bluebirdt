import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Thermometer } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/temperature-converter")({
  head: () => ({
    meta: [
      { title: "Temperature Converter — Celsius, Fahrenheit & Kelvin" },
      { name: "description", content: "Convert any temperature between Celsius, Fahrenheit and Kelvin instantly. Common presets for freezing, body temperature and boiling." },
      { property: "og:title", content: "Temperature Converter — Bluebird" },
      { property: "og:description", content: "Type once, see all three units update live." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/temperature-converter" },
    ],
    links: [{ rel: "canonical", href: "/temperature-converter" }],
  }),
  component: Page,
});

type Unit = "c" | "f" | "k";

function toC(v: number, u: Unit) {
  if (u === "c") return v;
  if (u === "f") return (v - 32) * (5 / 9);
  return v - 273.15;
}
function fromC(c: number, u: Unit) {
  if (u === "c") return c;
  if (u === "f") return c * (9 / 5) + 32;
  return c + 273.15;
}

function fmt(n: number) {
  if (!isFinite(n)) return "";
  const r = Math.round(n * 100) / 100;
  return String(r);
}

const PRESETS: { label: string; c: number }[] = [
  { label: "Absolute zero", c: -273.15 },
  { label: "Freezing", c: 0 },
  { label: "Room", c: 22 },
  { label: "Body temp", c: 37 },
  { label: "Hot day", c: 40 },
  { label: "Boiling", c: 100 },
];

function Page() {
  const [c, setC] = useState("20");
  const [f, setF] = useState("68");
  const [k, setK] = useState("293.15");

  function setAll(value: string, unit: Unit) {
    const num = parseFloat(value);
    if (unit === "c") setC(value); else if (unit === "f") setF(value); else setK(value);
    if (value === "" || isNaN(num)) {
      if (unit !== "c") setC("");
      if (unit !== "f") setF("");
      if (unit !== "k") setK("");
      return;
    }
    let celsius = toC(num, unit);
    if (unit === "k" && num < 0) celsius = toC(0, "k");
    if (unit !== "c") setC(fmt(celsius));
    if (unit !== "f") setF(fmt(fromC(celsius, "f")));
    if (unit !== "k") setK(fmt(fromC(celsius, "k")));
  }

  function applyPreset(cVal: number) {
    setC(fmt(cVal));
    setF(fmt(fromC(cVal, "f")));
    setK(fmt(fromC(cVal, "k")));
  }

  return (
    <ToolLayout slug="temperature-converter">
      <div className="soft-card p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Thermometer className="size-4 text-primary" />
          <div className="font-display text-lg">Type any value</div>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <UnitInput id="t-c" label="Celsius (°C)" value={c} onChange={(v) => setAll(v, "c")} />
          <UnitInput id="t-f" label="Fahrenheit (°F)" value={f} onChange={(v) => setAll(v, "f")} />
          <UnitInput id="t-k" label="Kelvin (K)" value={k} onChange={(v) => setAll(v, "k")} />
        </div>

        <div>
          <div className="eyebrow mb-2">Quick presets</div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p.c)}
                className="min-h-10 px-3 rounded-lg border border-border bg-card text-xs hover:border-primary hover:text-primary"
              >
                {p.label} · {p.c}°C
              </button>
            ))}
          </div>
        </div>
      </div>

      <HowItWorks>
        <li>Type a temperature in any of the three boxes.</li>
        <li>The other two units update as you type.</li>
        <li>Tap a preset to jump to a common value.</li>
      </HowItWorks>
    </ToolLayout>
  );
}

function UnitInput({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label htmlFor={id} className="eyebrow">{label}</label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3 text-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
