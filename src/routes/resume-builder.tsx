import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Printer } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/resume-builder")({
  head: () => ({
    meta: [
      { title: "Free Resume Builder — Print or Save as PDF" },
      { name: "description", content: "Build a clean, ATS-friendly resume in your browser. Live preview, simple form, print to PDF. No accounts, no watermark." },
      { property: "og:title", content: "Resume Builder — Bluebird" },
      { property: "og:description", content: "Make a polished resume privately in your browser." },
    ],
    links: [{ rel: "canonical", href: "/resume-builder" }],
  }),
  component: Page,
});

type Entry = { title: string; org: string; dates: string; details: string };

function Page() {
  const [name, setName] = useState("Alex Morgan");
  const [role, setRole] = useState("Senior Product Designer");
  const [contact, setContact] = useState("alex@example.com · +1 555 123 4567 · linkedin.com/in/alex");
  const [summary, setSummary] = useState("Product designer with 8+ years shipping clear, calm interfaces for fintech and education. Loves writing, accessibility and design systems.");
  const [skills, setSkills] = useState("Figma, Prototyping, Design systems, User research, Accessibility (WCAG), Workshop facilitation");
  const [work, setWork] = useState<Entry[]>([
    { title: "Senior Designer", org: "Acme Co.", dates: "2022 — Present", details: "Led the redesign of the onboarding flow, lifting completion by 24%.\nBuilt a 60-component design system used across 4 product teams." },
    { title: "Product Designer", org: "Northwind", dates: "2018 — 2022", details: "Owned mobile checkout end-to-end.\nMentored 3 junior designers and ran weekly critiques." },
  ]);
  const [edu, setEdu] = useState<Entry[]>([
    { title: "BA, Visual Communication", org: "State University", dates: "2014 — 2018", details: "" },
  ]);

  function up<T>(arr: T[], i: number, patch: Partial<T>): T[] { return arr.map((it, idx) => (idx === i ? { ...it, ...patch } : it)); }

  return (
    <ToolLayout slug="resume-builder">
      <style>{`@media print { .no-print { display: none !important; } body { background: white !important; } .print-page { box-shadow: none !important; border: none !important; padding: 24mm !important; max-width: none !important; } }`}</style>
      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6">
        <div className="no-print soft-card p-5 sm:p-6 space-y-4">
          <label className="block"><span className="text-sm font-medium">Full name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 min-h-11" /></label>
          <label className="block"><span className="text-sm font-medium">Headline / role</span>
            <input value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 min-h-11" /></label>
          <label className="block"><span className="text-sm font-medium">Contact (one line)</span>
            <input value={contact} onChange={(e) => setContact(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 min-h-11" /></label>
          <label className="block"><span className="text-sm font-medium">Summary</span>
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2" /></label>
          <label className="block"><span className="text-sm font-medium">Skills (comma separated)</span>
            <textarea value={skills} onChange={(e) => setSkills(e.target.value)} rows={2} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2" /></label>

          {([
            ["Work experience", work, setWork] as const,
            ["Education", edu, setEdu] as const,
          ]).map(([label, list, setter]) => (
            <div key={label}>
              <div className="text-sm font-medium mb-2">{label}</div>
              <div className="space-y-3">
                {list.map((e, i) => (
                  <div key={i} className="rounded-xl border border-border p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input placeholder="Title" value={e.title} onChange={(ev) => setter(up(list, i, { title: ev.target.value }))} className="rounded-xl border border-border bg-background px-3 py-2 min-h-11" />
                      <input placeholder="Org" value={e.org} onChange={(ev) => setter(up(list, i, { org: ev.target.value }))} className="rounded-xl border border-border bg-background px-3 py-2 min-h-11" />
                    </div>
                    <input placeholder="Dates" value={e.dates} onChange={(ev) => setter(up(list, i, { dates: ev.target.value }))} className="w-full rounded-xl border border-border bg-background px-3 py-2 min-h-11" />
                    <textarea placeholder="Details (one per line)" value={e.details} onChange={(ev) => setter(up(list, i, { details: ev.target.value }))} rows={3} className="w-full rounded-xl border border-border bg-background px-3 py-2" />
                    <button onClick={() => setter(list.filter((_, idx) => idx !== i))} className="text-sm text-rose-600 inline-flex items-center gap-1"><Trash2 className="size-3.5" /> Remove</button>
                  </div>
                ))}
                <button onClick={() => setter([...list, { title: "", org: "", dates: "", details: "" }])} className="inline-flex items-center gap-2 text-sm text-primary font-semibold"><Plus className="size-4" /> Add</button>
              </div>
            </div>
          ))}

          <button onClick={() => window.print()} className="w-full inline-flex items-center justify-center gap-2 min-h-12 rounded-xl bg-primary text-primary-foreground font-medium">
            <Printer className="size-4" /> Print or save as PDF
          </button>
        </div>

        <div className="print-page soft-card p-8 sm:p-10 bg-white text-slate-900 leading-relaxed">
          <h2 className="text-3xl font-display tracking-tight">{name}</h2>
          <div className="text-primary text-sm font-medium mt-1">{role}</div>
          <div className="text-xs text-slate-500 mt-1">{contact}</div>

          <Section title="Summary">{summary}</Section>
          <Section title="Skills">
            <div className="flex flex-wrap gap-1.5">
              {skills.split(",").map((s, i) => s.trim() && <span key={i} className="text-xs rounded-full bg-slate-100 px-2 py-1">{s.trim()}</span>)}
            </div>
          </Section>
          {[
            ["Experience", work] as const,
            ["Education", edu] as const,
          ].map(([label, list]) => (
            <Section key={label} title={label}>
              <div className="space-y-3">
                {list.map((e, i) => (
                  <div key={i}>
                    <div className="flex justify-between gap-3 text-sm">
                      <div className="font-semibold">{e.title}{e.org && <span className="text-slate-500 font-normal"> · {e.org}</span>}</div>
                      <div className="text-xs text-slate-500 shrink-0">{e.dates}</div>
                    </div>
                    {e.details.split("\n").filter(Boolean).map((d, j) => (
                      <div key={j} className="text-sm text-slate-700 ml-3">• {d}</div>
                    ))}
                  </div>
                ))}
              </div>
            </Section>
          ))}
        </div>
      </div>
      <HowItWorks>
        <p>Fill in your details on the left and watch the preview update. When you're happy, choose Print and pick "Save as PDF" in the print dialog. Plain text and simple layout means it reads cleanly in applicant tracking systems too.</p>
      </HowItWorks>
    </ToolLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <div className="text-xs uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-1 mb-2">{title}</div>
      <div className="text-sm text-slate-800">{children}</div>
    </div>
  );
}
