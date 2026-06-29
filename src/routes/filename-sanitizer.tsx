import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ShieldCheck, Copy } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/filename-sanitizer")({
  head: () => ({
    meta: [
      { title: "Filename Sanitizer — Clean File Names for Any OS" },
      { name: "description", content: "Strip emoji, accents, spaces and unsafe characters from one or many file names — safe for Windows, macOS, Linux and the web." },
      { property: "og:title", content: "Filename Sanitizer — Bluebird" },
      { property: "og:description", content: "Get clean, portable file names in seconds." },
    ],
    links: [{ rel: "canonical", href: "/filename-sanitizer" }],
  }),
  component: Page,
});

const RESERVED = new Set(["CON", "PRN", "AUX", "NUL", "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9", "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9"]);

function clean(name: string, opt: { stripDiacritics: boolean; spaces: "keep" | "dash" | "underscore"; lower: boolean; maxLen: number }) {
  let s = name.normalize("NFKD");
  if (opt.stripDiacritics) s = s.replace(/\p{M}/gu, "");
  // remove invisible / control / emoji symbols
  s = s.replace(/[\u0000-\u001F\u007F]/g, "");
  s = s.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, "");
  // disallowed OS chars
  s = s.replace(/[<>:"/\\|?*]/g, "-");
  // collapse runs of separators
  s = s.replace(/\s+/g, " ").trim();
  if (opt.spaces === "dash") s = s.replace(/\s+/g, "-");
  if (opt.spaces === "underscore") s = s.replace(/\s+/g, "_");
  if (opt.lower) s = s.toLowerCase();
  s = s.replace(/-{2,}/g, "-").replace(/_{2,}/g, "_").replace(/^[.\-_ ]+|[.\-_ ]+$/g, "");
  // reserved windows names
  const dot = s.lastIndexOf(".");
  const stem = dot > 0 ? s.slice(0, dot) : s;
  const ext = dot > 0 ? s.slice(dot) : "";
  if (RESERVED.has(stem.toUpperCase())) s = `_${stem}${ext}`;
  if (s.length > opt.maxLen) s = s.slice(0, opt.maxLen);
  return s || "untitled";
}

function Page() {
  const [input, setInput] = useState("Vacation 🌴 résumé (final v2)?.PDF\nIMG_2024 \"copy\".JPG\nCON.txt");
  const [stripDiacritics, setStripDiacritics] = useState(true);
  const [spaces, setSpaces] = useState<"keep" | "dash" | "underscore">("dash");
  const [lower, setLower] = useState(true);
  const [maxLen, setMaxLen] = useState(80);

  const out = useMemo(() => {
    return input.split(/\r?\n/).map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      return clean(trimmed, { stripDiacritics, spaces, lower, maxLen });
    }).join("\n");
  }, [input, stripDiacritics, spaces, lower, maxLen]);

  return (
    <ToolLayout slug="filename-sanitizer">
      <div className="soft-card p-4 sm:p-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={stripDiacritics} onChange={(e) => setStripDiacritics(e.target.checked)} /> Strip accents</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={lower} onChange={(e) => setLower(e.target.checked)} /> lowercase</label>
        <label className="flex items-center gap-2">Spaces
          <select value={spaces} onChange={(e) => setSpaces(e.target.value as "keep" | "dash" | "underscore")} className="rounded-xl border border-border bg-card p-2"><option value="keep">keep</option><option value="dash">→ dash</option><option value="underscore">→ underscore</option></select>
        </label>
        <label className="flex items-center gap-2">Max length <input type="number" min={20} max={255} value={maxLen} onChange={(e) => setMaxLen(Math.max(20, Math.min(255, Number(e.target.value) || 80)))} className="w-20 rounded-xl border border-border bg-card p-2" /></label>
      </div>
      <div className="mt-4 grid lg:grid-cols-2 gap-4">
        <div>
          <label className="eyebrow" htmlFor="in">Original names (one per line)</label>
          <textarea id="in" value={input} onChange={(e) => setInput(e.target.value)} className="mt-1.5 w-full min-h-72 font-mono text-sm rounded-2xl border border-border bg-card p-4 focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="eyebrow" htmlFor="out">Safe names</label>
            <button onClick={() => navigator.clipboard.writeText(out).catch(() => {})} className="text-sm text-primary inline-flex items-center gap-1.5"><Copy className="size-4" /> Copy</button>
          </div>
          <textarea id="out" value={out} readOnly className="mt-1.5 w-full min-h-72 font-mono text-sm rounded-2xl border border-border bg-primary-soft/30 p-4" />
        </div>
      </div>
      <HowItWorks>
        <li>Paste one filename per line — or a full list from your folder.</li>
        <li>Pick how to handle spaces, capitalisation and accented letters.</li>
        <li>Copy the clean list and rename your files (your OS or a batch renamer can paste it back).</li>
      </HowItWorks>
      <div className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground"><ShieldCheck className="size-4 text-primary" /> Names are processed in your browser — nothing is uploaded.</div>
    </ToolLayout>
  );
}
