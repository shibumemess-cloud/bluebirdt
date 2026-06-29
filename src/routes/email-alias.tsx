import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ShieldCheck, Copy, RefreshCw } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/email-alias")({
  head: () => ({
    meta: [
      { title: "Email Alias Generator — Plus Addresses & Dots" },
      { name: "description", content: "Generate Gmail-compatible plus-addresses and dot variants so you can track signups without revealing your main email." },
      { property: "og:title", content: "Email Alias Generator — Bluebird" },
      { property: "og:description", content: "Make tagged email aliases instantly." },
    ],
    links: [{ rel: "canonical", href: "/email-alias" }],
  }),
  component: Page,
});

function dotVariants(local: string): string[] {
  const n = local.length;
  if (n < 2 || n > 12) return [];
  const max = Math.min(2 ** (n - 1), 24);
  const out: string[] = [];
  for (let mask = 1; mask < max; mask++) {
    let s = local[0];
    for (let i = 1; i < n; i++) {
      if ((mask >> (i - 1)) & 1) s += ".";
      s += local[i];
    }
    out.push(s);
  }
  return out;
}

function randTag() {
  return Math.random().toString(36).slice(2, 8);
}

function Page() {
  const [email, setEmail] = useState("yourname@gmail.com");
  const [tag, setTag] = useState("newsletter");
  const [seed, setSeed] = useState(0);

  const result = useMemo(() => {
    const m = email.trim().match(/^([^@\s]+)@([^@\s]+)$/);
    if (!m) return null;
    const [, local, domain] = m;
    const plus = `${local}+${tag.trim() || "tag"}@${domain}`;
    const random = `${local}+${randTag()}-${seed}@${domain}`;
    const dots = dotVariants(local).slice(0, 12).map((l) => `${l}@${domain}`);
    return { plus, random, dots, isGmail: /gmail\.com|googlemail\.com/i.test(domain) };
  }, [email, tag, seed]);

  return (
    <ToolLayout slug="email-alias">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="soft-card p-4 sm:p-5">
          <label className="eyebrow" htmlFor="em">Your email</label>
          <input id="em" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full font-mono rounded-xl border border-border bg-card p-3 min-h-12" />
        </div>
        <div className="soft-card p-4 sm:p-5">
          <label className="eyebrow" htmlFor="tag">Tag (for plus-addressing)</label>
          <input id="tag" value={tag} onChange={(e) => setTag(e.target.value.replace(/[^a-zA-Z0-9._-]/g, ""))}
            className="mt-1.5 w-full font-mono rounded-xl border border-border bg-card p-3 min-h-12" />
        </div>
      </div>
      {result ? (
        <>
          <div className="mt-4 grid lg:grid-cols-2 gap-4">
            <div className="soft-card p-4 sm:p-5">
              <span className="eyebrow">Plus address</span>
              <div className="mt-2 flex items-center gap-2 rounded-xl bg-primary-soft/30 p-3"><span className="font-mono text-sm flex-1 break-all">{result.plus}</span><button onClick={() => navigator.clipboard.writeText(result.plus).catch(() => {})} className="text-primary text-sm inline-flex items-center gap-1.5"><Copy className="size-4" /> Copy</button></div>
              <p className="mt-2 text-xs text-muted-foreground">Mail still arrives at your inbox — filter or block this tag any time.</p>
            </div>
            <div className="soft-card p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="eyebrow">Random alias</span>
                <button onClick={() => setSeed((s) => s + 1)} className="text-primary text-sm inline-flex items-center gap-1.5"><RefreshCw className="size-4" /> New</button>
              </div>
              <div className="mt-2 flex items-center gap-2 rounded-xl bg-primary-soft/30 p-3"><span className="font-mono text-sm flex-1 break-all">{result.random}</span><button onClick={() => navigator.clipboard.writeText(result.random).catch(() => {})} className="text-primary text-sm inline-flex items-center gap-1.5"><Copy className="size-4" /> Copy</button></div>
            </div>
          </div>
          {result.isGmail && result.dots.length > 0 && (
            <div className="mt-4 soft-card p-4 sm:p-5">
              <span className="eyebrow">Gmail dot variants</span>
              <p className="mt-1 text-xs text-muted-foreground">Gmail ignores dots in the local part, so all of these reach the same inbox.</p>
              <ul className="mt-2 grid sm:grid-cols-2 gap-2">
                {result.dots.map((d) => (
                  <li key={d} className="flex items-center gap-2 rounded-lg bg-primary-soft/30 p-2.5"><span className="font-mono text-sm flex-1 break-all">{d}</span><button onClick={() => navigator.clipboard.writeText(d).catch(() => {})} className="text-primary text-xs"><Copy className="size-3.5" /></button></li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <div className="mt-4 soft-card p-4 text-sm text-destructive">Enter a valid email address.</div>
      )}
      <HowItWorks>
        <li>Type your real email and a label like <span className="font-mono">newsletter</span>.</li>
        <li>Sign up with the plus-address — incoming mail still hits your inbox.</li>
        <li>If a list sells your data you'll see which one because the tag travels with the message.</li>
      </HowItWorks>
      <div className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground"><ShieldCheck className="size-4 text-primary" /> Aliases are generated locally — nothing is sent to a server.</div>
    </ToolLayout>
  );
}
