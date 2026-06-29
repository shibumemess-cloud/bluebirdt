import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Printer, Shuffle, Eye, EyeOff } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/sudoku")({
  head: () => ({
    meta: [
      { title: "Sudoku Generator & Solver — Free, Printable" },
      { name: "description", content: "Generate a fresh Sudoku puzzle at four difficulty levels. Print, play on screen, or peek at the solution. Free forever." },
      { property: "og:title", content: "Sudoku — Bluebird" },
      { property: "og:description", content: "Generate and print Sudoku puzzles privately." },
    ],
    links: [{ rel: "canonical", href: "/sudoku" }],
  }),
  component: Page,
});

type Grid = number[];
const SIZE = 9;

function shuffle<T>(a: T[]): T[] { return [...a].sort(() => Math.random() - 0.5); }

function ok(g: Grid, i: number, n: number) {
  const r = Math.floor(i / 9), c = i % 9, br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
  for (let k = 0; k < 9; k++) {
    if (g[r * 9 + k] === n) return false;
    if (g[k * 9 + c] === n) return false;
    if (g[(br + Math.floor(k / 3)) * 9 + (bc + (k % 3))] === n) return false;
  }
  return true;
}
function solve(g: Grid, count = { n: 0 }, limit = 2): boolean {
  const i = g.indexOf(0);
  if (i === -1) { count.n++; return count.n >= limit; }
  for (const n of shuffle([1,2,3,4,5,6,7,8,9])) {
    if (ok(g, i, n)) {
      g[i] = n;
      if (solve(g, count, limit)) return true;
      g[i] = 0;
    }
  }
  return false;
}
function full(): Grid {
  const g: Grid = Array(81).fill(0);
  const c = { n: 0 };
  solve(g, c, 1);
  return g;
}
function uniqueAfterRemove(g: Grid): boolean {
  const copy = [...g];
  const c = { n: 0 };
  solve(copy, c, 2);
  return c.n === 1;
}
function makePuzzle(clues: number): { puzzle: Grid; solution: Grid } {
  const solution = full();
  const puzzle = [...solution];
  const order = shuffle(Array.from({ length: 81 }, (_, i) => i));
  let removed = 0; const target = 81 - clues;
  for (const i of order) {
    if (removed >= target) break;
    const saved = puzzle[i]; puzzle[i] = 0;
    if (uniqueAfterRemove(puzzle)) removed++;
    else puzzle[i] = saved;
  }
  return { puzzle, solution };
}

const LEVELS = { Easy: 40, Medium: 32, Hard: 28, Expert: 24 } as const;
type Level = keyof typeof LEVELS;

function Page() {
  const [level, setLevel] = useState<Level>("Easy");
  const [seed, setSeed] = useState(0);
  const [show, setShow] = useState(false);
  const [entries, setEntries] = useState<Record<number, string>>({});

  const { puzzle, solution } = useMemo(() => makePuzzle(LEVELS[level]), [level, seed]);

  function regen() { setEntries({}); setShow(false); setSeed((s) => s + 1); }

  return (
    <ToolLayout slug="sudoku">
      <style>{`@media print { .no-print { display: none !important; } body { background: white !important; } }`}</style>
      <div className="soft-card p-5 sm:p-6 space-y-4">
        <div className="no-print flex flex-wrap gap-3 items-end">
          <div role="radiogroup" aria-label="Difficulty" className="inline-flex rounded-xl border border-border p-1 bg-background">
            {(Object.keys(LEVELS) as Level[]).map((l) => (
              <button key={l} role="radio" aria-checked={level === l} onClick={() => { setLevel(l); regen(); }}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${level === l ? "bg-primary text-primary-foreground" : ""}`}>{l}</button>
            ))}
          </div>
          <button onClick={regen} className="min-h-11 px-4 rounded-xl border border-border inline-flex items-center gap-2"><Shuffle className="size-4" /> New puzzle</button>
          <button onClick={() => setShow((s) => !s)} className="min-h-11 px-4 rounded-xl border border-border inline-flex items-center gap-2">{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />} {show ? "Hide" : "Show"} solution</button>
          <button onClick={() => window.print()} className="min-h-11 px-4 rounded-xl bg-primary text-primary-foreground inline-flex items-center gap-2"><Printer className="size-4" /> Print</button>
        </div>

        <div className="mx-auto grid grid-cols-9 max-w-md aspect-square border-2 border-foreground rounded-md overflow-hidden">
          {Array.from({ length: 81 }, (_, i) => {
            const r = Math.floor(i / 9), c = i % 9;
            const given = puzzle[i] !== 0;
            const value = show ? solution[i] : given ? puzzle[i] : (entries[i] ? Number(entries[i]) : 0);
            const borderR = c % 3 === 2 && c !== 8 ? "border-r-2 border-r-foreground" : "border-r border-border";
            const borderB = r % 3 === 2 && r !== 8 ? "border-b-2 border-b-foreground" : "border-b border-border";
            return (
              <div key={i} className={`relative flex items-center justify-center bg-background ${borderR} ${borderB} text-base sm:text-xl font-semibold tabular-nums`}>
                {given || show ? (
                  <span className={given ? "" : "text-primary"}>{value || ""}</span>
                ) : (
                  <input
                    aria-label={`Row ${r + 1} column ${c + 1}`}
                    value={entries[i] || ""}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^1-9]/g, "").slice(-1);
                      setEntries((m) => ({ ...m, [i]: v }));
                    }}
                    inputMode="numeric"
                    className="w-full h-full text-center bg-transparent outline-none text-primary focus:bg-primary-soft"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
      <HowItWorks>
        <p>Pick a difficulty and we generate a fresh puzzle with a unique solution. Fill in cells on screen, or print it out for a coffee‑break challenge. Tap Show solution any time.</p>
      </HowItWorks>
    </ToolLayout>
  );
}
