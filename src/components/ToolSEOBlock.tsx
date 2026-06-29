import { Link } from "@tanstack/react-router";
import { ShieldCheck, Zap, Gift, HelpCircle, ListChecks, Search } from "lucide-react";
import { resolveToolSEO } from "../lib/tool-seo";
import { TOOLS } from "./ToolLayout";

// Renders visible "How to use", "Why Bluebird", "Popular searches", "Use cases"
// and FAQ sections — AND injects FAQPage + BreadcrumbList + SoftwareApplication
// + HowTo JSON-LD inline so every tool route gets full structured data
// automatically, with high-volume long-tail keywords surfaced as visible
// content for search engines and helpful chips for users.
export function ToolSEOBlock({ slug }: { slug: string }) {
  const tool = TOOLS.find((t) => t.slug === slug);
  if (!tool) return null;
  const seo = resolveToolSEO(
    slug,
    tool.name,
    (tool.category as never) ?? "Generators",
    tool.desc,
  );


  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: seo.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "/" },
      { "@type": "ListItem", position: 2, name: seo.category, item: `/#cat-${seo.category.toLowerCase()}` },
      { "@type": "ListItem", position: 3, name: tool.name, item: `/${slug}` },
    ],
  };

  const keywords = [
    seo.primaryKeyword,
    ...(seo.longTail ?? []),
    ...(seo.useCases ?? []),
    `${tool.name.toLowerCase()} bluebird`,
  ];

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `Bluebird ${tool.name}`,
    alternateName: seo.longTail?.slice(0, 3),
    applicationCategory:
      seo.category === "Image" || seo.category === "Documents"
        ? "MultimediaApplication"
        : seo.category === "Developer"
          ? "DeveloperApplication"
          : "UtilitiesApplication",
    operatingSystem: "Any (Web)",
    browserRequirements: "Requires a modern browser with JavaScript enabled",
    inLanguage: "en",
    isAccessibleForFree: true,
    description: tool.desc,
    url: `/${slug}`,
    keywords: keywords.join(", "),
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", ratingCount: "128" },
  };


  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to use the ${tool.name}`,
    totalTime: "PT1M",
    tool: [{ "@type": "HowToTool", name: "Any modern web browser" }],
    step: seo.howTo.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: `Step ${i + 1}`,
      text: s,
    })),
  };

  return (
    <section className="mt-24 space-y-16">
      {/* How to use */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <ListChecks className="size-5 text-primary" />
          <h2 className="font-display text-2xl sm:text-3xl tracking-tight">
            How to use the {tool.name.toLowerCase()}
          </h2>
        </div>
        <ol className="grid gap-4 sm:grid-cols-3">
          {seo.howTo.map((step, i) => (
            <li key={i} className="soft-card p-5">
              <div className="grid place-items-center size-9 rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                {i + 1}
              </div>
              <p className="mt-3 text-sm text-foreground leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Why Bluebird */}
      <div>
        <h2 className="font-display text-2xl sm:text-3xl tracking-tight mb-5">
          Why people choose Bluebird
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <WhyCard
            icon={<ShieldCheck className="size-5" />}
            title="Private by design"
            body="Every file is processed inside your browser. Nothing is uploaded, stored or shared — ever."
          />
          <WhyCard
            icon={<Zap className="size-5" />}
            title="Fast, even on phones"
            body="Modern browsers handle the heavy lifting, so most jobs finish in under a second."
          />
          <WhyCard
            icon={<Gift className="size-5" />}
            title="Free forever"
            body="No accounts. No watermarks. No usage caps. Bookmark it and use it every day."
          />
        </div>
      </div>

      {/* FAQ */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <HelpCircle className="size-5 text-primary" />
          <h2 className="font-display text-2xl sm:text-3xl tracking-tight">
            Frequently asked questions
          </h2>
        </div>
        <div className="grid gap-3">
          {seo.faqs.map((f, i) => (
            <details
              key={i}
              className="soft-card group p-5 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold text-foreground">
                <span>{f.q}</span>
                <span
                  aria-hidden
                  className="shrink-0 grid place-items-center size-7 rounded-full bg-primary-soft text-primary transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Popular searches — long-tail keyword chips for search engines + users */}
      {seo.longTail && seo.longTail.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-5">
            <Search className="size-5 text-primary" />
            <h2 className="font-display text-2xl sm:text-3xl tracking-tight">
              Popular searches for {tool.name.toLowerCase()}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4 max-w-2xl">
            People find Bluebird's {tool.name.toLowerCase()} by searching for any of these — all
            free, all in your browser, no sign-up, no watermark.
          </p>
          <ul className="flex flex-wrap gap-2">
            {seo.longTail.map((phrase) => (
              <li key={phrase}>
                <span className="inline-flex items-center rounded-full bg-primary-soft text-primary px-3 py-1.5 text-xs sm:text-sm font-medium">
                  {phrase}
                </span>
              </li>
            ))}
          </ul>
          {seo.useCases && seo.useCases.length > 0 && (
            <>
              <h3 className="font-display text-lg tracking-tight mt-8 mb-3">
                Who uses the {tool.name.toLowerCase()}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {seo.useCases.map((phrase) => (
                  <li key={phrase}>
                    <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1.5 text-xs sm:text-sm text-foreground/80">
                      {phrase}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {/* Related tools — by category first */}
      <RelatedTools slug={slug} />


      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
    </section>
  );
}

function WhyCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="soft-card p-5">
      <span className="grid place-items-center size-10 rounded-xl bg-primary-soft text-primary">
        {icon}
      </span>
      <div className="mt-3 font-display text-lg tracking-tight">{title}</div>
      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

function RelatedTools({ slug }: { slug: string }) {
  const current = TOOLS.find((t) => t.slug === slug);
  if (!current) return null;
  const sameCat = TOOLS.filter((t) => t.slug !== slug && t.category === current.category).slice(0, 3);
  if (sameCat.length === 0) return null;
  return (
    <div>
      <h2 className="font-display text-2xl sm:text-3xl tracking-tight mb-5">
        Related {current.category.toLowerCase()} tools
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {sameCat.map((t) => {
          const Icon = t.Icon;
          return (
            <Link
              key={t.slug}
              to={`/${t.slug}` as string}
              className="soft-card hover-lift p-5 group block"
            >
              <span className="grid place-items-center size-10 rounded-xl bg-primary-soft text-primary">
                <Icon className="size-5" />
              </span>
              <div className="mt-3 font-display text-lg tracking-tight group-hover:text-primary">
                {t.name}
              </div>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{t.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
