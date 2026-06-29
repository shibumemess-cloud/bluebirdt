import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Contrast, CheckCircle2, XCircle } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/contrast-checker")({
  head: () => ({
    meta: [
      { title: "Color Contrast Checker — WCAG AA & AAA Ratio" },
      { name: "description", content: "Check WCAG color contrast between text and background. See AA / AAA pass for normal and large text. Live preview." },
      { property: "og:title", content: "Contrast Checker — Bluebird" },
      { property: "og:description", content: "WCAG AA & AAA contrast ratio with live preview." },
      { property: "og:url", content: "/contrast-checker" },
    ],
    links: [{ rel: "canonical", href: "/contrast-checker" }],
  }),
  component: Page,
});

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([a-f0-9]{3}|[a-f0-9]{6})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}
function relLum({ r, g, b }: { r: number; g: number; b: number }) {
  const f = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function ratio(fg: string, bg: string): number | null {
  const a = hexToRgb(fg), b = hexToRgb(bg);
  if (!a || !b) return null;
  const la = relLum(a), lb = relLum(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function Page() {
  const [fg, setFg] = useState("#0F172A");
  const [bg, setBg] = useState("#F1F5F9");

  const r = useMemo(() => ratio(fg, bg), [fg, bg]);
  const rounded = r ? Math.round(r * 100) / 100 : 0;

  const checks = r ? [
    { label: "AA — Normal text", pass: r >= 4.5 },
    { label: "AA — Large text (18pt+)", pass: r >= 3 },
    { label: "AAA — Normal text", pass: r >= 7 },
    { label: "AAA — Large text", pass: r >= 4.5 },
    { label: "Graphics & UI components", pass: r >= 3 },
  ] : [];

  function swap() { const t = fg; setFg(bg); setBg(t); }

  return (
    <ToolLayout slug="contrast-checker">
      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-5">
          <ColorRow id="fg" label="Text color" value={fg} setValue={setFg} />
          <ColorRow id="bg" label="Background color" value={bg} setValue={setBg} />
          <button onClick={swap} className="w-full min-h-11 rounded-xl border border-border bg-card text-sm font-medium hover:border-primary">
            Swap colors
          </button>
        </section>

        <section className="space-y-5">
          <div className="soft-card p-5 sm:p-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2"><Contrast className="size-4 text-primary" /><div className="eyebrow">Contrast ratio</div></div>
              <div className="font-display text-4xl tabular-nums">{rounded.toFixed(2)} : 1</div>
            </div>
            <div className="mt-4 rounded-xl border border-border p-6" style={{ background: bg, color: fg }}>
              <div className="text-2xl font-display">The quick brown fox</div>
              <div className="text-sm mt-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit. The five boxing wizards jump quickly.</div>
            </div>
          </div>

          <div className="soft-card p-5 sm:p-6">
            <div className="eyebrow mb-3">WCAG compliance</div>
            <ul className="grid sm:grid-cols-2 gap-2">
              {checks.map((c) => (
                <li key={c.label} className={["flex items-center gap-2.5 rounded-xl border p-3 text-sm",
                  c.pass ? "border-emerald-500/30 bg-emerald-500/5" : "border-rose-500/30 bg-rose-500/5"].join(" ")}>
                  {c.pass ? <CheckCircle2 className="size-5 text-emerald-500 shrink-0" /> : <XCircle className="size-5 text-rose-500 shrink-0" />}
                  <span>{c.label}</span>
                  <span className="ml-auto text-xs font-semibold">{c.pass ? "Pass" : "Fail"}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <HowItWorks>
        <li>Pick a text color and background color.</li>
        <li>The ratio updates live, alongside WCAG AA and AAA checks.</li>
        <li>Aim for at least 4.5:1 for normal body text.</li>
      </HowItWorks>
    </ToolLayout>
  );
}

function ColorRow({ id, label, value, setValue }: { id: string; label: string; value: string; setValue: (v: string) => void }) {
  const valid = !!hexToRgb(value);
  return (
    <div>
      <label htmlFor={id} className="eyebrow">{label}</label>
      <div className="mt-1.5 grid grid-cols-[auto_1fr] gap-2 items-center">
        <input type="color" value={valid ? value : "#000000"} onChange={(e) => setValue(e.target.value.toUpperCase())}
          aria-label={`${label} swatch`}
          className="size-12 rounded-xl border border-border bg-card cursor-pointer" />
        <input id={id} value={value} onChange={(e) => setValue(e.target.value)}
          className="min-h-12 rounded-xl border border-border bg-card px-3 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
    </div>
  );
}
