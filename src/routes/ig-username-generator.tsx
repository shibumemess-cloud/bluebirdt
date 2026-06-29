import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { Field, HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/ig-username-generator")({
  head: () => ({
    meta: [
      { title: "Instagram Username Generator — Aesthetic & Unique" },
      { name: "description", content: "Type your name and get 60+ Instagram username ideas — aesthetic, short, themed and creative. No login, no upload." },
      { property: "og:title", content: "Instagram Username Generator — Bluebird" },
      { property: "og:description", content: "Find a unique Instagram handle in seconds." },
      { property: "og:url", content: "/ig-username-generator" },
    ],
    links: [{ rel: "canonical", href: "/ig-username-generator" }],
  }),
  component: Page,
});

const AESTHETIC_PREFIX = ["soft","velvet","honey","cosmic","lunar","moon","ocean","sunset","golden","wild","peachy","cloud","amber","mossy","misty","ember"];
const AESTHETIC_SUFFIX = ["bloom","glow","haze","wave","drift","spell","echo","muse","aura","verse","dust","river","grove","ember","tide","field"];
const VIBE_WORDS = ["xo","___","_","..","official","real","its","the","mx","mr","ms"];
const NUMBERS = ["07","21","23","99","01","11","_","00"];
const NICHES: Record<string, { pre: string[]; suf: string[] }> = {
  general: { pre: [], suf: [] },
  travel: { pre: ["wander","nomad","roam","passport"], suf: ["travels","abroad","journeys","wanders","onroad","map"] },
  food: { pre: ["hungry","crave","spice","bites"], suf: ["eats","kitchen","bites","cravings","plates","cooks"] },
  fitness: { pre: ["fit","strong","iron","lean"], suf: ["fit","trains","lifts","moves","strength","method"] },
  fashion: { pre: ["wears","style","threads"], suf: ["style","wears","fits","wardrobe","closet","threads"] },
  photo: { pre: ["lens","frame","shot","studio"], suf: ["shoots","frames","visuals","studio","captures","lens"] },
  art: { pre: ["studio","ink","draws"], suf: ["draws","paints","studio","makes","creates","sketches"] },
  beauty: { pre: ["glow","beauty","skin"], suf: ["beauty","glow","skin","muse","studio"] },
  music: { pre: ["sound","beats","tunes"], suf: ["sound","beats","music","tunes","studio","records"] },
  gaming: { pre: ["plays","ttv","gg"], suf: ["plays","gaming","ttv","ggs","gg","arena"] },
  business: { pre: ["the","official"], suf: ["co","studio","agency","official","brand","hq"] },
};

const seeded = (seed: number) => () => {
  // Simple deterministic pseudo-random for stable shuffling per refresh.
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};

function unique(arr: string[]) {
  const s = new Set<string>(); const o: string[] = [];
  for (const v of arr) if (!s.has(v)) { s.add(v); o.push(v); }
  return o;
}

function clean(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9._]/g, "");
}

function generate(name: string, niche: keyof typeof NICHES, seed: number): string[] {
  const base = clean(name) || "you";
  const rnd = seeded(seed || 1);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)];
  const n = NICHES[niche];
  const ideas: string[] = [];

  // Direct, with separators.
  ideas.push(base, `${base}_`, `_${base}`, `${base}.`, `.${base}`, `${base}.official`, `the.${base}`, `${base}_xo`);

  // With numbers.
  for (let i = 0; i < 6; i++) ideas.push(`${base}${pick(NUMBERS)}`);
  for (let i = 0; i < 3; i++) ideas.push(`${base}.${pick(NUMBERS)}`);

  // Doubled letters / aesthetic stretches.
  ideas.push(base.replace(/([aeiou])/, "$1$1"));
  ideas.push(`${base}${base.slice(-1)}${base.slice(-1)}`);

  // Aesthetic combos.
  for (let i = 0; i < 6; i++) ideas.push(`${pick(AESTHETIC_PREFIX)}.${base}`);
  for (let i = 0; i < 6; i++) ideas.push(`${base}.${pick(AESTHETIC_SUFFIX)}`);
  for (let i = 0; i < 4; i++) ideas.push(`${pick(AESTHETIC_PREFIX)}${base}${pick(AESTHETIC_SUFFIX)}`);

  // Niche flavored.
  if (niche !== "general") {
    for (const p of n.pre) ideas.push(`${p}.${base}`, `${p}${base}`);
    for (const s of n.suf) ideas.push(`${base}.${s}`, `${base}${s}`);
  }

  // Vibe modifiers.
  for (const v of VIBE_WORDS) ideas.push(`${v}.${base}`, `${base}.${v}`);

  // Reverse + leet-ish.
  const rev = base.split("").reverse().join("");
  ideas.push(rev, `${rev}.co`);
  ideas.push(base.replace(/o/g, "0"), base.replace(/i/g, "1"));

  return unique(ideas.map(clean).filter((s) => s.length >= 3 && s.length <= 30)).slice(0, 60);
}

function Page() {
  const [name, setName] = useState("alex");
  const [niche, setNiche] = useState<keyof typeof NICHES>("general");
  const [seed, setSeed] = useState(1);
  const [copied, setCopied] = useState<string | null>(null);

  const ideas = useMemo(() => generate(name, niche, seed), [name, niche, seed]);

  async function copy(t: string) {
    try {
      await navigator.clipboard.writeText(t);
      setCopied(t); setTimeout(() => setCopied(null), 1200);
    } catch { /* */ }
  }

  return (
    <ToolLayout slug="ig-username-generator">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 md:col-span-7 space-y-6">
          <Field label="Your name or word" hint="A first name, brand or anything you want at the core of your handle.">
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={20}
              className="w-full min-h-12 rounded-xl border border-border bg-card px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </Field>

          <Field label="Vibe / niche">
            <div className="flex flex-wrap gap-2">
              {Object.keys(NICHES).map((k) => (
                <button key={k} type="button" onClick={() => setNiche(k as keyof typeof NICHES)}
                  className={`min-h-11 px-4 rounded-full border text-sm font-medium capitalize ${niche === k ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary/40"}`}>
                  {k}
                </button>
              ))}
            </div>
          </Field>

          <button type="button" onClick={() => setSeed((s) => s + 1)}
            className="inline-flex items-center gap-2 min-h-12 px-5 rounded-xl border border-border bg-card hover:border-primary/40 text-sm font-semibold">
            <RefreshCw className="size-4" /> Shuffle ideas
          </button>

          <HowItWorks>
            We can't check Instagram availability without an account login — but we can spin up dozens of clean,
            aesthetic and niche-flavored ideas based on your name. Tap any one to copy it, then check it in the
            Instagram app's sign-up screen.
          </HowItWorks>
        </div>

        <aside className="col-span-12 md:col-span-5">
          <div className="soft-card p-5 sm:p-6">
            <span className="eyebrow">{ideas.length} ideas</span>
            <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ideas.map((t) => (
                <li key={t}>
                  <button type="button" onClick={() => copy(t)}
                    className="w-full text-left min-h-11 px-3 rounded-lg border border-border bg-card hover:border-primary/40 flex items-center justify-between gap-2 text-sm">
                    <span className="truncate font-medium">@{t}</span>
                    {copied === t ? <Check className="size-4 text-primary shrink-0" /> : <Copy className="size-4 text-muted-foreground shrink-0" />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </ToolLayout>
  );
}
