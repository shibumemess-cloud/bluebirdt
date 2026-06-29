import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2, Users } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/trip-cost-splitter")({
  head: () => ({
    meta: [
      { title: "Trip Cost Splitter — Settle Up Bills Free" },
      { name: "description", content: "Split shared expenses fairly across your group — enter who paid for what, get a clean settle‑up list with who owes whom." },
      { property: "og:title", content: "Trip Cost Splitter — Bluebird" },
      { property: "og:description", content: "Free group expense splitter that runs in your browser." },
    ],
    links: [{ rel: "canonical", href: "/trip-cost-splitter" }],
  }),
  component: Page,
});

type Expense = { id: string; desc: string; payer: string; amount: number };

function uid() { return Math.random().toString(36).slice(2, 9); }

function settle(balances: Record<string, number>): { from: string; to: string; amount: number }[] {
  const arr = Object.entries(balances).map(([n, v]) => ({ n, v }));
  const debtors = arr.filter((x) => x.v < -0.005).sort((a, b) => a.v - b.v);
  const creditors = arr.filter((x) => x.v > 0.005).sort((a, b) => b.v - a.v);
  const out: { from: string; to: string; amount: number }[] = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(-debtors[i].v, creditors[j].v);
    out.push({ from: debtors[i].n, to: creditors[j].n, amount: Math.round(pay * 100) / 100 });
    debtors[i].v += pay; creditors[j].v -= pay;
    if (Math.abs(debtors[i].v) < 0.005) i++;
    if (Math.abs(creditors[j].v) < 0.005) j++;
  }
  return out;
}

function Page() {
  const [people, setPeople] = useState<string[]>(["Alex", "Jordan", "Sam"]);
  const [newPerson, setNewPerson] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: uid(), desc: "Cabin rental", payer: "Alex", amount: 300 },
    { id: uid(), desc: "Groceries", payer: "Jordan", amount: 90 },
  ]);
  const [currency, setCurrency] = useState("$");

  const balances = useMemo(() => {
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const share = people.length ? total / people.length : 0;
    const bal: Record<string, number> = {};
    people.forEach((p) => (bal[p] = -share));
    expenses.forEach((e) => { if (bal[e.payer] !== undefined) bal[e.payer] += e.amount; });
    return bal;
  }, [people, expenses]);

  const transfers = useMemo(() => settle({ ...balances }), [balances]);

  function addPerson() {
    const n = newPerson.trim();
    if (!n || people.includes(n)) return;
    setPeople([...people, n]); setNewPerson("");
  }
  function removePerson(name: string) {
    setPeople(people.filter((p) => p !== name));
    setExpenses(expenses.filter((e) => e.payer !== name));
  }
  function addExpense() {
    setExpenses([...expenses, { id: uid(), desc: "", payer: people[0] || "", amount: 0 }]);
  }

  return (
    <ToolLayout slug="trip-cost-splitter">
      <div className="soft-card p-5 sm:p-6 space-y-6">
        <section>
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="font-medium flex items-center gap-2"><Users className="size-4 text-primary" /> People</h2>
            <label className="text-sm flex items-center gap-2">Currency
              <input value={currency} onChange={(e) => setCurrency(e.target.value.slice(0, 3))} className="w-14 rounded-lg border border-border bg-background px-2 py-1 text-center" />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {people.map((p) => (
              <span key={p} className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 text-sm">
                {p}<button onClick={() => removePerson(p)} aria-label={`Remove ${p}`}><Trash2 className="size-3.5" /></button>
              </span>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input value={newPerson} onChange={(e) => setNewPerson(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addPerson()} placeholder="Add a name" className="flex-1 rounded-xl border border-border bg-background px-3 py-2" />
            <button onClick={addPerson} className="inline-flex items-center gap-1 min-h-11 px-3 rounded-xl bg-primary text-primary-foreground font-medium"><Plus className="size-4" /> Add</button>
          </div>
        </section>

        <section>
          <h2 className="font-medium mb-3">Expenses</h2>
          <div className="space-y-2">
            {expenses.map((e) => (
              <div key={e.id} className="grid grid-cols-[1fr_140px_120px_auto] gap-2 items-center">
                <input value={e.desc} onChange={(ev) => setExpenses(expenses.map((x) => x.id === e.id ? { ...x, desc: ev.target.value } : x))} placeholder="What was it?" className="rounded-lg border border-border bg-background px-3 py-2" />
                <select value={e.payer} onChange={(ev) => setExpenses(expenses.map((x) => x.id === e.id ? { ...x, payer: ev.target.value } : x))} className="rounded-lg border border-border bg-background px-2 py-2">
                  {people.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <input inputMode="decimal" value={e.amount || ""} onChange={(ev) => setExpenses(expenses.map((x) => x.id === e.id ? { ...x, amount: parseFloat(ev.target.value) || 0 } : x))} placeholder="0.00" className="rounded-lg border border-border bg-background px-3 py-2 font-mono text-right" />
                <button onClick={() => setExpenses(expenses.filter((x) => x.id !== e.id))} aria-label="Delete expense" className="text-muted-foreground hover:text-rose-600"><Trash2 className="size-4" /></button>
              </div>
            ))}
          </div>
          <button onClick={addExpense} className="mt-3 inline-flex items-center gap-1 min-h-11 px-3 rounded-xl border border-border bg-background font-medium"><Plus className="size-4" /> Add expense</button>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="font-medium mb-2">Settle up</h2>
          {transfers.length === 0 ? (
            <p className="text-sm text-muted-foreground">Everyone is even — no payments needed.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {transfers.map((t, i) => (
                <li key={i}><strong>{t.from}</strong> pays <strong>{t.to}</strong> {currency}{t.amount.toFixed(2)}</li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <HowItWorks>
        <p>Add everyone in your group, then enter each shared cost and who paid for it. We work out the fair share for each person and the smallest set of transfers to settle up — nothing is stored on a server.</p>
      </HowItWorks>
    </ToolLayout>
  );
}
