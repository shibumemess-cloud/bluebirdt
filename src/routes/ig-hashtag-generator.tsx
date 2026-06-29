import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { Field, HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/ig-hashtag-generator")({
  head: () => ({
    meta: [
      { title: "Instagram Hashtag Generator — Free Curated by Topic" },
      { name: "description", content: "Pick a topic and get a balanced mix of popular, medium and niche Instagram hashtags. Copy 30 in one tap. No login, no upload." },
      { property: "og:title", content: "Instagram Hashtag Generator — Bluebird" },
      { property: "og:description", content: "Smart hashtag mix for any Instagram topic." },
      { property: "og:url", content: "/ig-hashtag-generator" },
    ],
    links: [{ rel: "canonical", href: "/ig-hashtag-generator" }],
  }),
  component: Page,
});

// Curated, evergreen hashtags. Three tiers per topic:
// popular = millions of posts, hard to rank · medium = mid-volume, balanced ·
// niche = small but targeted, easiest reach.
type Topic = {
  id: string; label: string;
  popular: string[]; medium: string[]; niche: string[];
};

const TOPICS: Topic[] = [
  { id: "travel", label: "Travel",
    popular: ["travel","travelgram","instatravel","wanderlust","traveling","traveler","vacation","trip","adventure","explore"],
    medium: ["travelphotography","travelblogger","traveltheworld","passportready","worldtraveler","traveldiaries","beautifuldestinations","traveltheglobe","backpacking","roadtrip"],
    niche: ["hiddengems","slowtravel","solofemaletravel","traveltips","offthebeatenpath","localexperience","traveljournal","weekendescape","mindfultravel","wanderfolk"],
  },
  { id: "food", label: "Food",
    popular: ["food","foodporn","foodie","instafood","foodgasm","yummy","delicious","foodphotography","foodlover","tasty"],
    medium: ["homecooking","easyrecipes","foodblogger","cookingathome","whatsonmyplate","comfortfood","foodstyling","eatlocal","foodietravel","weeknightdinner"],
    niche: ["realfoodrecipes","onepanmeals","seasonaleating","budgetmeals","mealprepideas","tinykitchen","oneskilletmeal","heritagecooking","everydaybaking","slowfoodmovement"],
  },
  { id: "fitness", label: "Fitness",
    popular: ["fitness","fit","workout","gym","fitfam","fitnessmotivation","training","health","healthy","strong"],
    medium: ["homeworkout","strengthtraining","fitnessjourney","workoutroutine","getfit","fitnesslife","fitover40","trainsmart","mobilitymatters","everydayathlete"],
    niche: ["beginnergains","mindfulmovement","gentlestrength","walkingforhealth","postpartumfitness","quietstrength","bodyweightonly","trainforyou","sustainablefitness","fitnessforlife"],
  },
  { id: "fashion", label: "Fashion & Style",
    popular: ["fashion","style","ootd","outfit","fashionista","fashionblogger","streetstyle","lookbook","fashionable","stylish"],
    medium: ["everydaystyle","capsulewardrobe","minimalstyle","fashioninspo","outfitoftheday","stylediaries","modeststyle","thrifted","secondhandstyle","slowfashion"],
    niche: ["personalstyleblog","wearitagain","loveyourcloset","sustainablestyle","timelesswardrobe","30wearschallenge","independentdesigner","considereddesign","slowstyle","quietluxury"],
  },
  { id: "photography", label: "Photography",
    popular: ["photography","photo","photographer","photooftheday","instaphoto","picoftheday","photoshoot","pictureoftheday","photolovers","photogram"],
    medium: ["streetphotography","portraitphotography","landscapephotography","naturephotography","photoediting","mobilephotography","filmphotography","lightandshadow","compositionmatters","photodiary"],
    niche: ["35mmfilm","grainisgood","everydaymagic","stillsfromlife","quietphotography","slowphotography","framesofmind","photoasdiary","walkandshoot","singleimage"],
  },
  { id: "smallbusiness", label: "Small Business",
    popular: ["smallbusiness","supportsmallbusiness","shopsmall","entrepreneur","handmade","businessowner","startup","womaninbusiness","etsy","handcrafted"],
    medium: ["smallbusinesslove","madebyhand","shoplocal","independentbusiness","makersgonnamake","onlinestore","craftedwithlove","behindthescenes","businessjourney","mindfulbusiness"],
    niche: ["slowmade","studiolife","makersmovement","ethicalbusiness","localmakers","quietluxurybrand","oneofakindfind","handsathework","intentionalbusiness","slowmaker"],
  },
  { id: "art", label: "Art & Illustration",
    popular: ["art","artist","artwork","drawing","illustration","painting","sketch","instaart","artoftheday","artistsoninstagram"],
    medium: ["artprocess","sketchbook","contemporaryart","worksonpaper","linework","colorstudy","artistsupportingartists","gouachepainting","watercolour","mixedmedia"],
    niche: ["dailydoodle","studiojournal","slowart","everydayart","tinyart","quietart","handlettered","creativeprocess","drawingdaily","artaspractice"],
  },
  { id: "beauty", label: "Beauty",
    popular: ["beauty","makeup","skincare","mua","beautyblogger","makeupartist","instabeauty","makeuplover","skincareroutine","glow"],
    medium: ["softglam","everydaymakeup","cleanbeauty","barefacedconfidence","skinfirst","minimalmakeup","makeuptutorial","skincarecommunity","beautytips","beautyaddict"],
    niche: ["nomakeupmakeup","skinpositivity","fragrancecommunity","fragranceaddict","slowbeauty","mindfulbeauty","handsoffmyface","quietbeauty","skincaresimplified","cleanproducts"],
  },
  { id: "wellness", label: "Wellness",
    popular: ["wellness","selfcare","mindfulness","meditation","yoga","mentalhealth","selflove","healing","mindset","positivity"],
    medium: ["wellnessjourney","mindfullife","slowliving","intentionalliving","journaling","yogaeveryday","breathwork","selfcaresunday","wellnesstips","gratitudepractice"],
    niche: ["quietmornings","softlife","gentleliving","nervoussystemhealth","slowsundays","mindfulrituals","tinyhabits","seasonalliving","walkingmeditation","journalingpractice"],
  },
  { id: "home", label: "Home & Interior",
    popular: ["home","interior","interiordesign","homedecor","homedesign","homeinspo","interiorinspo","interiorstyle","decor","mycozyhome"],
    medium: ["smallspaceliving","minimalhome","scandinavianstyle","japandi","cozyhomes","plantsofinstagram","rentersfriendly","midcenturymodern","slowhome","homestyling"],
    niche: ["lifeunstyled","slowdecor","quietluxuryhome","everydayhome","apartmenttherapy","collectedhome","intentionalhome","plantcornergoals","seasonalstyling","heirloomhome"],
  },
];

