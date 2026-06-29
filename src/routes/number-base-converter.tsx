import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Copy, Check, Binary } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks, WarnBox } from "../components/ToolControls";
import { parseInBase, toBase, type Base } from "../lib/extra-tools-helpers";

export const Route = createFileRoute("/number-base-converter")({
  head: () => ({
    meta: [
      { title: "Number Base Converter — Binary, Octal, Decimal, Hex" },
      { name: "description", content: "Convert numbers between binary, octal, decimal and hexadecimal in your browser. Big-number safe, free, no sign-up." },
      { property: "og:title", content: "Number Base Converter — Bluebird" },
      { property: "og:description", content: "Convert between binary, octal, decimal and hex. Big-number safe, in-browser." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/number-base-converter" },
    ],
    links: [{ rel: "canonical", href: "/number-base-converter" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Bluebird Number Base Converter",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any (Web)",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      }),
    }],
  }),
  component: Page,
});

const BASES: { value: Base; label: string; placeholder: string }[] = [
  { value: 2, label: "Binary", placeholder: "1010" },
  { value: 8, label: "Octal", placeholder: "755" },
  { value: 10, label: "Decimal", placeholder: "255" },
  { value: 16, label: "Hex", placeholder: "ff" },
];

function Page() {
  const [from, setFrom] = useState<Base>(10);
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState<Base | null>(null);

  const parsed = useMemo(() => parseInBase(input, from), [input, from]);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(null), 1200);
    return () => window.clearTimeout(t);
  }, [copied]);

  async function copy(value: string, base: Base) {
    await navigator.clipboard.writeText(value);
    setCopied(base);
  }

  return (
    <ToolLayout slug="number-base-converter">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-4">
          <div role="radiogroup" aria-label="Input base" className="inline-flex p-1 rounded-xl bg-muted">
            {BASES.map((b) => (
              <button
                key={b.value}
                role="radio"
                aria-checked={from === b.value}
                onClick={() => setFrom(b.value)}
                className={`min-h-9 px-3 rounded-lg text-sm font-medium ${from === b.value ? "bg-card shadow-soft" : "text-muted-foreground"}`}
              >
                {b.label}
              </button>
            ))}
          </div>

          <label htmlFor="nbc-in" className="eyebrow block">Value in base {from}</label>
          <input
            id="nbc-in"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={BASES.find((b) => b.value === from)!.placeholder}
            className="w-full min-h-12 rounded-xl border border-border bg-card px-3 font-mono text-base focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {parsed.error && <WarnBox>{parsed.error}</WarnBox>}
          <p className="text-xs text-muted-foreground">
            Negative numbers are supported. Big numbers use arbitrary precision — no overflow.
          </p>
        </section>

        <section className="soft-card p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Binary className="size-4 text-primary" />
            <div className="font-display text-lg">All bases</div>
          </div>
          <ul className="space-y-2">
            {BASES.map((b) => {
              const value = parsed.n !== null ? toBase(parsed.n, b.value) : "";
              const display = b.value === 16 ? value.toUpperCase() : value;
              return (
                <li key={b.value} className="rounded-xl border border-border bg-card p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-muted-foreground">{b.label} (base {b.value})</div>
                    <button
                      onClick={() => display && copy(display, b.value)}
                      disabled={!display}
                      className="inline-flex items-center gap-1.5 min-h-8 px-2.5 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs disabled:opacity-50"
                    >
                      {copied === b.value ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                      {copied === b.value ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div className="mt-1 font-mono text-sm break-all" aria-live="polite">
                    {display || <span className="text-muted-foreground">—</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <HowItWorks>
        <li>Pick which base you're starting from.</li>
        <li>Type a number — every other base updates instantly.</li>
        <li>Tap Copy next to the format you need.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
