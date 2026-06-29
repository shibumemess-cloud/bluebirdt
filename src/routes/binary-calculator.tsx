import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/binary-calculator")({
  head: () => ({
    meta: [
      { title: "Binary Calculator — Free Online Binary, Hex & Decimal Math" },
      { name: "description", content: "Add, subtract, multiply and divide binary, decimal or hex numbers. See results in binary, decimal and hex side-by-side." },
      { property: "og:title", content: "Binary Calculator — Bluebird" },
      { property: "og:description", content: "Binary arithmetic in your browser." },
      { property: "og:url", content: "/binary-calculator" },
    ],
    links: [{ rel: "canonical", href: "/binary-calculator" }],
  }),
  component: Page,
});

type Base = "bin" | "dec" | "hex";
type Op = "+" | "-" | "*" | "/" | "%" | "&" | "|" | "^" | "<<" | ">>";

const RADIX: Record<Base, number> = { bin: 2, dec: 10, hex: 16 };

function parseBig(v: string, base: Base): bigint | null {
  const t = v.trim().replace(/^0[bxBX]/, "");
  if (!t) return null;
  const valid = base === "bin" ? /^-?[01]+$/ : base === "dec" ? /^-?\d+$/ : /^-?[0-9a-fA-F]+$/;
  if (!valid.test(t)) return null;
  try {
    const neg = t.startsWith("-");
    const body = neg ? t.slice(1) : t;
    let acc = 0n;
    const r = BigInt(RADIX[base]);
    for (const ch of body) acc = acc * r + BigInt(parseInt(ch, RADIX[base]));
    return neg ? -acc : acc;
  } catch { return null; }
}

function compute(a: bigint, b: bigint, op: Op): bigint | string {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return b === 0n ? "Cannot divide by zero" : a / b;
    case "%": return b === 0n ? "Cannot divide by zero" : a % b;
    case "&": return a & b;
    case "|": return a | b;
    case "^": return a ^ b;
    case "<<": return a << b;
    case ">>": return a >> b;
  }
}

function Page() {
  const [base, setBase] = useState<Base>("bin");
  const [a, setA] = useState("1010");
  const [b, setB] = useState("1100");
  const [op, setOp] = useState<Op>("+");

  const result = useMemo(() => {
    const pa = parseBig(a, base);
    const pb = parseBig(b, base);
    if (pa === null || pb === null) return { ok: false as const, msg: "Enter valid numbers for the selected base." };
    const r = compute(pa, pb, op);
    if (typeof r === "string") return { ok: false as const, msg: r };
    return { ok: true as const, value: r };
  }, [a, b, op, base]);

  const copy = (v: string) => navigator.clipboard.writeText(v);

  return (
    <ToolLayout slug="binary-calculator">
      <div className="soft-card p-4 sm:p-5 mb-5 flex flex-wrap gap-3 items-end">
        <label className="text-sm">
          <div className="eyebrow mb-1">Input base</div>
          <select value={base} onChange={(e) => setBase(e.target.value as Base)}
            className="min-h-10 px-3 rounded-lg border border-border bg-card">
            <option value="bin">Binary (base 2)</option>
            <option value="dec">Decimal (base 10)</option>
            <option value="hex">Hex (base 16)</option>
          </select>
        </label>
      </div>

      <div className="soft-card p-4 sm:p-5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_110px_1fr] gap-3 items-end">
          <label className="text-sm">
            <div className="eyebrow mb-1">A</div>
            <input value={a} onChange={(e) => setA(e.target.value)} aria-label="First number"
              className="w-full min-h-12 px-3 rounded-lg border border-border bg-card font-mono" />
          </label>
          <label className="text-sm">
            <div className="eyebrow mb-1">Operation</div>
            <select value={op} onChange={(e) => setOp(e.target.value as Op)}
              className="w-full min-h-12 px-3 rounded-lg border border-border bg-card font-mono">
              {(["+", "-", "*", "/", "%", "&", "|", "^", "<<", ">>"] as Op[]).map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <div className="eyebrow mb-1">B</div>
            <input value={b} onChange={(e) => setB(e.target.value)} aria-label="Second number"
              className="w-full min-h-12 px-3 rounded-lg border border-border bg-card font-mono" />
          </label>
        </div>

        {!result.ok ? (
          <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 text-destructive p-3 text-sm">{result.msg}</div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-3 pt-2">
            {(["bin", "dec", "hex"] as Base[]).map((bb) => {
              const v = bb === "dec" ? result.value.toString(10)
                : bb === "bin" ? (result.value < 0n ? "-" + (-result.value).toString(2) : result.value.toString(2))
                : (result.value < 0n ? "-" + (-result.value).toString(16).toUpperCase() : result.value.toString(16).toUpperCase());
              return (
                <div key={bb} className="rounded-xl border border-border bg-card p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="eyebrow">{bb === "bin" ? "Binary" : bb === "dec" ? "Decimal" : "Hex"}</div>
                    <button onClick={() => copy(v)} className="text-xs inline-flex items-center gap-1 hover:text-primary">
                      <Copy className="size-3" /> Copy
                    </button>
                  </div>
                  <div className="font-mono text-sm break-all">{v}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <HowItWorks>
        <li>Pick the base your numbers are written in (binary, decimal or hex).</li>
        <li>Enter two values and choose an operator — bitwise ops are included.</li>
        <li>The result is shown in all three bases. Tap any value to copy it.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
