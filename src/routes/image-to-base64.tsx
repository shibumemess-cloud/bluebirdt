import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Check, Download, FileCode2 } from "lucide-react";
import { ToolLayout, validateImageFile } from "../components/ToolLayout";
import { FileDrop, HowItWorks, ErrorBox, EmptyState } from "../components/ToolControls";

export const Route = createFileRoute("/image-to-base64")({
  head: () => ({
    meta: [
      { title: "Image to Base64 — Free Data URL Converter" },
      { name: "description", content: "Convert any image to a Base64 data URL — perfect for inline CSS, HTML <img src> and email signatures. Reverse direction too. Runs in your browser." },
      { property: "og:title", content: "Image to Base64 — Bluebird" },
      { property: "og:description", content: "Turn images into Base64 data URLs in your browser — works both ways, with HTML, CSS and Markdown snippets." },
      { property: "og:url", content: "/image-to-base64" },
    ],
    links: [{ rel: "canonical", href: "/image-to-base64" }],
  }),
  component: Page,
});

async function fileToDataUrl(f: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onerror = () => rej(new Error("Could not read the file."));
    r.onload = () => res(String(r.result || ""));
    r.readAsDataURL(f);
  });
}

function Page() {
  const [direction, setDirection] = useState<"to" | "from">("to");
  const [file, setFile] = useState<File | null>(null);
  const [dataUrl, setDataUrl] = useState<string>("");
  const [pasted, setPasted] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function onFile(f: File | null) {
    setError(null); setDataUrl("");
    const err = validateImageFile(f);
    if (err) { setError(err); setFile(null); return; }
    setFile(f);
    try { setDataUrl(await fileToDataUrl(f!)); } catch (e) { setError((e as Error).message); }
  }

  async function copy(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1300);
    } catch { /* ignore */ }
  }

  const htmlTag = dataUrl ? `<img src="${dataUrl}" alt="" />` : "";
  const cssTag = dataUrl ? `background-image: url("${dataUrl}");` : "";
  const md = dataUrl ? `![](${dataUrl})` : "";

  // Reverse direction
  const reverse = (() => {
    if (direction !== "from" || !pasted.trim()) return null;
    const s = pasted.trim();
    const isDataUrl = s.startsWith("data:");
    const url = isDataUrl ? s : `data:image/png;base64,${s.replace(/\s+/g, "")}`;
    try {
      const m = /^data:([^;,]+)?(;base64)?,(.*)$/s.exec(url);
      if (!m) return { ok: false as const, error: "That doesn't look like Base64 image data." };
      return { ok: true as const, url, mime: m[1] || "image/png" };
    } catch {
      return { ok: false as const, error: "Could not decode that Base64 image." };
    }
  })();

  return (
    <ToolLayout slug="image-to-base64">
      <div className="space-y-6">
        <div className="inline-flex rounded-xl border border-border bg-card p-1">
          {(["to", "from"] as const).map((d) => (
            <button key={d} type="button" onClick={() => setDirection(d)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${direction === d ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {d === "to" ? "Image → Base64" : "Base64 → Image"}
            </button>
          ))}
        </div>

        {direction === "to" ? (
          <div className="grid grid-cols-12 gap-6 md:gap-8">
            <div className="col-span-12 md:col-span-7 space-y-5">
              <FileDrop file={file} onFile={onFile} label="Drop an image here, or click to pick" hint="JPG · PNG · WEBP · GIF · SVG — up to 20 MB" />
              {error && <ErrorBox>{error}</ErrorBox>}
              <HowItWorks>
                A Base64 data URL is just a long text version of the image bytes. Paste it straight into an
                HTML <code>&lt;img&gt;</code>, a CSS <code>background-image</code> or a Markdown image — no file
                hosting needed. Best for small icons; very large images become very long strings.
              </HowItWorks>
            </div>
            <aside className="col-span-12 md:col-span-5">
              {!dataUrl ? (
                <EmptyState text="Pick an image and we'll show the Base64 string plus copy-ready HTML, CSS and Markdown snippets." />
              ) : (
                <div className="space-y-4">
                  <div className="soft-card p-4">
                    <span className="eyebrow">Preview</span>
                    <div className="mt-2 rounded-xl border border-border checker-bg p-3 grid place-items-center">
                      <img src={dataUrl} alt="" className="max-h-48 object-contain" />
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground num">{(dataUrl.length / 1024).toFixed(1)} KB of text</div>
                  </div>
                  <CodeBlock label="Base64 data URL" value={dataUrl} copied={copied === "url"} onCopy={() => copy("url", dataUrl)} />
                  <CodeBlock label="HTML <img>" value={htmlTag} copied={copied === "html"} onCopy={() => copy("html", htmlTag)} />
                  <CodeBlock label="CSS background" value={cssTag} copied={copied === "css"} onCopy={() => copy("css", cssTag)} />
                  <CodeBlock label="Markdown" value={md} copied={copied === "md"} onCopy={() => copy("md", md)} />
                </div>
              )}
            </aside>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6 md:gap-8">
            <div className="col-span-12 md:col-span-7">
              <div className="soft-card p-4">
                <label className="block">
                  <span className="eyebrow flex items-center gap-1.5"><FileCode2 className="size-3.5" /> Paste Base64 or a data URL</span>
                  <textarea value={pasted} onChange={(e) => setPasted(e.target.value)} spellCheck={false}
                    placeholder="data:image/png;base64,iVBORw0KGgo..."
                    className="mt-2 w-full h-72 rounded-xl border border-border bg-background p-3 font-mono text-xs focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-y" />
                </label>
              </div>
            </div>
            <aside className="col-span-12 md:col-span-5">
              {!reverse ? (
                <EmptyState text="Paste a Base64 string or a data: URL and we'll rebuild the image so you can preview and download it." />
              ) : !reverse.ok ? (
                <ErrorBox>{reverse.error}</ErrorBox>
              ) : (
                <div className="soft-card p-4">
                  <span className="eyebrow">Decoded image</span>
                  <div className="mt-2 rounded-xl border border-border checker-bg p-3 grid place-items-center">
                    <img src={reverse.url} alt="" className="max-h-72 object-contain" />
                  </div>
                  <a href={reverse.url} download={`decoded.${reverse.mime.includes("jpeg") ? "jpg" : reverse.mime.split("/")[1] || "png"}`}
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3 font-semibold w-full">
                    <Download className="size-4" /> Download image
                  </a>
                </div>
              )}
            </aside>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

function CodeBlock({ label, value, copied, onCopy }: { label: string; value: string; copied: boolean; onCopy: () => void }) {
  return (
    <div className="soft-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="eyebrow">{label}</span>
        <button type="button" onClick={onCopy}
          className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-border bg-card hover:border-primary text-xs font-medium">
          {copied ? <><Check className="size-3.5" /> Copied</> : <><Copy className="size-3.5" /> Copy</>}
        </button>
      </div>
      <div className="rounded-lg bg-muted/40 border border-border p-2.5 font-mono text-xs break-all max-h-32 overflow-auto">{value}</div>
    </div>
  );
}
