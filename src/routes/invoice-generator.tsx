import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Plus, Trash2, Printer } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/invoice-generator")({
  head: () => ({
    meta: [
      { title: "Free Invoice Generator — Print or Save as PDF" },
      { name: "description", content: "Create a clean, professional invoice in your browser. Add line items, tax and notes, then print or save as PDF. No signup." },
      { property: "og:title", content: "Invoice Generator — Bluebird" },
      { property: "og:description", content: "Build and download invoices privately in your browser." },
    ],
    links: [{ rel: "canonical", href: "/invoice-generator" }],
  }),
  component: Page,
});

type Item = { desc: string; qty: number; price: number };

function fmt(n: number, cur: string) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: cur }).format(n || 0);
}

function Page() {
  const [from, setFrom] = useState("Your Business\n123 Street, City\nyou@example.com");
  const [to, setTo] = useState("Client Name\nClient Address\nclient@example.com");
  const [number, setNumber] = useState("INV-0001");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [due, setDue] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [tax, setTax] = useState(0);
  const [notes, setNotes] = useState("Thanks for your business.");
  const [items, setItems] = useState<Item[]>([
    { desc: "Design work", qty: 10, price: 50 },
    { desc: "Hosting (monthly)", qty: 1, price: 15 },
  ]);

  const subtotal = useMemo(() => items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.price) || 0), 0), [items]);
  const taxAmt = useMemo(() => (subtotal * (Number(tax) || 0)) / 100, [subtotal, tax]);
  const total = subtotal + taxAmt;

  function update(i: number, patch: Partial<Item>) {
    setItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }
  function remove(i: number) { setItems((arr) => arr.filter((_, idx) => idx !== i)); }
  function add() { setItems((arr) => [...arr, { desc: "", qty: 1, price: 0 }]); }

  return (
    <ToolLayout slug="invoice-generator">
      <style>{`@media print { .no-print { display: none !important; } body { background: white !important; } .print-page { box-shadow: none !important; border: none !important; padding: 0 !important; } }`}</style>
      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6">
        <div className="no-print soft-card p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="block"><span className="text-sm font-medium">Invoice #</span>
              <input value={number} onChange={(e) => setNumber(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 min-h-11" /></label>
            <label className="block"><span className="text-sm font-medium">Currency</span>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 min-h-11">
                {["USD","EUR","GBP","INR","JPY","AUD","CAD","CHF","CNY","BRL"].map((c) => <option key={c}>{c}</option>)}
              </select></label>
            <label className="block"><span className="text-sm font-medium">Issue date</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 min-h-11" /></label>
            <label className="block"><span className="text-sm font-medium">Due date</span>
              <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 min-h-11" /></label>
          </div>
          <label className="block"><span className="text-sm font-medium">From</span>
            <textarea value={from} onChange={(e) => setFrom(e.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2" /></label>
          <label className="block"><span className="text-sm font-medium">Bill to</span>
            <textarea value={to} onChange={(e) => setTo(e.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2" /></label>

          <div>
            <div className="text-sm font-medium mb-2">Items</div>
            <div className="space-y-2">
              {items.map((it, i) => (
                <div key={i} className="grid grid-cols-[1fr_70px_90px_auto] gap-2 items-center">
                  <input value={it.desc} onChange={(e) => update(i, { desc: e.target.value })} placeholder="Description" className="rounded-xl border border-border bg-background px-3 py-2 min-h-11" />
                  <input type="number" min={0} value={it.qty} onChange={(e) => update(i, { qty: Number(e.target.value) })} className="rounded-xl border border-border bg-background px-2 py-2 min-h-11 text-right tabular-nums" />
                  <input type="number" min={0} step="0.01" value={it.price} onChange={(e) => update(i, { price: Number(e.target.value) })} className="rounded-xl border border-border bg-background px-2 py-2 min-h-11 text-right tabular-nums" />
                  <button onClick={() => remove(i)} aria-label="Remove row" className="text-muted-foreground hover:text-rose-600 p-2"><Trash2 className="size-4" /></button>
                </div>
              ))}
            </div>
            <button onClick={add} className="mt-2 inline-flex items-center gap-2 text-sm text-primary font-semibold"><Plus className="size-4" /> Add item</button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block"><span className="text-sm font-medium">Tax %</span>
              <input type="number" min={0} step="0.1" value={tax} onChange={(e) => setTax(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 min-h-11" /></label>
          </div>
          <label className="block"><span className="text-sm font-medium">Notes</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2" /></label>

          <button onClick={() => window.print()} className="w-full inline-flex items-center justify-center gap-2 min-h-12 rounded-xl bg-primary text-primary-foreground font-medium">
            <Printer className="size-4" /> Print or save as PDF
          </button>
        </div>

        <div className="print-page soft-card p-6 sm:p-10 bg-white text-slate-900">
          <div className="flex justify-between items-start gap-6">
            <div>
              <div className="text-3xl font-display tracking-tight">INVOICE</div>
              <div className="text-xs uppercase tracking-wider text-slate-500 mt-1">{number}</div>
            </div>
            <div className="text-right text-sm">
              <div><span className="text-slate-500">Date:</span> {date}</div>
              {due && <div><span className="text-slate-500">Due:</span> {due}</div>}
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-6 text-sm">
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">From</div>
              <pre className="whitespace-pre-wrap font-sans">{from}</pre>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Bill to</div>
              <pre className="whitespace-pre-wrap font-sans">{to}</pre>
            </div>
          </div>
          <table className="w-full mt-8 text-sm">
            <thead>
              <tr className="border-b border-slate-300 text-left text-slate-500 uppercase text-xs tracking-wider">
                <th className="py-2">Description</th><th className="py-2 text-right">Qty</th><th className="py-2 text-right">Price</th><th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-2">{it.desc || "—"}</td>
                  <td className="py-2 text-right tabular-nums">{it.qty}</td>
                  <td className="py-2 text-right tabular-nums">{fmt(it.price, currency)}</td>
                  <td className="py-2 text-right tabular-nums">{fmt(it.qty * it.price, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex justify-end">
            <div className="w-64 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="tabular-nums">{fmt(subtotal, currency)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Tax ({tax}%)</span><span className="tabular-nums">{fmt(taxAmt, currency)}</span></div>
              <div className="flex justify-between border-t border-slate-300 pt-2 font-semibold text-lg"><span>Total</span><span className="tabular-nums">{fmt(total, currency)}</span></div>
            </div>
          </div>
          {notes && <div className="mt-8 text-xs text-slate-500"><div className="uppercase tracking-wider mb-1">Notes</div>{notes}</div>}
        </div>
      </div>
      <HowItWorks>
        <p>Fill in your business, your client and the items. The right side shows a live preview. When it looks right, hit Print and choose "Save as PDF" in the print dialog. Everything stays in your browser.</p>
      </HowItWorks>
    </ToolLayout>
  );
}
