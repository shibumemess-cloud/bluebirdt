import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, X, CornerDownLeft, ArrowRight, Clock, Sparkles } from "lucide-react";
import { TOOLS } from "./ToolLayout";

type Tool = (typeof TOOLS)[number];

// Loose keyword index so common search terms route to the right tool.
const KEYWORDS: Record<string, string[]> = {
  "image-compressor": ["compress", "smaller", "reduce size", "shrink", "optimize", "tinypng"],
  "image-resizer": ["resize", "scale", "dimensions", "width", "height"],
  "image-cropper": ["crop", "trim", "cut", "aspect ratio"],
  "rotate-flip": ["rotate", "flip", "mirror", "turn"],
  "image-format-converter": ["convert", "png to jpg", "webp", "jpeg", "format", "change format"],
  "watermark": ["watermark", "logo", "stamp", "signature"],
  "color-picker": ["color picker", "eyedropper", "hex", "rgb", "palette"],
  "exif-viewer": ["exif", "metadata", "gps", "remove location", "strip metadata"],
  "favicon-generator": ["favicon", "icon", "apple touch"],
  "heic-to-jpg": ["heic", "iphone", "ios photo", "convert heic"],
  "images-to-pdf": ["images to pdf", "jpg to pdf", "png to pdf", "make pdf"],
  "pdf-to-images": ["pdf to images", "pdf to jpg", "pdf to png", "extract pages"],
  "pdf-merge": ["merge pdf", "combine pdf", "join pdf"],
  "pdf-split": ["split pdf", "extract pages", "separate pdf"],
  "qr-generator": ["qr code", "wifi qr", "vcard", "barcode"],
  "password-generator": ["password", "secure password", "strong password", "passphrase"],
  "uuid-generator": ["uuid", "guid", "unique id", "v4", "v7"],
  "lorem-ipsum": ["lorem ipsum", "placeholder text", "dummy text", "filler"],
  "json-formatter": ["json", "format json", "validate json", "yaml"],
  "base64": ["base64", "encode", "decode"],
  "text-case-converter": ["case", "uppercase", "lowercase", "title case", "camelcase", "snake case", "kebab"],
  "jwt-decoder": ["jwt", "token", "decode jwt"],
  "regex-tester": ["regex", "regular expression", "pattern", "match"],
  "diff-checker": ["diff", "compare text", "difference"],
  "word-counter": ["word count", "character count", "letters", "essay"],
  "hash-generator": ["hash", "sha256", "sha1", "md5", "checksum"],
  "url-encoder": ["url encode", "url decode", "percent encoding", "escape url"],
  "timestamp-converter": ["unix timestamp", "epoch", "date converter", "time"],
  "markdown-preview": ["markdown", "md", "readme", "preview", "gfm", "github markdown"],
  "csv-json": ["csv to json", "json to csv", "csv", "json", "convert csv", "spreadsheet"],
  "color-converter": ["color converter", "hex to rgb", "rgb to hex", "hsl", "oklch", "hsv"],
  "slug-generator": ["slug", "slugify", "url slug", "permalink", "kebab"],
  "number-base-converter": ["binary", "hex", "octal", "decimal", "base converter", "bin to hex", "dec to bin"],
  "html-entities": ["html entities", "html encode", "html decode", "escape html", "nbsp", "ampersand"],
  "text-to-pdf": ["text to pdf", "txt to pdf", "make pdf", "create pdf", "plain text pdf"],
  "pdf-page-numbers": ["pdf page numbers", "add page numbers", "number pdf pages", "paginate pdf"],
  "random-number": ["random number", "rng", "random generator", "dice", "lottery", "pick a number"],
  "color-palette": ["color palette", "palette generator", "color harmony", "complementary", "analogous", "triadic"],
  "box-shadow": ["box shadow", "css shadow", "drop shadow", "shadow generator"],
  "cron-parser": ["cron", "crontab", "schedule", "cron expression", "cron explain"],
  "age-calculator": ["age", "age calculator", "birthday", "date difference", "days between"],
  "bmi-calculator": ["bmi", "body mass index", "weight", "health"],
  "percentage-calculator": ["percentage", "percent", "percent of", "percent change", "percent increase", "percent decrease"],
  "loan-calculator": ["loan", "emi", "mortgage", "interest", "amortization", "monthly payment"],
  "tip-calculator": ["tip", "gratuity", "bill split", "split bill", "restaurant"],
  "discount-calculator": ["discount", "sale price", "off", "coupon", "markdown"],
  "unit-converter": ["unit converter", "length", "weight", "volume", "area", "speed", "meters to feet", "kg to lb", "miles to km"],
  "temperature-converter": ["temperature", "celsius", "fahrenheit", "kelvin", "c to f", "f to c"],
  "roman-numerals": ["roman numerals", "roman", "numerals", "mcm", "year in roman"],
};

