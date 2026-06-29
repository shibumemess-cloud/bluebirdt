import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, Delete } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/scientific-calculator")({
  head: () => ({
    meta: [
      { title: "Scientific Calculator — Free Online with Trig, Log & Memory" },
      { name: "description", content: "A free online scientific calculator with sin, cos, tan, log, ln, powers, roots, factorial, pi and parentheses. Keyboard friendly." },
      { property: "og:title", content: "Scientific Calculator — Bluebird" },
      { property: "og:description", content: "Trig, logs, powers and memory in a clean keypad." },
      { property: "og:url", content: "/scientific-calculator" },
    ],
    links: [{ rel: "canonical", href: "/scientific-calculator" }],
  }),
  component: Page,
});

// Safe expression evaluator using a tokenizer + shunting-yard.
// Supports: + - * / ^ %, parentheses, unary minus, functions and constants.

type Token = { t: "num"; v: number } | { t: "op"; v: string } | { t: "fn"; v: string } | { t: "lp" } | { t: "rp" } | { t: "comma" };

const FUNCS: Record<string, (...a: number[]) => number> = {
  sin: (x) => Math.sin(x), cos: (x) => Math.cos(x), tan: (x) => Math.tan(x),
  asin: (x) => Math.asin(x), acos: (x) => Math.acos(x), atan: (x) => Math.atan(x),
  ln: (x) => Math.log(x), log: (x) => Math.log10(x), log2: (x) => Math.log2(x),
  sqrt: (x) => Math.sqrt(x), cbrt: (x) => Math.cbrt(x), abs: (x) => Math.abs(x),
  exp: (x) => Math.exp(x), fact: (x) => { if (x < 0 || x !== Math.floor(x) || x > 170) return NaN; let r = 1; for (let i = 2; i <= x; i++) r *= i; return r; },
};

const PREC: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2, "%": 2, "^": 3, "u-": 4 };
const RIGHT = new Set(["^", "u-"]);

function tokenize(input: string, degrees: boolean): Token[] {
  const out: Token[] = [];
  let i = 0;
  const src = input.replace(/\s+/g, "").replace(/π/g, "(pi)").replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");
  while (i < src.length) {
    const c = src[i];
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < src.length && /[0-9.eE+\-]/.test(src[j])) {
        // allow e+/e- only after digit
        if ((src[j] === "+" || src[j] === "-") && !(j > i && /[eE]/.test(src[j - 1]))) break;
        j++;
      }
      const num = parseFloat(src.slice(i, j));
      if (isNaN(num)) throw new Error("Bad number");
      out.push({ t: "num", v: num }); i = j; continue;
    }
    if (/[a-zA-Z]/.test(c)) {
      let j = i;
      while (j < src.length && /[a-zA-Z0-9]/.test(src[j])) j++;
      const name = src.slice(i, j).toLowerCase();
      if (name === "pi") out.push({ t: "num", v: Math.PI });
      else if (name === "e") out.push({ t: "num", v: Math.E });
      else if (FUNCS[name]) {
        if (degrees && ["sin", "cos", "tan"].includes(name)) {
          // wrap argument in deg→rad later; mark with special name
          out.push({ t: "fn", v: name + "_deg" });
        } else if (degrees && ["asin", "acos", "atan"].includes(name)) {
          out.push({ t: "fn", v: name + "_deg" });
        } else out.push({ t: "fn", v: name });
      } else throw new Error("Unknown name: " + name);
      i = j; continue;
    }
    if (c === "(") { out.push({ t: "lp" }); i++; continue; }
    if (c === ")") { out.push({ t: "rp" }); i++; continue; }
    if ("+-*/%^".includes(c)) {
      const prev = out[out.length - 1];
      if (c === "-" && (!prev || prev.t === "op" || prev.t === "lp" || prev.t === "comma")) {
        out.push({ t: "op", v: "u-" });
      } else out.push({ t: "op", v: c });
      i++; continue;
    }
    if (c === "!") { out.push({ t: "fn", v: "fact_post" }); i++; continue; }
    throw new Error("Bad character: " + c);
  }
  return out;
}

