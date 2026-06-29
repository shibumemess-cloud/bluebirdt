import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bitcoin, Check, X } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";
import { validateBitcoinAddress } from "../lib/crypto-helpers";

export const Route = createFileRoute("/bitcoin-address-validator")({
  head: () => ({
    meta: [
      { title: "Bitcoin Address Validator — Free Online Checker" },
      { name: "description", content: "Check if a Bitcoin address is valid before sending. Supports legacy, SegWit and Taproot. Runs offline in your browser — your address is never sent anywhere." },
      { property: "og:title", content: "Bitcoin Address Validator — Bluebird" },
      { property: "og:description", content: "Validate any BTC address right in your browser. Free, private, no signup." },
    ],
    links: [{ rel: "canonical", href: "/bitcoin-address-validator" }],
  }),
  component: Page,
});

function Page() {
  const [addr, setAddr] = useState("");
  const [result, setResult] = useState<{ valid: boolean; type?: string; reason?: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!addr.trim()) { setResult(null); return; }
    validateBitcoinAddress(addr).then((r) => { if (!cancelled) setResult(r); });
    return () => { cancelled = true; };
  }, [addr]);

  return (
    <ToolLayout slug="bitcoin-address-validator">
      <div className="soft-card p-5 sm:p-6 space-y-5">
        <label className="block">
          <span className="font-medium">Paste a Bitcoin address</span>
          <input value={addr} onChange={(e) => setAddr(e.target.value)} spellCheck={false} placeholder="bc1q… or 1… or 3…" className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm" aria-label="Bitcoin address" />
        </label>

        <div className="min-h-12" aria-live="polite">
          {result && (
            result.valid ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-start gap-3">
                <Check className="size-5 text-emerald-600 mt-0.5" aria-hidden />
                <div>
                  <div className="font-medium text-emerald-900">Looks valid</div>
                  <div className="text-sm text-emerald-800">{result.type}</div>
                  {result.reason && <div className="text-xs text-emerald-700 mt-1">{result.reason}</div>}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 flex items-start gap-3">
                <X className="size-5 text-rose-600 mt-0.5" aria-hidden />
                <div>
                  <div className="font-medium text-rose-900">Not a valid address</div>
                  <div className="text-sm text-rose-800">{result.reason}</div>
                </div>
              </div>
            )
          )}
        </div>

        <div className="rounded-xl bg-primary-soft p-4 text-sm text-foreground/80 flex gap-3">
          <Bitcoin className="size-5 text-primary shrink-0 mt-0.5" aria-hidden />
          <p>Always double‑check the first and last characters against the source before sending any funds. A valid format does not guarantee the address belongs to who you think it does.</p>
        </div>
      </div>
      <HowItWorks>
        <p>Paste any Bitcoin address. We check its format and checksum locally — supporting legacy (1…), P2SH (3…), SegWit (bc1q…) and Taproot (bc1p…). Nothing is sent to a server.</p>
      </HowItWorks>
    </ToolLayout>
  );
}
