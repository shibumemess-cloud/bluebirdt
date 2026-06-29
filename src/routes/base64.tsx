import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, Check, FileCode2, ArrowLeftRight, Trash2, AlertTriangle, Upload } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks, WarnBox } from "../components/ToolControls";

export const Route = createFileRoute("/base64")({
  head: () => ({
    meta: [
      { title: "Base64 Encoder & Decoder — Free, In-Browser" },
      {
        name: "description",
        content:
          "Encode text or files to Base64 and decode them back instantly. UTF-8 safe, URL-safe option, file-to-data-URL. Runs in your browser, nothing uploads.",
      },
      { property: "og:title", content: "Base64 Encoder & Decoder — Bluebird" },
      { property: "og:description", content: "Encode and decode Base64 text or files in your browser. Free, private, no sign-up." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/base64" },
    ],
    links: [{ rel: "canonical", href: "/base64" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird Base64 Encoder & Decoder",
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          description: "Free in-browser Base64 encoder and decoder for text and files.",
        }),
      },
    ],
  }),
  component: Page,
});

type Mode = "encode" | "decode";

function encodeText(text: string, urlSafe: boolean): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  let b64 = btoa(bin);
  if (urlSafe) b64 = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return b64;
}

function decodeText(b64: string, urlSafe: boolean): string {
  let s = b64.trim().replace(/\s+/g, "");
  if (urlSafe) {
    s = s.replace(/-/g, "+").replace(/_/g, "/");
    const pad = s.length % 4;
    if (pad) s += "=".repeat(4 - pad);
  }
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

function Page() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const [urlSafe, setUrlSafe] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);

  const result = useMemo(() => {
    if (!input) return { ok: true, value: "" };
    try {
      const value = mode === "encode" ? encodeText(input, urlSafe) : decodeText(input, urlSafe);
      return { ok: true, value };
    } catch (e) {
      return { ok: false, value: (e as Error).message || "Could not decode — make sure this is valid Base64." };
    }
  }, [input, mode, urlSafe]);

  const swap = () => {
    if (result.ok && result.value) {
      setInput(result.value);
      setMode((m) => (m === "encode" ? "decode" : "encode"));
    } else {
      setMode((m) => (m === "encode" ? "decode" : "encode"));
    }
  };

  async function copy() {
    if (!result.ok || !result.value) return;
    await navigator.clipboard.writeText(result.value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  async function handleFile(f: File | null) {
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setFileDataUrl("error:File is larger than 5 MB.");
      return;
    }
    const buf = await f.arrayBuffer();
    let bin = "";
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    const b64 = btoa(bin);
    setFileDataUrl(`data:${f.type || "application/octet-stream"};base64,${b64}`);
  }

  const bytesOut = result.ok ? new Blob([result.value]).size : 0;

  return (
    <ToolLayout slug="base64">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        {/* Controls */}
        <section className="soft-card p-5 sm:p-6 space-y-5">
          <div>
            <div className="eyebrow mb-2">Mode</div>
            <div role="radiogroup" aria-label="Mode" className="grid grid-cols-2 gap-2">
              {(["encode", "decode"] as Mode[]).map((m) => (
                <button
                  key={m}
                  role="radio"
                  aria-checked={mode === m}
                  onClick={() => setMode(m)}
                  className={`min-h-11 rounded-xl border px-3 text-sm font-medium capitalize transition ${
                    mode === m
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:bg-primary-soft"
                  }`}
                >
                  {m === "encode" ? "Text → Base64" : "Base64 → Text"}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={urlSafe}
              onChange={(e) => setUrlSafe(e.target.checked)}
              className="size-4 accent-[color:var(--primary)]"
            />
            URL-safe (replaces <code className="px-1 rounded bg-primary-soft">+/=</code> with <code className="px-1 rounded bg-primary-soft">-_</code>)
          </label>

          <div>
            <label htmlFor="b64-input" className="eyebrow mb-2 block">
              {mode === "encode" ? "Your text" : "Base64 to decode"}
            </label>
            <textarea
              id="b64-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === "encode" ? "Type or paste any text…" : "Paste Base64 here…"}
              className="w-full min-h-44 sm:min-h-56 rounded-xl border border-border bg-card p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              spellCheck={false}
            />
            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>{input.length.toLocaleString()} characters</span>
              {input && (
                <button onClick={() => setInput("")} className="inline-flex items-center gap-1 hover:text-foreground">
                  <Trash2 className="size-3.5" /> Clear
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={swap}
              className="inline-flex items-center gap-2 min-h-11 px-4 rounded-xl border border-border bg-card hover:bg-primary-soft text-sm font-medium"
            >
              <ArrowLeftRight className="size-4" /> Swap input and output
            </button>
          </div>

          {/* File → Base64 helper */}
          <div className="border-t border-border pt-5">
            <div className="eyebrow mb-2">Encode a file as a data URL</div>
            <label className="flex items-center gap-2 min-h-11 px-4 rounded-xl border border-dashed border-border hover:bg-primary-soft cursor-pointer text-sm">
              <Upload className="size-4" />
              <span>Choose a file (max 5 MB)</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {fileDataUrl?.startsWith("error:") && (
              <WarnBox>{fileDataUrl.slice(6)}</WarnBox>
            )}
            {fileDataUrl && !fileDataUrl.startsWith("error:") && (
              <div className="mt-3 space-y-2">
                <div className="text-xs text-muted-foreground">
                  {fileDataUrl.length.toLocaleString()} characters
                </div>
                <textarea
                  readOnly
                  value={fileDataUrl}
                  className="w-full min-h-28 rounded-xl border border-border bg-card p-3 font-mono text-xs"
                />
                <button
                  onClick={async () => { await navigator.clipboard.writeText(fileDataUrl); }}
                  className="inline-flex items-center gap-2 min-h-11 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-95"
                >
                  <Copy className="size-4" /> Copy data URL
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Output */}
        <section className="soft-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileCode2 className="size-4 text-primary" />
              <div className="font-display text-lg">Result</div>
            </div>
            <div className="text-xs text-muted-foreground" aria-live="polite">
              {result.ok && result.value ? `${bytesOut.toLocaleString()} bytes` : ""}
            </div>
          </div>

          {!input ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Your converted text will appear here.
            </div>
          ) : !result.ok ? (
            <WarnBox>
              <span className="inline-flex items-center gap-2">
                <AlertTriangle className="size-4" /> {result.value}
              </span>
            </WarnBox>
          ) : (
            <>
              <textarea
                readOnly
                value={result.value}
                className="w-full min-h-44 sm:min-h-56 rounded-xl border border-border bg-card p-3 font-mono text-sm"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={copy}
                  className="inline-flex items-center gap-2 min-h-11 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-95"
                >
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {copied ? "Copied" : "Copy result"}
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([result.value], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = mode === "encode" ? "encoded.txt" : "decoded.txt";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="inline-flex items-center gap-2 min-h-11 px-4 rounded-xl border border-border bg-card hover:bg-primary-soft text-sm font-medium"
                >
                  Download
                </button>
              </div>
            </>
          )}
        </section>
      </div>

      <HowItWorks>
        <li>Pick a mode — turn text into Base64, or Base64 back into text.</li>
        <li>Type or paste, and the result updates as you go.</li>
        <li>Optionally choose URL-safe Base64 for use in links and tokens.</li>
        <li>For small files, use the file encoder to get a ready-to-use data URL.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
