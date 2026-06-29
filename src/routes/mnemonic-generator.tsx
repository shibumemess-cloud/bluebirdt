import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/mnemonic-generator")({
  head: () => ({
    meta: [
      { title: "Mnemonic Generator — Memorable Phrases from Any Words" },
      { name: "description", content: "Turn a list or acronym into memorable mnemonic sentences. Great for studying, lists and remembering passwords by phrase." },
      { property: "og:title", content: "Mnemonic Generator — Bluebird" },
      { property: "og:description", content: "Generate mnemonic sentences from your words." },
    ],
    links: [{ rel: "canonical", href: "/mnemonic-generator" }],
  }),
  component: Page,
});

const POOL: Record<string, string[]> = {
  a: ["Astronauts","Apples","Angry","Adventurous","Amazing"],
  b: ["Bears","Bake","Bright","Brilliant","Busy"],
  c: ["Cats","Climb","Calm","Curious","Cheerful"],
  d: ["Dogs","Dance","Daring","Determined","Dreamy"],
  e: ["Elephants","Eat","Eager","Elegant","Energetic"],
  f: ["Foxes","Fly","Fearless","Friendly","Fancy"],
  g: ["Giraffes","Giggle","Gentle","Generous","Glowing"],
  h: ["Horses","Hike","Happy","Helpful","Hungry"],
  i: ["Iguanas","Inspect","Inventive","Inquisitive","Icy"],
  j: ["Jaguars","Jump","Jolly","Jealous","Juicy"],
  k: ["Kangaroos","Kick","Kind","Keen","Knightly"],
  l: ["Lions","Laugh","Lovely","Loyal","Lucky"],
  m: ["Monkeys","March","Mighty","Merry","Mysterious"],
  n: ["Newts","Nibble","Nice","Noble","Nimble"],
  o: ["Otters","Observe","Open","Optimistic","Orange"],
  p: ["Pandas","Paint","Polite","Proud","Playful"],
  q: ["Quokkas","Quiver","Quiet","Quick","Quirky"],
  r: ["Rabbits","Run","Royal","Ready","Radiant"],
  s: ["Snakes","Sing","Silly","Smart","Speedy"],
  t: ["Tigers","Travel","Tall","Thoughtful","Tireless"],
  u: ["Unicorns","Unite","Unusual","Upbeat","Useful"],
  v: ["Vultures","Visit","Vivid","Valiant","Vibrant"],
  w: ["Wolves","Wander","Warm","Wise","Wild"],
  x: ["Xerus","Xerox","eXcited","eXtra","eXpert"],
  y: ["Yaks","Yell","Young","Yummy","Yearning"],
  z: ["Zebras","Zoom","Zealous","Zen","Zippy"],
};

function pick(letter: string, seed: number) {
  const list = POOL[letter.toLowerCase()] || [letter.toUpperCase()];
  return list[seed % list.length];
}

function Page() {
  const [mode, setMode] = useState<"acronym" | "list">("acronym");
  const [input, setInput] = useState("HOMES");
  const [seed, setSeed] = useState(0);

  const phrases = useMemo(() => {
    const letters = mode === "acronym"
      ? input.replace(/[^a-zA-Z]/g, "").split("")
      : input.split(/[\n,]/).map((w) => w.trim()).filter(Boolean).map((w) => w[0]);
    if (letters.length === 0) return [] as string[];
    return [0, 1, 2].map((k) => letters.map((l, i) => pick(l, seed + k + i * 7)).join(" "));
  }, [input, mode, seed]);

  return (
    <ToolLayout slug="mnemonic-generator">
      <div className="soft-card p-5 sm:p-6 space-y-4">
        <div role="radiogroup" aria-label="Mode" className="inline-flex rounded-xl border border-border p-1 bg-background">
          {([
            ["acronym", "Acronym"],
            ["list", "Word list"],
          ] as const).map(([m, l]) => (
            <button key={m} role="radio" aria-checked={mode === m} onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === m ? "bg-primary text-primary-foreground" : ""}`}>{l}</button>
          ))}
        </div>
        <label className="block">
          <span className="text-sm font-medium">{mode === "acronym" ? "Letters or acronym" : "Words (one per line or comma‑separated)"}</span>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={3}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2"
            placeholder={mode === "acronym" ? "PEMDAS" : "Pluto, Venus, Mars"} />
        </label>
        <button onClick={() => setSeed((s) => s + 1)} className="inline-flex items-center gap-2 min-h-11 px-4 rounded-xl border border-border"><RefreshCw className="size-4" /> Try different words</button>

        <div className="space-y-2">
          {phrases.length === 0 ? (
            <p className="text-muted-foreground">Enter letters or words above to generate mnemonic phrases.</p>
          ) : phrases.map((p, i) => (
            <div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-primary-soft/40 p-3">
              <span className="font-display text-lg">{p}</span>
              <button onClick={() => navigator.clipboard.writeText(p)} aria-label="Copy phrase" className="p-2 rounded-lg hover:bg-card"><Copy className="size-4" /></button>
            </div>
          ))}
        </div>
      </div>
      <HowItWorks>
        <p>Type an acronym (like HOMES for the Great Lakes) or a list of words, and we'll build memorable phrases using the first letter of each. Tap "Try different words" for fresh ideas.</p>
      </HowItWorks>
    </ToolLayout>
  );
}
