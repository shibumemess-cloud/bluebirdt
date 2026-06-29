import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import {
  TOOLS,
  CATEGORIES,
  SiteHeader,
  SiteFooter,
  categorySlug,
} from "../components/ToolLayout";
import { ToolSearch } from "../components/ToolSearch";
import { CategorySkeleton } from "../components/Skeletons";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }) => {
    const cat = CATEGORIES.find((c) => categorySlug(c.id) === params.slug);
    if (!cat) throw notFound();
    const toolsCount = TOOLS.filter((t) => t.category === cat.id).length;
    // Only return JSON-serializable data — tool icons are React components.
    return { catId: cat.id, label: cat.label, blurb: cat.blurb, toolsCount };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Category — Bluebird" }] };
    const { label, blurb, toolsCount, catId } = loaderData;
    const title = `${label} Tools — ${toolsCount} free, private tools | Bluebird`;
    const desc = `${blurb} ${toolsCount} free tools that run in your browser — no uploads, no sign-up.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: `${label} Tools — Bluebird` },
        { property: "og:description", content: desc },
      ],
      links: [{ rel: "canonical", href: `/category/${categorySlug(catId)}` }],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-dvh sky-bg text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Category not found</h1>
        <p className="mt-3 text-muted-foreground">That category doesn't exist (yet).</p>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 font-semibold">
          <ArrowLeft className="size-4" /> Back to all categories
        </Link>
      </main>
      <SiteFooter />
    </div>
  ),
  pendingComponent: CategorySkeleton,
  component: CategoryPage,
});

function CategoryPage() {
  const { catId, label, blurb, toolsCount } = Route.useLoaderData();
  const tools = TOOLS.filter((t) => t.category === catId);

  return (
    <div className="min-h-dvh sky-bg text-foreground">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="mx-auto w-full max-w-5xl px-4 sm:px-6 pt-8 sm:pt-14 pb-6 sm:pb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="size-4" /> All categories
          </Link>

          <div className="mt-4 sm:mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <span className="eyebrow">Category</span>
              <h1 className="font-display text-[1.75rem] sm:text-5xl leading-[1.1] tracking-tight mt-1 text-balance break-words">
                {label} <span className="text-primary">tools</span>
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] sm:text-lg text-muted-foreground leading-relaxed">
                {blurb}
              </p>
            </div>
            <span className="self-start sm:self-auto shrink-0 inline-flex items-center gap-2 rounded-full bg-primary-soft text-primary px-3 py-1.5 text-sm font-semibold">
              <Sparkles className="size-3.5" />
              {tools.length} {tools.length === 1 ? "tool" : "tools"}
            </span>
          </div>

          <div className="mt-6 sm:mt-7 max-w-2xl">
            <ToolSearch />
          </div>
        </section>

        {/* Tools grid */}
        <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-16">
          {tools.length === 0 ? (
            <p className="text-muted-foreground">No tools in this category yet — check back soon.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tools.map((t: (typeof TOOLS)[number], i: number) => {
                const Icon = t.Icon;
                return (
                  <Link
                    key={t.slug}
                    to={`/${t.slug}` as string}
                    className="soft-card hover-lift p-5 sm:p-6 group block"
                    style={{ animation: `rise .5s cubic-bezier(0.22,1,0.36,1) ${Math.min(i * 30, 240)}ms both` }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span aria-hidden className="grid place-items-center size-12 shrink-0 rounded-2xl bg-primary-soft text-primary group-hover:scale-105 motion-reduce:transform-none transition-transform">
                        <Icon className="size-6" />
                      </span>
                      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {t.short}
                      </span>
                    </div>
                    <div className="mt-4 font-display text-xl tracking-tight group-hover:text-primary">
                      {t.name}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{t.desc}</p>
                    <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                      Open tool
                      <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Other categories */}
        <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-24">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="font-display text-xl sm:text-2xl tracking-tight">Browse other categories</h2>
            <Link to="/" className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
              See all <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {CATEGORIES.filter((c) => c.id !== catId).slice(0, 8).map((c) => {
              const count = TOOLS.filter((t) => t.category === c.id).length;
              return (
                <Link
                  key={c.id}
                  to="/category/$slug"
                  params={{ slug: categorySlug(c.id) }}
                  className="soft-card hover-lift p-4 group block"
                >
                  <div className="font-display text-base group-hover:text-primary">{c.label}</div>
                  <div className="text-xs text-muted-foreground num">{count} tools</div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
