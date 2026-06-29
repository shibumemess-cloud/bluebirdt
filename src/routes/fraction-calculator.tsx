import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/fraction-calculator")({
  head: () => ({
    meta: [
      { title: "Fraction Calculator — Free Online Add, Subtract, Multiply & Divide" },
      { name: "description", content: "Add, subtract, multiply or divide fractions and mixed numbers. Simplified result, decimal value and step-by-step work shown." },
      { property: "og:title", content: "Fraction Calculator — Bluebird" },
      { property: "og:description", content: "Fast fraction math with simplified results." },
      { property: "og:url", content: "/fraction-calculator" },
    ],
    links: [{ rel: "canonical", href: "/fraction-calculator" }],
  }),
  component: Page,
});

type Op = "+" | "-" | "×" | "÷";

function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a || 1;
}

function simplify(n: number, d: number) {
  if (d === 0) return { n: NaN, d: 1 };
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(Math.round(n), Math.round(d));
  return { n: Math.round(n) / g, d: Math.round(d) / g };
}

function mixedToImproper(whole: string, num: string, den: string) {
  const w = parseInt(whole || "0", 10) || 0;
  const n = parseInt(num || "0", 10) || 0;
  const d = parseInt(den || "1", 10) || 1;
  const sign = w < 0 ? -1 : 1;
  return { n: sign * (Math.abs(w) * d + n), d };
}

function compute(a: { n: number; d: number }, b: { n: number; d: number }, op: Op) {
  switch (op) {
    case "+": return simplify(a.n * b.d + b.n * a.d, a.d * b.d);
    case "-": return simplify(a.n * b.d - b.n * a.d, a.d * b.d);
    case "×": return simplify(a.n * b.n, a.d * b.d);
    case "÷": return simplify(a.n * b.d, a.d * b.n);
  }
}

function toMixed(n: number, d: number) {
  if (!isFinite(n / d)) return null;
  const sign = (n < 0) !== (d < 0) ? -1 : 1;
  const an = Math.abs(n), ad = Math.abs(d);
  const whole = Math.floor(an / ad);
  const rem = an % ad;
  return { sign, whole, n: rem, d: ad };
}

function Box({ label, w, n, d, on }: { label: string; w: string; n: string; d: string; on: (p: { w?: string; n?: string; d?: string }) => void; }) {
  return (
    <div className="soft-card p-4 space-y-2">
      <div className="eyebrow">{label}</div>
      <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 items-center">
        <input value={w} onChange={(e) => on({ w: e.target.value })} aria-label={`${label} whole`}
          placeholder="0" inputMode="numeric"
          className="min-h-12 px-3 rounded-lg border border-border bg-card text-center text-lg font-mono" />
        <input value={n} onChange={(e) => on({ n: e.target.value })} aria-label={`${label} numerator`}
          placeholder="num" inputMode="numeric"
          className="min-h-12 px-3 rounded-lg border border-border bg-card text-center text-lg font-mono" />
        <input value={d} onChange={(e) => on({ d: e.target.value })} aria-label={`${label} denominator`}
          placeholder="den" inputMode="numeric"
          className="min-h-12 px-3 rounded-lg border border-border bg-card text-center text-lg font-mono" />
      </div>
      <div className="text-xs text-muted-foreground">Whole · Numerator · Denominator (leave whole blank for plain fractions)</div>
    </div>
  );
}

function Page() {
  const [a, setA] = useState({ w: "", n: "1", d: "2" });
  const [b, setB] = useState({ w: "", n: "1", d: "3" });
  const [op, setOp] = useState<Op>("+");

  const result = useMemo(() => {
    const A = mixedToImproper(a.w, a.n, a.d);
    const B = mixedToImproper(b.w, b.n, b.d);
    if (!A.d || !B.d) return null;
    const r = compute(A, B, op);
    if (!isFinite(r.n) || !isFinite(r.d)) return null;
    return { ...r, decimal: r.n / r.d, mixed: toMixed(r.n, r.d) };
  }, [a, b, op]);

  const copy = (v: string) => navigator.clipboard.writeText(v);
  const fracStr = result ? `${result.n}/${result.d}` : "";
  const mixedStr = result?.mixed
    ? result.mixed.whole === 0
      ? `${result.mixed.sign < 0 ? "-" : ""}${result.mixed.n}/${result.mixed.d}`
      : result.mixed.n === 0
        ? `${result.mixed.sign * result.mixed.whole}`
        : `${result.mixed.sign < 0 ? "-" : ""}${result.mixed.whole} ${result.mixed.n}/${result.mixed.d}`
    : "";

  return (
    <ToolLayout slug="fraction-calculator">
      <div className="grid lg:grid-cols-[1fr_120px_1fr] gap-4 items-end">
        <Box label="Fraction A" w={a.w} n={a.n} d={a.d} on={(p) => setA({ ...a, ...p })} />
        <label className="soft-card p-4">
          <div className="eyebrow mb-1">Operation</div>
          <select value={op} onChange={(e) => setOp(e.target.value as Op)}
            className="w-full min-h-12 px-3 rounded-lg border border-border bg-card text-center text-xl font-mono">
            {(["+", "-", "×", "÷"] as Op[]).map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
        <Box label="Fraction B" w={b.w} n={b.n} d={b.d} on={(p) => setB({ ...b, ...p })} />
      </div>

      <div className="soft-card p-5 mt-5">
        <div className="eyebrow mb-2">Result</div>
        {!result || !isFinite(result.decimal) ? (
          <div role="alert" className="text-destructive text-sm">Enter valid numbers (denominators can't be zero).</div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-3">
            <Cell label="Simplified" value={fracStr} onCopy={() => copy(fracStr)} big />
            <Cell label="Mixed number" value={mixedStr} onCopy={() => copy(mixedStr)} />
            <Cell label="Decimal" value={result.decimal.toFixed(6).replace(/\.?0+$/, "")} onCopy={() => copy(String(result.decimal))} />
          </div>
        )}
      </div>

      <HowItWorks>
        <li>Type the two fractions — leave the whole number blank for plain fractions like 1/2.</li>
        <li>Pick add, subtract, multiply or divide.</li>
        <li>The simplified, mixed and decimal result all show instantly.</li>
      </HowItWorks>
    </ToolLayout>
  );
}

function Cell({ label, value, onCopy, big }: { label: string; value: string; onCopy: () => void; big?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-between mb-1">
        <div className="eyebrow">{label}</div>
        <button onClick={onCopy} className="text-xs inline-flex items-center gap-1 hover:text-primary"><Copy className="size-3" /> Copy</button>
      </div>
      <div className={`font-mono break-all ${big ? "text-3xl text-primary" : "text-lg"}`}>{value}</div>
    </div>
  );
}
