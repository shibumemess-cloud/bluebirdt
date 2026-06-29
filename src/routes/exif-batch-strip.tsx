import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Download, Loader2 } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/exif-batch-strip")({
  head: () => ({
    meta: [
      { title: "Batch EXIF Stripper — Remove Metadata From Multiple Photos" },
      { name: "description", content: "Drop in any number of JPG, PNG or WEBP photos and download a clean ZIP with all hidden EXIF, GPS and camera data removed." },
      { property: "og:title", content: "Batch EXIF Stripper — Bluebird" },
      { property: "og:description", content: "Strip metadata from many photos at once, privately." },
    ],
    links: [{ rel: "canonical", href: "/exif-batch-strip" }],
  }),
  component: Page,
});

type Job = { name: string; before: number; after: number; url: string };

async function stripOne(file: File): Promise<Blob | null> {
  const bmp = await createImageBitmap(file).catch(() => null);
  if (!bmp) return null;
  const c = document.createElement("canvas");
  c.width = bmp.width; c.height = bmp.height;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(bmp, 0, 0);
  const type = file.type === "image/png" ? "image/png" : file.type === "image/webp" ? "image/webp" : "image/jpeg";
  return await new Promise((r) => c.toBlob((b) => r(b), type, 0.95));
}

function Page() {
  const [busy, setBusy] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => () => {
    jobs.forEach((j) => URL.revokeObjectURL(j.url));
    if (zipUrl) URL.revokeObjectURL(zipUrl);
  }, [jobs, zipUrl]);

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true); setZipUrl(null);
    const next: Job[] = [];
    const blobs: { name: string; blob: Blob }[] = [];
    for (const f of Array.from(files)) {
      const blob = await stripOne(f);
      if (!blob) continue;
      const url = URL.createObjectURL(blob);
      next.push({ name: f.name, before: f.size, after: blob.size, url });
      blobs.push({ name: f.name, blob });
    }
    setJobs(next);
    if (blobs.length > 1) {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      blobs.forEach(({ name, blob }) => zip.file(name, blob));
      const z = await zip.generateAsync({ type: "blob" });
      setZipUrl(URL.createObjectURL(z));
    }
    setBusy(false);
  }

  const totalBefore = jobs.reduce((s, j) => s + j.before, 0);
  const totalAfter = jobs.reduce((s, j) => s + j.after, 0);

  return (
    <ToolLayout slug="exif-batch-strip">
      <div className="soft-card p-6 text-center">
        <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => onFiles(e.target.files)} />
        <button onClick={() => fileRef.current?.click()} className="px-5 py-3 rounded-xl bg-primary text-primary-foreground font-medium min-h-12 inline-flex items-center gap-2">
          {busy ? <><Loader2 className="size-4 animate-spin" /> Cleaning…</> : "Choose photos"}
        </button>
        <p className="mt-2 text-sm text-muted-foreground">JPG, PNG or WEBP — pick as many as you like.</p>
      </div>
      {jobs.length > 0 && (
        <>
          <div className="mt-4 soft-card p-4 sm:p-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="text-sm text-muted-foreground">{jobs.length} photo{jobs.length === 1 ? "" : "s"} cleaned · {(totalBefore / 1024).toFixed(0)} KB → {(totalAfter / 1024).toFixed(0)} KB</div>
              {zipUrl && (
                <a href={zipUrl} download="cleaned-photos.zip" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground inline-flex items-center gap-2 min-h-12"><Download className="size-4" /> Download all as ZIP</a>
              )}
            </div>
            <ul className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {jobs.map((j) => (
                <li key={j.name} className="rounded-xl border border-border overflow-hidden bg-card">
                  <img src={j.url} alt="" className="w-full h-32 object-cover" />
                  <div className="p-3 text-sm">
                    <div className="font-medium truncate" title={j.name}>{j.name}</div>
                    <div className="text-xs text-muted-foreground">{(j.before / 1024).toFixed(0)} KB → {(j.after / 1024).toFixed(0)} KB</div>
                    <a href={j.url} download={j.name} className="mt-2 inline-flex items-center gap-1.5 text-primary text-sm"><Download className="size-3.5" /> Download</a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
      <HowItWorks>
        <li>Pick one or many photos — they stay on your device.</li>
        <li>Each image is re-saved without EXIF, GPS or camera metadata.</li>
        <li>Download individually, or grab everything as a ZIP.</li>
      </HowItWorks>
      <div className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground"><ShieldCheck className="size-4 text-primary" /> All cleaning happens in your browser — nothing is uploaded.</div>
    </ToolLayout>
  );
}
