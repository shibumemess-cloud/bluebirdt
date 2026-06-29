import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, Check, Search, Smile } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/emoji-picker")({
  head: () => ({
    meta: [
      { title: "Emoji Picker — Copy & Paste Emojis Free" },
      { name: "description", content: "Search and copy emojis with one click. Faces, hands, hearts, animals, food, flags and more — works on any device. No sign-up." },
      { property: "og:title", content: "Emoji Picker — Bluebird" },
      { property: "og:description", content: "A fast emoji search and copy tool for social posts, captions and messages." },
      { property: "og:url", content: "/emoji-picker" },
    ],
    links: [{ rel: "canonical", href: "/emoji-picker" }],
  }),
  component: Page,
});

type Emoji = { e: string; k: string[] };
const GROUPS: { name: string; items: Emoji[] }[] = [
  { name: "Smileys", items: [
    { e: "😀", k: ["grin","happy","smile"] },{ e: "😃", k: ["smile","happy"] },{ e: "😄", k: ["smile","joy"] },
    { e: "😁", k: ["beaming","grin"] },{ e: "😆", k: ["laugh","lol"] },{ e: "😂", k: ["joy","laugh","tears"] },
    { e: "🤣", k: ["rofl","rolling","laugh"] },{ e: "😊", k: ["blush","happy"] },{ e: "😇", k: ["angel","halo"] },
    { e: "🙂", k: ["slight","smile"] },{ e: "🙃", k: ["upside","down"] },{ e: "😉", k: ["wink"] },
    { e: "😍", k: ["love","heart","eyes"] },{ e: "🥰", k: ["love","hearts","smile"] },{ e: "😘", k: ["kiss"] },
    { e: "😋", k: ["yum","tongue"] },{ e: "😎", k: ["cool","sunglasses"] },{ e: "🤩", k: ["star","struck"] },
    { e: "🥳", k: ["party","celebrate"] },{ e: "😏", k: ["smirk"] },{ e: "😒", k: ["unamused"] },
    { e: "😞", k: ["sad","disappointed"] },{ e: "😔", k: ["pensive","sad"] },{ e: "😟", k: ["worried"] },
    { e: "😢", k: ["cry","sad","tear"] },{ e: "😭", k: ["sob","cry"] },{ e: "😤", k: ["huff","triumph"] },
    { e: "😡", k: ["angry","mad"] },{ e: "🤬", k: ["swear","angry"] },{ e: "🤯", k: ["mind","blown"] },
    { e: "😳", k: ["flushed","shocked"] },{ e: "🥵", k: ["hot","sweat"] },{ e: "🥶", k: ["cold","freezing"] },
    { e: "🤔", k: ["thinking"] },{ e: "🤫", k: ["shush","quiet"] },{ e: "🤐", k: ["zipper","quiet"] },
    { e: "😴", k: ["sleep","tired"] },{ e: "🤤", k: ["drool"] },{ e: "🤒", k: ["sick"] },{ e: "🤧", k: ["sneeze"] },
  ]},
  { name: "Hands", items: [
    { e: "👍", k: ["thumbs","up","like","approve"] },{ e: "👎", k: ["thumbs","down","dislike"] },{ e: "👏", k: ["clap","applause"] },
    { e: "🙌", k: ["raise","hands","praise"] },{ e: "👐", k: ["open","hands"] },{ e: "🤝", k: ["handshake","deal"] },
    { e: "🙏", k: ["pray","thanks","please"] },{ e: "✌️", k: ["peace","victory"] },{ e: "🤞", k: ["fingers","crossed","luck"] },
    { e: "🤟", k: ["love","you","rock"] },{ e: "🤘", k: ["rock","horns"] },{ e: "👌", k: ["ok","perfect"] },
    { e: "🤙", k: ["call","me","shaka"] },{ e: "👉", k: ["point","right"] },{ e: "👈", k: ["point","left"] },
    { e: "👆", k: ["point","up"] },{ e: "👇", k: ["point","down"] },{ e: "✋", k: ["stop","hand","high","five"] },
    { e: "🤚", k: ["raise","back"] },{ e: "💪", k: ["muscle","strong"] },{ e: "🫶", k: ["heart","hands"] },
  ]},
  { name: "Hearts", items: [
    { e: "❤️", k: ["heart","red","love"] },{ e: "🧡", k: ["heart","orange"] },{ e: "💛", k: ["heart","yellow"] },
    { e: "💚", k: ["heart","green"] },{ e: "💙", k: ["heart","blue"] },{ e: "💜", k: ["heart","purple"] },
    { e: "🖤", k: ["heart","black"] },{ e: "🤍", k: ["heart","white"] },{ e: "🤎", k: ["heart","brown"] },
    { e: "💖", k: ["heart","sparkle"] },{ e: "💗", k: ["heart","growing"] },{ e: "💓", k: ["heart","beating"] },
    { e: "💞", k: ["hearts","revolving"] },{ e: "💕", k: ["hearts","two"] },{ e: "💘", k: ["heart","arrow","cupid"] },
    { e: "💝", k: ["heart","gift","ribbon"] },{ e: "💔", k: ["heart","broken"] },{ e: "❣️", k: ["heart","exclamation"] },
  ]},
  { name: "Animals", items: [
    { e: "🐶", k: ["dog","puppy"] },{ e: "🐱", k: ["cat","kitten"] },{ e: "🐭", k: ["mouse"] },{ e: "🐹", k: ["hamster"] },
    { e: "🐰", k: ["rabbit","bunny"] },{ e: "🦊", k: ["fox"] },{ e: "🐻", k: ["bear"] },{ e: "🐼", k: ["panda"] },
    { e: "🐨", k: ["koala"] },{ e: "🐯", k: ["tiger"] },{ e: "🦁", k: ["lion"] },{ e: "🐮", k: ["cow"] },
    { e: "🐷", k: ["pig"] },{ e: "🐸", k: ["frog"] },{ e: "🐵", k: ["monkey"] },{ e: "🙈", k: ["see","no","evil"] },
    { e: "🐔", k: ["chicken"] },{ e: "🐧", k: ["penguin"] },{ e: "🐦", k: ["bird"] },{ e: "🐤", k: ["chick","baby"] },
    { e: "🦆", k: ["duck"] },{ e: "🦅", k: ["eagle"] },{ e: "🦉", k: ["owl"] },{ e: "🐺", k: ["wolf"] },
    { e: "🐗", k: ["boar"] },{ e: "🐴", k: ["horse"] },{ e: "🦄", k: ["unicorn"] },{ e: "🐝", k: ["bee"] },
    { e: "🐛", k: ["bug","caterpillar"] },{ e: "🦋", k: ["butterfly"] },{ e: "🐢", k: ["turtle"] },{ e: "🐍", k: ["snake"] },
    { e: "🐙", k: ["octopus"] },{ e: "🦑", k: ["squid"] },{ e: "🦀", k: ["crab"] },{ e: "🐳", k: ["whale"] },
  ]},
  { name: "Food", items: [
    { e: "🍎", k: ["apple","red","fruit"] },{ e: "🍌", k: ["banana"] },{ e: "🍇", k: ["grapes"] },{ e: "🍓", k: ["strawberry"] },
    { e: "🍑", k: ["peach"] },{ e: "🍒", k: ["cherries"] },{ e: "🍍", k: ["pineapple"] },{ e: "🥭", k: ["mango"] },
    { e: "🥑", k: ["avocado"] },{ e: "🍅", k: ["tomato"] },{ e: "🌽", k: ["corn"] },{ e: "🥕", k: ["carrot"] },
    { e: "🍞", k: ["bread"] },{ e: "🥐", k: ["croissant"] },{ e: "🧀", k: ["cheese"] },{ e: "🍔", k: ["burger"] },
    { e: "🍟", k: ["fries"] },{ e: "🍕", k: ["pizza"] },{ e: "🌭", k: ["hot","dog"] },{ e: "🌮", k: ["taco"] },
    { e: "🌯", k: ["burrito"] },{ e: "🍣", k: ["sushi"] },{ e: "🍦", k: ["ice","cream"] },{ e: "🍩", k: ["donut"] },
    { e: "🍪", k: ["cookie"] },{ e: "🎂", k: ["cake","birthday"] },{ e: "🍫", k: ["chocolate"] },{ e: "🍿", k: ["popcorn"] },
    { e: "☕", k: ["coffee"] },{ e: "🍵", k: ["tea"] },{ e: "🍺", k: ["beer"] },{ e: "🍷", k: ["wine"] },
  ]},
  { name: "Activities", items: [
    { e: "⚽", k: ["soccer","football"] },{ e: "🏀", k: ["basketball"] },{ e: "🏈", k: ["football","american"] },
    { e: "⚾", k: ["baseball"] },{ e: "🎾", k: ["tennis"] },{ e: "🏐", k: ["volleyball"] },{ e: "🏉", k: ["rugby"] },
    { e: "🎱", k: ["pool","8","ball"] },{ e: "🏓", k: ["ping","pong"] },{ e: "🏸", k: ["badminton"] },
    { e: "🥊", k: ["boxing","gloves"] },{ e: "🎮", k: ["game","controller"] },{ e: "🎲", k: ["dice"] },
    { e: "🎯", k: ["target","bullseye"] },{ e: "🎤", k: ["mic","sing"] },{ e: "🎧", k: ["headphones"] },
    { e: "🎵", k: ["music","note"] },{ e: "🎸", k: ["guitar"] },{ e: "🎹", k: ["piano"] },{ e: "🥇", k: ["gold","medal"] },
  ]},
  { name: "Travel", items: [
    { e: "🚗", k: ["car"] },{ e: "🚕", k: ["taxi"] },{ e: "🚌", k: ["bus"] },{ e: "🚓", k: ["police","car"] },
    { e: "🚑", k: ["ambulance"] },{ e: "🚒", k: ["fire","truck"] },{ e: "🚜", k: ["tractor"] },{ e: "🏍️", k: ["motorcycle"] },
    { e: "🚲", k: ["bike","bicycle"] },{ e: "✈️", k: ["plane","airplane"] },{ e: "🚀", k: ["rocket","launch"] },
    { e: "🚁", k: ["helicopter"] },{ e: "🛳️", k: ["ship","cruise"] },{ e: "⛵", k: ["sailboat"] },
    { e: "🗽", k: ["statue","liberty"] },{ e: "🗼", k: ["tokyo","tower"] },{ e: "🏝️", k: ["island","beach"] },
    { e: "🌋", k: ["volcano"] },{ e: "🏔️", k: ["mountain"] },{ e: "🌅", k: ["sunrise"] },{ e: "🌃", k: ["night","city"] },
  ]},
  { name: "Objects", items: [
    { e: "💡", k: ["bulb","idea","light"] },{ e: "🔥", k: ["fire","hot","lit"] },{ e: "💧", k: ["water","drop"] },
    { e: "⭐", k: ["star"] },{ e: "🌟", k: ["star","glow"] },{ e: "✨", k: ["sparkles","new"] },
    { e: "🎉", k: ["party","celebrate","tada"] },{ e: "🎊", k: ["confetti","party"] },{ e: "🎁", k: ["gift","present"] },
    { e: "💯", k: ["100","perfect","score"] },{ e: "✅", k: ["check","ok","done","tick"] },{ e: "❌", k: ["cross","no","wrong"] },
    { e: "⚠️", k: ["warning","caution"] },{ e: "🔔", k: ["bell","notification"] },{ e: "📌", k: ["pin"] },
    { e: "📍", k: ["location","pin"] },{ e: "🔒", k: ["lock","secure"] },{ e: "🔑", k: ["key"] },
    { e: "💰", k: ["money","bag"] },{ e: "💸", k: ["money","flying"] },{ e: "💎", k: ["diamond","gem"] },
    { e: "📱", k: ["phone","mobile"] },{ e: "💻", k: ["laptop","computer"] },{ e: "⌚", k: ["watch"] },
    { e: "📷", k: ["camera"] },{ e: "🎬", k: ["movie","clapper"] },{ e: "📺", k: ["tv"] },{ e: "🕹️", k: ["joystick","gaming"] },
  ]},
  { name: "Flags", items: [
    { e: "🏳️", k: ["flag","white"] },{ e: "🏴", k: ["flag","black"] },{ e: "🏁", k: ["checkered","race"] },
    { e: "🚩", k: ["red","flag"] },{ e: "🏳️‍🌈", k: ["rainbow","pride","lgbt"] },{ e: "🇺🇸", k: ["usa","america","united","states"] },
    { e: "🇬🇧", k: ["uk","britain","england"] },{ e: "🇨🇦", k: ["canada"] },{ e: "🇮🇳", k: ["india"] },
    { e: "🇯🇵", k: ["japan"] },{ e: "🇩🇪", k: ["germany"] },{ e: "🇫🇷", k: ["france"] },{ e: "🇪🇸", k: ["spain"] },
    { e: "🇮🇹", k: ["italy"] },{ e: "🇧🇷", k: ["brazil"] },{ e: "🇦🇺", k: ["australia"] },{ e: "🇲🇽", k: ["mexico"] },
  ]},
];

