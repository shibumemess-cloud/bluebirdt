import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, ShieldAlert, ShieldCheck, Clock } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";

export const Route = createFileRoute("/jwt-decoder")({
  head: () => ({
    meta: [
      { title: "JWT Decoder — Decode JSON Web Tokens Online Free" },
      { name: "description", content: "Decode and inspect any JWT in your browser. Header, payload, expiry and signature — nothing is sent to a server. Free and private." },
      { property: "og:title", content: "JWT Decoder — Bluebird" },
      { property: "og:description", content: "Decode JWT tokens without leaving your browser. Header, payload, expiry — fully private." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/jwt-decoder" },
    ],
    links: [{ rel: "canonical", href: "/jwt-decoder" }],
  }),
  component: Page,
});

const SAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkYSBMb3ZlbGFjZSIsImlhdCI6MTcxNzAwMDAwMCwiZXhwIjoxOTAwMDAwMDAwfQ.5W5K1u-7gqIs9XK4kRk0sQ8mF1pj8m5ZxhUjPVnu5JU";

function base64UrlDecode(input: string): string {
  const pad = input.length % 4 === 0 ? 0 : 4 - (input.length % 4);
  const b64 = (input + "=".repeat(pad)).replace(/-/g, "+").replace(/_/g, "/");
  try {
    const binary = atob(b64);
    // UTF-8 safe
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    throw new Error("Invalid base64url");
  }
}

type Decoded = {
  header: unknown;
  payload: unknown;
  signature: string;
  raw: { header: string; payload: string; signature: string };
};

function decodeJwt(token: string): Decoded {
  const parts = token.trim().split(".");
  if (parts.length !== 3) throw new Error("A JWT must have three parts separated by dots.");
  const [h, p, s] = parts;
  const header = JSON.parse(base64UrlDecode(h));
  const payload = JSON.parse(base64UrlDecode(p));
  return { header, payload, signature: s, raw: { header: h, payload: p, signature: s } };
}

function fmtExp(epoch: number): { label: string; tone: "ok" | "warn" | "bad" } {
  const ms = epoch * 1000;
  const now = Date.now();
  const diff = ms - now;
  const date = new Date(ms).toLocaleString();
  if (diff < 0) return { label: `Expired · ${date}`, tone: "bad" };
  const days = Math.floor(diff / 86_400_000);
  if (days < 1) return { label: `Expires in less than a day · ${date}`, tone: "warn" };
  return { label: `Expires in ${days} day${days === 1 ? "" : "s"} · ${date}`, tone: "ok" };
}

function Page() {
  const [token, setToken] = useState<string>("");

  const result = useMemo(() => {
    if (!token.trim()) return { ok: false as const, error: "" };
    try {
      return { ok: true as const, value: decodeJwt(token) };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  }, [token]);

  function copy(text: string) {
    navigator.clipboard.writeText(text).catch(() => undefined);
  }

  const exp =
    result.ok && typeof (result.value.payload as { exp?: number }).exp === "number"
      ? fmtExp((result.value.payload as { exp: number }).exp)
      : null;

  return (
    <ToolLayout slug="jwt-decoder">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="jwt-input" className="text-sm font-semibold">
              Paste your JWT
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setToken(SAMPLE)}
                className="text-xs font-medium text-primary hover:underline underline-offset-4"
              >
                Use sample
              </button>
              <button
                type="button"
                onClick={() => setToken("")}
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            </div>
          </div>
          <textarea
            id="jwt-input"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            spellCheck={false}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            className="w-full min-h-56 font-mono text-sm rounded-2xl border border-border bg-card p-4 focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <div className="flex items-start gap-3 rounded-xl border border-border bg-primary-soft/40 px-4 py-3 text-sm">
            <ShieldCheck className="size-5 text-primary shrink-0 mt-0.5" />
            <p className="text-muted-foreground">
              Your token never leaves this tab. Decoding runs entirely in your browser using <code className="font-mono">atob</code> and <code className="font-mono">JSON.parse</code>.
            </p>
          </div>
          {!result.ok && result.error && (
            <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
              <ShieldAlert className="size-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-foreground">{result.error}</p>
            </div>
          )}
        </div>

        <aside className="col-span-12 lg:col-span-6 space-y-4">
          {result.ok ? (
            <>
              {exp && (
                <div
                  className={[
                    "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm",
                    exp.tone === "bad"
                      ? "border-destructive/40 bg-destructive/5 text-destructive"
                      : exp.tone === "warn"
                        ? "border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-300"
                        : "border-border bg-card text-foreground",
                  ].join(" ")}
                >
                  <Clock className="size-4 shrink-0" />
                  <span className="font-medium">{exp.label}</span>
                </div>
              )}
              <Section
                title="Header"
                body={JSON.stringify(result.value.header, null, 2)}
                tone="primary"
                onCopy={copy}
              />
              <Section
                title="Payload"
                body={JSON.stringify(result.value.payload, null, 2)}
                tone="primary"
                onCopy={copy}
              />
              <Section
                title="Signature"
                body={result.value.raw.signature}
                tone="muted"
                mono
                onCopy={copy}
              />
            </>
          ) : (
            <div className="soft-card p-8 text-center">
              <div className="text-sm text-muted-foreground">
                Paste a JWT to see its header, payload, expiry and signature side-by-side.
              </div>
            </div>
          )}
        </aside>
      </div>
    </ToolLayout>
  );
}

function Section({
  title,
  body,
  tone,
  mono,
  onCopy,
}: {
  title: string;
  body: string;
  tone: "primary" | "muted";
  mono?: boolean;
  onCopy: (text: string) => void;
}) {
  return (
    <div className="soft-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card/60">
        <div className={["text-xs font-semibold uppercase tracking-wider", tone === "primary" ? "text-primary" : "text-muted-foreground"].join(" ")}>
          {title}
        </div>
        <button
          type="button"
          onClick={() => onCopy(body)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary"
        >
          <Copy className="size-3.5" /> Copy
        </button>
      </div>
      <pre className={["px-4 py-3 text-sm overflow-x-auto whitespace-pre-wrap break-all", mono ? "font-mono" : "font-mono"].join(" ")}>
        {body}
      </pre>
    </div>
  );
}
