import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { Field, HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/yt-hashtag-generator")({
  head: () => ({
    meta: [
      { title: "YouTube Hashtag Generator — Trending tags by niche" },
      { name: "description", content: "Get a smart mix of broad, mid-tail and niche YouTube hashtags for your video — copy them straight into your title or description." },
      { property: "og:title", content: "YouTube Hashtag Generator — Bluebird" },
      { property: "og:description", content: "Generate 15 YouTube hashtags built for reach." },
      { property: "og:url", content: "/yt-hashtag-generator" },
    ],
    links: [{ rel: "canonical", href: "/yt-hashtag-generator" }],
  }),
  component: Page,
});

type Niche = keyof typeof BANK;

const BANK = {
  general: { broad: ["youtube", "youtuber", "viral", "trending", "video"], mid: ["contentcreator", "youtubechannel", "subscribe", "creator", "newvideo"], niche: ["smallyoutuber", "youtubelife", "supportcreators"] },
  gaming: { broad: ["gaming", "gamer", "twitch", "gameplay", "esports"], mid: ["letsplay", "gamingcommunity", "gamingvideos", "youtubegaming"], niche: ["smallstreamer", "indiegamer", "speedrun"] },
  tech: { broad: ["tech", "technology", "gadgets", "review", "unboxing"], mid: ["techreview", "techtips", "techyoutuber", "techcommunity"], niche: ["techdeals", "geargear", "techlife"] },
  beauty: { broad: ["beauty", "makeup", "skincare", "mua", "tutorial"], mid: ["beautyguru", "makeuptutorial", "beautyblogger", "skincaretips"], niche: ["cleanbeauty", "kbeauty", "everydaymakeup"] },
  fitness: { broad: ["fitness", "workout", "gym", "training", "health"], mid: ["fitnessmotivation", "homeworkout", "fitnesstips", "wellness"], niche: ["fitover40", "bodyweighttraining", "calisthenics"] },
  cooking: { broad: ["cooking", "food", "recipe", "foodie", "homecook"], mid: ["easyrecipes", "cookingvideo", "foodblogger", "yummy"], niche: ["onepotmeals", "budgetcooking", "mealprepideas"] },
  vlog: { broad: ["vlog", "vlogger", "dailyvlog", "lifestyle", "vlogs"], mid: ["dayinmylife", "vlogging", "lifevlog", "storytime"], niche: ["minivlog", "slowliving", "morningvlog"] },
  music: { broad: ["music", "musician", "song", "newmusic", "cover"], mid: ["musicvideo", "musiccover", "originalmusic", "songwriter"], niche: ["bedroompop", "loficover", "indieartist"] },
  education: { broad: ["education", "learn", "study", "school", "edutainment"], mid: ["studytips", "onlinelearning", "studentlife", "learnenglish"], niche: ["studywithme", "examprep", "selflearning"] },
  shorts: { broad: ["shorts", "youtubeshorts", "shortsvideo", "viralshorts"], mid: ["shortsfeed", "shortsbeta", "shortsyoutube"], niche: ["shortsclip", "shortstrending", "ytshorts"] },
};

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generate(topic: string, niche: Niche, seed: number): string[] {
  const bank = BANK[niche];
  const cleanTopic = topic.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
  const words = cleanTopic.split(/\s+/).filter(Boolean);
  const fromTopic: string[] = [];
  if (words.length) {
    fromTopic.push(words.join(""));
    if (words.length > 1) fromTopic.push(words.map((w) => w[0].toUpperCase() + w.slice(1)).join(""));
    for (const w of words) if (w.length > 2) fromTopic.push(w);
  }
  const broad = shuffle(bank.broad, seed).slice(0, 4);
  const mid = shuffle(bank.mid, seed + 1).slice(0, 5);
  const nicheTags = shuffle(bank.niche, seed + 2).slice(0, 3);
  return Array.from(new Set([...fromTopic.slice(0, 3), ...broad, ...mid, ...nicheTags])).slice(0, 15);
}

function Page() {
  const [topic, setTopic] = useState("davinci resolve tutorial");
  const [niche, setNiche] = useState<Niche>("tech");
  const [seed, setSeed] = useState(1);
  const [copied, setCopied] = useState(false);
  const [copiedOne, setCopiedOne] = useState<string | null>(null);

  const tags = useMemo(() => generate(topic, niche, seed), [topic, niche, seed]);
  const block = tags.map((t) => `#${t}`).join(" ");

  async function copyAll() {
    try { await navigator.clipboard.writeText(block); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch { /* */ }
  }
  async function copyOne(t: string) {
    try { await navigator.clipboard.writeText(`#${t}`); setCopiedOne(t); setTimeout(() => setCopiedOne(null), 1200); } catch { /* */ }
  }

  return (
    <ToolLayout slug="yt-hashtag-generator">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 md:col-span-7 space-y-5">
          <Field label="Video topic" hint="A few words that describe what your video is about.">
            <input value={topic} onChange={(e) => setTopic(e.target.value)}
              className="w-full min-h-12 rounded-xl border border-border bg-card px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </Field>

          <Field label="Niche">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(BANK) as Niche[]).map((k) => (
                <button key={k} type="button" onClick={() => setNiche(k)}
                  className={`min-h-11 px-4 rounded-full border text-sm font-medium capitalize ${niche === k ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary/40"}`}>
                  {k}
                </button>
              ))}
            </div>
          </Field>

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setSeed((s) => s + 1)}
              className="inline-flex items-center gap-2 min-h-12 px-5 rounded-xl border border-border bg-card hover:border-primary/40 text-sm font-semibold">
              <RefreshCw className="size-4" /> Shuffle tags
            </button>
            <button type="button" onClick={copyAll}
              className="inline-flex items-center gap-2 min-h-12 px-5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 text-sm font-semibold">
              {copied ? <><Check className="size-4" /> Copied all</> : <><Copy className="size-4" /> Copy all 15</>}
            </button>
          </div>

          <HowItWorks>
            YouTube shows the first three hashtags from your description above the video title. We mix
            three sizes of tags — broad reach, mid-tail and niche — so you're discoverable without
            sounding generic. Put the top three at the very end of your description.
          </HowItWorks>
        </div>

        <aside className="col-span-12 md:col-span-5">
          <div className="soft-card p-5 sm:p-6">
            <span className="eyebrow">{tags.length} hashtags</span>
            <ul className="mt-3 flex flex-wrap gap-2">
              {tags.map((t) => (
                <li key={t}>
                  <button type="button" onClick={() => copyOne(t)}
                    className="inline-flex items-center gap-1.5 min-h-10 px-3 rounded-full border border-border bg-card hover:border-primary/40 text-sm font-medium">
                    #{t}
                    {copiedOne === t ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5 text-muted-foreground" />}
                  </button>
                </li>
              ))}
            </ul>
            <pre className="mt-4 text-xs font-mono whitespace-pre-wrap break-words bg-background rounded-lg p-3 border border-border">{block}</pre>
          </div>
        </aside>
      </div>
    </ToolLayout>
  );
}
