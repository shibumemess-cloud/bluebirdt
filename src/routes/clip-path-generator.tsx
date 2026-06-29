import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/clip-path-generator")({
  head: () => ({
    meta: [
      { title: "CSS clip-path Generator — Free Online Visual Shape Maker" },
      { name: "description", content: "Design CSS clip-path shapes visually — triangle, hexagon, star, arrow, blob and more. Live preview and one-click CSS copy." },
      { property: "og:title", content: "CSS clip-path Generator — Bluebird" },
      { property: "og:description", content: "Build clip-path shapes with a live preview." },
      { property: "og:url", content: "/clip-path-generator" },
    ],
    links: [{ rel: "canonical", href: "/clip-path-generator" }],
  }),
  component: Page,
});

type Shape = {
  id: string;
  name: string;
  points: [number, number][];
};

const SHAPES: Shape[] = [
  { id: "triangle", name: "Triangle", points: [[50, 0], [100, 100], [0, 100]] },
  { id: "rhombus", name: "Rhombus", points: [[50, 0], [100, 50], [50, 100], [0, 50]] },
  { id: "pentagon", name: "Pentagon", points: [[50, 0], [100, 38], [82, 100], [18, 100], [0, 38]] },
  { id: "hexagon", name: "Hexagon", points: [[25, 0], [75, 0], [100, 50], [75, 100], [25, 100], [0, 50]] },
  { id: "heptagon", name: "Heptagon", points: [[50, 0], [90, 20], [100, 60], [75, 100], [25, 100], [0, 60], [10, 20]] },
  { id: "octagon", name: "Octagon", points: [[30, 0], [70, 0], [100, 30], [100, 70], [70, 100], [30, 100], [0, 70], [0, 30]] },
  { id: "star", name: "Star", points: [[50, 0], [61, 35], [98, 35], [68, 57], [79, 91], [50, 70], [21, 91], [32, 57], [2, 35], [39, 35]] },
  { id: "arrow-right", name: "Arrow right", points: [[0, 20], [60, 20], [60, 0], [100, 50], [60, 100], [60, 80], [0, 80]] },
  { id: "arrow-left", name: "Arrow left", points: [[40, 0], [40, 20], [100, 20], [100, 80], [40, 80], [40, 100], [0, 50]] },
  { id: "chevron-right", name: "Chevron right", points: [[75, 0], [100, 50], [75, 100], [0, 100], [25, 50], [0, 0]] },
  { id: "message", name: "Speech bubble", points: [[0, 0], [100, 0], [100, 75], [75, 75], [75, 100], [50, 75], [0, 75]] },
  { id: "trapezoid", name: "Trapezoid", points: [[20, 0], [80, 0], [100, 100], [0, 100]] },
  { id: "parallelogram", name: "Parallelogram", points: [[25, 0], [100, 0], [75, 100], [0, 100]] },
  { id: "cross", name: "Cross", points: [[20, 0], [80, 0], [80, 20], [100, 20], [100, 80], [80, 80], [80, 100], [20, 100], [20, 80], [0, 80], [0, 20], [20, 20]] },
];

function polygonCss(points: [number, number][]) {
  return `polygon(${points.map(([x, y]) => `${x}% ${y}%`).join(", ")})`;
}

const PREVIEW_IMG = "https://images.unsplash.com/photo-1503264116251-35a269479413?w=800&q=80";

function Page() {
  const [shapeId, setShapeId] = useState(SHAPES[0].id);
  const [points, setPoints] = useState<[number, number][]>(SHAPES[0].points);
  const [bg, setBg] = useState<"image" | "color">("color");
  const [color, setColor] = useState("#2f6fed");
  const [copied, setCopied] = useState(false);

  const css = useMemo(() => polygonCss(points), [points]);
  const fullCss = useMemo(() =>
    `clip-path: ${css};\n-webkit-clip-path: ${css};`, [css]);

  function pickShape(id: string) {
    const s = SHAPES.find((x) => x.id === id);
    if (!s) return;
    setShapeId(id);
    setPoints(s.points.map(([x, y]) => [x, y]));
  }
  function updatePt(idx: number, axis: 0 | 1, v: number) {
    setPoints((ps) => ps.map((p, i) => i === idx ? (axis === 0 ? [v, p[1]] : [p[0], v]) : p));
  }
  async function copy() {
    await navigator.clipboard.writeText(fullCss);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <ToolLayout slug="clip-path-generator">
      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        <div className="soft-card p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap gap-2">
            {SHAPES.map((s) => (
              <button key={s.id} onClick={() => pickShape(s.id)}
                aria-pressed={shapeId === s.id}
                className={`min-h-9 px-3 rounded-lg border text-sm ${shapeId === s.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary"}`}>
                {s.name}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-border p-4 grid place-items-center bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)_50%/20px_20px]">
            <div className="relative w-full max-w-[420px] aspect-square">
              <div
                className="absolute inset-0 rounded-md"
                style={{
                  background: bg === "image"
                    ? `center/cover no-repeat url(${PREVIEW_IMG})`
                    : color,
                  clipPath: css,
                  WebkitClipPath: css,
                }}
                aria-label="Clip path preview"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border border-border bg-card text-sm overflow-hidden">
              <button onClick={() => setBg("color")} className={`px-3 min-h-10 ${bg === "color" ? "bg-primary text-primary-foreground" : ""}`}>Solid</button>
              <button onClick={() => setBg("image")} className={`px-3 min-h-10 ${bg === "image" ? "bg-primary text-primary-foreground" : ""}`}>Photo</button>
            </div>
            {bg === "color" && (
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} aria-label="Fill color"
                className="h-10 w-14 rounded-lg border border-border bg-card" />
            )}
            <button onClick={copy}
              className="ml-auto min-h-10 px-4 rounded-lg bg-primary text-primary-foreground inline-flex items-center gap-2 text-sm font-medium">
              {copied ? <><Check className="size-4" /> Copied</> : <><Copy className="size-4" /> Copy CSS</>}
            </button>
          </div>

          <pre className="rounded-xl border border-border bg-card p-3 text-xs sm:text-sm font-mono overflow-auto"><code>{fullCss}</code></pre>
        </div>

        <div className="soft-card p-4 sm:p-5 h-fit lg:sticky lg:top-24">
          <div className="eyebrow mb-2">Fine-tune points</div>
          <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
            {points.map((p, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-2">
                <div className="text-xs text-muted-foreground mb-1">Point {i + 1}</div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-xs">
                    <div className="mb-0.5">X: {p[0]}%</div>
                    <input type="range" min={0} max={100} value={p[0]} onChange={(e) => updatePt(i, 0, Number(e.target.value))} className="w-full" />
                  </label>
                  <label className="text-xs">
                    <div className="mb-0.5">Y: {p[1]}%</div>
                    <input type="range" min={0} max={100} value={p[1]} onChange={(e) => updatePt(i, 1, Number(e.target.value))} className="w-full" />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <HowItWorks>
        <li>Pick a starting shape — triangle, hexagon, star, arrow and more.</li>
        <li>Drag the X and Y sliders to fine-tune any corner.</li>
        <li>Copy the ready-to-paste clip-path CSS into your project.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
