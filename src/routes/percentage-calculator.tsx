import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Percent } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/percentage-calculator")({
  head: () => ({
    meta: [
      { title: "Percentage Calculator — Percent of, Change & What Percent" },
      { name: "description", content: "Free percentage calculator. Work out X% of a number, what percent one number is of another, and percent increase or decrease — all in your browser." },
      { property: "og:title", content: "Percentage Calculator — Bluebird" },
      { property: "og:description", content: "Three modes: percent of a number, what percent, and percent change." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/percentage-calculator" },
    ],
    links: [{ rel: "canonical", href: "/percentage-calculator" }],
  }),
  component: Page,
});

type Mode = "of" | "what" | "change";

function fmt(n: number) {
  if (!isFinite(n)) return "—";
  const r = Math.round(n * 1e6) / 1e6;
  return r.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

function Page() {
  const [mode, setMode] = useState<Mode>("of");
  const [a, setA] = useState("20");
  const [b, setB] = useState("150");

  const na = parseFloat(a);
  const nb = parseFloat(b);
  const valid = isFinite(na) && isFinite(nb);

  let result = "—";
  let explain = "";
  if (valid) {
    if (mode === "of") {
      result = fmt((na / 100) * nb);
      explain = `${a}% × ${b} ÷ 100 = ${result}`;
    } else if (mode === "what") {
      result = nb === 0 ? "—" : fmt((na / nb) * 100) + "%";
      explain = nb === 0 ? "Cannot divide by zero." : `${a} ÷ ${b} × 100 = ${result}`;
    } else {
      result = na === 0 ? "—" : fmt(((nb - na) / Math.abs(na)) * 100) + "%";
      explain = na === 0 ? "Old value cannot be zero." : `((${b} − ${a}) ÷ |${a}|) × 100 = ${result}`;
    }
  }

  const modes: { id: Mode; label: string; aLabel: string; bLabel: string }[] = [
    { id: "of", label: "X% of Y", aLabel: "Percent (%)", bLabel: "Of number" },
    { id: "what", label: "What % is X of Y", aLabel: "Number", bLabel: "Of total" },
    { id: "change", label: "Percent change", aLabel: "Old value", bLabel: "New value" },
  ];
  const active = modes.find((m) => m.id === mode)!;

  return (
    <ToolLayout slug="percentage-calculator">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-5">
          <div role="radiogroup" aria-label="Calculation type" className="grid grid-cols-3 gap-2">
            {modes.map((m) => (
              <button
                key={m.id}
                role="radio"
                aria-checked={mode === m.id}
                onClick={() => setMode(m.id)}
                className={`min-h-11 rounded-xl border text-xs sm:text-sm px-2 ${
                  mode === m.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:border-primary"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div>
            <label htmlFor="pc-a" className="eyebrow">{active.aLabel}</label>
            <input
              id="pc-a"
              type="number"
              inputMode="decimal"
              value={a}
              onChange={(e) => setA(e.target.value)}
              className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3 text-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label htmlFor="pc-b" className="eyebrow">{active.bLabel}</label>
            <input
              id="pc-b"
              type="number"
              inputMode="decimal"
              value={b}
              onChange={(e) => setB(e.target.value)}
              className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3 text-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </section>

        <section className="soft-card p-5 sm:p-6 space-y-4" aria-live="polite">
          <div className="flex items-center gap-2">
            <Percent className="size-4 text-primary" />
            <div className="font-display text-lg">Result</div>
          </div>
          <div className="rounded-2xl border border-border bg-primary-soft/40 p-5 text-center">
            <div className="text-4xl sm:text-5xl font-display tabular-nums break-all">{result}</div>
          </div>
          {explain && (
            <div className="rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground">
              {explain}
            </div>
          )}
        </section>
      </div>

      <HowItWorks>
        <li>Pick the calculation type.</li>
        <li>Type the two numbers — the result updates as you type.</li>
        <li>Copy the answer or change the mode to try a different question.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
