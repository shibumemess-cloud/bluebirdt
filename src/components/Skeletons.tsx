/**
 * Skeleton placeholders matching Bluebird page shells.
 * Used as router pendingComponent and inline while loaders run.
 * Uses tailwind's animate-pulse + theme tokens for shimmer.
 */

function Bar({ className = "" }: { className?: string }) {
  return <div className={`rounded-md bg-muted/70 ${className}`} />;
}

function Card({ className = "" }: { className?: string }) {
  return (
    <div className={`soft-card p-5 sm:p-6 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <Bar className="size-12 rounded-2xl" />
        <Bar className="h-3 w-16" />
      </div>
      <Bar className="mt-4 h-5 w-2/3" />
      <Bar className="mt-3 h-3 w-full" />
      <Bar className="mt-2 h-3 w-5/6" />
      <Bar className="mt-5 h-4 w-24" />
    </div>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh sky-bg text-foreground animate-pulse">
      {/* Header strip */}
      <div className="h-16 border-b border-border/60 bg-card/60">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <Bar className="size-9 rounded-xl" />
            <Bar className="h-4 w-24" />
          </div>
          <Bar className="hidden h-4 w-64 sm:block" />
          <Bar className="size-10 rounded-xl sm:hidden" />
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <PageShell>
      <section className="mx-auto w-full max-w-5xl px-4 sm:px-6 pt-10 sm:pt-14 pb-8">
        <Bar className="h-3 w-32" />
        <Bar className="mt-5 h-10 w-2/3 sm:h-14" />
        <Bar className="mt-4 h-4 w-4/5" />
        <Bar className="mt-3 h-4 w-3/5" />
        <Bar className="mt-7 h-12 w-full max-w-xl rounded-xl" />
      </section>
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}

export function ToolSkeleton() {
  return (
    <PageShell>
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pt-8 sm:pt-12 pb-16">
        <Bar className="h-3 w-24" />
        <Bar className="mt-4 h-8 w-1/2 sm:h-10" />
        <Bar className="mt-3 h-4 w-3/4" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="soft-card p-6 space-y-4">
            <Bar className="h-4 w-32" />
            <Bar className="h-36 w-full rounded-xl" />
            <Bar className="h-10 w-full rounded-xl" />
            <Bar className="h-10 w-2/3 rounded-xl" />
            <Bar className="h-12 w-full rounded-xl" />
          </div>
          <div className="soft-card p-6 space-y-4">
            <Bar className="h-4 w-28" />
            <Bar className="h-64 w-full rounded-xl" />
            <div className="grid grid-cols-3 gap-3">
              <Bar className="h-10 rounded-xl" />
              <Bar className="h-10 rounded-xl" />
              <Bar className="h-10 rounded-xl" />
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

export function HomeSkeleton() {
  return (
    <PageShell>
      <section className="mx-auto w-full max-w-5xl px-4 sm:px-6 pt-16 pb-12 text-center">
        <Bar className="mx-auto h-3 w-40" />
        <Bar className="mx-auto mt-5 h-12 w-4/5 sm:h-16" />
        <Bar className="mx-auto mt-4 h-4 w-3/4" />
        <Bar className="mx-auto mt-2 h-4 w-2/3" />
        <Bar className="mx-auto mt-7 h-12 w-full max-w-xl rounded-xl" />
      </section>
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Card key={i} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