function evalTokens(tokens: Token[], degrees: boolean): number {
  // Shunting-yard to RPN, handling postfix factorial.
  const out: Token[] = [];
  const stack: Token[] = [];
  for (const tk of tokens) {
    if (tk.t === "num") out.push(tk);
    else if (tk.t === "fn") {
      if (tk.v === "fact_post") {
        // postfix: apply immediately to top of output as a function call.
        out.push({ t: "fn", v: "fact_call" });
      } else stack.push(tk);
    }
    else if (tk.t === "lp") stack.push(tk);
    else if (tk.t === "rp") {
      while (stack.length && stack[stack.length - 1].t !== "lp") out.push(stack.pop()!);
      if (!stack.length) throw new Error("Mismatched )");
      stack.pop();
      if (stack.length && stack[stack.length - 1].t === "fn") out.push(stack.pop()!);
    } else if (tk.t === "op") {
      while (stack.length) {
        const top = stack[stack.length - 1];
        if (top.t === "op" && (PREC[top.v] > PREC[tk.v] || (PREC[top.v] === PREC[tk.v] && !RIGHT.has(tk.v)))) {
          out.push(stack.pop()!);
        } else break;
      }
      stack.push(tk);
    }
  }
  while (stack.length) {
    const t = stack.pop()!;
    if (t.t === "lp") throw new Error("Mismatched (");
    out.push(t);
  }

  const eval$: number[] = [];
  for (const tk of out) {
    if (tk.t === "num") eval$.push(tk.v);
    else if (tk.t === "op") {
      if (tk.v === "u-") { eval$.push(-eval$.pop()!); continue; }
      const b = eval$.pop()!, a = eval$.pop()!;
      switch (tk.v) {
        case "+": eval$.push(a + b); break;
        case "-": eval$.push(a - b); break;
        case "*": eval$.push(a * b); break;
        case "/": eval$.push(a / b); break;
        case "%": eval$.push(a % b); break;
        case "^": eval$.push(Math.pow(a, b)); break;
      }
    } else if (tk.t === "fn") {
      const x = eval$.pop()!;
      const base = tk.v.replace(/_deg$/, "").replace(/_call$/, "");
      const isDeg = tk.v.endsWith("_deg");
      const fnName = base === "fact" ? "fact" : base;
      const fn = FUNCS[fnName];
      if (!fn) throw new Error("Unknown fn " + fnName);
      if (isDeg && ["sin", "cos", "tan"].includes(fnName)) eval$.push(fn(x * Math.PI / 180));
      else if (isDeg && ["asin", "acos", "atan"].includes(fnName)) eval$.push(fn(x) * 180 / Math.PI);
      else eval$.push(fn(x));
    }
  }
  if (eval$.length !== 1) throw new Error("Bad expression");
  return eval$[0];
}

const KEYS: { l: string; v: string; cls?: string }[][] = [
  [{ l: "sin", v: "sin(" }, { l: "cos", v: "cos(" }, { l: "tan", v: "tan(" }, { l: "π", v: "π" }, { l: "e", v: "e" }],
  [{ l: "x²", v: "^2" }, { l: "x^y", v: "^" }, { l: "√", v: "sqrt(" }, { l: "ln", v: "ln(" }, { l: "log", v: "log(" }],
  [{ l: "(", v: "(" }, { l: ")", v: ")" }, { l: "!", v: "!" }, { l: "%", v: "%" }, { l: "÷", v: "÷", cls: "bg-primary/10" }],
  [{ l: "7", v: "7" }, { l: "8", v: "8" }, { l: "9", v: "9" }, { l: "×", v: "×", cls: "bg-primary/10" }, { l: "−", v: "-", cls: "bg-primary/10" }],
  [{ l: "4", v: "4" }, { l: "5", v: "5" }, { l: "6", v: "6" }, { l: "+", v: "+", cls: "bg-primary/10" }, { l: "1/x", v: "1/(" }],
  [{ l: "1", v: "1" }, { l: "2", v: "2" }, { l: "3", v: "3" }, { l: "0", v: "0" }, { l: ".", v: "." }],
];

