import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Plus, Play, Trash2, RotateCw } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/wheel-of-names")({
  head: () => ({
    meta: [
      { title: "Wheel of Names — Free Random Picker" },
      { name: "description", content: "Spin a colourful wheel to pick a random name from your list. Perfect for classrooms, giveaways and decisions. Runs in your browser." },
      { property: "og:title", content: "Wheel of Names — Bluebird" },
      { property: "og:description", content: "Spin a random name picker, free and private." },
    ],
    links: [{ rel: "canonical", href: "/wheel-of-names" }],
  }),
  component: Page,
});

const COLORS = ["#1e3a8a","#1e40af","#2563eb","#3b82f6","#60a5fa","#0ea5e9","#0284c7","#0369a1","#0c4a6e","#7c3aed","#6d28d9","#db2777"];

function Page() {
  const [names, setNames] = useState<string[]>(["Alice","Ben","Chloe","Dev","Emma","Faisal","Grace","Hugo"]);
  const [input, setInput] = useState("");
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const size = 400;
    c.width = size * dpr; c.height = size * dpr; ctx.scale(dpr, dpr);
    const cx = size / 2, cy = size / 2, r = size / 2 - 8;
    ctx.clearRect(0, 0, size, size);
    const n = Math.max(1, names.length);
    const step = (Math.PI * 2) / n;
    ctx.font = "600 14px 'Plus Jakarta Sans', sans-serif";
    for (let i = 0; i < n; i++) {
      const a0 = i * step, a1 = a0 + step;
      ctx.beginPath();
      ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, a0, a1); ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length]; ctx.fill();
      ctx.save();
      ctx.translate(cx, cy); ctx.rotate(a0 + step / 2);
      ctx.fillStyle = "white"; ctx.textAlign = "right"; ctx.textBaseline = "middle";
      const label = (names[i] || "").slice(0, 18);
      ctx.fillText(label, r - 14, 0);
      ctx.restore();
    }
    ctx.beginPath(); ctx.arc(cx, cy, 24, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = "#1e3a8a"; ctx.stroke();
  }, [names]);

  function add() {
    const list = input.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
    if (list.length) { setNames((a) => [...a, ...list]); setInput(""); }
  }
  function remove(i: number) { setNames((a) => a.filter((_, j) => j !== i)); }
  function spin() {
    if (spinning || names.length === 0) return;
    setWinner(null);
    const turns = 5 + Math.random() * 3;
    const target = angle + turns * 360 + Math.random() * 360;
    setSpinning(true); setAngle(target);
    setTimeout(() => {
      const final = ((target % 360) + 360) % 360;
      // pointer at top (12 o'clock). Wheel rotates clockwise by `final`.
      const pointer = (360 - final + 270) % 360; // angle on original wheel under pointer
      const step = 360 / names.length;
      const idx = Math.floor(pointer / step) % names.length;
      setWinner(names[idx]); setSpinning(false);
    }, 4200);
  }

  return (
    <ToolLayout slug="wheel-of-names">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        <div className="soft-card p-5 sm:p-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Add names (one per line or comma‑separated)</span>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={4} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2" placeholder="Maya, Noah, Olivia…" />
          </label>
          <div className="flex gap-2">
            <button onClick={add} className="inline-flex items-center gap-2 min-h-11 px-4 rounded-xl bg-primary text-primary-foreground font-medium"><Plus className="size-4" /> Add</button>
            <button onClick={() => setNames([])} className="inline-flex items-center gap-2 min-h-11 px-4 rounded-xl border border-border"><RotateCw className="size-4" /> Clear</button>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-56 overflow-auto">
            {names.map((n, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-full bg-primary-soft text-primary px-3 py-1 text-sm">
                {n}
                <button onClick={() => remove(i)} aria-label={`Remove ${n}`} className="opacity-60 hover:opacity-100"><Trash2 className="size-3" /></button>
              </span>
            ))}
            {names.length === 0 && <span className="text-sm text-muted-foreground">No names yet.</span>}
          </div>
        </div>

        <div className="soft-card p-5 sm:p-6 flex flex-col items-center gap-4">
          <div className="relative" style={{ width: 400, maxWidth: "100%" }}>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[14px] border-r-[14px] border-t-[22px] border-l-transparent border-r-transparent border-t-primary z-10" />
            <canvas ref={canvasRef} style={{ width: "100%", height: "auto", transform: `rotate(${angle}deg)`, transition: spinning ? "transform 4s cubic-bezier(0.17, 0.67, 0.16, 0.99)" : undefined }} />
          </div>
          <button onClick={spin} disabled={spinning || names.length === 0} className="inline-flex items-center gap-2 min-h-12 px-6 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-50">
            <Play className="size-4" /> {spinning ? "Spinning…" : "Spin the wheel"}
          </button>
          {winner && <div role="status" className="text-2xl font-display text-primary">Winner: {winner}</div>}
        </div>
      </div>
      <HowItWorks>
        <p>Paste a list of names, hit Spin, and a random winner is picked from the wheel. Great for class participation, raffle draws and choosing where to eat.</p>
      </HowItWorks>
    </ToolLayout>
  );
}
