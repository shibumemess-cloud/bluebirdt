import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Printer } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/multiplication-table")({
  head: () => ({
    meta: [
      { title: "Multiplication Table Generator — Free, Printable" },
      { name: "description", content: "Generate clean multiplication tables for any range. Print, copy, or save as PDF — perfect for kids and classrooms." },
      { property: "og:title", content: "Multiplication Table — Bluebird" },
      { property: "og:description", content: "Print-ready multiplication tables in your browser." },
    ],
    links: [{ rel: "canonical", href: "/multiplication-table" }],
  }),
  component: Page,
});

function Page() {
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(12);
  const [times, setTimes] = useState(12);
  const cols = Math.max(1, Math.min(20, to - from + 1));

  const text = (() => {
    const rows: string[] = [];
    for (let r = 1; r <= times; r++) {
      const cells: string[] = [];
      for (let c = from; c <= to; c++) cells.push(`${c} x ${r} = ${c * r}`);
      rows.push(cells.join("\t"));
    }
    return rows.join("\n");
  })();

  return (
    <ToolLayout slug="multiplication-table">
      <style>{`@media print { .no-print { display: none !important; } body { background: white !important; } .print-table { box-shadow: none !important; border: none !important; } }`}</style>
      <div className="soft-card p-5 sm:p-6 space-y-4">
        <div className="no-print grid grid-cols-3 gap-3">
          <label className="block"><span className="text-sm font-medium">From</span>
            <input type="number" value={from} min={1} max={50} onChange={(e) => setFrom(Math.max(1, +e.target.value || 1))} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 min-h-11" /></label>
          <label className="block"><span className="text-sm font-medium">To</span>
            <input type="number" value={to} min={from} max={50} onChange={(e) => setTo(Math.min(50, Math.max(from, +e.target.value || from)))} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 min-h-11" /></label>
          <label className="block"><span className="text-sm font-medium">Rows (× up to)</span>
            <input type="number" value={times} min={1} max={50} onChange={(e) => setTimes(Math.min(50, Math.max(1, +e.target.value || 1)))} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 min-h-11" /></label>
        </div>

        <div className="print-table overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-primary-soft">
              <tr>
                <th className="p-2 border border-border">×</th>
                {Array.from({ length: cols }, (_, i) => (
                  <th key={i} className="p-2 border border-border text-center tabular-nums">{from + i}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: times }, (_, r) => (
                <tr key={r}>
                  <th className="p-2 border border-border bg-primary-soft text-center tabular-nums">{r + 1}</th>
                  {Array.from({ length: cols }, (_, c) => (
                    <td key={c} className="p-2 border border-border text-center tabular-nums">{(from + c) * (r + 1)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="no-print grid grid-cols-2 gap-3">
          <button onClick={() => navigator.clipboard.writeText(text)} className="min-h-11 rounded-xl border border-border inline-flex items-center justify-center gap-2"><Copy className="size-4" /> Copy as text</button>
          <button onClick={() => window.print()} className="min-h-11 rounded-xl bg-primary text-primary-foreground inline-flex items-center justify-center gap-2"><Printer className="size-4" /> Print</button>
        </div>
      </div>
      <HowItWorks>
        <p>Set the range you want and we'll lay out a clean times table. Use Print and pick "Save as PDF" to keep a copy or hand it out at school.</p>
      </HowItWorks>
    </ToolLayout>
  );
}
