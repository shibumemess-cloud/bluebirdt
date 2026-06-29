import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { Field, HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/ig-line-break")({
  head: () => ({
    meta: [
      { title: "Instagram Line Break Generator — Keep Caption Spacing" },
      { name: "description", content: "Instagram strips blank lines from your caption. Paste your text and copy a version with real line breaks that stay visible after posting." },
      { property: "og:title", content: "Instagram Line Break Generator — Bluebird" },
      { property: "og:description", content: "Add real line breaks to your Instagram captions." },
      { property: "og:url", content: "/ig-line-break" },
    ],
    links: [{ rel: "canonical", href: "/ig-line-break" }],
  }),
  component: Page,
});

// Braille Pattern Blank — visible to Instagram, invisible to humans.
const INVISIBLE = "\u2800";

function fix(text: string, mode: "blank" | "dots") {
  const filler = mode === "dots" ? "." : INVISIBLE;
  // Trim trailing spaces on every line (IG drops trailing-space lines), then
  // replace each empty line with the chosen invisible filler.
  return text
    .split(/\r?\n/)
    .map((l) => l.replace(/[ \t]+$/g, ""))
    .map((l) => (l.length === 0 ? filler : l))
    .join("\n");
}

function Page() {
  const [input, setInput] = useState(
    "Welcome to my page!\n\nHere is what I do:\n\n• Photos\n• Travel\n• Recipes\n\nDM for collabs ↓",
  );
  const [mode, setMode] = useState<"blank" | "dots">("blank");
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => fix(input, mode), [input, mode]);
  const chars = Array.from(output).length;

  async function copy() {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true); setTimeout(() => setCopied(false), 1500);
    } catch { /* */ }
  }

  return (
    <ToolLayout slug="ig-line-break">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 md:col-span-7 space-y-6">
          <Field label="Your caption" hint="Write it normally, with empty lines between paragraphs.">
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={10}
              className="w-full rounded-xl border border-border bg-card p-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </Field>

          <Field label="Fix style" hint="Invisible is cleanest. Dots are a safe fallback if a paste removes the invisible character.">
            <div className="grid grid-cols-2 gap-2">
              {([
                { id: "blank", label: "Invisible (recommended)" },
                { id: "dots", label: "Visible dot · ·" },
              ] as const).map((o) => (
                <button key={o.id} type="button" onClick={() => setMode(o.id)}
                  className={`min-h-12 rounded-xl border text-sm font-medium ${mode === o.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary/40"}`}>
                  {o.label}
                </button>
              ))}
            </div>
          </Field>

          <HowItWorks>
            Instagram removes empty lines and trailing spaces when you post. We replace every blank line with a
            single invisible character (Braille Pattern Blank, U+2800) so your paragraph spacing survives the paste.
            Everything happens in your browser.
          </HowItWorks>
        </div>

        <aside className="col-span-12 md:col-span-5">
          <div className="soft-card p-5 sm:p-6 sticky top-4">
            <div className="flex items-center justify-between gap-3">
              <span className="eyebrow">Fixed caption · {chars} chars</span>
              <button type="button" onClick={copy}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline min-h-10 px-2">
                {copied ? <><Check className="size-4" /> Copied</> : <><Copy className="size-4" /> Copy</>}
              </button>
            </div>
            <pre className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed bg-muted/40 rounded-xl p-4 border border-border min-h-[12rem]">{output}</pre>
            <p className="mt-3 text-xs text-muted-foreground">Paste this into the Instagram caption field exactly as copied — your blank lines will stay.</p>
          </div>
        </aside>
      </div>
    </ToolLayout>
  );
}
