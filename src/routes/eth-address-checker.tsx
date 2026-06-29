import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, X, Copy } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";
import { validateEthAddress } from "../lib/crypto-helpers";

export const Route = createFileRoute("/eth-address-checker")({
  head: () => ({
    meta: [
      { title: "Ethereum Address Checker — EIP-55 Validator Free" },
      { name: "description", content: "Validate any Ethereum address with full EIP‑55 checksum so you can spot copy‑paste typos before sending. 100% in your browser." },
      { property: "og:title", content: "Ethereum Address Checker — Bluebird" },
      { property: "og:description", content: "Free EIP‑55 ETH address validator that runs offline." },
    ],
    links: [{ rel: "canonical", href: "/eth-address-checker" }],
  }),
  component: Page,
});

function Page() {
  const [addr, setAddr] = useState("");
  const result = useMemo(() => addr.trim() ? validateEthAddress(addr.trim()) : null, [addr]);

  async function copy(s: string) { try { await navigator.clipboard.writeText(s); } catch { /* ignore */ } }

  return (
    <ToolLayout slug="eth-address-checker">
      <div className="soft-card p-5 sm:p-6 space-y-5">
        <label className="block">
          <span className="font-medium">Paste an Ethereum address</span>
          <input value={addr} onChange={(e) => setAddr(e.target.value)} spellCheck={false} placeholder="0x…" className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm" aria-label="Ethereum address" />
        </label>

        <div className="min-h-12" aria-live="polite">
          {result && (
            result.valid ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 space-y-2">
                <div className="flex items-center gap-2 font-medium text-emerald-900"><Check className="size-5" aria-hidden /> Address is valid</div>
                {result.reason && <p className="text-sm text-emerald-800">{result.reason}</p>}
                {result.checksum && (
                  <div className="text-sm">
                    <span className="text-emerald-800">Checksum form:</span>
                    <code className="ml-2 font-mono break-all">{result.checksum}</code>
                    <button onClick={() => copy(result.checksum!)} className="ml-2 inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900" aria-label="Copy checksum address"><Copy className="size-4" /></button>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                <div className="flex items-center gap-2 font-medium text-rose-900"><X className="size-5" aria-hidden /> {result.reason}</div>
                {result.checksum && (
                  <div className="text-sm mt-1">
                    <span className="text-rose-800">Did you mean:</span>{" "}
                    <code className="font-mono break-all">{result.checksum}</code>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
      <HowItWorks>
        <p>Type or paste any Ethereum address. We verify the EIP‑55 mixed‑case checksum locally, which catches almost all copy‑paste typos. The address never leaves your browser.</p>
      </HowItWorks>
    </ToolLayout>
  );
}
