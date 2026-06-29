import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import JSZip from "jszip";
import { Download, Check, Copy, AlertTriangle } from "lucide-react";
import { ToolLayout, validateImageFile } from "../components/ToolLayout";
import { FileDrop, Field, ErrorBox, RunButton, EmptyState, HowItWorks } from "../components/ToolControls";
import ogImage from "../assets/og/og-favicon.jpg";

export const Route = createFileRoute("/favicon-generator")({
  head: () => ({
    meta: [
      { title: "Favicon Generator — Free Online Favicon Maker from PNG" },
      { name: "description", content: "Make a complete favicon pack from a PNG or JPG — browser tabs, Apple touch icons, Android maskable and Windows tiles — with a copy-paste HTML snippet. Free." },
      { property: "og:title", content: "Favicon Generator — Bluebird" },
      { property: "og:description", content: "A complete favicon set with previews and a ready-to-paste HTML snippet. Free." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/favicon-generator" },
      { property: "og:image", content: ogImage },
      { name: "twitter:image", content: ogImage },
    ],
    links: [{ rel: "canonical", href: "/favicon-generator" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird Favicon Generator",
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          description: "Free in-browser favicon generator that produces a complete icon pack and HTML snippet.",
        }),
      },
    ],
  }),
  component: Page,
});

const SIZES = [16, 32, 48, 180, 192, 512] as const;

async function loadImage(file: File): Promise<HTMLImageElement> {
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await img.decode();
  return img;
}

function drawIcon(
  img: HTMLImageElement,
  size: number,
  bg: string,
  padding: number, // 0..0.3
  rounded = false,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";

  if (rounded) {
    const r = size * 0.22;
    ctx.beginPath();
    ctx.moveTo(r, 0); ctx.lineTo(size - r, 0); ctx.quadraticCurveTo(size, 0, size, r);
    ctx.lineTo(size, size - r); ctx.quadraticCurveTo(size, size, size - r, size);
    ctx.lineTo(r, size); ctx.quadraticCurveTo(0, size, 0, size - r);
    ctx.lineTo(0, r); ctx.quadraticCurveTo(0, 0, r, 0); ctx.closePath();
    ctx.clip();
  }
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  const inner = size * (1 - padding * 2);
  const ratio = Math.min(inner / img.naturalWidth, inner / img.naturalHeight);
  const w = img.naturalWidth * ratio;
  const h = img.naturalHeight * ratio;
  ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
  return canvas;
}

async function canvasToBlob(c: HTMLCanvasElement, mime = "image/png"): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) =>
    c.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), mime),
  );
}

const HTML_SNIPPET = `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="{THEME}">`;

