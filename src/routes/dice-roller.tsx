import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Dices, RotateCcw } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/dice-roller")({
  head: () => ({
    meta: [
      { title: "Dice Roller — Roll D4, D6, D8, D10, D12, D20, D100 Free" },
      { name: "description", content: "Roll any number and type of dice with a true random source. Great for board games, RPGs and quick decisions." },
      { property: "og:title", content: "Dice Roller — Bluebird" },
      { property: "og:description", content: "Roll D6, D20 and more with cryptographic randomness." },
      { property: "og:url", content: "/dice-roller" },
    ],
    links: [{ rel: "canonical", href: "/dice-roller" }],
  }),
  component: Page,
});

const SIDES = [4, 6, 8, 10, 12, 20, 100];

function secureInt(max: number): number {
  const buf = new Uint32Array(1);
  const limit = Math.floor(0xffffffff / max) * max;
  let n = 0;
  do { crypto.getRandomValues(buf); n = buf[0]; } while (n >= limit);
  return (n % max) + 1;
}

function Page() {
  const [sides, setSides] = useState(6);
  const [count, setCount] = useState(2);
  const [rolls, setRolls] = useState<number[]>([]);
  const [history, setHistory] = useState<{ sides: number; rolls: number[]; total: number }[]>([]);

  function roll() {
    const r: number[] = [];
    for (let i = 0; i < count; i++) r.push(secureInt(sides));
    setRolls(r);
    setHistory((h) => [{ sides, rolls: r, total: r.reduce((a, b) => a + b, 0) }, ...h].slice(0, 12));
  }

  const total = rolls.reduce((a, b) => a + b, 0);

  return (
    <ToolLayout slug="dice-roller">
      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-5">
          <div>
            <div className="eyebrow mb-2">Die type</div>
            <div className="flex flex-wrap gap-2">
              {SIDES.map((s) => (
                <button key={s} onClick={() => setSides(s)} aria-pressed={sides === s}
                  className={["min-h-11 px-4 rounded-xl text-sm font-semibold border tabular-nums",
                    sides === s ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary"].join(" ")}>
                  d{s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="dr-c" className="eyebrow">How many dice (1–20)</label>
            <input id="dr-c" type="number" min={1} max={20} value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
              className="mt-1.5 w-full min-h-12 rounded-xl border border-border bg-card px-3 tabular-nums focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <button onClick={roll} className="w-full min-h-12 rounded-xl bg-primary text-primary-foreground font-semibold inline-flex items-center justify-center gap-2 hover:shadow-lift hover:-translate-y-0.5">
            <Dices className="size-5" /> Roll {count}d{sides}
          </button>
          {history.length > 0 && (
            <button onClick={() => { setHistory([]); setRolls([]); }} className="w-full min-h-10 rounded-lg border border-border bg-card/50 text-sm text-muted-foreground hover:text-primary inline-flex items-center justify-center gap-1.5">
              <RotateCcw className="size-4" /> Clear history
            </button>
          )}
        </section>

        <section className="soft-card p-5 sm:p-6">
          <div className="eyebrow">Latest roll</div>
          {rolls.length === 0 ? (
            <div className="mt-6 text-center text-muted-foreground">Press Roll to begin.</div>
          ) : (
            <>
              <div className="mt-4 flex flex-wrap gap-3">
                {rolls.map((r, i) => (
                  <div key={i} className="grid place-items-center size-16 rounded-2xl bg-primary-soft border border-border font-display text-3xl tabular-nums text-primary">
                    {r}
                  </div>
                ))}
              </div>
              <div className="mt-4 font-display text-2xl">Total: <span className="tabular-nums">{total}</span></div>
            </>
          )}
          {history.length > 0 && (
            <div className="mt-6">
              <div className="eyebrow mb-2">History</div>
              <ul className="space-y-1 text-sm text-muted-foreground max-h-56 overflow-y-auto">
                {history.map((h, i) => (
                  <li key={i} className="tabular-nums">
                    {h.rolls.length}d{h.sides}: [{h.rolls.join(", ")}] = <strong className="text-foreground">{h.total}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>

      <HowItWorks>
        <li>Pick a die type (d6 for board games, d20 for RPGs).</li>
        <li>Choose how many to roll at once and tap Roll.</li>
        <li>Rolls use your browser's cryptographic randomness for fairness.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
