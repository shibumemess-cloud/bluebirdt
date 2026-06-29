import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/distance-calculator")({
  head: () => ({
    meta: [
      { title: "Distance Calculator — Great-Circle Online Free" },
      { name: "description", content: "Calculate the great‑circle distance between two latitude/longitude points in km and miles using the Haversine formula. Runs offline." },
      { property: "og:title", content: "Distance Calculator — Bluebird" },
      { property: "og:description", content: "Free Haversine distance calculator — kilometres, miles and nautical miles." },
    ],
    links: [{ rel: "canonical", href: "/distance-calculator" }],
  }),
  component: Page,
});

const R_KM = 6371.0088;

function parseCoord(s: string): number | null {
  const n = parseFloat(s.trim());
  return Number.isFinite(n) ? n : null;
}
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

function Page() {
  const [a, setA] = useState({ lat: "40.7128", lon: "-74.0060" }); // NYC
  const [b, setB] = useState({ lat: "51.5074", lon: "-0.1278" });  // London

  const result = useMemo(() => {
    const lat1 = parseCoord(a.lat), lon1 = parseCoord(a.lon);
    const lat2 = parseCoord(b.lat), lon2 = parseCoord(b.lon);
    if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return null;
    if (Math.abs(lat1) > 90 || Math.abs(lat2) > 90 || Math.abs(lon1) > 180 || Math.abs(lon2) > 180) return null;
    const km = haversine(lat1, lon1, lat2, lon2);
    return { km, mi: km * 0.621371, nm: km * 0.539957 };
  }, [a, b]);

  function pair(label: string, val: { lat: string; lon: string }, set: (v: { lat: string; lon: string }) => void) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <div className="font-medium flex items-center gap-2"><MapPin className="size-4 text-primary" /> {label}</div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="text-xs text-muted-foreground">Latitude</span>
            <input inputMode="decimal" value={val.lat} onChange={(e) => set({ ...val, lat: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm" />
          </label>
          <label className="block"><span className="text-xs text-muted-foreground">Longitude</span>
            <input inputMode="decimal" value={val.lon} onChange={(e) => set({ ...val, lon: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm" />
          </label>
        </div>
      </div>
    );
  }

  return (
    <ToolLayout slug="distance-calculator">
      <div className="soft-card p-5 sm:p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          {pair("Point A", a, setA)}
          {pair("Point B", b, setB)}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5" aria-live="polite">
          {result ? (
            <div className="grid grid-cols-3 gap-3 text-center">
              <div><div className="text-2xl font-semibold tabular-nums">{result.km.toFixed(2)}</div><div className="text-xs text-muted-foreground">kilometres</div></div>
              <div><div className="text-2xl font-semibold tabular-nums">{result.mi.toFixed(2)}</div><div className="text-xs text-muted-foreground">miles</div></div>
              <div><div className="text-2xl font-semibold tabular-nums">{result.nm.toFixed(2)}</div><div className="text-xs text-muted-foreground">nautical miles</div></div>
            </div>
          ) : (
            <p className="text-sm text-rose-700">Enter valid latitude (−90 to 90) and longitude (−180 to 180) for both points.</p>
          )}
        </div>
      </div>
      <HowItWorks>
        <p>Type the latitude and longitude of each point. We use the Haversine formula on a sphere of radius 6,371 km — the same approximation used for flight paths. Accuracy is within ~0.5% for any two points on Earth.</p>
      </HowItWorks>
    </ToolLayout>
  );
}