const COUNTS: { id: "balanced30" | "small15" | "all"; label: string; pop: number; med: number; nic: number }[] = [
  { id: "balanced30", label: "Balanced 30", pop: 8, med: 12, nic: 10 },
  { id: "small15", label: "Light 15", pop: 4, med: 6, nic: 5 },
  { id: "all", label: "All 30", pop: 10, med: 10, nic: 10 },
];

function Page() {
  const [topicId, setTopicId] = useState(TOPICS[0].id);
  const [countId, setCountId] = useState<typeof COUNTS[number]["id"]>("balanced30");
  const [extra, setExtra] = useState("");
  const [copied, setCopied] = useState(false);

  const topic = TOPICS.find((t) => t.id === topicId)!;
  const count = COUNTS.find((c) => c.id === countId)!;

  const tags = useMemo(() => {
    const pop = topic.popular.slice(0, count.pop);
    const med = topic.medium.slice(0, count.med);
    const nic = topic.niche.slice(0, count.nic);
    const extras = extra.split(/[\s,]+/).filter(Boolean).map((t) => t.replace(/^#/, "").toLowerCase());
    const seen = new Set<string>();
    return [...pop, ...med, ...nic, ...extras].filter((t) => (seen.has(t) ? false : (seen.add(t), true)));
  }, [topic, count, extra]);

  const text = tags.map((t) => `#${t}`).join(" ");

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true); setTimeout(() => setCopied(false), 1500);
    } catch { /* */ }
  }

  return (
    <ToolLayout slug="ig-hashtag-generator">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 md:col-span-7 space-y-6">
          <Field label="Topic" hint="Pick what your post is about.">
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((t) => (
                <button key={t.id} type="button" onClick={() => setTopicId(t.id)}
                  className={`min-h-11 px-4 rounded-full border text-sm font-medium ${topicId === t.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary/40"}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="How many" hint="Instagram allows up to 30 hashtags per post.">
            <div className="grid grid-cols-3 gap-2">
              {COUNTS.map((c) => (
                <button key={c.id} type="button" onClick={() => setCountId(c.id)}
                  className={`min-h-12 rounded-xl border text-sm font-medium ${countId === c.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary/40"}`}>
                  {c.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Add your own (optional)" hint="Comma or space separated, with or without #.">
            <input value={extra} onChange={(e) => setExtra(e.target.value)}
              placeholder="brandname, mycity, productname"
              className="w-full min-h-12 rounded-xl border border-border bg-card px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </Field>

          <HowItWorks>
            Hashtags are picked from a curated, evergreen list grouped by reach (popular, medium, niche). A balanced
            mix gives your post a chance with both broad and targeted audiences. Nothing is sent anywhere.
          </HowItWorks>
        </div>

        <aside className="col-span-12 md:col-span-5">
          <div className="soft-card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <span className="eyebrow">Your hashtags · {tags.length}</span>
              <button type="button" onClick={copy}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline min-h-10 px-2">
                {copied ? <><Check className="size-4" /> Copied</> : <><Copy className="size-4" /> Copy all</>}
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span key={t} className="inline-flex items-center rounded-full bg-primary/10 text-primary border border-primary/20 px-3 py-1 text-sm">#{t}</span>
              ))}
            </div>
            <pre className="mt-5 text-sm bg-muted/40 rounded-xl p-4 whitespace-pre-wrap break-words border border-border">{text}</pre>
          </div>
        </aside>
      </div>
    </ToolLayout>
  );
}
