import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Download } from "lucide-react";
import * as L from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { Field, HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/ig-highlight-cover")({
  head: () => ({
    meta: [
      { title: "Instagram Highlight Cover Maker — Free Custom Icons" },
      { name: "description", content: "Design clean Instagram Story Highlight covers in any color with a built-in icon library. 1080×1920 PNG, no watermark, no upload." },
      { property: "og:title", content: "Highlight Cover Maker — Bluebird" },
      { property: "og:description", content: "Make pixel-perfect Instagram Highlight covers." },
      { property: "og:url", content: "/ig-highlight-cover" },
    ],
    links: [{ rel: "canonical", href: "/ig-highlight-cover" }],
  }),
  component: Page,
});

const ICONS: { name: string; Icon: L.LucideIcon }[] = [
  { name: "heart", Icon: L.Heart },
  { name: "star", Icon: L.Star },
  { name: "camera", Icon: L.Camera },
  { name: "plane", Icon: L.Plane },
  { name: "utensils", Icon: L.Utensils },
  { name: "coffee", Icon: L.Coffee },
  { name: "music", Icon: L.Music },
  { name: "book", Icon: L.BookOpen },
  { name: "home", Icon: L.Home },
  { name: "gift", Icon: L.Gift },
  { name: "shopping", Icon: L.ShoppingBag },
  { name: "sparkles", Icon: L.Sparkles },
  { name: "sun", Icon: L.Sun },
  { name: "moon", Icon: L.Moon },
  { name: "leaf", Icon: L.Leaf },
  { name: "flower", Icon: L.Flower2 },
  { name: "paw", Icon: L.PawPrint },
  { name: "smile", Icon: L.Smile },
  { name: "dumbbell", Icon: L.Dumbbell },
  { name: "mic", Icon: L.Mic },
  { name: "shirt", Icon: L.Shirt },
  { name: "palette", Icon: L.Palette },
  { name: "briefcase", Icon: L.Briefcase },
  { name: "graduation", Icon: L.GraduationCap },
];

const PRESETS = [
  { bg: "#FFFFFF", fg: "#1F2937" },
  { bg: "#0F172A", fg: "#F8FAFC" },
  { bg: "#F5E8DD", fg: "#7C4A2B" },
  { bg: "#E8F0FE", fg: "#1D4ED8" },
  { bg: "#FFE4E1", fg: "#BE185D" },
  { bg: "#E6F4EA", fg: "#15803D" },
  { bg: "#1F2937", fg: "#FBBF24" },
  { bg: "#FCE7F3", fg: "#831843" },
];

type Bg = { type: "solid"; color: string } | { type: "gradient"; from: string; to: string };

