import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ToolLayout } from "../components/ToolLayout";
import { Field, HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/yt-money-calculator")({
  head: () => ({
    meta: [
      { title: "YouTube Money Calculator — Estimate Earnings from Views" },
      { name: "description", content: "Estimate how much a YouTube video or channel can earn from AdSense. Pick a niche, set a CPM range, and see daily, monthly and yearly revenue." },
      { property: "og:title", content: "YouTube Money Calculator — Bluebird" },
      { property: "og:description", content: "Free YouTube earnings calculator — estimate ad revenue by views, CPM and niche." },
      { property: "og:url", content: "/yt-money-calculator" },
    ],
    links: [{ rel: "canonical", href: "/yt-money-calculator" }],
  }),
  component: Page,
});

// Industry-average RPM ranges (USD) — what a creator keeps after YouTube's 45% cut.
const NICHES: { id: string; label: string; lo: number; hi: number }[] = [
  { id: "finance", label: "Finance & investing", lo: 12, hi: 30 },
  { id: "tech", label: "Tech & software reviews", lo: 6, hi: 18 },
  { id: "business", label: "Business & marketing", lo: 8, hi: 20 },
  { id: "education", label: "Education & how-to", lo: 4, hi: 12 },
  { id: "health", label: "Health & fitness", lo: 3, hi: 9 },
  { id: "lifestyle", label: "Lifestyle & vlog", lo: 2, hi: 6 },
  { id: "gaming", label: "Gaming", lo: 1.5, hi: 5 },
  { id: "entertainment", label: "Entertainment & comedy", lo: 1.5, hi: 4 },
  { id: "music", label: "Music", lo: 1, hi: 3 },
  { id: "kids", label: "Made for kids", lo: 0.5, hi: 2 },
];

const CTR_DEFAULT = 0.5; // half of views see a monetised ad-impression on average
const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

function Page() {
  const [views, setViews] = useState(100_000);
  const [niche, setNiche] = useState("tech");
  const [monetisable, setMonetisable] = useState(CTR_DEFAULT * 100);
  const n = NICHES.find((x) => x.id === niche)!;

  const result = useMemo(() => {
    const monetisedViews = views * (monetisable / 100);
    const lo = (monetisedViews / 1000) * n.lo;
    const hi = (monetisedViews / 1000) * n.hi;
    const mid = (lo + hi) / 2;
    return { lo, hi, mid };
  }, [views, monetisable, n]);

  return (
    <ToolLayout slug="yt-money-calculator">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 md:col-span-7 space-y-5">
          <Field label="Total video views">
            <input type="number" min={0} value={views} onChange={(e) => setViews(Math.max(0, Number(e.target.value) || 0))}
              className="w-full min-h-12 rounded-xl border border-border bg-card px-4 text-base font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <input type="range" min={1000} max={10_000_000} step={1000} value={Math.min(views, 10_000_000)} onChange={(e) => setViews(Number(e.target.value))}
              className="w-full mt-3 accent-primary" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>1K</span><span>100K</span><span>1M</span><span>10M</span></div>
          </Field>

          <Field label="Channel niche" hint="Average RPM (what you keep per 1,000 monetised views) varies a lot by topic.">
            <select value={niche} onChange={(e) => setNiche(e.target.value)}
              className="w-full min-h-12 rounded-xl border border-border bg-card px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/30">
              {NICHES.map((x) => <option key={x.id} value={x.id}>{x.label} — ${x.lo}–${x.hi} RPM</option>)}
            </select>
          </Field>

          <Field label={`Monetisable view rate · ${monetisable.toFixed(0)}%`} hint="Skips, ad-blockers, kids' content and YouTube Premium views don't earn ad revenue. 40–60% is typical.">
            <input type="range" min={10} max={100} step={5} value={monetisable} onChange={(e) => setMonetisable(Number(e.target.value))} className="w-full accent-primary" />
          </Field>

          <HowItWorks>
            We multiply your views by the monetisable rate, divide by 1,000 and apply your niche's
            RPM range. RPM is your share of ad revenue after YouTube's 45% cut, so the figure shown
            is what lands in your AdSense account — before tax. Sponsorships, memberships, Super
            Thanks and affiliate income aren't included.
          </HowItWorks>
        </div>

        <aside className="col-span-12 md:col-span-5 space-y-3">
          <div className="soft-card p-6 text-center">
            <span className="eyebrow">Estimated AdSense earnings</span>
            <div className="mt-2 text-4xl font-display font-bold text-primary">{fmt(result.lo)} – {fmt(result.hi)}</div>
            <div className="mt-1 text-sm text-muted-foreground">midpoint <span className="num font-semibold">{fmt(result.mid)}</span> from {views.toLocaleString()} views</div>
          </div>
          <div className="soft-card p-5 space-y-3">
            <span className="eyebrow">If this is a monthly view count</span>
            {[
              ["Per day", result.mid / 30],
              ["Per month", result.mid],
              ["Per year", result.mid * 12],
            ].map(([label, val]) => (
              <div key={label as string} className="flex items-baseline justify-between border-b border-border last:border-0 pb-2 last:pb-0">
                <span className="text-sm text-muted-foreground">{label as string}</span>
                <span className="font-mono font-semibold">{fmt(val as number)}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground px-1">Rough estimates only — your real RPM depends on watch time, audience country, ad inventory and the season.</p>
        </aside>
      </div>
    </ToolLayout>
  );
}
