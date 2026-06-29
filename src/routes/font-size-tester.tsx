import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/font-size-tester")({
  head: () => ({
    meta: [
      { title: "Font Size Tester — Live Type Preview Online" },
      { name: "description", content: "Preview the same paragraph at multiple font sizes side‑by‑side so you can pick the most readable one for your design." },
      { property: "og:title", content: "Font Size Tester — Bluebird" },
      { property: "og:description", content: "Compare typography sizes for free in your browser." },
    ],
    links: [{ rel: "canonical", href: "/font-size-tester" }],
  }),
  component: Page,
});

const FAMILIES = [
  "system-ui, sans-serif",
  "'Outfit', sans-serif",
  "'Plus Jakarta Sans', sans-serif",
  "Georgia, serif",
  "'Courier New', monospace",
];

function Page() {
  const [text, setText] = useState("The quick brown fox jumps over the lazy dog. 1234567890");
  const [family, setFamily] = useState(FAMILIES[0]);
  const [sizes, setSizes] = useState("12, 14, 16, 18, 20, 24, 32");
  const [weight, setWeight] = useState(400);

  const list = sizes.split(/[,\s]+/).map((n) => parseInt(n, 10)).filter((n) => n >= 8 && n <= 120);

  return (
    <ToolLayout slug="font-size-tester">
      <div className="soft-card p-5 sm:p-6 space-y-5">
        <label className="block">
          <span className="font-medium">Sample text</span>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3" />
        </label>
        <div className="grid sm:grid-cols-3 gap-4">
          <label className="block"><span className="text-sm font-medium">Font family</span>
            <select value={family} onChange={(e) => setFamily(e.target.value)} className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 min-h-11">
              {FAMILIES.map((f) => <option key={f} value={f}>{f.split(",")[0].replace(/'/g, "")}</option>)}
            </select>
          </label>
          <label className="block"><span className="text-sm font-medium">Weight ({weight})</span>
            <input type="range" min={300} max={800} step={100} value={weight} onChange={(e) => setWeight(+e.target.value)} className="w-full mt-2" />
          </label>
          <label className="block"><span className="text-sm font-medium">Sizes (px, comma‑separated)</span>
            <input value={sizes} onChange={(e) => setSizes(e.target.value)} className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 min-h-11" />
          </label>
        </div>

        <div className="rounded-2xl border border-border bg-card divide-y divide-border">
          {list.map((s) => (
            <div key={s} className="p-4 flex items-baseline gap-4">
              <span className="w-16 shrink-0 text-xs text-muted-foreground">{s}px</span>
              <p style={{ fontFamily: family, fontSize: `${s}px`, fontWeight: weight, lineHeight: 1.4 }}>{text}</p>
            </div>
          ))}
          {list.length === 0 && <p className="p-4 text-sm text-muted-foreground">Enter sizes like <code className="font-mono">12, 16, 20</code>.</p>}
        </div>
      </div>
      <HowItWorks>
        <p>Type your copy and a list of sizes — we render each side‑by‑side using the same font. Great for picking accessible body sizes (16–20px is a safe range for most audiences).</p>
      </HowItWorks>
    </ToolLayout>
  );
}