// Curated "popular" picks shown when the search is empty.
const POPULAR_SLUGS = [
  "image-compressor",
  "qr-generator",
  "pdf-merge",
  "password-generator",
  "json-formatter",
  "word-counter",
];

const RECENT_KEY = "bluebird:recent-tools";
const MAX_RECENT = 5;

function loadRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string").slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

function saveRecent(slug: string) {
  if (typeof window === "undefined") return;
  try {
    const cur = loadRecent().filter((s) => s !== slug);
    const next = [slug, ...cur].slice(0, MAX_RECENT);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota / private mode */
  }
}

function score(t: Tool, q: string): number {
  const ql = q.toLowerCase().trim();
  if (!ql) return 0;
  const hay = [
    t.name.toLowerCase(),
    t.desc.toLowerCase(),
    t.short.toLowerCase(),
    t.category.toLowerCase(),
    t.slug.toLowerCase(),
    ...(KEYWORDS[t.slug] ?? []),
  ];
  let s = 0;
  for (const h of hay) {
    if (h === ql) s += 100;
    else if (h.startsWith(ql)) s += 40;
    else if (h.includes(ql)) s += 15;
  }
  const tokens = ql.split(/\s+/).filter(Boolean);
  if (tokens.length > 1) {
    let allHit = true;
    for (const tok of tokens) {
      if (!hay.some((h) => h.includes(tok))) { allHit = false; break; }
    }
    if (allHit) s += 25;
  }
  return s;
}

function bySlug(slug: string): Tool | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

// Highlight matched substring within a label (case-insensitive, single match).
function Highlight({ text, q }: { text: string; q: string }) {
  const ql = q.trim().toLowerCase();
  if (!ql) return <>{text}</>;
  const i = text.toLowerCase().indexOf(ql);
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-transparent text-primary font-semibold">{text.slice(i, i + ql.length)}</mark>
      {text.slice(i + ql.length)}
    </>
  );
}

