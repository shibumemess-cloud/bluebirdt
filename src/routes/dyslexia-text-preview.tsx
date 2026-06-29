import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/dyslexia-text-preview")({
  head: () => ({
    meta: [
      { title: "Dyslexia-Friendly Text Preview — Free Online" },
      { name: "description", content: "Preview any text in dyslexia‑friendly fonts with adjustable spacing, line height and colour — see what works best for your readers." },
      { property: "og:title", content: "Dyslexia‑Friendly Preview — Bluebird" },
      { property: "og:description", content: "Test text in OpenDyslexic, Comic Sans and Atkinson Hyperlegible." },
    ],
    links: [
      { rel: "canonical", href: "/dyslexia-text-preview" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Lexend:wght@400;500&display=swap" },
    ],
  }),
  component: Page,
});

const FONTS = [
  { id: "atkinson", label: "Atkinson Hyperlegible", family: "'Atkinson Hyperlegible', sans-serif" },
  { id: "lexend", label: "Lexend", family: "'Lexend', sans-serif" },
  { id: "comic", label: "Comic Sans MS", family: "'Comic Sans MS', 'Comic Sans', cursive" },
  { id: "verdana", label: "Verdana", family: "Verdana, Geneva, sans-serif" },
  { id: "system", label: "System default", family: "system-ui, sans-serif" },
];
const SAMPLE = "The quick brown fox jumps over the lazy dog. Reading should feel light and clear, not like a maze. Pick the spacing and colour that work best for you.";

function Page() {
  const [text, setText] = useState(SAMPLE);
  const [font, setFont] = useState(FONTS[0].id);
  const [size, setSize] = useState(20);
  const [lh, setLh] = useState(1.7);
  const [ls, setLs] = useState(0.04);
  const [ws, setWs] = useState(0.06);
  const [bg, setBg] = useState("#FFF8E7");
  const [fg, setFg] = useState("#222222");

  const family = FONTS.find((f) => f.id === font)?.family ?? FONTS[0].family;

  return (
    <ToolLayout slug="dyslexia-text-preview">
      <div className="soft-card p-5 sm:p-6 space-y-5">
        <label className="block">
          <span className="font-medium">Your text</span>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3" />
        </label>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block"><span className="text-sm font-medium">Font</span>
            <select value={font} onChange={(e) => setFont(e.target.value)} className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 min-h-11">
              {FONTS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
            </select>
          </label>
          <label className="block"><span className="text-sm font-medium">Font size ({size}px)</span>
            <input type="range" min={14} max={40} value={size} onChange={(e) => setSize(+e.target.value)} className="w-full mt-2" />
          </label>
          <label className="block"><span className="text-sm font-medium">Line height ({lh})</span>
            <input type="range" min={1.2} max={2.4} step={0.05} value={lh} onChange={(e) => setLh(+e.target.value)} className="w-full mt-2" />
          </label>
          <label className="block"><span className="text-sm font-medium">Letter spacing ({ls.toFixed(2)}em)</span>
            <input type="range" min={0} max={0.2} step={0.01} value={ls} onChange={(e) => setLs(+e.target.value)} className="w-full mt-2" />
          </label>
          <label className="block"><span className="text-sm font-medium">Word spacing ({ws.toFixed(2)}em)</span>
            <input type="range" min={0} max={0.4} step={0.02} value={ws} onChange={(e) => setWs(+e.target.value)} className="w-full mt-2" />
          </label>
          <div className="flex gap-3">
            <label className="block flex-1"><span className="text-sm font-medium">Background</span>
              <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="mt-2 w-full h-11 rounded-lg border border-border" />
            </label>
            <label className="block flex-1"><span className="text-sm font-medium">Text</span>
              <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="mt-2 w-full h-11 rounded-lg border border-border" />
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-border p-5" style={{ background: bg, color: fg, fontFamily: family, fontSize: `${size}px`, lineHeight: lh, letterSpacing: `${ls}em`, wordSpacing: `${ws}em` }}>
          {text || "Type some text above to preview it here."}
        </div>
      </div>
      <HowItWorks>
        <p>Switch between dyslexia‑friendly fonts (Atkinson Hyperlegible, Lexend, Comic Sans, Verdana), then tune spacing and colour to find what feels easiest to read. Use this to test web pages, slides or printed material before sharing.</p>
      </HowItWorks>
    </ToolLayout>
  );
}
