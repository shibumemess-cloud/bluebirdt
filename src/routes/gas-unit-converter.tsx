import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Fuel, Copy } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";
import { gasConvert } from "../lib/crypto-helpers";

export const Route = createFileRoute("/gas-unit-converter")({
  head: () => ({
    meta: [
      { title: "Gas Unit Converter — Wei, Gwei, Ether Free" },
      { name: "description", content: "Convert between Wei, Gwei and Ether with full precision. Perfect for gas fee math. Runs in your browser, free, no signup." },
      { property: "og:title", content: "Gas Unit Converter — Bluebird" },
      { property: "og:description", content: "Wei ↔ Gwei ↔ Ether with BigInt precision." },
    ],
    links: [{ rel: "canonical", href: "/gas-unit-converter" }],
  }),
  component: Page,
});

type Unit = "wei" | "gwei" | "ether";

function Page() {
  const [value, setValue] = useState("21000");
  const [unit, setUnit] = useState<Unit>("gwei");
  const result = useMemo(() => gasConvert(value, unit), [value, unit]);

  async function copy(s: string) { try { await navigator.clipboard.writeText(s); } catch { /* ignore */ } }

  return (
    <ToolLayout slug="gas-unit-converter">
      <div className="soft-card p-5 sm:p-6 space-y-5">
        <div className="grid sm:grid-cols-[1fr_auto] gap-3">
          <label className="block">
            <span className="font-medium">Amount</span>
            <input inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm" aria-label="Amount" />
          </label>
          <label className="block">
            <span className="font-medium">From unit</span>
            <select value={unit} onChange={(e) => setUnit(e.target.value as Unit)} className="mt-2 rounded-xl border border-border bg-background px-3 py-3 min-h-12">
              <option value="wei">Wei</option>
              <option value="gwei">Gwei</option>
              <option value="ether">Ether</option>
            </select>
          </label>
        </div>

        <div className="rounded-2xl border border-border bg-card divide-y divide-border" aria-live="polite">
          {(["wei", "gwei", "ether"] as Unit[]).map((u) => {
            const v = result ? result[u] : "—";
            return (
              <div key={u} className="px-4 py-3 flex items-center gap-3">
                <span className="w-20 text-sm text-muted-foreground uppercase tracking-wide">{u}</span>
                <code className="flex-1 font-mono text-sm break-all">{v}</code>
                {result && (
                  <button onClick={() => copy(v)} className="text-muted-foreground hover:text-foreground" aria-label={`Copy ${u} value`}><Copy className="size-4" /></button>
                )}
              </div>
            );
          })}
        </div>
        {!result && value.trim() && <p className="text-sm text-rose-700">Enter a non‑negative number. Wei takes whole numbers only.</p>}

        <div className="rounded-xl bg-primary-soft p-4 text-sm flex gap-3">
          <Fuel className="size-5 text-primary shrink-0 mt-0.5" aria-hidden />
          <p>1 Ether = 1,000,000,000 Gwei = 10<sup>18</sup> Wei. Gas prices are usually quoted in Gwei.</p>
        </div>
      </div>
      <HowItWorks>
        <p>Type a value, choose its unit and read all three forms below. All math uses BigInt so even 18‑decimal Ether values stay exact.</p>
      </HowItWorks>
    </ToolLayout>
  );
}
