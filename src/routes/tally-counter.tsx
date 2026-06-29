import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Minus, RotateCcw, Trash2 } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/tally-counter")({
  head: () => ({
    meta: [
      { title: "Tally Counter — Free Online Click Counter (Multi)" },
      { name: "description", content: "Count anything: people, reps, inventory, birds. Multiple labeled counters, keyboard shortcuts and saved sessions. Works offline." },
      { property: "og:title", content: "Tally Counter — Bluebird" },
      { property: "og:description", content: "Multiple counters, keyboard shortcuts, autosave." },
      { property: "og:url", content: "/tally-counter" },
    ],
    links: [{ rel: "canonical", href: "/tally-counter" }],
  }),
  component: Page,
});

type Counter = { id: string; label: string; value: number; step: number };
const KEY = "bluebird.tally.counters.v1";

function load(): Counter[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [{ id: crypto.randomUUID(), label: "Counter 1", value: 0, step: 1 }];
}

function Page() {
  const [items, setItems] = useState<Counter[]>(() => (typeof window === "undefined" ? [] : load()));
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!items.length) return;
      const id = activeId ?? items[0].id;
      if (e.key === " " || e.key === "+" || e.key === "ArrowUp") { e.preventDefault(); bump(id, +1); }
      else if (e.key === "-" || e.key === "ArrowDown") { e.preventDefault(); bump(id, -1); }
      else if (e.key.toLowerCase() === "r") { reset(id); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items, activeId]);

  function bump(id: string, dir: number) {
    setItems((arr) => arr.map((c) => c.id === id ? { ...c, value: Math.max(0, c.value + dir * c.step) } : c));
  }
  function reset(id: string) { setItems((arr) => arr.map((c) => c.id === id ? { ...c, value: 0 } : c)); }
  function remove(id: string) { setItems((arr) => arr.filter((c) => c.id !== id)); }
  function add() {
    setItems((arr) => [...arr, { id: crypto.randomUUID(), label: `Counter ${arr.length + 1}`, value: 0, step: 1 }]);
  }
  function rename(id: string, label: string) {
    setItems((arr) => arr.map((c) => c.id === id ? { ...c, label } : c));
  }
  function setStep(id: string, step: number) {
    setItems((arr) => arr.map((c) => c.id === id ? { ...c, step: Math.max(1, step) } : c));
  }

  const total = items.reduce((a, b) => a + b.value, 0);

  return (
    <ToolLayout slug="tally-counter">
      <div className="space-y-5">
        <div className="soft-card p-4 sm:p-5 flex flex-wrap items-center gap-3 justify-between">
          <div>
            <div className="eyebrow">Grand total</div>
            <div className="font-display text-3xl tabular-nums">{total}</div>
          </div>
          <button onClick={add} className="min-h-11 px-4 rounded-xl bg-primary text-primary-foreground font-semibold inline-flex items-center gap-2">
            <Plus className="size-4" /> Add counter
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((c) => (
            <div key={c.id} onClick={() => setActiveId(c.id)}
              className={["soft-card p-5 space-y-4 cursor-pointer transition",
                activeId === c.id ? "ring-2 ring-primary" : "hover:border-primary"].join(" ")}>
              <div className="flex items-center gap-2">
                <input value={c.label} onChange={(e) => rename(c.id, e.target.value)}
                  className="min-h-10 flex-1 bg-transparent border-b border-border focus:border-primary focus:outline-none font-display text-lg" />
                <button onClick={(e) => { e.stopPropagation(); remove(c.id); }} aria-label={`Delete ${c.label}`}
                  className="size-9 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 grid place-items-center">
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="text-center font-display text-6xl tabular-nums py-2 select-none">{c.value}</div>
              <div className="grid grid-cols-[1fr_auto_1fr] gap-2">
                <button onClick={(e) => { e.stopPropagation(); bump(c.id, -1); }} aria-label="Decrease"
                  className="min-h-14 rounded-xl border border-border bg-card hover:border-primary inline-flex items-center justify-center">
                  <Minus className="size-6" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); reset(c.id); }} aria-label="Reset"
                  className="min-h-14 px-3 rounded-xl border border-border bg-card hover:border-primary inline-flex items-center justify-center text-sm">
                  <RotateCcw className="size-4" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); bump(c.id, +1); }} aria-label="Increase"
                  className="min-h-14 rounded-xl bg-primary text-primary-foreground inline-flex items-center justify-center">
                  <Plus className="size-6" />
                </button>
              </div>
              <label className="flex items-center justify-between text-sm text-muted-foreground">
                Step
                <input type="number" min={1} max={1000} value={c.step}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setStep(c.id, parseInt(e.target.value) || 1)}
                  className="ml-2 w-20 min-h-9 rounded-lg border border-border bg-card px-2 tabular-nums focus:outline-none focus:ring-2 focus:ring-ring" />
              </label>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            Tip: tap a counter to make it active, then use <kbd className="px-1.5 py-0.5 rounded border border-border bg-card">Space</kbd> or <kbd className="px-1.5 py-0.5 rounded border border-border bg-card">↑</kbd> to count, <kbd className="px-1.5 py-0.5 rounded border border-border bg-card">↓</kbd> to undo, <kbd className="px-1.5 py-0.5 rounded border border-border bg-card">R</kbd> to reset.
          </p>
        )}
      </div>

      <HowItWorks>
        <li>Tap the big + to count, the – to undo, and R to reset.</li>
        <li>Add as many counters as you need — name each one.</li>
        <li>Your counters are saved on this device automatically.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