function Page() {
  const [iconName, setIconName] = useState(ICONS[0].name);
  const [bg, setBg] = useState<Bg>({ type: "solid", color: PRESETS[0].bg });
  const [fg, setFg] = useState(PRESETS[0].fg);
  const [size, setSize] = useState(55); // % of canvas width
  const [stroke, setStroke] = useState(2);
  const [out, setOut] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const Icon = useMemo(() => ICONS.find((i) => i.name === iconName)!.Icon, [iconName]);

  function applyPreset(p: { bg: string; fg: string }) {
    setBg({ type: "solid", color: p.bg });
    setFg(p.fg);
  }

  async function render() {
    const W = 1080, H = 1920;
    const cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d")!;
    if (bg.type === "solid") {
      ctx.fillStyle = bg.color;
      ctx.fillRect(0, 0, W, H);
    } else {
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, bg.from); g.addColorStop(1, bg.to);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    // Serialize the live lucide SVG and rasterize centered.
    const svg = svgRef.current!;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("stroke", fg);
    clone.setAttribute("stroke-width", String(stroke));
    const xml = new XMLSerializer().serializeToString(clone);
    const url = `data:image/svg+xml;utf8,${encodeURIComponent(xml)}`;
    const img = new Image();
    img.src = url;
    await img.decode();
    const target = (size / 100) * W;
    ctx.drawImage(img, (W - target) / 2, (H - target) / 2, target, target);
    const blob = await new Promise<Blob>((r, j) => cv.toBlob((b) => (b ? r(b) : j(new Error())), "image/png"));
    setOut(URL.createObjectURL(blob));
  }

  useEffect(() => { render(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [iconName, bg, fg, size, stroke]);

  return (
    <ToolLayout slug="ig-highlight-cover">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 md:col-span-7 space-y-6">
          <Field label="Pick an icon">
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-56 overflow-auto p-1">
              {ICONS.map(({ name, Icon: I }) => (
                <button key={name} type="button" onClick={() => setIconName(name)} aria-label={name}
                  className={`aspect-square grid place-items-center rounded-xl border ${iconName === name ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary/40"}`}>
                  <I className="size-6" />
                </button>
              ))}
            </div>
          </Field>

          <Field label="Color preset">
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {PRESETS.map((p) => (
                <button key={p.bg + p.fg} type="button" onClick={() => applyPreset(p)} aria-label={`${p.bg} / ${p.fg}`}
                  className="aspect-square rounded-xl border border-border overflow-hidden grid place-items-center"
                  style={{ background: p.bg, color: p.fg }}>
                  <L.Heart className="size-5" />
                </button>
              ))}
            </div>
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Background color">
              <input type="color" value={bg.type === "solid" ? bg.color : "#ffffff"}
                onChange={(e) => setBg({ type: "solid", color: e.target.value })}
                className="w-full h-12 rounded-xl border border-border bg-card cursor-pointer" />
            </Field>
            <Field label="Icon color">
              <input type="color" value={fg} onChange={(e) => setFg(e.target.value)}
                className="w-full h-12 rounded-xl border border-border bg-card cursor-pointer" />
            </Field>
            <Field label={`Icon size — ${size}%`}>
              <input type="range" min={25} max={80} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full" />
            </Field>
            <Field label={`Stroke width — ${stroke}px`}>
              <input type="range" min={1} max={3} step={0.25} value={stroke} onChange={(e) => setStroke(Number(e.target.value))} className="w-full" />
            </Field>
          </div>

          {/* Off-screen reference icon used for rasterization. */}
          <Icon ref={svgRef} className="hidden" />


          <HowItWorks>
            Instagram Highlight thumbnails are 1080×1920 and cropped to a circle in the profile. Keep your icon in
            the middle 60% so nothing gets cut. Download a clean PNG and upload it as the cover.
          </HowItWorks>
        </div>

        <aside className="col-span-12 md:col-span-5">
          <div className="soft-card p-5 sm:p-6 sticky top-4">
            <span className="eyebrow">Preview</span>
            <div className="mt-3 grid place-items-center">
              <div className="relative w-56 sm:w-64 aspect-[9/16] rounded-3xl overflow-hidden border border-border shadow-soft"
                style={ bg.type === "solid" ? { background: bg.color } : { background: `linear-gradient(135deg, ${bg.from}, ${bg.to})` } }>
                {out && <img src={out} alt="Highlight cover" className="absolute inset-0 w-full h-full object-cover" />}
              </div>
              <div className="mt-4 flex flex-col items-center">
                <div className="size-20 rounded-full overflow-hidden border-2 border-border" style={ bg.type === "solid" ? { background: bg.color } : undefined }>
                  {out && <img src={out} alt="" className="w-full h-full object-cover" />}
                </div>
                <span className="mt-2 text-xs text-muted-foreground">How it looks as a Highlight</span>
              </div>
            </div>
            {out && (
              <a href={out} download={`highlight-${iconName}-1080x1920.png`}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3.5 font-semibold min-h-12 hover:shadow-lift hover:-translate-y-0.5">
                <Download className="size-4" /> Download cover (PNG)
              </a>
            )}
          </div>
        </aside>
      </div>
    </ToolLayout>
  );
}
