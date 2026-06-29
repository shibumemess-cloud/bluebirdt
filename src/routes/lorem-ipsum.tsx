import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlignLeft, Copy, Check, RefreshCw, Download } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/lorem-ipsum")({
  head: () => ({
    meta: [
      { title: "Lorem Ipsum Generator — Free Placeholder Text Online" },
      { name: "description", content: "Generate Lorem Ipsum paragraphs, sentences or words with one click. Plain text or HTML, copy or download — free and in-browser." },
      { property: "og:title", content: "Lorem Ipsum Generator — Bluebird" },
      { property: "og:description", content: "Free placeholder-text generator with paragraph, sentence and word modes, plus HTML output." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/lorem-ipsum" },
    ],
    links: [{ rel: "canonical", href: "/lorem-ipsum" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird Lorem Ipsum Generator",
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: Page,
});

const WORDS = (
  "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor " +
  "incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud " +
  "exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure " +
  "reprehenderit in voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint " +
  "occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum"
).split(" ");

const CLASSIC = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

type Unit = "paragraphs" | "sentences" | "words";

function pick(rng: () => number): string {
  return WORDS[Math.floor(rng() * WORDS.length)];
}

// Tiny deterministic PRNG (mulberry32) so "Regenerate" is reproducible per-seed
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateSentence(rng: () => number, minWords = 6, maxWords = 14): string {
  const n = minWords + Math.floor(rng() * (maxWords - minWords + 1));
  const parts: string[] = [];
  for (let i = 0; i < n; i++) parts.push(pick(rng));
  let s = parts.join(" ");
  // Sprinkle a comma about a third of the time, after the third word
  if (n > 6 && rng() < 0.35) {
    const arr = s.split(" ");
    arr[2] = arr[2] + ",";
    s = arr.join(" ");
  }
  s = s[0].toUpperCase() + s.slice(1) + ".";
  return s;
}

export function generateParagraph(rng: () => number, minSent = 3, maxSent = 6): string {
  const n = minSent + Math.floor(rng() * (maxSent - minSent + 1));
  const arr: string[] = [];
  for (let i = 0; i < n; i++) arr.push(generateSentence(rng));
  return arr.join(" ");
}

export function generateLorem(
  count: number,
  unit: Unit,
  opts: { startClassic?: boolean; seed?: number } = {},
): string[] {
  const n = Math.max(1, Math.min(200, Math.floor(count) || 1));
  const rng = mulberry32((opts.seed ?? Date.now()) >>> 0);
  if (unit === "words") {
    const words: string[] = [];
    if (opts.startClassic) {
      const seed = CLASSIC.replace(/[.,]/g, "").split(" ");
      while (words.length < n && seed.length) words.push(seed.shift()!);
    }
    while (words.length < n) words.push(pick(rng));
    return [words.slice(0, n).join(" ")];
  }
  if (unit === "sentences") {
    const out: string[] = [];
    for (let i = 0; i < n; i++) {
      if (i === 0 && opts.startClassic) out.push(CLASSIC);
      else out.push(generateSentence(rng));
    }
    return [out.join(" ")];
  }
  // paragraphs
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    if (i === 0 && opts.startClassic) {
      out.push(CLASSIC + " " + generateParagraph(rng, 2, 5));
    } else {
      out.push(generateParagraph(rng));
    }
  }
  return out;
}

const PREF_KEY = "bb-lorem-prefs-v1";

function Page() {
  const [unit, setUnit] = useState<Unit>("paragraphs");
  const [count, setCount] = useState(3);
  const [startClassic, setStartClassic] = useState(true);
  const [asHtml, setAsHtml] = useState(false);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9));
  const [copied, setCopied] = useState(false);
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  // Restore prefs
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREF_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (p.unit === "paragraphs" || p.unit === "sentences" || p.unit === "words") setUnit(p.unit);
        if (typeof p.count === "number") setCount(Math.max(1, Math.min(200, p.count)));
        if (typeof p.startClassic === "boolean") setStartClassic(p.startClassic);
        if (typeof p.asHtml === "boolean") setAsHtml(p.asHtml);
      }
    } catch { /* ignore */ }
    setPrefsLoaded(true);
  }, []);
  useEffect(() => {
    if (!prefsLoaded) return;
    try { localStorage.setItem(PREF_KEY, JSON.stringify({ unit, count, startClassic, asHtml })); } catch { /* ignore */ }
  }, [prefsLoaded, unit, count, startClassic, asHtml]);

  const blocks = useMemo(
    () => generateLorem(count, unit, { startClassic, seed }),
    [count, unit, startClassic, seed],
  );

  const output = useMemo(() => {
    if (asHtml && unit === "paragraphs") return blocks.map((b) => `<p>${b}</p>`).join("\n");
    return blocks.join(unit === "paragraphs" ? "\n\n" : " ");
  }, [blocks, asHtml, unit]);

  const wordCount = useMemo(() => output.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length, [output]);
  const charCount = useMemo(() => output.replace(/<[^>]+>/g, "").length, [output]);

  // Reseed when unit changes so the first render isn't identical-looking
  useEffect(() => { setSeed(Math.floor(Math.random() * 1e9)); }, [unit]);


  async function copyOut() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }
  function download() {
    const ext = asHtml && unit === "paragraphs" ? "html" : "txt";
    const blob = new Blob([output], { type: ext === "html" ? "text/html" : "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `lorem-ipsum-${count}-${unit}.${ext}`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ToolLayout slug="lorem-ipsum">
      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-5 self-start">
          <div>
            <div className="eyebrow mb-2">What to generate</div>
            <div role="radiogroup" aria-label="Unit" className="grid grid-cols-3 p-1 rounded-xl bg-muted">
              {(["paragraphs", "sentences", "words"] as const).map((u) => (
                <button
                  key={u}
                  role="radio"
                  aria-checked={unit === u}
                  onClick={() => setUnit(u)}
                  className={`min-h-10 px-2 rounded-lg text-xs sm:text-sm font-medium capitalize ${unit === u ? "bg-card shadow-soft text-foreground" : "text-muted-foreground"}`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="li-n" className="eyebrow block mb-2">How many?</label>
            <input
              id="li-n"
              type="number"
              min={1}
              max={200}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(200, Number(e.target.value) || 1)))}
              className="w-full min-h-11 rounded-xl border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[1, 3, 5, 10, 25].map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`min-h-8 px-2.5 rounded-lg border text-xs ${count === n ? "border-primary bg-primary-soft text-primary" : "border-border bg-card hover:bg-primary-soft"}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="eyebrow">Options</div>
            <Toggle label="Start with “Lorem ipsum dolor sit amet…”" checked={startClassic} onChange={setStartClassic} />
            <Toggle
              label="Output as <p> HTML"
              checked={asHtml}
              onChange={setAsHtml}
              disabled={unit !== "paragraphs"}
            />
          </div>

          <button
            onClick={() => setSeed(Math.floor(Math.random() * 1e9))}
            className="w-full inline-flex items-center justify-center gap-2 min-h-12 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-95"
          >
            <RefreshCw className="size-4" /> Regenerate
          </button>
        </section>

        <section className="soft-card p-5 sm:p-6 space-y-3 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlignLeft className="size-4 text-primary" />
              <div className="font-display text-lg">Preview <span className="text-sm font-sans text-muted-foreground">· {wordCount} words · {charCount} chars</span></div>
            </div>
            <div className="flex gap-2">
              <button onClick={copyOut} className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs">
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button onClick={download} className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs">
                <Download className="size-3.5" /> {asHtml && unit === "paragraphs" ? ".html" : ".txt"}
              </button>
            </div>
          </div>

          {asHtml && unit === "paragraphs" ? (
            <pre className="max-h-[560px] overflow-auto rounded-xl border border-border bg-card p-4 font-mono text-sm whitespace-pre-wrap break-words">
              {output}
            </pre>
          ) : (
            <div className="max-h-[560px] overflow-auto rounded-xl border border-border bg-card p-4 leading-relaxed text-[15px] space-y-3" aria-live="polite">
              {unit === "paragraphs" ? blocks.map((b, i) => <p key={i}>{b}</p>) : <p>{output}</p>}
            </div>
          )}
        </section>
      </div>

      <HowItWorks>
        <li>Pick paragraphs, sentences or words and how many you need.</li>
        <li>Toggle the classic opener or HTML &lt;p&gt; output to match your needs.</li>
        <li>Hit Copy or download as a .txt or .html file. Click Regenerate any time for fresh text.</li>
      </HowItWorks>
    </ToolLayout>
  );
}

function Toggle({ label, checked, onChange, disabled }: { label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <label className={`flex items-center justify-between gap-3 min-h-11 rounded-xl border border-border bg-card px-3 ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-primary-soft"}`}>
      <span className="text-sm">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4"
        style={{ accentColor: "var(--primary)" }}
      />
    </label>
  );
}
