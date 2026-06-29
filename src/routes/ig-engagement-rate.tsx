import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ToolLayout } from "../components/ToolLayout";
import { Field, HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/ig-engagement-rate")({
  head: () => ({
    meta: [
      { title: "Instagram Engagement Rate Calculator — Free & Private" },
      { name: "description", content: "Calculate Instagram engagement rate by followers, reach or impressions. Get a benchmark rating and share-ready breakdown. Nothing leaves your browser." },
      { property: "og:title", content: "Engagement Rate Calculator — Bluebird" },
      { property: "og:description", content: "Free Instagram engagement rate calculator." },
      { property: "og:url", content: "/ig-engagement-rate" },
    ],
    links: [{ rel: "canonical", href: "/ig-engagement-rate" }],
  }),
  component: Page,
});

type Basis = "followers" | "reach" | "impressions";

function ratingFor(pct: number) {
  if (pct >= 6) return { label: "Outstanding", tone: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" };
  if (pct >= 3) return { label: "Strong", tone: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" };
  if (pct >= 1) return { label: "Healthy", tone: "text-primary", bg: "bg-primary/5 border-primary/20" };
  if (pct >= 0.5) return { label: "Below average", tone: "text-amber-600", bg: "bg-amber-50 border-amber-200" };
  return { label: "Low", tone: "text-destructive", bg: "bg-destructive/5 border-destructive/20" };
}

function num(v: string) {
  const n = Number(String(v).replace(/[, _]/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function Page() {
  const [basis, setBasis] = useState<Basis>("followers");
  const [audience, setAudience] = useState("10000");
  const [likes, setLikes] = useState("420");
  const [comments, setComments] = useState("38");
  const [saves, setSaves] = useState("22");
  const [shares, setShares] = useState("14");

  const result = useMemo(() => {
    const aud = num(audience);
    const eng = num(likes) + num(comments) + num(saves) + num(shares);
    const rate = aud > 0 ? (eng / aud) * 100 : 0;
    return { aud, eng, rate };
  }, [audience, likes, comments, saves, shares]);

  const rating = ratingFor(result.rate);
  const basisLabel: Record<Basis, string> = {
    followers: "Followers (ER by reach is more accurate when available)",
    reach: "Reach (unique accounts that saw the post)",
    impressions: "Impressions (total times the post was shown)",
  };

  return (
    <ToolLayout slug="ig-engagement-rate">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 md:col-span-7 space-y-6">
          <Field label="Calculate against" hint="Choose the denominator. Reach is the most accurate when you have it.">
            <div className="grid grid-cols-3 gap-2">
              {(["followers", "reach", "impressions"] as Basis[]).map((b) => (
                <button key={b} type="button" onClick={() => setBasis(b)}
                  className={`min-h-12 rounded-xl border text-sm font-medium capitalize ${basis === b ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary/40"}`}>
                  {b}
                </button>
              ))}
            </div>
          </Field>

          <Field label={`Your ${basis} count`} hint={basisLabel[basis]}>
            <input inputMode="numeric" value={audience} onChange={(e) => setAudience(e.target.value)}
              className="w-full min-h-12 rounded-xl border border-border bg-card px-4 text-base num focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Likes">
              <input inputMode="numeric" value={likes} onChange={(e) => setLikes(e.target.value)}
                className="w-full min-h-12 rounded-xl border border-border bg-card px-4 num focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </Field>
            <Field label="Comments">
              <input inputMode="numeric" value={comments} onChange={(e) => setComments(e.target.value)}
                className="w-full min-h-12 rounded-xl border border-border bg-card px-4 num focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </Field>
            <Field label="Saves">
              <input inputMode="numeric" value={saves} onChange={(e) => setSaves(e.target.value)}
                className="w-full min-h-12 rounded-xl border border-border bg-card px-4 num focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </Field>
            <Field label="Shares">
              <input inputMode="numeric" value={shares} onChange={(e) => setShares(e.target.value)}
                className="w-full min-h-12 rounded-xl border border-border bg-card px-4 num focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </Field>
          </div>

          <HowItWorks>
            Engagement rate = (likes + comments + saves + shares) ÷ chosen audience × 100. Most creators see 1%–3%
            against followers as a healthy range; rates against reach are usually higher because reach is smaller
            than your total following.
          </HowItWorks>
        </div>

        <aside className="col-span-12 md:col-span-5">
          <div className="soft-card p-5 sm:p-6 sticky top-4">
            <span className="eyebrow">Engagement rate</span>
            <div className="font-display text-5xl mt-2 num">{result.rate.toFixed(2)}%</div>
            <div className={`mt-3 inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${rating.bg} ${rating.tone}`}>{rating.label}</div>

            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <dt className="text-muted-foreground">Total engagements</dt>
              <dd className="text-right font-semibold num">{result.eng.toLocaleString()}</dd>
              <dt className="text-muted-foreground capitalize">{basis}</dt>
              <dd className="text-right font-semibold num">{result.aud.toLocaleString()}</dd>
              <dt className="text-muted-foreground">Per 1,000 {basis}</dt>
              <dd className="text-right font-semibold num">{result.aud > 0 ? ((result.eng / result.aud) * 1000).toFixed(1) : "0"}</dd>
            </dl>

            <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Benchmarks (vs followers):</strong>
              <div className="mt-1">Under 0.5% low · 0.5–1% below avg · 1–3% healthy · 3–6% strong · 6%+ outstanding.</div>
            </div>
          </div>
        </aside>
      </div>
    </ToolLayout>
  );
}
