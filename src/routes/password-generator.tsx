import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Copy, Check, RefreshCw, KeyRound, ShieldCheck, Eye, EyeOff, Type, MessageSquareText } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { Field, HowItWorks, ErrorBox } from "../components/ToolControls";
import { buildPassphrase, passphraseEntropyBits } from "../lib/image-tool-helpers";
import ogImage from "../assets/og/og-password.jpg";

export const Route = createFileRoute("/password-generator")({
  head: () => ({
    meta: [
      { title: "Password Generator — Strong, Free, In-Browser" },
      {
        name: "description",
        content:
          "Generate strong random passwords or memorable passphrases in your browser. Length, character classes, skip look-alikes, instant strength meter. No uploads, ever.",
      },
      { property: "og:title", content: "Password Generator — Bluebird" },
      { property: "og:description", content: "Strong random passwords and memorable passphrases made in your browser with secure randomness. Free, no sign-up." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/password-generator" },
      { property: "og:image", content: ogImage },
      { name: "twitter:image", content: ogImage },
    ],
    links: [{ rel: "canonical", href: "/password-generator" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird Password Generator",
          applicationCategory: "SecurityApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          description: "Free in-browser strong password generator with strength meter and memorable passphrase mode.",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Are these passwords safe to use?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. They're created on your device using your browser's built-in secure randomness (crypto.getRandomValues). Nothing is sent to any server.",
              },
            },
            {
              "@type": "Question",
              name: "What is a passphrase and when should I use one?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "A passphrase is a string of random everyday words like 'amber-canoe-pilot-river'. They're far easier to remember than random characters and, at six or more words, just as hard to crack.",
              },
            },
            {
              "@type": "Question",
              name: "How long should my password be?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "For most accounts, 16 characters or more is excellent. For ultra-sensitive accounts (email, banking, password manager master), use 20+ characters or a 6-word passphrase.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: Page,
});

type Mode = "random" | "passphrase";


const SETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?/",
} as const;

const LOOKALIKES = /[Il1O0o]/g;

function secureRandomInt(max: number): number {
  // Rejection sampling for an unbiased 0..max-1 from crypto.getRandomValues
  const arr = new Uint32Array(1);
  const limit = Math.floor(0xffffffff / max) * max;
  while (true) {
    crypto.getRandomValues(arr);
    if (arr[0] < limit) return arr[0] % max;
  }
}

function generate(opts: {
  length: number;
  lower: boolean;
  upper: boolean;
  digits: boolean;
  symbols: boolean;
  noLookalikes: boolean;
}): string {
  let alphabet = "";
  const required: string[] = [];
  if (opts.lower) { alphabet += SETS.lower; required.push(SETS.lower); }
  if (opts.upper) { alphabet += SETS.upper; required.push(SETS.upper); }
  if (opts.digits) { alphabet += SETS.digits; required.push(SETS.digits); }
  if (opts.symbols) { alphabet += SETS.symbols; required.push(SETS.symbols); }
  if (opts.noLookalikes) alphabet = alphabet.replace(LOOKALIKES, "");
  if (!alphabet) return "";

  const out: string[] = [];
  // Seed with one char per required class so the result includes them all.
  for (const cls of required) {
    const cleaned = opts.noLookalikes ? cls.replace(LOOKALIKES, "") : cls;
    if (cleaned.length) out.push(cleaned[secureRandomInt(cleaned.length)]);
  }
  while (out.length < opts.length) out.push(alphabet[secureRandomInt(alphabet.length)]);
  // Fisher–Yates shuffle so the seeded chars are not stuck at the front.
  for (let i = out.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.slice(0, opts.length).join("");
}

function estimateEntropyBits(pw: string, alphabetSize: number): number {
  if (!pw || alphabetSize <= 1) return 0;
  return Math.round(pw.length * Math.log2(alphabetSize));
}

function strengthLabel(bits: number): { label: string; tone: "danger" | "warn" | "ok" | "great"; pct: number } {
  const pct = Math.max(4, Math.min(100, Math.round((bits / 128) * 100)));
  if (bits < 40) return { label: "Weak", tone: "danger", pct };
  if (bits < 60) return { label: "Okay", tone: "warn", pct };
  if (bits < 90) return { label: "Strong", tone: "ok", pct };
  return { label: "Excellent", tone: "great", pct };
}

function Page() {
  const [mode, setMode] = useState<Mode>("random");

  // Random password options
  const [length, setLength] = useState(20);
  const [lower, setLower] = useState(true);
  const [upper, setUpper] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [noLookalikes, setNoLookalikes] = useState(false);

  // Passphrase options
  const [words, setWords] = useState(5);
  const [separator, setSeparator] = useState("-");
  const [capitalize, setCapitalize] = useState(true);
  const [addDigit, setAddDigit] = useState(true);

  const [reveal, setReveal] = useState(true);
  const [password, setPassword] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const announceRef = useRef<HTMLParagraphElement>(null);

  const alphabetSize = useMemo(() => {
    let a = 0;
    if (lower) a += SETS.lower.length;
    if (upper) a += SETS.upper.length;
    if (digits) a += SETS.digits.length;
    if (symbols) a += SETS.symbols.length;
    if (noLookalikes) {
      const all = (lower ? SETS.lower : "") + (upper ? SETS.upper : "") + (digits ? SETS.digits : "") + (symbols ? SETS.symbols : "");
      a = all.replace(LOOKALIKES, "").length;
    }
    return a;
  }, [lower, upper, digits, symbols, noLookalikes]);

  const noClassPicked = mode === "random" && !(lower || upper || digits || symbols);

  const make = useCallback(() => {
    let pw = "";
    if (mode === "random") {
      if (noClassPicked) return;
      pw = generate({ length, lower, upper, digits, symbols, noLookalikes });
    } else {
      pw = buildPassphrase({ words, separator, capitalize, addDigit });
    }
    setPassword(pw);
    setHistory((h) => [pw, ...h.filter((p) => p !== pw)].slice(0, 5));
    if (announceRef.current) announceRef.current.textContent = "New password generated.";
  }, [mode, length, lower, upper, digits, symbols, noLookalikes, words, separator, capitalize, addDigit, noClassPicked]);

  useEffect(() => { make(); /* initial + on option change */ }, [make]);

  async function copy(v: string) {
    try {
      await navigator.clipboard.writeText(v);
      setCopied(v);
      setTimeout(() => setCopied((c) => (c === v ? null : c)), 1500);
    } catch {
      /* ignore — clipboard may be blocked */
    }
  }

  const bits = mode === "random"
    ? estimateEntropyBits(password, alphabetSize)
    : passphraseEntropyBits(words, addDigit);
  const strength = strengthLabel(bits);
  const toneClass = {
    danger: "bg-[color:var(--color-danger)]",
    warn: "bg-[color:var(--color-warn)]",
    ok: "bg-[color:var(--color-success)]",
    great: "bg-primary",
  }[strength.tone];

  return (
    <ToolLayout slug="password-generator">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Controls */}
        <div className="soft-card p-5 sm:p-6 space-y-6">
          {/* Mode switcher */}
          <div role="radiogroup" aria-label="Password type" className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-muted/40 border border-border">
            <ModeBtn active={mode === "random"} onClick={() => setMode("random")} icon={<Type className="size-4" />} label="Random" />
            <ModeBtn active={mode === "passphrase"} onClick={() => setMode("passphrase")} icon={<MessageSquareText className="size-4" />} label="Passphrase" />
          </div>

          {mode === "random" ? (
            <>
              <Field
                label={`Length — ${length} characters`}
                hint="Anything above 16 characters is generally very strong."
              >
                <input
                  type="range"
                  min={6}
                  max={64}
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  aria-label="Password length"
                  className="w-full accent-primary min-h-11"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1 num">
                  <span>6</span><span>20</span><span>40</span><span>64</span>
                </div>
              </Field>

              <fieldset>
                <legend className="block text-sm font-semibold mb-2">Include</legend>
                <div className="grid grid-cols-2 gap-2">
                  <Toggle on={lower} onChange={setLower} label="Lower (a-z)" />
                  <Toggle on={upper} onChange={setUpper} label="Upper (A-Z)" />
                  <Toggle on={digits} onChange={setDigits} label="Digits (0-9)" />
                  <Toggle on={symbols} onChange={setSymbols} label="Symbols (!@#…)" />
                </div>
              </fieldset>

              <Toggle
                on={noLookalikes}
                onChange={setNoLookalikes}
                label="Skip look-alike letters (I, l, 1, O, 0, o)"
              />

              {noClassPicked && <ErrorBox>Pick at least one character type to start.</ErrorBox>}
            </>
          ) : (
            <>
              <Field
                label={`Words — ${words}`}
                hint="Six or more words is excellent. Easier to remember than random characters."
              >
                <input
                  type="range"
                  min={3}
                  max={10}
                  value={words}
                  onChange={(e) => setWords(Number(e.target.value))}
                  aria-label="Word count"
                  className="w-full accent-primary min-h-11"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1 num">
                  <span>3</span><span>5</span><span>7</span><span>10</span>
                </div>
              </Field>

              <Field label="Separator">
                <div className="grid grid-cols-5 gap-1.5" role="radiogroup" aria-label="Separator">
                  {[
                    { v: "-", l: "Dash" },
                    { v: ".", l: "Dot" },
                    { v: "_", l: "Under" },
                    { v: " ", l: "Space" },
                    { v: "", l: "None" },
                  ].map((s) => (
                    <button
                      key={s.l}
                      type="button"
                      role="radio"
                      aria-checked={separator === s.v}
                      onClick={() => setSeparator(s.v)}
                      className={[
                        "rounded-lg border px-2 py-2 text-xs font-medium min-h-11",
                        separator === s.v
                          ? "border-primary bg-primary-soft text-primary"
                          : "border-border bg-card text-muted-foreground hover:bg-primary-soft/40",
                      ].join(" ")}
                    >
                      {s.l}
                    </button>
                  ))}
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-2">
                <Toggle on={capitalize} onChange={setCapitalize} label="Capitalize each word" />
                <Toggle on={addDigit} onChange={setAddDigit} label="Add a digit on end" />
              </div>
            </>
          )}

          <HowItWorks>
            We use your browser's built-in secure randomness
            (<code>crypto.getRandomValues</code>) and never send the password anywhere.
            Close the tab and it's gone forever.
          </HowItWorks>
        </div>


        {/* Result */}
        <div className="soft-card p-5 sm:p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between gap-2">
            <span className="eyebrow inline-flex items-center gap-2">
              <KeyRound className="size-4 text-primary" /> Your password
            </span>
            <button
              type="button"
              onClick={() => setReveal((r) => !r)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-primary-soft min-h-9"
              aria-pressed={!reveal}
              aria-label={reveal ? "Hide password" : "Show password"}
            >
              {reveal ? <><EyeOff className="size-4" /> Hide</> : <><Eye className="size-4" /> Show</>}
            </button>
          </div>

          <div className="rounded-xl border-2 border-primary/30 bg-primary-soft/40 p-4 sm:p-5">
            <div
              className="font-mono break-all text-xl sm:text-2xl leading-snug select-all min-h-12"
              aria-live="polite"
              aria-label="Generated password"
            >
              {reveal ? (password || "—") : "•".repeat(password.length || 1)}
            </div>
          </div>

          {/* Strength */}
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">Strength: {strength.label}</span>
              <span className="text-muted-foreground num">{bits} bits</span>
            </div>
            <div className="mt-2 h-2.5 w-full rounded-full bg-card border border-border overflow-hidden">
              <div
                className={`h-full ${toneClass} transition-[width] duration-300`}
                style={{ width: `${strength.pct}%` }}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={strength.pct}
                aria-label={`Password strength ${strength.label}`}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <button
              type="button"
              onClick={() => copy(password)}
              disabled={!password}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3.5 font-semibold min-h-12 hover:shadow-lift hover:-translate-y-0.5 disabled:opacity-50"
            >
              {copied === password ? <><Check className="size-4" /> Copied</> : <><Copy className="size-4" /> Copy</>}
            </button>
            <button
              type="button"
              onClick={make}
              disabled={noClassPicked}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-medium min-h-12 hover:bg-primary-soft disabled:opacity-50"
              aria-label="Generate another password"
            >
              <RefreshCw className="size-4" /> New
            </button>
          </div>

          {/* History */}
          {history.length > 1 && (
            <div>
              <div className="eyebrow mb-2">Recent (this tab only)</div>
              <ul className="space-y-1.5">
                {history.slice(1).map((p) => (
                  <li key={p} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
                    <code className="font-mono text-sm truncate flex-1">{reveal ? p : "•".repeat(p.length)}</code>
                    <button
                      type="button"
                      onClick={() => copy(p)}
                      className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:text-primary hover:bg-primary-soft"
                      aria-label="Copy this password"
                    >
                      {copied === p ? <Check className="size-4" /> : <Copy className="size-4" />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-muted-foreground flex items-start gap-1.5">
            <ShieldCheck className="size-3.5 mt-0.5 text-primary shrink-0" />
            Passwords are made on your device. We never see them — nothing is sent anywhere.
          </p>
          <p ref={announceRef} className="sr-only" role="status" aria-live="polite" />
        </div>
      </div>
    </ToolLayout>
  );
}

function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={[
        "inline-flex items-center justify-between gap-2 rounded-xl border px-3.5 py-3 text-sm font-medium min-h-11 text-left",
        on
          ? "border-primary bg-primary-soft text-primary"
          : "border-border bg-card text-foreground hover:bg-primary-soft/40",
      ].join(" ")}
    >
      <span className="truncate">{label}</span>
      <span
        aria-hidden
        className={[
          "shrink-0 inline-block w-9 h-5 rounded-full relative transition-colors",
          on ? "bg-primary" : "bg-muted",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-0.5 size-4 rounded-full bg-card shadow-sm transition-transform",
            on ? "translate-x-4" : "translate-x-0.5",
          ].join(" ")}
        />
      </span>
    </button>
  );
}

function ModeBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium min-h-11 transition-colors",
        active
          ? "bg-card text-primary shadow-sm border border-primary/30"
          : "text-muted-foreground hover:text-foreground",
      ].join(" ")}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

