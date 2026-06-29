import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, ShieldCheck, CloudOff, Gift, Sparkles,
  Image as ImageIcon, FileText, Type as TypeIcon, Palette, AtSign, PlaySquare,
  Code2, Calculator, Repeat, Wand2, Mic, Timer,
  Network, ShieldCheck as ShieldCheckIcon, AudioLines, Bitcoin, Accessibility, Plane,
  Briefcase, GraduationCap, PartyPopper,
} from "lucide-react";
import { TOOLS, CATEGORIES, SiteHeader, SiteFooter, categorySlug, type ToolCategory } from "../components/ToolLayout";
import { ToolSearch } from "../components/ToolSearch";
import ogHome from "../assets/og/og-home.jpg";

const CATEGORY_ICONS: Record<ToolCategory, typeof ImageIcon> = {
  "Image": ImageIcon,
  "PDF": FileText,
  "Audio": AudioLines,
  "Text": TypeIcon,
  "Color & Design": Palette,
  "Instagram": AtSign,
  "YouTube": PlaySquare,
  "Developer": Code2,
  "Calculators": Calculator,
  "Converters": Repeat,
  "Generators": Wand2,
  "Media": Mic,
  "Productivity": Timer,
  "Network": Network,
  "Privacy": ShieldCheckIcon,
  "Crypto": Bitcoin,
  "Accessibility": Accessibility,
  "Travel": Plane,
  "Office": Briefcase,
  "Education": GraduationCap,
  "Fun": PartyPopper,
};


const FAQ_ITEMS = [
  { q: "Where do my files go?", a: "Nowhere. Every tool runs inside this browser tab — your photos, PDFs and text never touch a server. You can switch off Wi-Fi after the page loads and most tools still work." },
  { q: "Is it really free? What's the catch?", a: "It's free, with no catch. No accounts, no trials, no watermarks, no ads, no upsell. Bluebird is funded by being tiny and cheap to run." },
  { q: "Will it work on my phone?", a: "Yes. Bluebird is built mobile-first and works on any modern phone, tablet, Chromebook or computer — iOS, Android, Windows, Mac or Linux." },
  { q: "How big a file can I open?", a: "Up to 20 MB per image and most everyday PDFs. Because everything runs locally, the limit depends on your device's memory, not on us." },
  { q: "Can my kids or my parents use it?", a: "That's exactly who it's for. Big buttons, plain words, large type, and each tool walks you through it step by step — no jargon, no surprises." },
  { q: "Do I have to install anything?", a: "No. There's nothing to download, no extension, no app store. Open the page, pick a tool, you're done." },
];