const FAVS_KEY = "bluebird:emoji-recent";

function Page() {
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(FAVS_KEY) || "[]"); } catch { return []; }
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return GROUPS;
    return GROUPS.map((g) => ({
      ...g,
      items: g.items.filter((it) => it.k.some((kw) => kw.includes(term)) || it.e.includes(term)),
    })).filter((g) => g.items.length > 0);
  }, [q]);

  async function copy(e: string) {
    try {
      await navigator.clipboard.writeText(e);
      setCopied(e);
      setTimeout(() => setCopied(null), 1200);
      setRecent((prev) => {
        const next = [e, ...prev.filter((x) => x !== e)].slice(0, 24);
        try { localStorage.setItem(FAVS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
        return next;
      });
    } catch { /* ignore */ }
  }

  return (
    <ToolLayout slug="emoji-picker">
      <div className="space-y-6">
        <div className="soft-card p-4 sm:p-5">
          <label className="block">
            <span className="sr-only">Search emojis</span>
            <div className="relative">
              <Search aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search — try smile, fire, heart, party…" autoFocus
                className="w-full min-h-12 rounded-xl border border-border bg-background pl-11 pr-4 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
          </label>
          <p className="text-xs text-muted-foreground mt-2">Click any emoji to copy. Works on phones, tablets and computers.</p>
        </div>

        {recent.length > 0 && !q && (
          <Section title="Recently used">
            <Grid items={recent.map((e) => ({ e, k: [] }))} onCopy={copy} copied={copied} />
          </Section>
        )}

        {filtered.length === 0 && (
          <div className="soft-card p-8 text-center text-muted-foreground">No emojis match "{q}". Try a simpler word.</div>
        )}

        {filtered.map((g) => (
          <Section key={g.name} title={g.name}>
            <Grid items={g.items} onCopy={copy} copied={copied} />
          </Section>
        ))}

        <HowItWorks>
          The emojis here are standard Unicode characters — when you copy one, it pastes anywhere you can type:
          Instagram captions, WhatsApp, email, design files, even file names. Your most-used emojis are saved
          on this device only, so they're ready the next time you visit.
        </HowItWorks>
      </div>
    </ToolLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-3"><Smile aria-hidden className="size-4 text-muted-foreground" /><h2 className="font-display text-lg tracking-tight">{title}</h2></div>
      {children}
    </section>
  );
}

function Grid({ items, onCopy, copied }: { items: Emoji[]; onCopy: (e: string) => void; copied: string | null }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(56px,1fr))] gap-2">
      {items.map((it, i) => (
        <button key={`${it.e}-${i}`} type="button" onClick={() => onCopy(it.e)}
          title={it.k[0] ?? it.e}
          aria-label={`Copy ${it.k[0] ?? "emoji"}`}
          className="group relative aspect-square rounded-xl border border-border bg-card hover:border-primary hover:bg-primary-soft hover:-translate-y-0.5 transition-transform grid place-items-center text-3xl">
          <span aria-hidden>{it.e}</span>
          {copied === it.e && (
            <span className="absolute inset-0 grid place-items-center rounded-xl bg-primary text-primary-foreground text-xs font-semibold"><Check className="size-4 mr-1" />Copied</span>
          )}
          <Copy aria-hidden className="absolute bottom-1 right-1 size-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
        </button>
      ))}
    </div>
  );
}