const MANIFEST = (bg: string) => JSON.stringify({
  name: "My Site",
  short_name: "Site",
  icons: [
    { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
    { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    { src: "/maskable-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
  theme_color: bg,
  background_color: bg,
  display: "standalone",
}, null, 2);

function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [bg, setBg] = useState("#1E66F5");
  const [padding, setPadding] = useState(0.1);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [snippetCopied, setSnippetCopied] = useState(false);
  const [individuals, setIndividuals] = useState<{ size: number; url: string; name: string }[]>([]);
  const [qualityNote, setQualityNote] = useState<string | null>(null);

  function onFile(f: File | null) {
    setIndividuals([]); setZipUrl(null); setImg(null); setQualityNote(null);
    const err = validateImageFile(f);
    setError(err);
    if (err || !f) { setFile(null); return; }
    setFile(f);
    (async () => {
      const i = await loadImage(f);
      setImg(i);
      const min = Math.min(i.naturalWidth, i.naturalHeight);
      if (min < 180) setQualityNote(`A bit small (${i.naturalWidth} × ${i.naturalHeight}). Try a source ≥ 512 px for sharp icons.`);
      else if (min < 512) setQualityNote(`Good (${i.naturalWidth} × ${i.naturalHeight}). 512 × 512 or larger is ideal.`);
      else setQualityNote(`Looks great (${i.naturalWidth} × ${i.naturalHeight}).`);
    })();
  }

  async function generate() {
    if (!file || !img) return;
    setBusy(true); setError(null); setIndividuals([]); setZipUrl(null);
    try {
      const png = (size: number, p = padding) => drawIcon(img, size, bg, p);
      const items: Array<{ size: number; name: string; blob: Blob }> = [];
      items.push({ size: 16,  name: "favicon-16x16.png",         blob: await canvasToBlob(png(16)) });
      items.push({ size: 32,  name: "favicon-32x32.png",         blob: await canvasToBlob(png(32)) });
      items.push({ size: 48,  name: "favicon-48x48.png",         blob: await canvasToBlob(png(48)) });
      items.push({ size: 180, name: "apple-touch-icon.png",      blob: await canvasToBlob(png(180)) });
      items.push({ size: 192, name: "android-chrome-192x192.png",blob: await canvasToBlob(png(192)) });
      items.push({ size: 512, name: "android-chrome-512x512.png",blob: await canvasToBlob(png(512)) });
      // Maskable variant uses a larger safe-area padding (~20%)
      items.push({ size: 512, name: "maskable-512x512.png",      blob: await canvasToBlob(drawIcon(img, 512, bg, 0.2)) });

      const zip = new JSZip();
      for (const it of items) zip.file(it.name, it.blob);
      zip.file("site.webmanifest", MANIFEST(bg));
      zip.file("README.txt",
        "Bluebird favicon pack\n\n" +
        "Paste the snippet from README-snippet.html into your site's <head>.\n" +
        "Place every PNG and site.webmanifest at the root of your site (/).\n",
      );
      zip.file("README-snippet.html", HTML_SNIPPET.replace("{THEME}", bg));
      const zipBlob = await zip.generateAsync({ type: "blob" });

      setIndividuals(items.map((s) => ({ size: s.size, name: s.name, url: URL.createObjectURL(s.blob) })));
      setZipUrl(URL.createObjectURL(zipBlob));
    } catch {
      setError("Sorry, we couldn't make the icons from that image. A square picture works best.");
    } finally { setBusy(false); }
  }

  const canRun = !!file && !!img && !error && !busy;

  return (
    <ToolLayout slug="favicon-generator">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 md:col-span-7 space-y-6">
          <FileDrop
            file={file}
            onFile={onFile}
            label="Choose a logo or square picture"
            hint="A square image at 512 × 512 or larger works best — up to 20 MB"
          />

          {qualityNote && (
            <div className="flex items-start gap-2 rounded-xl border border-border bg-card/60 px-4 py-3 text-sm">
              <span className="size-2 rounded-full bg-primary mt-2 shrink-0" />
              <span>{qualityNote}</span>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-[1fr_1fr]">
            <Field label="Background color" hint="Used behind transparent images and for the manifest theme.">
              <div className="flex items-center gap-3">
                <input type="color" value={bg} onChange={(e) => setBg(e.target.value)}
                  className="size-11 rounded-lg border border-border bg-card cursor-pointer" />
                <code className="rounded-lg border border-border bg-card px-3 py-2 text-sm num">{bg}</code>
              </div>
            </Field>
            <Field label={`Padding · ${Math.round(padding * 100)}%`} hint="Some breathing room around your logo.">
              <input type="range" min={0} max={0.3} step={0.02} value={padding}
                onChange={(e) => setPadding(Number(e.target.value))}
                className="w-full" />
            </Field>
          </div>

          {img && (
            <div>
              <div className="text-sm font-semibold mb-3">Live preview in real places</div>
              <ContextPreviews img={img} bg={bg} padding={padding} />
            </div>
          )}

          {error && <ErrorBox>{error}</ErrorBox>}
          <RunButton onClick={generate} disabled={!canRun} busy={busy} label="Make my icons" />

          {individuals.length > 0 && (
            <div className="soft-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
                <span className="font-display text-lg">Files in your pack</span>
                <span className="text-xs text-muted-foreground num">{individuals.length} files</span>
              </div>
              <ul className="divide-y divide-border">
                {individuals.map((f) => (
                  <li key={f.name} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-5 py-3">
                    <div className="checker-bg rounded-lg border border-border p-1 grid place-items-center size-10">
                      <img src={f.url} alt="" width={Math.min(f.size, 32)} height={Math.min(f.size, 32)} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{f.name}</div>
                      <div className="text-xs text-muted-foreground num">{f.size} × {f.size} px</div>
                    </div>
                    <a
                      href={f.url}
                      download={f.name}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline underline-offset-4 shrink-0 min-h-10 px-2"
                    >
                      <Download className="size-4" /> Save
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <HowItWorks>
            Icons are rendered on a hidden canvas in your browser using your chosen color and padding,
            then bundled into a zip with a manifest and a copy-paste HTML snippet.
          </HowItWorks>
        </div>

        <aside className="col-span-12 md:col-span-5">
          {zipUrl ? (
            <div className="soft-card p-5 sm:p-6 h-full flex flex-col animate-[pop_.4s_cubic-bezier(0.22,1,0.36,1)_both]">
              <span className="eyebrow">Ready</span>
              <div className="font-display text-2xl mt-1">Your icon pack</div>
              <p className="text-sm text-muted-foreground mt-2">
                Includes browser-tab icons, Apple touch icon, Android maskable, Windows tile, and a
                <span className="font-medium"> site.webmanifest</span>.
              </p>

              <div className="mt-5 inset-surface p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Paste in your &lt;head&gt;</div>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(HTML_SNIPPET.replace("{THEME}", bg));
                        setSnippetCopied(true);
                        setTimeout(() => setSnippetCopied(false), 1500);
                      } catch { /* */ }
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    {snippetCopied ? <><Check className="size-3.5" /> Copied</> : <><Copy className="size-3.5" /> Copy</>}
                  </button>
                </div>
                <pre className="text-[11px] leading-relaxed overflow-x-auto text-foreground/90 font-mono">
{HTML_SNIPPET.replace("{THEME}", bg)}
                </pre>
              </div>

              <a
                href={zipUrl}
                download="favicons.zip"
                className="mt-auto pt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3.5 font-semibold min-h-12 hover:shadow-lift hover:-translate-y-0.5"
              >
                <Download className="size-4" /> Download icon pack
              </a>
            </div>
          ) : (
            <EmptyState text="Choose a logo, tweak the background and padding, then we'll generate a full set of icons with previews." />
          )}
        </aside>
      </div>
    </ToolLayout>
  );
}

/* -------------------- live context previews -------------------- */

function ContextPreviews({ img, bg, padding }: { img: HTMLImageElement; bg: string; padding: number }) {
  const small = useDataUrl(img, 32, bg, padding);
  const apple = useDataUrl(img, 180, bg, padding, true);
  const maskable = useDataUrl(img, 192, bg, 0.2);
  const tile = useDataUrl(img, 144, bg, padding);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {/* Chrome tab */}
      <div className="soft-card p-3">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-2">Browser tab</div>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-2 bg-[color:var(--color-muted)] px-3 py-2 border-b border-border">
            {small && <img src={small} alt="" className="size-4 rounded-sm" />}
            <span className="text-xs truncate text-foreground/80">Your Website — Home</span>
            <span className="ml-auto text-muted-foreground text-xs">×</span>
          </div>
          <div className="h-10 bg-card" />
        </div>
      </div>

      {/* iOS home */}
      <div className="soft-card p-3">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-2">iOS home screen</div>
        <div className="rounded-lg bg-gradient-to-b from-[#a3c5ff] to-[#dde9ff] p-4 grid place-items-center">
          <div className="flex flex-col items-center gap-1">
            {apple && <img src={apple} alt="" className="size-12 rounded-[18%] shadow-md" />}
            <span className="text-[10px] text-white drop-shadow font-medium">My Site</span>
          </div>
        </div>
      </div>

      {/* Android maskable */}
      <div className="soft-card p-3">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-2">Android (maskable)</div>
        <div className="rounded-lg bg-gradient-to-b from-[#1a1a2e] to-[#0f1424] p-4 grid place-items-center">
          <div className="flex flex-col items-center gap-1">
            {maskable && (
              <div className="size-12 rounded-full overflow-hidden ring-1 ring-white/10 grid place-items-center">
                <img src={maskable} alt="" className="size-full object-cover" />
              </div>
            )}
            <span className="text-[10px] text-white/85 font-medium">My Site</span>
          </div>
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground inline-flex items-center gap-1">
          <AlertTriangle className="size-3" /> Logo stays inside the safe circle.
        </p>
      </div>

      {/* Windows tile */}
      <div className="soft-card p-3">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-2">Windows tile</div>
        <div className="rounded-lg bg-[#0078d4] p-4 grid place-items-center">
          {tile && <img src={tile} alt="" className="size-14" />}
        </div>
      </div>
    </div>
  );
}

function useDataUrl(
  img: HTMLImageElement | null,
  size: number,
  bg: string,
  padding: number,
  rounded = false,
): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!img) return;
    const c = drawIcon(img, size, bg, padding, rounded);
    setUrl(c.toDataURL("image/png"));
  }, [img, size, bg, padding, rounded]);
  return url;
}