// Short, punchy popular picks shown right under the hero search.
const POPULAR_SLUGS = [
  "image-compressor",
  "qr-generator",
  "pdf-merge",
  "password-generator",
  "json-formatter",
  "word-counter",
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bluebird — Free Online Tools That Run In Your Browser" },
      { name: "description", content: `${TOOLS.length}+ free tools for images, PDFs, text and developers. Everything runs on your device — no uploads, no sign-up, no ads. Works on any phone or laptop.` },
      { property: "og:title", content: "Bluebird — Free, Private Browser Tools" },
      { property: "og:description", content: `One tab, ${TOOLS.length}+ tools. Compress photos, edit PDFs, generate QR codes and passwords — all without uploading a single file.` },
      { property: "og:url", content: "/" },
      { property: "og:image", content: ogHome },
      { name: "twitter:image", content: ogHome },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Bluebird",
          url: "/",
          description: "Free, private browser tools for images, PDFs, QR codes, passwords and JSON.",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ_ITEMS.map((it) => ({
            "@type": "Question",
            name: it.q,
            acceptedAnswer: { "@type": "Answer", text: it.a },
          })),
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  const popular = POPULAR_SLUGS
    .map((s) => TOOLS.find((t) => t.slug === s))
    .filter((t): t is (typeof TOOLS)[number] => Boolean(t));

  return (
    <div className="min-h-dvh sky-bg text-foreground">
      <SiteHeader />

      <main>
        {/* ───────── Hero ───────── */}
        <section className="relative overflow-hidden">
          <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 pt-10 sm:pt-24 pb-12 sm:pb-20 text-center animate-[fade-in_.5s_ease-out_both]">
            <span className="eyebrow inline-flex items-center gap-2 justify-center max-w-full">
              <span className="inline-block size-2 rounded-full bg-primary animate-pulse shrink-0" />
              <span className="truncate">{TOOLS.length} free tools · 100% private</span>
            </span>

            <h1 className="font-display mt-4 sm:mt-5 text-[2rem] xs:text-[2.25rem] leading-[1.1] tracking-tight sm:text-6xl md:text-7xl mx-auto max-w-4xl text-balance px-1">
              The everyday toolbox{" "}
              <span className="text-primary">that lives in your browser.</span>
            </h1>

            <p className="mx-auto mt-4 sm:mt-6 max-w-2xl text-[15px] sm:text-lg md:text-xl text-muted-foreground text-pretty">
              <span className="sm:hidden">Shrink photos, merge PDFs, make QR codes — no uploads, no sign-ups, no ads.</span>
              <span className="hidden sm:inline">Shrink a photo, merge a few PDFs, make a QR code, generate a strong password — without uploading anything, signing up, or paying a cent. Just <strong className="text-foreground font-semibold">{TOOLS.length} small tools</strong> that do one job each, and do it well.</span>
            </p>

            {/* Hero search */}
            <div className="mt-8 sm:mt-10 flex justify-center">
              <ToolSearch size="hero" />
            </div>

            {/* Popular pills */}
            <div className="mt-5 flex flex-col items-center gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Sparkles className="size-3.5 text-primary" /> Try one now
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {popular.map((t) => (
                  <Link
                    key={t.slug}
                    to={`/${t.slug}` as string}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:border-primary hover:bg-primary-soft hover:text-primary"
                  >
                    <t.Icon aria-hidden className="size-3.5" />
                    {t.short}
                  </Link>
                ))}
              </div>
            </div>

            {/* Inline trust strip */}
            <ul className="mt-8 sm:mt-10 mx-auto max-w-xl grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-muted-foreground sm:flex sm:max-w-none sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-6">
              <li className="inline-flex items-center gap-2 min-w-0">
                <span className="inline-flex items-center justify-center min-w-8 h-7 px-2 rounded-full bg-primary text-primary-foreground text-xs font-bold tabular-nums shrink-0">{TOOLS.length}</span>
                <span>tools, one tab</span>
              </li>
              <li className="inline-flex items-center gap-2 min-w-0">
                <ShieldCheck className="size-4 text-primary shrink-0" /> <span>Runs on your device</span>
              </li>
              <li className="inline-flex items-center gap-2 min-w-0">
                <CloudOff className="size-4 text-primary shrink-0" /> <span>Files never uploaded</span>
              </li>
              <li className="inline-flex items-center gap-2 min-w-0">
                <Gift className="size-4 text-primary shrink-0" /> <span>Free forever, no ads</span>
              </li>
            </ul>
          </div>
        </section>


        {/* ───────── Browse by category (visual cards) ───────── */}
        <section id="categories" className="mx-auto w-full max-w-6xl px-4 sm:px-6 mt-2 sm:-mt-2 pb-2 scroll-mt-20">
          <div className="mb-6">
            <span className="eyebrow">Browse by category</span>
            <h2 className="font-display text-2xl sm:text-3xl tracking-tight mt-1">
              Whatever you came for — it's a click away.
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
              {CATEGORIES.length} neatly sorted categories, {TOOLS.length} focused tools. Pick a category and you'll land on its own page with everything inside — searchable, fast, and free.
            </p>
          </div>
          <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {CATEGORIES.map((cat, i) => {
              const count = TOOLS.filter((t) => t.category === cat.id).length;
              const Icon = CATEGORY_ICONS[cat.id] ?? Sparkles;
              return (
                <Link
                  key={cat.id}
                  to="/category/$slug"
                  params={{ slug: categorySlug(cat.id) }}
                  className="soft-card hover-lift p-4 sm:p-5 group block"
                  style={{ animation: `rise .5s cubic-bezier(0.22,1,0.36,1) ${Math.min(i * 25, 240)}ms both` }}
                >
                  <div className="flex items-center gap-3">
                    <span aria-hidden className="grid place-items-center size-11 shrink-0 rounded-2xl bg-primary-soft text-primary group-hover:scale-105 motion-reduce:transform-none transition-transform">
                      <Icon className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="font-display text-base sm:text-lg leading-tight truncate group-hover:text-primary">{cat.label}</div>
                      <div className="text-xs text-muted-foreground num">{count} tools</div>
                    </div>
                  </div>
                  <p className="mt-3 text-xs sm:text-sm text-muted-foreground line-clamp-2">{cat.blurb}</p>
                  <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                    Open category
                    <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>


        {/* ───────── How it works ───────── */}
        <section className="mx-auto w-full max-w-5xl px-4 sm:px-6 mt-16 sm:mt-24">
          <div className="text-center max-w-2xl mx-auto">
            <span className="eyebrow">How it works</span>
            <h2 className="font-display text-[1.6rem] sm:text-4xl tracking-tight mt-2 text-balance">
              Three taps, and you're done.
            </h2>
            <p className="mt-3 text-muted-foreground text-sm sm:text-base">
              No tutorials to watch, no settings to learn. Open a tool and it walks you through it.
            </p>
          </div>
          <ol className="mt-8 sm:mt-10 grid gap-4 sm:gap-5 sm:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="soft-card p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <span className="font-display text-4xl sm:text-5xl text-primary leading-none num shrink-0">{s.n}</span>
                  <span className="font-display text-base sm:text-lg min-w-0">{s.title}</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>


        {/* ───────── FAQ ───────── */}
        <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 mt-16 sm:mt-24 mb-20 sm:mb-24 grid gap-8 md:gap-10 md:grid-cols-[1fr_2fr]">
          <div>
            <span className="eyebrow">Good to know</span>
            <h2 className="font-display text-[1.6rem] sm:text-3xl tracking-tight mt-2 text-balance">
              The short, honest answers.
            </h2>
            <p className="mt-3 text-muted-foreground text-sm">
              The questions people ask most — answered without the marketing voice. Each tool also explains itself as you use it.
            </p>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((q) => (
              <details key={q.q} className="soft-card p-5 group">
                <summary className="cursor-pointer list-none grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 font-semibold">
                  <span className="min-w-0">{q.q}</span>
                  <span aria-hidden className="shrink-0 text-primary transition-transform group-open:rotate-45 motion-reduce:transform-none text-xl leading-none">+</span>
                </summary>
                <p className="mt-3 text-muted-foreground text-sm leading-relaxed">{q.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

const STEPS = [
  { n: "1", title: "Pick a tool", body: "Search by name or browse a category. The tool opens straight away — no loading screens." },
  { n: "2", title: "Drop your file", body: "Drag it in, paste it, or tap to choose. Smart defaults are already set, so you can skip the settings if you want." },
  { n: "3", title: "Save the result", body: "One tap downloads it to your device. Your original file never leaves this tab." },
];
