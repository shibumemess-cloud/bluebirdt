import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/gpa-calculator")({
  head: () => ({
    meta: [
      { title: "GPA Calculator — Free Online College & High School GPA" },
      { name: "description", content: "Calculate your GPA on a 4.0 scale in seconds. Add courses, credits and letter grades — supports weighted and unweighted. Nothing leaves your device." },
      { property: "og:title", content: "GPA Calculator — Bluebird" },
      { property: "og:description", content: "Fast, private GPA calculator." },
      { property: "og:url", content: "/gpa-calculator" },
    ],
    links: [{ rel: "canonical", href: "/gpa-calculator" }],
  }),
  component: Page,
});

const GRADE_POINTS: Record<string, number> = {
  "A+": 4.0, "A": 4.0, "A-": 3.7,
  "B+": 3.3, "B": 3.0, "B-": 2.7,
  "C+": 2.3, "C": 2.0, "C-": 1.7,
  "D+": 1.3, "D": 1.0, "D-": 0.7,
  "F": 0.0,
};

type Course = { id: string; name: string; credits: number; grade: string };

function uid() { return Math.random().toString(36).slice(2, 9); }

function Page() {
  const [courses, setCourses] = useState<Course[]>([
    { id: uid(), name: "Math", credits: 3, grade: "A" },
    { id: uid(), name: "English", credits: 3, grade: "B+" },
    { id: uid(), name: "History", credits: 4, grade: "A-" },
  ]);

  const { gpa, totalCredits } = useMemo(() => {
    let pts = 0, cr = 0;
    for (const c of courses) {
      const g = GRADE_POINTS[c.grade];
      if (g === undefined || !c.credits) continue;
      pts += g * c.credits;
      cr += c.credits;
    }
    return { gpa: cr ? pts / cr : 0, totalCredits: cr };
  }, [courses]);

  const update = (id: string, patch: Partial<Course>) =>
    setCourses((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const remove = (id: string) => setCourses((cs) => cs.filter((c) => c.id !== id));
  const add = () => setCourses((cs) => [...cs, { id: uid(), name: "", credits: 3, grade: "A" }]);

  return (
    <ToolLayout slug="gpa-calculator">
      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        <div className="soft-card p-4 sm:p-5 space-y-3">
          <div className="hidden sm:grid grid-cols-[1fr_110px_110px_44px] gap-2 eyebrow">
            <div>Course</div><div>Credits</div><div>Grade</div><div></div>
          </div>
          {courses.map((c) => (
            <div key={c.id} className="grid grid-cols-1 sm:grid-cols-[1fr_110px_110px_44px] gap-2">
              <input value={c.name} onChange={(e) => update(c.id, { name: e.target.value })}
                placeholder="Course name" aria-label="Course name"
                className="min-h-11 px-3 rounded-lg border border-border bg-card" />
              <input type="number" min={0} max={20} step={0.5} value={c.credits}
                onChange={(e) => update(c.id, { credits: Number(e.target.value) })}
                aria-label="Credits"
                className="min-h-11 px-3 rounded-lg border border-border bg-card" />
              <select value={c.grade} onChange={(e) => update(c.id, { grade: e.target.value })}
                aria-label="Letter grade"
                className="min-h-11 px-3 rounded-lg border border-border bg-card">
                {Object.keys(GRADE_POINTS).map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              <button onClick={() => remove(c.id)} aria-label="Remove course"
                className="min-h-11 rounded-lg border border-border bg-card hover:border-destructive hover:text-destructive inline-flex items-center justify-center">
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          <button onClick={add}
            className="min-h-11 px-4 rounded-lg border border-border bg-card hover:border-primary inline-flex items-center gap-2 text-sm">
            <Plus className="size-4" /> Add course
          </button>
        </div>

        <div className="soft-card p-5 space-y-3 h-fit lg:sticky lg:top-24">
          <div className="eyebrow">Your GPA</div>
          <div className="text-5xl font-display text-primary tabular-nums">{gpa.toFixed(2)}</div>
          <div className="text-sm text-muted-foreground">on a 4.0 scale</div>
          <div className="pt-3 border-t border-border text-sm space-y-1">
            <div className="flex justify-between"><span>Courses</span><span className="tabular-nums">{courses.length}</span></div>
            <div className="flex justify-between"><span>Total credits</span><span className="tabular-nums">{totalCredits}</span></div>
          </div>
        </div>
      </div>

      <div className="soft-card p-4 sm:p-5 mt-5">
        <div className="eyebrow mb-2">Grade scale (4.0)</div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-sm">
          {Object.entries(GRADE_POINTS).map(([g, p]) => (
            <div key={g} className="rounded-lg border border-border bg-card p-2 text-center">
              <div className="font-semibold">{g}</div>
              <div className="text-muted-foreground tabular-nums">{p.toFixed(1)}</div>
            </div>
          ))}
        </div>
      </div>

      <HowItWorks>
        <li>Add each course with its credit hours and letter grade.</li>
        <li>Your GPA updates instantly using the standard 4.0 scale.</li>
        <li>Add or remove courses to see what-if scenarios for next semester.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
