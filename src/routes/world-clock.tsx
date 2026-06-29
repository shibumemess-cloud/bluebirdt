import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Globe2, Plus, X } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/world-clock")({
  head: () => ({
    meta: [
      { title: "World Clock & Time Zone Board — Free" },
      { name: "description", content: "Compare the current time across multiple cities at a glance. Add and remove zones, save your board — perfect for remote teams." },
      { property: "og:title", content: "World Clock — Bluebird" },
      { property: "og:description", content: "A simple world clock that runs in your browser." },
    ],
    links: [{ rel: "canonical", href: "/world-clock" }],
  }),
  component: Page,
});

const POPULAR = [
  "UTC", "America/Los_Angeles", "America/Denver", "America/Chicago", "America/New_York",
  "America/Sao_Paulo", "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Athens",
  "Africa/Cairo", "Asia/Dubai", "Asia/Karachi", "Asia/Kolkata", "Asia/Bangkok",
  "Asia/Singapore", "Asia/Shanghai", "Asia/Tokyo", "Australia/Sydney", "Pacific/Auckland",
];

const STORAGE = "bluebird:world-clock";

function Page() {
  const [zones, setZones] = useState<string[]>([]);
  const [now, setNow] = useState(new Date());
  const [add, setAdd] = useState("Europe/London");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE);
      if (saved) setZones(JSON.parse(saved));
      else {
        const local = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
        setZones(Array.from(new Set([local, "UTC", "America/New_York", "Asia/Tokyo"])));
      }
    } catch { setZones(["UTC", "America/New_York", "Asia/Tokyo"]); }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE, JSON.stringify(zones)); } catch { /* ignore */ }
  }, [zones]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  function addZone() {
    if (!add) return;
    if (!zones.includes(add)) setZones([...zones, add]);
  }
  function remove(z: string) { setZones(zones.filter((x) => x !== z)); }

  return (
    <ToolLayout slug="world-clock">
      <div className="soft-card p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-end gap-3">
          <label className="block flex-1 min-w-[220px]">
            <span className="text-sm font-medium">Add a city / zone</span>
            <select value={add} onChange={(e) => setAdd(e.target.value)} className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 min-h-11">
              {POPULAR.map((z) => <option key={z} value={z}>{z.replace(/_/g, " ")}</option>)}
            </select>
          </label>
          <button onClick={addZone} className="inline-flex items-center gap-2 min-h-11 px-4 rounded-xl bg-primary text-primary-foreground font-medium"><Plus className="size-4" /> Add</button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {zones.map((z) => {
            const time = new Intl.DateTimeFormat([], { timeZone: z, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(now);
            const date = new Intl.DateTimeFormat([], { timeZone: z, weekday: "short", month: "short", day: "numeric" }).format(now);
            return (
              <div key={z} className="rounded-2xl border border-border bg-card p-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2"><Globe2 className="size-3.5" />{z.replace(/_/g, " ")}</div>
                  <div className="text-2xl font-mono tabular-nums mt-1">{time}</div>
                  <div className="text-xs text-muted-foreground">{date}</div>
                </div>
                <button onClick={() => remove(z)} aria-label={`Remove ${z}`} className="text-muted-foreground hover:text-rose-600"><X className="size-4" /></button>
              </div>
            );
          })}
          {zones.length === 0 && <p className="text-sm text-muted-foreground">Add a zone above to start your board.</p>}
        </div>
      </div>
      <HowItWorks>
        <p>Pick zones from the list — your board saves to this browser so it loads instantly next time. Times use the official IANA database via your browser, so daylight‑saving changes work automatically.</p>
      </HowItWorks>
    </ToolLayout>
  );
}