export function ToolSearch({
  autoFocus = false,
  size = "default",
}: {
  autoFocus?: boolean;
  size?: "default" | "hero";
}) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => { setRecent(loadRecent()); }, []);

  const results = useMemo(() => {
    if (!q.trim()) return [] as Tool[];
    return [...TOOLS]
      .map((t) => ({ t, s: score(t, q) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 8)
      .map((x) => x.t);
  }, [q]);

  // Suggested list (popular + recent) used when input is empty.
  const suggestions = useMemo(() => {
    const recentTools = recent.map(bySlug).filter((t): t is Tool => Boolean(t));
    const popularTools = POPULAR_SLUGS
      .map(bySlug)
      .filter((t): t is Tool => Boolean(t))
      .filter((t) => !recent.includes(t.slug));
    return { recentTools, popularTools };
  }, [recent]);

  // The visible list driven by keyboard nav (results OR suggestions).
  const navList: Tool[] = q.trim() ? results : [...suggestions.recentTools, ...suggestions.popularTools];

  // Global shortcut: "/" or Cmd/Ctrl+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const inField = target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
      if ((e.key === "/" && !inField) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => { setActive(0); }, [q]);
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Keep active option in view when navigating with the keyboard.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function go(tool: Tool) {
    saveRecent(tool.slug);
    setRecent(loadRecent());
    setOpen(false);
    setQ("");
    navigate({ to: `/${tool.slug}` as string });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const len = navList.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (len ? (a + 1) % len : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (len ? (a - 1 + len) % len : 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(Math.max(0, len - 1));
    } else if (e.key === "Enter") {
      const tool = navList[active];
      if (tool) { e.preventDefault(); go(tool); }
    }
  }

  const showPanel = open;
  const showingResults = q.trim().length > 0;
  const hasResults = results.length > 0;
  const activeId = navList[active] ? `tool-opt-${navList[active].slug}` : undefined;

  // Build the row for one tool — reused by results and suggestions.
  const renderRow = (t: Tool, i: number, opts?: { highlight?: boolean }) => {
    const Icon = t.Icon;
    const isActive = i === active;
    return (
      <li key={t.slug} role="option" aria-selected={isActive} id={`tool-opt-${t.slug}`} data-idx={i}>
        <button
          type="button"
          onMouseEnter={() => setActive(i)}
          onClick={() => go(t)}
          className={`w-full grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-3 text-left min-h-12 ${isActive ? "bg-primary-soft" : "hover:bg-primary-soft/60"}`}
        >
          <span aria-hidden className="grid place-items-center size-10 rounded-xl bg-primary-soft text-primary">
            <Icon className="size-5" />
          </span>
          <span className="min-w-0">
            <span className="block font-display text-base text-foreground truncate">
              {opts?.highlight ? <Highlight text={t.name} q={q} /> : t.name}
            </span>
            <span className="block text-xs text-muted-foreground truncate">
              {t.category} · {t.desc}
            </span>
          </span>
          <ArrowRight aria-hidden className={`size-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
        </button>
      </li>
    );
  };

  const isHero = size === "hero";
  const haloClass = isHero
    ? "rounded-[1.4rem] bg-[linear-gradient(135deg,color-mix(in_oklab,var(--color-primary)_55%,transparent),color-mix(in_oklab,var(--color-accent)_70%,transparent))] p-[1.5px] shadow-lift"
    : "";
  const fieldClass = isHero
    ? "flex items-center gap-3 rounded-[1.25rem] border border-border/60 bg-card pl-5 pr-3 transition-colors focus-within:border-primary"
    : "flex items-center gap-2 rounded-2xl border border-border bg-card shadow-soft px-4 transition-shadow focus-within:ring-2 focus-within:ring-ring focus-within:border-primary";
  const inputClass = isHero
    ? "flex-1 min-w-0 h-14 sm:h-16 bg-transparent border-0 outline-none text-base sm:text-lg placeholder:text-muted-foreground/80"
    : "flex-1 min-w-0 min-h-12 bg-transparent border-0 outline-none text-base placeholder:text-muted-foreground";

  return (
    <div ref={wrapRef} className={`relative w-full ${isHero ? "max-w-3xl" : "max-w-2xl"}`}>
      <label htmlFor="tool-search" className="sr-only">Search tools</label>
      <div className={haloClass}>
        <div className={fieldClass}>
          <Search aria-hidden className={`${isHero ? "size-6" : "size-5"} text-primary shrink-0`} />
          <input
            ref={inputRef}
            id="tool-search"
            type="search"
            role="combobox"
            aria-expanded={showPanel}
            aria-controls="tool-search-listbox"
            aria-autocomplete="list"
            aria-activedescendant={activeId}
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="go"
            value={q}
            onChange={(e) => { setQ(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder={isHero ? "Search 25+ tools — compress, qr, pdf, json…" : "Search tools — try “compress”, “qr”, “pdf”…"}
            className={inputClass}
          />
          {q && (
            <button
              type="button"
              onClick={() => { setQ(""); inputRef.current?.focus(); }}
              aria-label="Clear search"
              className="grid place-items-center size-9 rounded-lg text-muted-foreground hover:bg-primary-soft hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-4" />
            </button>
          )}
          <kbd
            aria-hidden
            className={`hidden sm:inline-flex items-center gap-1 rounded-md border border-border bg-muted ${isHero ? "px-2 py-1 text-xs" : "px-1.5 py-0.5 text-[11px]"} font-medium text-muted-foreground`}
          >
            {isHero ? <><span>⌘</span><span>K</span></> : "/"}
          </kbd>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {showingResults
          ? `${results.length} ${results.length === 1 ? "tool" : "tools"} found for ${q}`
          : ""}
      </p>

      {showPanel && (
        <div
          id="tool-search-listbox"
          role="listbox"
          aria-label="Tool suggestions"
          className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-card shadow-lift"
        >
          {showingResults ? (
            hasResults ? (
              <ul ref={listRef} className="max-h-[60vh] overflow-y-auto py-1">
                {results.map((t, i) => renderRow(t, i, { highlight: true }))}
              </ul>
            ) : (
              <div className="px-4 py-5">
                <p className="text-sm text-muted-foreground">
                  No tool matches “<span className="text-foreground">{q}</span>”. Try one of these instead.
                </p>
                <ul ref={listRef} className="mt-3">
                  {suggestions.popularTools.slice(0, 4).map((t, i) => renderRow(t, i))}
                </ul>
              </div>
            )
          ) : (
            <div className="py-1">
              {suggestions.recentTools.length > 0 && (
                <>
                  <div className="flex items-center gap-2 px-4 pt-3 pb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                    <Clock className="size-3" /> Recently used
                  </div>
                  <ul ref={listRef}>
                    {suggestions.recentTools.map((t, i) => renderRow(t, i))}
                  </ul>
                </>
              )}
              <div className="flex items-center gap-2 px-4 pt-3 pb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                <Sparkles className="size-3" /> Popular tools
              </div>
              <ul>
                {suggestions.popularTools.map((t, i) =>
                  renderRow(t, suggestions.recentTools.length + i),
                )}
              </ul>
            </div>
          )}
          <div className="flex items-center justify-between gap-3 border-t border-border px-3 py-2 text-[11px] text-muted-foreground bg-muted/40">
            <span className="inline-flex items-center gap-1.5">
              <CornerDownLeft className="size-3" /> Enter to open
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5">
              ↑ ↓ to navigate · Esc to close
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
