import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { KeyRound, Copy, Loader2 } from "lucide-react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/dkim-keygen")({
  head: () => ({
    meta: [
      { title: "DKIM Key Pair Generator — Free RSA Keys for Email" },
      { name: "description", content: "Generate a 1024 or 2048-bit DKIM key pair in your browser. Copy the public TXT record and keep the private key safe." },
      { property: "og:title", content: "DKIM Key Generator — Bluebird" },
      { property: "og:description", content: "Create DKIM RSA keys without uploading anything." },
    ],
    links: [{ rel: "canonical", href: "/dkim-keygen" }],
  }),
  component: Page,
});

function ab2b64(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
function wrap(s: string, n = 64) {
  return s.replace(new RegExp(`.{1,${n}}`, "g"), "$&\n").trim();
}

function Page() {
  const [bits, setBits] = useState<1024 | 2048>(2048);
  const [selector, setSelector] = useState("bluebird");
  const [busy, setBusy] = useState(false);
  const [pub, setPub] = useState("");
  const [priv, setPriv] = useState("");
  const [err, setErr] = useState("");

  async function gen() {
    setBusy(true); setErr(""); setPub(""); setPriv("");
    try {
      const k = await crypto.subtle.generateKey(
        { name: "RSASSA-PKCS1-v1_5", modulusLength: bits, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
        true, ["sign", "verify"],
      );
      const spki = await crypto.subtle.exportKey("spki", k.publicKey);
      const pkcs8 = await crypto.subtle.exportKey("pkcs8", k.privateKey);
      setPub(ab2b64(spki));
      setPriv(`-----BEGIN PRIVATE KEY-----\n${wrap(ab2b64(pkcs8))}\n-----END PRIVATE KEY-----`);
    } catch (e: any) {
      setErr(e?.message || "Could not generate key.");
    } finally {
      setBusy(false);
    }
  }

  const txt = pub ? `v=DKIM1; k=rsa; p=${pub}` : "";
  const host = `${selector}._domainkey`;

  return (
    <ToolLayout slug="dkim-keygen">
      <div className="soft-card p-4 sm:p-5 flex flex-wrap gap-3 items-end">
        <label className="block">
          <span className="eyebrow">Key size</span>
          <select value={bits} onChange={(e) => setBits(Number(e.target.value) as 1024 | 2048)} className="mt-1.5 rounded-xl border border-border bg-card p-3 min-h-12">
            <option value={2048}>2048-bit (recommended)</option>
            <option value={1024}>1024-bit</option>
          </select>
        </label>
        <label className="block">
          <span className="eyebrow">Selector</span>
          <input value={selector} onChange={(e) => setSelector(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
            className="mt-1.5 rounded-xl border border-border bg-card p-3 min-h-12 font-mono" />
        </label>
        <button onClick={gen} disabled={busy}
          className="px-5 py-3 rounded-xl bg-primary text-primary-foreground font-medium min-h-12 inline-flex items-center gap-2 disabled:opacity-60">
          {busy ? <><Loader2 className="size-4 animate-spin" /> Generating…</> : <>Generate keys</>}
        </button>
      </div>
      {err && <div className="mt-3 text-sm text-destructive">{err}</div>}
      {pub && (
        <div className="mt-4 grid lg:grid-cols-2 gap-4">
          <div className="soft-card p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="eyebrow">Public DNS TXT record</span>
              <button onClick={() => navigator.clipboard.writeText(txt).catch(() => {})} className="text-sm text-primary inline-flex items-center gap-1.5 hover:underline"><Copy className="size-4" /> Copy</button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Host: <span className="font-mono">{host}</span></p>
            <pre className="mt-2 font-mono text-xs whitespace-pre-wrap break-all rounded-xl bg-primary-soft/30 p-4 max-h-72 overflow-auto">{txt}</pre>
          </div>
          <div className="soft-card p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="eyebrow">Private key (PEM)</span>
              <button onClick={() => navigator.clipboard.writeText(priv).catch(() => {})} className="text-sm text-primary inline-flex items-center gap-1.5 hover:underline"><Copy className="size-4" /> Copy</button>
            </div>
            <p className="mt-1 text-xs text-warning">Keep this secret — upload only to your mail server.</p>
            <pre className="mt-2 font-mono text-xs whitespace-pre-wrap break-all rounded-xl bg-primary-soft/30 p-4 max-h-72 overflow-auto">{priv}</pre>
          </div>
        </div>
      )}
      <HowItWorks>
        <li>Pick a key size (2048-bit is the modern recommendation).</li>
        <li>Choose a selector — a short label like <span className="font-mono">bluebird</span> or <span className="font-mono">mail2026</span>.</li>
        <li>Add the TXT record to DNS and configure your mail server with the private key.</li>
      </HowItWorks>
      <div className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground"><KeyRound className="size-4 text-primary" /> Keys are generated by your browser's Web Crypto API and never leave this page.</div>
    </ToolLayout>
  );
}
