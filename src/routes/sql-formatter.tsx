import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { format } from "sql-formatter";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/sql-formatter")({
  head: () => ({
    meta: [
      { title: "SQL Formatter — Free Online SQL Beautifier" },
      { name: "description", content: "Format and beautify SQL queries instantly. Supports PostgreSQL, MySQL, SQLite, BigQuery, T-SQL and more. Runs in your browser." },
      { property: "og:title", content: "SQL Formatter — Bluebird" },
      { property: "og:description", content: "Beautify SQL queries in your browser." },
      { property: "og:url", content: "/sql-formatter" },
    ],
    links: [{ rel: "canonical", href: "/sql-formatter" }],
  }),
  component: Page,
});

const DIALECTS = ["sql", "postgresql", "mysql", "sqlite", "mariadb", "bigquery", "tsql", "redshift", "snowflake", "spark", "trino"] as const;
type Dialect = (typeof DIALECTS)[number];

function Page() {
  const [input, setInput] = useState("select id,name,email from users u join orders o on o.user_id=u.id where u.active=true and o.total>100 order by o.created_at desc limit 10;");
  const [dialect, setDialect] = useState<Dialect>("sql");
  const [tabWidth, setTabWidth] = useState(2);
  const [uppercase, setUppercase] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const output = useMemo(() => {
    try {
      setError(null);
      return format(input, { language: dialect, tabWidth, keywordCase: uppercase ? "upper" : "lower" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not format that query");
      return "";
    }
  }, [input, dialect, tabWidth, uppercase]);

  return (
    <ToolLayout slug="sql-formatter">
      <div className="soft-card p-4 sm:p-5 mb-5 flex flex-wrap gap-3 items-end">
        <label className="text-sm">
          <div className="eyebrow mb-1">Dialect</div>
          <select value={dialect} onChange={(e) => setDialect(e.target.value as Dialect)}
            className="min-h-10 px-3 rounded-lg border border-border bg-card">
            {DIALECTS.map((d) => <option key={d} value={d}>{d.toUpperCase()}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <div className="eyebrow mb-1">Indent</div>
          <select value={tabWidth} onChange={(e) => setTabWidth(Number(e.target.value))}
            className="min-h-10 px-3 rounded-lg border border-border bg-card">
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value={8}>Tab (8)</option>
          </select>
        </label>
        <label className="text-sm inline-flex items-center gap-2 min-h-10">
          <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} />
          UPPERCASE keywords
        </label>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="soft-card p-4 sm:p-5 space-y-3">
          <div className="eyebrow">Your SQL</div>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={16} spellCheck={false}
            aria-label="SQL input"
            className="w-full font-mono text-sm rounded-xl border border-border bg-card p-3 focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="soft-card p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="eyebrow">Formatted</div>
            <button onClick={() => navigator.clipboard.writeText(output)} disabled={!output}
              className="min-h-10 px-3 rounded-lg border border-border bg-card hover:border-primary inline-flex items-center gap-2 text-sm disabled:opacity-50">
              <Copy className="size-4" /> Copy
            </button>
          </div>
          {error ? (
            <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 text-destructive p-3 text-sm">{error}</div>
          ) : (
            <pre aria-live="polite" className="min-h-[24rem] rounded-xl border border-border bg-card p-3 overflow-auto font-mono text-sm whitespace-pre">{output}</pre>
          )}
        </div>
      </div>

      <HowItWorks>
        <li>Paste a SQL query into the left panel.</li>
        <li>Pick your dialect (PostgreSQL, MySQL, T-SQL…) and indent size.</li>
        <li>Copy the formatted query — everything happens in your browser.</li>
      </HowItWorks>
    </ToolLayout>
  );
}
