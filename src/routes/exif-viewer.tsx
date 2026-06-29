import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import EXIF from "exif-js";
import { Camera, Clock, MapPin, Settings2, Info, ShieldAlert, ShieldCheck, ChevronDown } from "lucide-react";
import { ToolLayout, validateImageFile, formatBytes } from "../components/ToolLayout";
import { FileDrop, ErrorBox, RunButton, ResultPanel, EmptyState, HowItWorks } from "../components/ToolControls";
import ogImage from "../assets/og/og-exif.jpg";

export const Route = createFileRoute("/exif-viewer")({
  head: () => ({
    meta: [
      { title: "Remove EXIF Data from Photos — See and Strip Hidden Info" },
      { name: "description", content: "See the camera, date, GPS location and settings hidden inside a JPG photo, then download a clean copy with all EXIF data removed. Free and private." },
      { property: "og:title", content: "Remove EXIF Data — Bluebird" },
      { property: "og:description", content: "See what's hidden inside a JPG and download a clean copy. Free, private." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/exif-viewer" },
      { property: "og:image", content: ogImage },
      { name: "twitter:image", content: ogImage },
    ],
    links: [{ rel: "canonical", href: "/exif-viewer" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bluebird EXIF Viewer & Cleaner",
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Any (Web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          description: "Free in-browser tool to view EXIF metadata in JPG photos and download a clean copy.",
        }),
      },
    ],
  }),
  component: Page,
});

type Group = "camera" | "when" | "where" | "settings" | "other";
type Sensitivity = "high" | "medium" | "low";

const GROUPS: Record<Group, { label: string; Icon: typeof Camera }> = {
  camera:   { label: "Camera",   Icon: Camera },
  when:     { label: "When",     Icon: Clock },
  where:    { label: "Where",    Icon: MapPin },
  settings: { label: "Settings", Icon: Settings2 },
  other:    { label: "Other",    Icon: Info },
};

const FIELD_META: Record<string, { label: string; group: Group; sensitive: Sensitivity; why?: string }> = {
  Make:               { label: "Camera brand",  group: "camera",   sensitive: "low" },
  Model:              { label: "Camera model",  group: "camera",   sensitive: "low" },
  LensModel:          { label: "Lens",          group: "camera",   sensitive: "low" },
  Software:           { label: "Edited with",   group: "camera",   sensitive: "medium", why: "Can reveal the app or device used." },
  Artist:             { label: "Photographer",  group: "camera",   sensitive: "high", why: "Personal name stored inside the photo." },
  Copyright:          { label: "Copyright",     group: "camera",   sensitive: "low" },
  SerialNumber:       { label: "Camera serial", group: "camera",   sensitive: "high", why: "Uniquely identifies the camera body." },
  BodySerialNumber:   { label: "Body serial",   group: "camera",   sensitive: "high", why: "Uniquely identifies the camera." },
  DateTime:           { label: "Saved on",      group: "when",     sensitive: "medium" },
  DateTimeOriginal:   { label: "Taken on",      group: "when",     sensitive: "medium", why: "Exact date and time of the shot." },
  DateTimeDigitized:  { label: "Digitized",     group: "when",     sensitive: "medium" },
  GPSLatitude:        { label: "Latitude",      group: "where",    sensitive: "high", why: "Exact location where the photo was taken." },
  GPSLongitude:       { label: "Longitude",     group: "where",    sensitive: "high", why: "Exact location where the photo was taken." },
  GPSAltitude:        { label: "Altitude",      group: "where",    sensitive: "high" },
  GPSLatitudeRef:     { label: "Lat ref",       group: "where",    sensitive: "high" },
  GPSLongitudeRef:    { label: "Long ref",      group: "where",    sensitive: "high" },
  ExposureTime:       { label: "Shutter speed", group: "settings", sensitive: "low" },
  FNumber:            { label: "Aperture",      group: "settings", sensitive: "low" },
  ISOSpeedRatings:    { label: "ISO",           group: "settings", sensitive: "low" },
  FocalLength:        { label: "Focal length",  group: "settings", sensitive: "low" },
  Flash:              { label: "Flash",         group: "settings", sensitive: "low" },
  WhiteBalance:       { label: "White balance", group: "settings", sensitive: "low" },
  Orientation:        { label: "Orientation",   group: "settings", sensitive: "low" },
};

function classify(key: string): { label: string; group: Group; sensitive: Sensitivity; why?: string } {
  if (FIELD_META[key]) return FIELD_META[key];
  if (/^GPS/.test(key)) return { label: key.replace(/^GPS/, "GPS "), group: "where", sensitive: "high" };
  if (/Date|Time/.test(key)) return { label: key, group: "when", sensitive: "medium" };
  return { label: key.replace(/([a-z])([A-Z])/g, "$1 $2"), group: "other", sensitive: "low" };
}

