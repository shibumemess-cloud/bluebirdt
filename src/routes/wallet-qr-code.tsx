import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks, ErrorBox } from "../components/ToolControls";

type Chain = "bitcoin" | "ethereum" | "solana";

export const Route = createFileRoute("/wallet-qr-code")({
  head: () => ({
    meta: [
      { title: "Wallet QR Code Generator — BTC, ETH, SOL Free" },
      { name: "description", content: "Turn any Bitcoin, Ethereum or Solana wallet address into a scannable QR code with an optional amount and label. Runs offline." },
      { property: "og:title", content: "Wallet QR Code — Bluebird" },
      { property: "og:description", content: "Make a wallet QR in your browser — free, private, no signup." },
    ],
    links: [{ rel: "canonical", href: "/wallet-qr-code" }],
  }),
  component: Page,
});

function buildUri(chain: Chain, address: string, amount: string, label: string): string {
  const a = address.trim();
  const params = new URLSearchParams();
  if (amount.trim()) params.set("amount", amount.trim());
  if (label.trim()) params.set("label", label.trim());
  const qs = params.toString();
  const scheme = chain === "bitcoin" ? "bitcoin" : chain === "ethereum" ? "ethereum" : "solana";
  return `${scheme}:${a}${qs ? "?" + qs : ""}`;
}

function Page() {
  const [chain, setChain] = useState<Chain>("bitcoin");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [label, setLabel] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setErr(null);
      if (!address.trim()) { setDataUrl(null); return; }
      try {
        const { default: QRCode } = await import("qrcode");
        const uri = buildUri(chain, address, amount, label);
        const canvas = canvasRef.current;
        if (canvas) await QRCode.toCanvas(canvas, uri, { width: 320, margin: 2, errorCorrectionLevel: "M" });
        const url = await QRCode.toDataURL(uri, { width: 640, margin: 2, errorCorrectionLevel: "M" });
        if (!cancelled) setDataUrl(url);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Could not generate QR code.");
      }
    }
    run();
    return () => { cancelled = true; };
  }, [chain, address, amount, label]);

  return (
    <ToolLayout slug="wallet-qr-code">
      <div className="soft-card p-5 sm:p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="font-medium">Chain</span>
            <select value={chain} onChange={(e) => setChain(e.target.value as Chain)} className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-3 min-h-12">
              <option value="bitcoin">Bitcoin</option>
              <option value="ethereum">Ethereum</option>
              <option value="solana">Solana</option>
            </select>
          </label>
          <label className="block">
            <span className="font-medium">Amount (optional)</span>
            <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.01" className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm" />
          </label>
        </div>
        <label className="block">
          <span className="font-medium">Wallet address</span>
          <input value={address} onChange={(e) => setAddress(e.target.value)} spellCheck={false} placeholder="Paste the receiving address" className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm" />
        </label>
        <label className="block">
          <span className="font-medium">Label (optional)</span>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Coffee fund" maxLength={80} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3" />
        </label>

        {err && <ErrorBox>{err}</ErrorBox>}

        <div className="rounded-2xl border border-border bg-card p-5 flex flex-col items-center gap-3">
          <canvas ref={canvasRef} className="rounded-lg bg-white" aria-label="Wallet QR preview" />
          {!address.trim() && <p className="text-sm text-muted-foreground">Paste an address above to see your QR.</p>}
          {dataUrl && (
            <a href={dataUrl} download={`${chain}-wallet-qr.png`} className="inline-flex items-center gap-2 min-h-12 px-5 rounded-xl bg-primary text-primary-foreground font-medium">
              <Download className="size-4" /> Download PNG
            </a>
          )}
        </div>
      </div>
      <HowItWorks>
        <p>Pick a chain, paste the receiving address, and (optionally) add an amount and label. We build the standard wallet URI and turn it into a QR locally — perfect for invoices, posters and tip jars.</p>
      </HowItWorks>
    </ToolLayout>
  );
}
