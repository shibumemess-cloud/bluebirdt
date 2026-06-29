import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Hash, Copy, Check, FileUp, Trash2, Download } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks, WarnBox } from "../components/ToolControls";

export const Route = createFileRoute("/hash-generator")({
  head: () => ({
    meta: [
      { title: "Hash Generator — SHA-1, SHA-256, SHA-384, SHA-512 Free Online" },
      {
        name: "description",
        content:
          "Generate SHA-1, SHA-256, SHA-384 and SHA-512 hashes from text or a file. Free, secure and 100% in your browser.",
      },
      { property: "og:title", content: "Hash Generator — Bluebird" },
      { property: "og:description", content: "Free in-browser SHA-1 / SHA-256 / SHA-384 / SHA-512 hash generator for text or files." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/hash-generator" },
    ],
    links: [{ rel: "canonical", href: "/hash-generator" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird Hash Generator",
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: Page,
});

const ALGOS = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const;
type Algo = (typeof ALGOS)[number];

export function toHex(buf: ArrayBuffer): string {
  const view = new Uint8Array(buf);
  let out = "";
  for (let i = 0; i < view.length; i++) out += view[i].toString(16).padStart(2, "0");
  return out;
}

export async function hashBuffer(algo: Algo, data: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest(algo, data);
  return toHex(digest);
}

const MAX_FILE = 100 * 1024 * 1024;
const SAFE_NAME = (s: string) => s.replace(/[^a-z0-9._-]+/gi, "_").slice(0, 80) || "file";

function Page() {
  const [mode, setMode] = useState<"text" | "file">("text");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [results, setResults] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [compare, setCompare] = useState("");

  useEffect(() => {
    let cancel = false;
    async function run() {
      setErr(null);
      if (mode === "text") {
        if (!text) { setResults({}); return; }
        const enc = new TextEncoder().encode(text);
        const out: Record<string, string> = {};
        for (const a of ALGOS) out[a] = await hashBuffer(a, enc.buffer as ArrayBuffer);
        if (!cancel) setResults(out);
      } else {
        if (!file) { setResults({}); return; }
        if (file.size > MAX_FILE) { setErr("That file is bigger than 100 MB."); setResults({}); return; }
        if (file.size === 0) { setErr("This file is empty (0 bytes)."); setResults({}); return; }
        setBusy(true);
        try {
          const buf = await file.arrayBuffer();
          const out: Record<string, string> = {};
          for (const a of ALGOS) out[a] = await hashBuffer(a, buf);
          if (!cancel) setResults(out);
        } catch (e) {
          if (!cancel) setErr(e instanceof Error ? e.message : "Could not hash file.");
        } finally {
          if (!cancel) setBusy(false);
        }
      }
    }
    run();
    return () => { cancel = true; };
  }, [mode, text, file]);

  const compareNorm = compare.trim().toLowerCase();
  const matchAlgo = useMemo(
    () => (compareNorm ? Object.entries(results).find(([, v]) => v === compareNorm)?.[0] : null),
    [compareNorm, results],
  );

  async function copy(name: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(name);
    window.setTimeout(() => setCopied(null), 1400);
  }

  function downloadSidecar(algo: Algo, hex: string) {
    const stem = mode === "file" && file ? SAFE_NAME(file.name) : "text";
    const ext = algo.toLowerCase().replace("-", "");
    const blob = new Blob([`${hex}  ${stem}\n`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${stem}.${ext}`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ToolLayout slug="hash-generator">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        <section className="soft-card p-5 sm:p-6 space-y-4">
          <div role="radiogroup" aria-label="Input mode" className="inline-flex p-1 rounded-xl bg-muted">
            {(["text", "file"] as const).map((m) => (
              <button
                key={m}
                role="radio"
                aria-checked={mode === m}
                onClick={() => { setMode(m); setResults({}); setErr(null); }}
                className={`min-h-9 px-4 rounded-lg text-sm font-medium ${mode === m ? "bg-card shadow-soft" : "text-muted-foreground"}`}
              >
                {m === "text" ? "Text" : "File"}
              </button>
            ))}
          </div>

          {mode === "text" ? (
            <>
              <div className="flex items-center justify-between">
                <label htmlFor="hg-text" className="eyebrow">Text to hash</label>
                {text && (
                  <button onClick={() => setText("")} className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-border bg-card hover:bg-primary-soft text-xs">
                    <Trash2 className="size-3.5" /> Clear
                  </button>
                )}
              </div>
              <textarea
                id="hg-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste any text to hash…"
                className="w-full min-h-[260px] rounded-xl border border-border bg-card p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </>
          ) : (
            <>
              <label className="eyebrow block">File to hash (up to 100 MB)</label>
              <label
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDrag(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) { setFile(f); setResults({}); }
                }}
                className={`flex flex-col items-center justify-center gap-2 min-h-[220px] rounded-xl border-2 border-dashed cursor-pointer p-6 text-center transition ${drag ? "border-primary bg-primary-soft" : "border-border bg-card hover:bg-primary-soft"}`}
              >
                <FileUp className="size-7 text-primary" />
                <span className="font-medium break-all">
                  {file ? file.name : "Drop a file or click to choose"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Anything works — images, docs, archives"}
                </span>
                <input
                  type="file"
                  className="sr-only"
                  onChange={(e) => { setFile(e.target.files?.[0] || null); setResults({}); }}
                />
              </label>
            </>
          )}

          <div>
            <label htmlFor="hg-cmp" className="eyebrow block mb-2">Compare against a hash (optional)</label>
            <input
              id="hg-cmp"
              value={compare}
              onChange={(e) => setCompare(e.target.value)}
              placeholder="Paste a hash to verify a match…"
              className="w-full min-h-11 rounded-xl border border-border bg-card px-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {compareNorm && (
              <p className={`mt-2 text-sm ${matchAlgo ? "text-primary" : "text-destructive"}`} aria-live="polite">
                {matchAlgo ? `Match: ${matchAlgo}` : "No match against the hashes below."}
              </p>
            )}
          </div>

          {err && <WarnBox>{err}</WarnBox>}
        </section>

        <section className="soft-card p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Hash className="size-4 text-primary" />
            <div className="font-display text-lg">Hashes</div>
            {busy && <span className="text-xs text-muted-foreground">working…</span>}
          </div>

          {Object.keys(results).length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Hashes will appear here as you type or after you pick a file.
            </div>
          ) : (
            <ul className="space-y-3" aria-live="polite">
              {ALGOS.map((a) => (
                <li key={a} className="rounded-xl border border-border bg-card p-3">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-medium text-primary">{a}</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => copy(a, results[a])}
                        className="inline-flex items-center gap-1.5 min-h-8 px-2.5 rounded-lg border border-border hover:bg-primary-soft text-xs"
                        aria-label={`Copy ${a}`}
                      >
                        {copied === a ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                        {copied === a ? "Copied" : "Copy"}
                      </button>
                      <button
                        onClick={() => downloadSidecar(a, results[a])}
                        className="inline-flex items-center gap-1.5 min-h-8 px-2.5 rounded-lg border border-border hover:bg-primary-soft text-xs"
                        aria-label={`Download ${a} checksum file`}
                      >
                        <Download className="size-3.5" /> .{a.toLowerCase().replace("-", "")}
                      </button>
                    </div>
                  </div>
                  <div className="font-mono text-xs break-all text-muted-foreground">{results[a]}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <HowItWorks>
        <li>Choose Text or File and add your input.</li>
        <li>All four hashes are computed instantly in your browser.</li>
        <li>Download a checksum sidecar (.sha256 etc.) or paste an expected hash to verify a download.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
