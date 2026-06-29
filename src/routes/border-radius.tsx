import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Square, Copy } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/border-radius")({
  head: () => ({
    meta: [
      { title: "CSS Border Radius Generator — Live Preview" },
      { name: "description", content: "Design rounded corners for any element with per-corner control, live preview and a one-click CSS copy." },
      { property: "og:title", content: "Border Radius Generator — Bluebird" },
      { property: "og:description", content: "Per-corner border-radius with live preview." },
      { property: "og:url", content: "/border-radius" },
    ],
    links: [{ rel: "canonical", href: "/border-radius" }],
  }),
  component: Page,
});

function Page() {
  const [tl, setTl] = useState(24);
  const [tr, setTr] = useState(24);
  const [br, setBr] = useState(24);
  const [bl, setBl] = useState(24);
  const [linked, setLinked] = useState(true);
  const [unit, setUnit] = useState<"px" | "%">("px");

  function setAll(v: number) { setTl(v); setTr(v); setBr(v); setBl(v); }

  const css = useMemo(() => {
    if (tl === tr && tr === br && br === bl) return `border-radius: ${tl}${unit};`;
    return `border-radius: ${tl}${unit} ${tr}${unit} ${br}${unit} ${bl}${unit};`;
  }, [tl, tr, br, bl, unit]);

  const max = unit === "px" ? 200 : 50;

  return (
    <ToolLayout slug="border-radius">
      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-5">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={linked} onChange={(e) => setLinked(e.target.checked)}
              className="size-4 accent-[color:var(--color-primary)]" />
            Link all corners
          </label>

          <div className="flex gap-2">
            {(["px", "%"] as const).map((u) => (
              <button key={u} onClick={() => setUnit(u)} aria-pressed={unit === u}
                className={["min-h-10 px-4 rounded-lg text-sm font-medium border flex-1",
                  unit === u ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary"].join(" ")}>
                {u}
              </button>
            ))}
          </div>

          {linked ? (
            <Slider id="br-all" label={`All corners`} value={tl} max={max} unit={unit} onChange={setAll} />
          ) : (
            <>
              <Slider id="br-tl" label="Top left" value={tl} max={max} unit={unit} onChange={setTl} />
              <Slider id="br-tr" label="Top right" value={tr} max={max} unit={unit} onChange={setTr} />
              <Slider id="br-br" label="Bottom right" value={br} max={max} unit={unit} onChange={setBr} />
              <Slider id="br-bl" label="Bottom left" value={bl} max={max} unit={unit} onChange={setBl} />
            </>
          )}

          <div className="flex flex-wrap gap-1.5 pt-2">
            {[0, 4, 8, 12, 16, 24, 32, 9999].map((p) => (
              <button key={p} onClick={() => { setLinked(true); setUnit("px"); setAll(p); }}
                className="min-h-9 px-3 rounded-lg border border-border bg-card text-xs hover:border-primary hover:text-primary">
                {p === 9999 ? "Pill" : `${p}px`}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <div className="soft-card p-5 sm:p-6">
            <div className="eyebrow mb-3">Live preview</div>
            <div className="checker-bg rounded-xl border border-border p-8 grid place-items-center min-h-72">
              <div
                style={{
                  borderRadius: `${tl}${unit} ${tr}${unit} ${br}${unit} ${bl}${unit}`,
                }}
                className="size-48 sm:size-56 bg-gradient-to-br from-primary to-[color-mix(in_oklab,var(--color-primary)_60%,#000)] shadow-lift"
              />
            </div>
          </div>

          <div className="soft-card p-5 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2"><Square className="size-4 text-primary" /><div className="eyebrow">CSS</div></div>
              <button onClick={() => navigator.clipboard.writeText(css).catch(() => {})}
                className="text-sm text-primary hover:underline inline-flex items-center gap-1.5"><Copy className="size-4" /> Copy</button>
            </div>
            <pre className="font-mono text-sm bg-primary-soft/30 rounded-xl border border-border p-4 overflow-x-auto">{css}</pre>
          </div>
        </section>
      </div>

      <HowItWorks>
        <li>Drag the sliders to round each corner.</li>
        <li>Unlink corners for asymmetric shapes — great for chat bubbles.</li>
        <li>Copy the CSS line and paste it straight into your stylesheet.</li>
      </HowItWorks>
    </ToolLayout>
  );
}

function Slider({ id, label, value, max, unit, onChange }: { id: string; label: string; value: number; max: number; unit: string; onChange: (n: number) => void }) {
  return (
    <div>
      <label htmlFor={id} className="flex items-center justify-between text-sm font-medium">
        <span>{label}</span>
        <span className="tabular-nums text-muted-foreground">{value}{unit}</span>
      </label>
      <input id={id} type="range" min={0} max={max} value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="mt-1.5 w-full accent-[color:var(--color-primary)]" />
    </div>
  );
}
