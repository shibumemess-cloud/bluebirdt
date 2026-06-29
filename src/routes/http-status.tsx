import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Globe } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/http-status")({
  head: () => ({
    meta: [
      { title: "HTTP Status Code Lookup — Free Reference" },
      { name: "description", content: "Search every HTTP status code (200, 301, 404, 500…) with a plain-English meaning and category." },
      { property: "og:title", content: "HTTP Status Code Lookup — Bluebird" },
      { property: "og:description", content: "All HTTP status codes explained." },
    ],
    links: [{ rel: "canonical", href: "/http-status" }],
  }),
  component: Page,
});

type Code = { code: number; name: string; desc: string };

const CODES: Code[] = [
  { code: 100, name: "Continue", desc: "The server has received the request headers and the client should proceed." },
  { code: 101, name: "Switching Protocols", desc: "The server is switching protocols as requested." },
  { code: 200, name: "OK", desc: "Standard success — the request worked." },
  { code: 201, name: "Created", desc: "The request succeeded and a new resource was created." },
  { code: 202, name: "Accepted", desc: "Request accepted for processing, but not yet completed." },
  { code: 204, name: "No Content", desc: "Success, but there is no body to return." },
  { code: 206, name: "Partial Content", desc: "The server is returning part of the resource (range requests)." },
  { code: 301, name: "Moved Permanently", desc: "The resource has a new URL — update bookmarks and links." },
  { code: 302, name: "Found", desc: "Temporary redirect to a different URL." },
  { code: 304, name: "Not Modified", desc: "The cached copy is still fresh — no need to re-download." },
  { code: 307, name: "Temporary Redirect", desc: "Same method, different URL, just for now." },
  { code: 308, name: "Permanent Redirect", desc: "Like 301 but the original method is preserved." },
  { code: 400, name: "Bad Request", desc: "The server can't understand the request." },
  { code: 401, name: "Unauthorized", desc: "You need to sign in." },
  { code: 403, name: "Forbidden", desc: "You're signed in but not allowed." },
  { code: 404, name: "Not Found", desc: "The page or resource doesn't exist." },
  { code: 405, name: "Method Not Allowed", desc: "The HTTP method isn't supported on this URL." },
  { code: 408, name: "Request Timeout", desc: "The server gave up waiting for the request." },
  { code: 409, name: "Conflict", desc: "The request conflicts with the current state (e.g. duplicate)." },
  { code: 410, name: "Gone", desc: "The resource used to exist but is permanently removed." },
  { code: 413, name: "Payload Too Large", desc: "The upload is bigger than the server allows." },
  { code: 415, name: "Unsupported Media Type", desc: "The server doesn't accept the body's format." },
  { code: 418, name: "I'm a Teapot", desc: "An April Fools' joke from RFC 2324 — still served as an Easter egg." },
  { code: 422, name: "Unprocessable Entity", desc: "Request is well-formed but failed validation." },
  { code: 429, name: "Too Many Requests", desc: "Rate-limited — slow down or wait." },
  { code: 500, name: "Internal Server Error", desc: "Something broke on the server side." },
  { code: 501, name: "Not Implemented", desc: "The server doesn't support this feature." },
  { code: 502, name: "Bad Gateway", desc: "An upstream server gave an invalid response." },
  { code: 503, name: "Service Unavailable", desc: "The server is overloaded or down for maintenance." },
  { code: 504, name: "Gateway Timeout", desc: "An upstream server didn't respond in time." },
  { code: 505, name: "HTTP Version Not Supported", desc: "The HTTP version in the request isn't supported." },
];

function cat(code: number) {
  if (code < 200) return { label: "Informational", tone: "bg-muted text-foreground" };
  if (code < 300) return { label: "Success", tone: "bg-success/15 text-success" };
  if (code < 400) return { label: "Redirect", tone: "bg-primary-soft text-primary" };
  if (code < 500) return { label: "Client error", tone: "bg-warning/15 text-warning" };
  return { label: "Server error", tone: "bg-destructive/10 text-destructive" };
}

function Page() {
  const [q, setQ] = useState("");
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return CODES;
    return CODES.filter((c) => String(c.code).startsWith(s) || c.name.toLowerCase().includes(s) || c.desc.toLowerCase().includes(s));
  }, [q]);
  return (
    <ToolLayout slug="http-status">
      <div className="soft-card p-4 sm:p-5">
        <label className="eyebrow" htmlFor="q">Search by code or name</label>
        <input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. 404 or redirect"
          className="mt-1.5 w-full rounded-xl border border-border bg-card p-3 min-h-12 focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div className="mt-4 grid sm:grid-cols-2 gap-3">
        {rows.map((c) => {
          const k = cat(c.code);
          return (
            <div key={c.code} className="soft-card p-4">
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-3"><span className="text-2xl font-bold font-mono">{c.code}</span><span className="font-semibold">{c.name}</span></div>
                <span className={`text-xs px-2 py-1 rounded-full ${k.tone}`}>{k.label}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
            </div>
          );
        })}
        {rows.length === 0 && <div className="text-muted-foreground p-6 col-span-full text-center">No matching codes.</div>}
      </div>
      <HowItWorks>
        <li>Type a code or part of a name to filter the list.</li>
        <li>Use it to explain an error to a non-technical teammate.</li>
      </HowItWorks>
      <div className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground"><Globe className="size-4 text-primary" /> Static reference — no network calls.</div>
    </ToolLayout>
  );
}
