import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, Code2 } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";
import { solidityFunctionSelector } from "../lib/crypto-helpers";

export const Route = createFileRoute("/solidity-function-selector")({
  head: () => ({
    meta: [
      { title: "Solidity Function Selector — 4-byte Signature Tool" },
      { name: "description", content: "Compute the keccak‑256 4‑byte selector for any Solidity function signature. Free, offline and instant." },
      { property: "og:title", content: "Solidity Function Selector — Bluebird" },
      { property: "og:description", content: "Generate 4‑byte selectors for any Solidity function — runs in your browser." },
    ],
    links: [{ rel: "canonical", href: "/solidity-function-selector" }],
  }),
  component: Page,
});

const EXAMPLES = [
  "transfer(address,uint256)",
  "approve(address,uint256)",
  "balanceOf(address)",
  "totalSupply()",
];

function Page() {
  const [sig, setSig] = useState("transfer(address,uint256)");
  const selector = useMemo(() => sig.trim() ? solidityFunctionSelector(sig) : "", [sig]);
  async function copy(s: string) { try { await navigator.clipboard.writeText(s); } catch { /* ignore */ } }

  return (
    <ToolLayout slug="solidity-function-selector">
      <div className="soft-card p-5 sm:p-6 space-y-5">
        <label className="block">
          <span className="font-medium">Function signature</span>
          <input value={sig} onChange={(e) => setSig(e.target.value)} spellCheck={false} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm" aria-label="Solidity function signature" />
          <p className="mt-1 text-xs text-muted-foreground">Use canonical types — no parameter names, no spaces. Example: <code className="font-mono">transfer(address,uint256)</code>.</p>
        </label>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-2" aria-live="polite">
          <div className="text-sm text-muted-foreground">4‑byte selector</div>
          <div className="flex items-center gap-3">
            <code className="text-2xl font-mono">{selector || "—"}</code>
            {selector && <button onClick={() => copy(selector)} className="text-muted-foreground hover:text-foreground" aria-label="Copy selector"><Copy className="size-4" /></button>}
          </div>
        </div>

        <div>
          <div className="text-sm font-medium mb-2">Common examples</div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((e) => (
              <button key={e} onClick={() => setSig(e)} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-mono hover:bg-primary-soft">{e}</button>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-primary-soft p-4 text-sm flex gap-3">
          <Code2 className="size-5 text-primary shrink-0 mt-0.5" aria-hidden />
          <p>The selector is the first 4 bytes of <code className="font-mono">keccak256("transfer(address,uint256)")</code>. EVM contracts use it to route calls.</p>
        </div>
      </div>
      <HowItWorks>
        <p>Type a Solidity function signature. We hash it with keccak‑256 in your browser and show the 4‑byte selector you'd use in <code>data</code> for an EVM transaction.</p>
      </HowItWorks>
    </ToolLayout>
  );
}