function Page() {
  const [expr, setExpr] = useState("");
  const [degrees, setDegrees] = useState(true);
  const [history, setHistory] = useState<{ e: string; r: string }[]>([]);

  const result = useMemo(() => {
    if (!expr.trim()) return "";
    try {
      const r = evalTokens(tokenize(expr, degrees), degrees);
      if (!isFinite(r)) return "Error";
      return String(parseFloat(r.toPrecision(12)));
    } catch { return "…"; }
  }, [expr, degrees]);

  const push = (s: string) => setExpr((e) => e + s);
  const equals = useCallback(() => {
    if (!expr.trim()) return;
    try {
      const r = evalTokens(tokenize(expr, degrees), degrees);
      if (!isFinite(r)) return;
      const v = String(parseFloat(r.toPrecision(12)));
      setHistory((h) => [{ e: expr, r: v }, ...h].slice(0, 12));
      setExpr(v);
    } catch { /* ignore */ }
  }, [expr, degrees]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "=") { e.preventDefault(); equals(); }
      else if (e.key === "Backspace") setExpr((s) => s.slice(0, -1));
      else if (e.key === "Escape") setExpr("");
      else if (/^[0-9+\-*/().%^!]$/.test(e.key)) setExpr((s) => s + e.key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [equals]);

  return (
    <ToolLayout slug="scientific-calculator">
      <div className="grid lg:grid-cols-[1fr_280px] gap-4">
        <div className="soft-card p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex rounded-lg border border-border bg-card text-sm overflow-hidden">
              <button onClick={() => setDegrees(true)} className={`px-3 min-h-10 ${degrees ? "bg-primary text-primary-foreground" : ""}`}>DEG</button>
              <button onClick={() => setDegrees(false)} className={`px-3 min-h-10 ${!degrees ? "bg-primary text-primary-foreground" : ""}`}>RAD</button>
            </div>
            <button onClick={() => navigator.clipboard.writeText(result || "")} disabled={!result || result === "Error"}
              className="text-sm inline-flex items-center gap-1 hover:text-primary disabled:opacity-50">
              <Copy className="size-4" /> Copy result
            </button>
          </div>

          <div className="rounded-xl border border-border bg-card p-3 text-right">
            <input value={expr} onChange={(e) => setExpr(e.target.value)} aria-label="Expression"
              placeholder="0"
              className="w-full bg-transparent text-right text-xl font-mono outline-none min-h-10" />
            <div className={`mt-1 font-mono text-3xl tabular-nums ${result === "Error" ? "text-destructive" : "text-primary"}`} aria-live="polite">
              {result || "0"}
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {KEYS.flat().map((k, i) => (
              <button key={i} onClick={() => push(k.v)}
                className={`min-h-12 rounded-lg border border-border bg-card hover:border-primary font-mono text-base ${k.cls ?? ""}`}>
                {k.l}
              </button>
            ))}
            <button onClick={() => setExpr("")} className="min-h-12 rounded-lg border border-border bg-card hover:border-destructive col-span-2">AC</button>
            <button onClick={() => setExpr((s) => s.slice(0, -1))} className="min-h-12 rounded-lg border border-border bg-card hover:border-primary inline-flex items-center justify-center"><Delete className="size-4" /></button>
            <button onClick={equals} className="min-h-12 rounded-lg bg-primary text-primary-foreground font-semibold col-span-2">=</button>
          </div>
        </div>

        <div className="soft-card p-4 h-fit lg:sticky lg:top-24">
          <div className="eyebrow mb-2">History</div>
          {history.length === 0 ? (
            <div className="text-sm text-muted-foreground">Your last calculations will appear here.</div>
          ) : (
            <ul className="space-y-2 text-sm">
              {history.map((h, i) => (
                <li key={i}>
                  <button onClick={() => setExpr(h.r)} className="w-full text-left rounded-lg border border-border bg-card p-2 hover:border-primary">
                    <div className="font-mono text-muted-foreground truncate">{h.e}</div>
                    <div className="font-mono">= {h.r}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <HowItWorks>
        <li>Tap the keypad or type with your keyboard — Enter calculates.</li>
        <li>Switch between DEG and RAD for trig functions at any time.</li>
        <li>Tap any history row to reuse the result in your next calculation.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
