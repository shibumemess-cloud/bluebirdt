import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, RotateCw, Shuffle, ChevronLeft, ChevronRight } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/flash-cards")({
  head: () => ({
    meta: [
      { title: "Free Flash Cards — Make and Study Decks" },
      { name: "description", content: "Create flash card decks and study them with shuffle and progress tracking. Saved locally — no signup, no uploads." },
      { property: "og:title", content: "Flash Cards — Bluebird" },
      { property: "og:description", content: "Build, shuffle and study flash cards in your browser." },
    ],
    links: [{ rel: "canonical", href: "/flash-cards" }],
  }),
  component: Page,
});

type Card = { q: string; a: string };
const STORAGE = "bluebird:flash-cards";

function Page() {
  const [cards, setCards] = useState<Card[]>([
    { q: "Capital of France", a: "Paris" }, { q: "H2O is the formula for…", a: "Water" },
  ]);
  const [mode, setMode] = useState<"edit" | "study">("edit");
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    try { const s = localStorage.getItem(STORAGE); if (s) setCards(JSON.parse(s)); } catch { /* ignore */ }
  }, []);
  useEffect(() => { try { localStorage.setItem(STORAGE, JSON.stringify(cards)); } catch { /* ignore */ } }, [cards]);

  function update(i: number, patch: Partial<Card>) { setCards((a) => a.map((c, j) => (j === i ? { ...c, ...patch } : c))); }
  function shuffle() { setCards((a) => [...a].sort(() => Math.random() - 0.5)); setIdx(0); setShow(false); }
  function reset() { setIdx(0); setShow(false); }

  return (
    <ToolLayout slug="flash-cards">
      <div className="soft-card p-5 sm:p-6 space-y-4">
        <div role="radiogroup" aria-label="Mode" className="inline-flex rounded-xl border border-border p-1 bg-background">
          {(["edit", "study"] as const).map((m) => (
            <button key={m} role="radio" aria-checked={mode === m} onClick={() => { setMode(m); reset(); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === m ? "bg-primary text-primary-foreground" : ""}`}>
              {m === "edit" ? "Edit deck" : `Study (${cards.length})`}
            </button>
          ))}
        </div>

        {mode === "edit" ? (
          <div className="space-y-2">
            {cards.map((c, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start">
                <textarea value={c.q} onChange={(e) => update(i, { q: e.target.value })} placeholder="Question / front" rows={2} className="rounded-xl border border-border bg-background px-3 py-2" />
                <textarea value={c.a} onChange={(e) => update(i, { a: e.target.value })} placeholder="Answer / back" rows={2} className="rounded-xl border border-border bg-background px-3 py-2" />
                <button onClick={() => setCards((a) => a.filter((_, j) => j !== i))} aria-label="Delete card" className="p-2 text-muted-foreground hover:text-rose-600"><Trash2 className="size-4" /></button>
              </div>
            ))}
            <button onClick={() => setCards((a) => [...a, { q: "", a: "" }])} className="inline-flex items-center gap-2 text-sm text-primary font-semibold"><Plus className="size-4" /> Add card</button>
          </div>
        ) : cards.length === 0 ? (
          <p className="text-muted-foreground">Add cards in the Edit tab first.</p>
        ) : (
          <div className="space-y-4">
            <div className="text-xs text-muted-foreground tabular-nums">Card {idx + 1} of {cards.length}</div>
            <button onClick={() => setShow((s) => !s)} className="w-full rounded-2xl border border-border bg-primary-soft text-foreground min-h-56 p-8 text-2xl text-center font-display leading-snug focus-visible:ring-2 ring-ring">
              {show ? cards[idx].a : cards[idx].q || "(empty)"}
              <div className="text-xs text-muted-foreground mt-4 font-sans">Tap to flip</div>
            </button>
            <div className="grid grid-cols-4 gap-2">
              <button onClick={() => { setIdx((i) => (i - 1 + cards.length) % cards.length); setShow(false); }} className="min-h-11 rounded-xl border border-border inline-flex items-center justify-center gap-1"><ChevronLeft className="size-4" /> Prev</button>
              <button onClick={() => { setIdx((i) => (i + 1) % cards.length); setShow(false); }} className="min-h-11 rounded-xl border border-border inline-flex items-center justify-center gap-1">Next <ChevronRight className="size-4" /></button>
              <button onClick={shuffle} className="min-h-11 rounded-xl border border-border inline-flex items-center justify-center gap-1"><Shuffle className="size-4" /> Shuffle</button>
              <button onClick={reset} className="min-h-11 rounded-xl border border-border inline-flex items-center justify-center gap-1"><RotateCw className="size-4" /> Restart</button>
            </div>
          </div>
        )}
      </div>
      <HowItWorks>
        <p>Build your deck in the Edit tab, then switch to Study to flip through cards. Shuffle for spaced repetition. Your deck is saved to this browser only — nothing is uploaded.</p>
      </HowItWorks>
    </ToolLayout>
  );
}
