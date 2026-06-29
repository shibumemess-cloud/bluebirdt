import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/chmod-calculator")({
  head: () => ({
    meta: [
      { title: "Chmod Calculator — Free Online File Permissions Tool" },
      { name: "description", content: "Build Linux chmod commands with checkboxes. See octal (755), symbolic (rwxr-xr-x) and ready-to-paste chmod commands instantly." },
      { property: "og:title", content: "Chmod Calculator — Bluebird" },
      { property: "og:description", content: "Visual file-permission builder for Linux & macOS." },
      { property: "og:url", content: "/chmod-calculator" },
    ],
    links: [{ rel: "canonical", href: "/chmod-calculator" }],
  }),
  component: Page,
});

type Bits = { r: boolean; w: boolean; x: boolean };
const empty: Bits = { r: false, w: false, x: false };

function bitsToDigit(b: Bits) { return (b.r ? 4 : 0) + (b.w ? 2 : 0) + (b.x ? 1 : 0); }
function bitsToSym(b: Bits) { return `${b.r ? "r" : "-"}${b.w ? "w" : "-"}${b.x ? "x" : "-"}`; }
function digitToBits(d: number): Bits { return { r: !!(d & 4), w: !!(d & 2), x: !!(d & 1) }; }

const PRESETS: { label: string; oct: string; note: string }[] = [
  { label: "755", oct: "755", note: "Scripts, web folders" },
  { label: "644", oct: "644", note: "Regular files" },
  { label: "777", oct: "777", note: "Full access (avoid)" },
  { label: "700", oct: "700", note: "Private files" },
  { label: "600", oct: "600", note: "Private read/write" },
  { label: "775", oct: "775", note: "Group-writable" },
];

function Page() {
  const [u, setU] = useState<Bits>({ r: true, w: true, x: true });
  const [g, setG] = useState<Bits>({ r: true, w: false, x: true });
  const [o, setO] = useState<Bits>({ r: true, w: false, x: true });
  const [path, setPath] = useState("filename");
  const [recursive, setRecursive] = useState(false);

  const octal = `${bitsToDigit(u)}${bitsToDigit(g)}${bitsToDigit(o)}`;
  const symbolic = `${bitsToSym(u)}${bitsToSym(g)}${bitsToSym(o)}`;
  const cmd = `chmod ${recursive ? "-R " : ""}${octal} ${path || "filename"}`;

  function applyPreset(oct: string) {
    setU(digitToBits(parseInt(oct[0])));
    setG(digitToBits(parseInt(oct[1])));
    setO(digitToBits(parseInt(oct[2])));
  }

  function Row({ label, bits, setBits }: { label: string; bits: Bits; setBits: (b: Bits) => void }) {
    return (
      <tr>
        <th scope="row" className="text-left py-2 pr-3 font-medium">{label}</th>
        {(["r", "w", "x"] as const).map((k) => (
          <td key={k} className="py-2 pr-2">
            <label className="inline-flex items-center gap-2 min-h-11 px-3 rounded-lg border border-border bg-card hover:border-primary cursor-pointer">
              <input type="checkbox" checked={bits[k]} onChange={(e) => setBits({ ...bits, [k]: e.target.checked })}
                className="size-4 accent-primary" />
              <span className="font-mono text-sm">{k === "r" ? "read" : k === "w" ? "write" : "execute"}</span>
            </label>
          </td>
        ))}
        <td className="py-2 font-mono tabular-nums text-center">{bitsToDigit(bits)}</td>
      </tr>
    );
  }

  return (
    <ToolLayout slug="chmod-calculator">
      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-5">
        <div className="soft-card p-4 sm:p-5">
          <div className="eyebrow mb-3">Permissions</div>
          <table className="w-full">
            <thead className="text-xs text-muted-foreground">
              <tr><th className="text-left pb-2">Who</th><th className="text-left pb-2">Read</th><th className="text-left pb-2">Write</th><th className="text-left pb-2">Execute</th><th className="text-center pb-2">#</th></tr>
            </thead>
            <tbody>
              <Row label="Owner" bits={u} setBits={setU} />
              <Row label="Group" bits={g} setBits={setG} />
              <Row label="Others" bits={o} setBits={setO} />
            </tbody>
          </table>

          <div className="eyebrow mt-5 mb-2">Presets</div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button key={p.label} onClick={() => applyPreset(p.oct)}
                className="min-h-10 px-3 rounded-full border border-border bg-card hover:border-primary text-sm">
                <span className="font-mono">{p.label}</span> <span className="text-muted-foreground text-xs">· {p.note}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="soft-card p-4 sm:p-5 space-y-4">
          <div>
            <div className="eyebrow mb-1">Octal</div>
            <div className="font-display text-5xl tabular-nums">{octal}</div>
          </div>
          <div>
            <div className="eyebrow mb-1">Symbolic</div>
            <div className="font-mono text-2xl">-{symbolic}</div>
          </div>

          <div>
            <label className="block">
              <span className="eyebrow block mb-1.5">File or folder</span>
              <input value={path} onChange={(e) => setPath(e.target.value)}
                className="min-h-11 w-full rounded-xl border border-border bg-card px-3 font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
            </label>
            <label className="inline-flex items-center gap-2 mt-2 text-sm">
              <input type="checkbox" checked={recursive} onChange={(e) => setRecursive(e.target.checked)} className="size-4 accent-primary" />
              Apply to folder contents (-R)
            </label>
          </div>

          <div>
            <div className="eyebrow mb-1">Command</div>
            <div className="flex gap-2">
              <code className="flex-1 min-h-12 rounded-xl border border-border bg-card px-3 py-2 font-mono text-sm break-all flex items-center">{cmd}</code>
              <button onClick={() => navigator.clipboard.writeText(cmd)} aria-label="Copy command"
                className="min-h-12 px-4 rounded-xl bg-primary text-primary-foreground font-semibold inline-flex items-center gap-2">
                <Copy className="size-4" /> Copy
              </button>
            </div>
          </div>
        </div>
      </div>

      <HowItWorks>
        <li>Tick the boxes for who can read, write or run the file.</li>
        <li>Octal and symbolic values update as you go.</li>
        <li>Copy the ready-to-paste chmod command for your terminal.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