function dmsToDecimal(dms: number[], ref: string): number {
  const [d = 0, m = 0, s = 0] = dms;
  let v = d + m / 60 + s / 3600;
  if (ref === "S" || ref === "W") v = -v;
  return v;
}

async function readExif(file: File): Promise<Record<string, unknown>> {
  const buf = await file.arrayBuffer();
  const tags = (EXIF as unknown as { readFromBinaryFile: (b: ArrayBuffer) => Record<string, unknown> | null }).readFromBinaryFile(buf);
  return tags ?? {};
}

async function stripExif(file: File): Promise<Blob> {
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await img.decode();
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), "image/jpeg", 0.95),
  );
}

function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [exifData, setExifData] = useState<Record<string, unknown> | null>(null);
  const [noMeta, setNoMeta] = useState(false);
  const [cleaned, setCleaned] = useState<{ url: string; name: string; size: number; removed: number } | null>(null);
  const [openGroups, setOpenGroups] = useState<Record<Group, boolean>>({ camera: true, when: true, where: true, settings: false, other: false });

  function onFile(f: File | null) {
    setExifData(null); setCleaned(null); setNoMeta(false);
    const err = validateImageFile(f, { jpegOnly: true });
    setError(err);
    setFile(err ? null : f);
  }

  async function process() {
    if (!file) return;
    setBusy(true); setError(null); setExifData(null); setNoMeta(false); setCleaned(null);
    try {
      const tags = await readExif(file);
      const count = Object.keys(tags).length;
      if (count === 0) setNoMeta(true);
      else setExifData(tags);
      const blob = await stripExif(file);
      setCleaned({ url: URL.createObjectURL(blob), name: `clean-${file.name}`, size: blob.size, removed: count });
    } catch {
      setError("Sorry, we couldn't read that image. Please try another JPG photo.");
    } finally { setBusy(false); }
  }

  const grouped = useMemo(() => {
    if (!exifData) return null;
    const out: Record<Group, Array<{ key: string; label: string; value: string; sensitive: Sensitivity; why?: string }>> = {
      camera: [], when: [], where: [], settings: [], other: [],
    };
    for (const [k, v] of Object.entries(exifData)) {
      const meta = classify(k);
      out[meta.group].push({ key: k, label: meta.label, value: String(v), sensitive: meta.sensitive, why: meta.why });
    }
    return out;
  }, [exifData]);

  const gps = useMemo(() => {
    if (!exifData) return null;
    const lat = exifData.GPSLatitude as number[] | undefined;
    const latRef = exifData.GPSLatitudeRef as string | undefined;
    const lng = exifData.GPSLongitude as number[] | undefined;
    const lngRef = exifData.GPSLongitudeRef as string | undefined;
    if (!lat || !lng) return null;
    return { lat: dmsToDecimal(lat, latRef ?? "N"), lng: dmsToDecimal(lng, lngRef ?? "E") };
  }, [exifData]);

  const { sensitiveCount, mediumCount, score } = useMemo(() => {
    if (!grouped) return { sensitiveCount: 0, mediumCount: 0, score: 100 };
    const flat = Object.values(grouped).flat();
    const hi = flat.filter((f) => f.sensitive === "high").length;
    const med = flat.filter((f) => f.sensitive === "medium").length;
    const s = Math.max(0, Math.min(100, 100 - hi * 25 - med * 8));
    return { sensitiveCount: hi, mediumCount: med, score: s };
  }, [grouped]);

  const canRun = !!file && !error && !busy;

  return (
    <ToolLayout slug="exif-viewer">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 md:col-span-7 space-y-6">
          <FileDrop
            file={file}
            onFile={onFile}
            accept="image/jpeg"
            label="Choose a JPG photo"
            hint="Only JPG photos store this kind of hidden information — up to 20 MB"
          />
          {error && <ErrorBox>{error}</ErrorBox>}
          <RunButton onClick={process} disabled={!canRun} busy={busy} label="Show & remove hidden info" />

          {noMeta && (
            <div className="soft-card p-4 text-sm flex items-start gap-2">
              <ShieldCheck className="size-4 mt-0.5 text-[color:var(--color-success)]" />
              <span>Good news — this photo doesn't have any hidden information to remove.</span>
            </div>
          )}

          {grouped && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className={[
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 num font-semibold",
                  score >= 80 ? "status-success" : score >= 50 ? "status-warn" : "status-danger",
                ].join(" ")}>
                  Privacy {score}/100
                </span>
                <span className="rounded-full border border-border bg-card px-3 py-1 num">
                  {Object.values(grouped).flat().length} fields found
                </span>
                {sensitiveCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border status-danger px-3 py-1 num">
                    <ShieldAlert className="size-3.5" /> {sensitiveCount} private
                  </span>
                )}
                {mediumCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border status-warn px-3 py-1 num">
                    {mediumCount} mild
                  </span>
                )}
              </div>

              {(Object.keys(GROUPS) as Group[]).map((g) => {
                const items = grouped[g];
                if (items.length === 0) return null;
                const Icon = GROUPS[g].Icon;
                const open = openGroups[g];
                return (
                  <div key={g} className="soft-card overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenGroups((s) => ({ ...s, [g]: !s[g] }))}
                      className="w-full px-5 py-3.5 border-b border-border flex items-center justify-between gap-3 hover:bg-primary-soft/40"
                      aria-expanded={open}
                    >
                      <span className="flex items-center gap-2.5 font-display text-lg">
                        <Icon className="size-4 text-primary" /> {GROUPS[g].label}
                      </span>
                      <span className="flex items-center gap-3 text-xs text-muted-foreground num">
                        {items.length} {items.length === 1 ? "field" : "fields"}
                        <ChevronDown className={["size-4 transition-transform", open ? "rotate-180" : ""].join(" ")} />
                      </span>
                    </button>
                    {open && (
                      <dl className="divide-y divide-border">
                        {items.map((it) => (
                          <div key={it.key} className="grid grid-cols-[auto_minmax(0,10rem)_minmax(0,1fr)] items-center gap-3 px-5 py-3 text-sm">
                            <SensitivityBadge level={it.sensitive} title={it.why} />
                            <dt className="text-muted-foreground truncate">{it.label}</dt>
                            <dd className="font-medium break-words text-right num">{it.value}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </div>
                );
              })}

              {gps && (
                <div className="soft-card p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="size-4 text-primary" />
                    <span className="font-display text-lg">Where it was taken</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 num">
                    {gps.lat.toFixed(5)}°, {gps.lng.toFixed(5)}°
                  </p>
                  <MiniMap lat={gps.lat} lng={gps.lng} />
                  <p className="mt-2 text-[11px] text-muted-foreground">Coordinates plotted offline — no map service is contacted.</p>
                </div>
              )}
            </div>
          )}

          <HowItWorks>
            We read the EXIF block embedded in your JPG locally, then re-encode the picture through the
            browser's canvas. That re-encode is what removes the hidden data — nothing is sent anywhere.
          </HowItWorks>
        </div>

        <aside className="col-span-12 md:col-span-5">
          {cleaned ? (
            <ResultPanel
              title="Clean copy ready"
              delta={cleaned.removed > 0 ? { label: `Removed ${cleaned.removed} fields`, tone: "success" } : null}
              lines={[
                ["Hidden info", cleaned.removed > 0 ? "Removed" : "None found"],
                ["File size", formatBytes(cleaned.size)],
              ]}
              previewUrl={cleaned.url}
              href={cleaned.url}
              download={cleaned.name}
              onReset={() => { setFile(null); setCleaned(null); setExifData(null); }}
            />
          ) : (
            <EmptyState text="Choose a JPG photo to see what's hidden inside, then download a clean copy." />
          )}
        </aside>
      </div>
    </ToolLayout>
  );
}

function SensitivityBadge({ level, title }: { level: Sensitivity; title?: string }) {
  const cls =
    level === "high" ? "status-danger" : level === "medium" ? "status-warn" : "border-border text-muted-foreground bg-card";
  const label = level === "high" ? "Private" : level === "medium" ? "Mild" : "Safe";
  return (
    <span
      title={title}
      className={["inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide w-16", cls].join(" ")}
    >
      {label}
    </span>
  );
}

function MiniMap({ lat, lng }: { lat: number; lng: number }) {
  // Equirectangular projection on a stylized world rectangle
  const x = ((lng + 180) / 360) * 100;
  const y = ((90 - lat) / 180) * 100;
  return (
    <div className="relative aspect-[2/1] w-full overflow-hidden rounded-xl border border-border bg-primary-soft/40">
      <svg viewBox="0 0 360 180" className="absolute inset-0 size-full" aria-hidden>
        {/* Simple grid */}
        {[30, 60, 90, 120, 150].map((y) => (
          <line key={y} x1="0" y1={y} x2="360" y2={y} className="stroke-border" strokeWidth="0.5" />
        ))}
        {[60, 120, 180, 240, 300].map((x) => (
          <line key={x} x1={x} y1="0" x2={x} y2="180" className="stroke-border" strokeWidth="0.5" />
        ))}
        {/* Equator + meridian highlight */}
        <line x1="0" y1="90" x2="360" y2="90" className="stroke-primary/40" strokeWidth="0.6" />
        <line x1="180" y1="0" x2="180" y2="180" className="stroke-primary/40" strokeWidth="0.6" />
      </svg>
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${x}%`, top: `${y}%` }}
      >
        <span className="block size-3 rounded-full bg-primary shadow-[0_0_0_6px_color-mix(in_oklab,var(--color-primary)_25%,transparent)]" />
      </div>
    </div>
  );
}
