import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AtSign, Copy, CheckCircle2, XCircle } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/email-validator")({
  head: () => ({
    meta: [
      { title: "Email Validator — Check Email Address Syntax (Bulk)" },
      { name: "description", content: "Validate one email address or check a whole list. Catches typos in popular domains. Free, instant, in your browser." },
      { property: "og:title", content: "Email Validator — Bluebird" },
      { property: "og:description", content: "Check email syntax in bulk. No upload." },
      { property: "og:url", content: "/email-validator" },
    ],
    links: [{ rel: "canonical", href: "/email-validator" }],
  }),
  component: Page,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const COMMON_DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "proton.me", "live.com", "aol.com"];

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  }
  return dp[m][n];
}

function suggestDomain(domain: string): string | null {
  const lower = domain.toLowerCase();
  if (COMMON_DOMAINS.includes(lower)) return null;
  let best: { d: string; dist: number } | null = null;
  for (const d of COMMON_DOMAINS) {
    const dist = levenshtein(lower, d);
    if (dist > 0 && dist <= 2 && (!best || dist < best.dist)) best = { d, dist };
  }
  return best?.d ?? null;
}

type Result = { email: string; valid: boolean; suggestion?: string | null };

function check(email: string): Result {
  const trimmed = email.trim();
  if (!trimmed) return { email, valid: false };
  if (!EMAIL_RE.test(trimmed)) return { email: trimmed, valid: false };
  const [, domain] = trimmed.split("@");
  return { email: trimmed, valid: true, suggestion: suggestDomain(domain) };
}

function Page() {
  const [input, setInput] = useState("alice@gmial.com\nbob@example.com\nnot-an-email\ncarol@yahooo.com");
  const results = useMemo(() => {
    const lines = input.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean);
    return lines.map(check);
  }, [input]);
  const valid = results.filter((r) => r.valid).length;
  const invalid = results.length - valid;

  function copyValid() {
    navigator.clipboard.writeText(results.filter((r) => r.valid).map((r) => r.email).join("\n")).catch(() => {});
  }

  return (
    <ToolLayout slug="email-validator">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2">
            <AtSign className="size-4 text-primary" />
            <div className="font-display text-lg">Paste emails — one per line</div>
          </div>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false}
            className="w-full min-h-64 font-mono text-sm rounded-2xl border border-border bg-card p-4 focus:outline-none focus:ring-2 focus:ring-ring" />
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="size-4 text-emerald-500" /> {valid} valid</span>
            <span className="inline-flex items-center gap-1.5"><XCircle className="size-4 text-rose-500" /> {invalid} invalid</span>
            {valid > 0 && (
              <button onClick={copyValid} className="ml-auto text-primary hover:underline inline-flex items-center gap-1.5">
                <Copy className="size-4" /> Copy valid only
              </button>
            )}
          </div>
        </section>

        <section className="soft-card p-5 sm:p-6 space-y-2 max-h-[34rem] overflow-y-auto" aria-live="polite">
          {results.length === 0 && <div className="text-sm text-muted-foreground">Results will appear here.</div>}
          {results.map((r, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
              {r.valid ? <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" /> : <XCircle className="size-5 text-rose-500 shrink-0 mt-0.5" />}
              <div className="min-w-0 flex-1">
                <div className="font-mono text-sm truncate">{r.email}</div>
                {!r.valid && <div className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">Not a valid email address</div>}
                {r.valid && r.suggestion && (
                  <div className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                    Did you mean <strong>{r.email.split("@")[0]}@{r.suggestion}</strong>?
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>
      </div>

      <HowItWorks>
        <li>Paste one or many email addresses, one per line.</li>
        <li>Each address is checked against standard syntax rules.</li>
        <li>Common typos like <code>gmial.com</code> get a suggested fix.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
