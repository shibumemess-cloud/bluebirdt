---
name: site-copy-qa
description: Audit the Bluebird image-tools site for user-facing copy bugs — developer jargon, dev-only artifacts, step/order numbers leaking into UI, typos, inconsistent terminology, broken alignment, and emoji-as-icon usage. Trigger when the user reports "weird text", "looks unprofessional", "fix typos", "fix bugs across the site", "audit the UI", or names a specific phrase that should not be visible.
---

# Site Copy & UI QA

The user repeatedly catches small UI/copy regressions ("Setup time: None", "Step 1 / Step 2", library names like `jszip` leaking into UI, leftover dev panels, emoji icons). This skill makes a sweep cheap and exhaustive.

## How to run an audit

1. Run the **forbidden-strings scan** below against `src/`. Every hit is a bug unless the file is a test/helper.
2. Read every route under `src/routes/*.tsx` and `src/components/ToolLayout.tsx`, `src/components/ToolControls.tsx`, `src/components/SiteHeader.tsx`. Look at every visible string with the checklist.
3. Open the live preview at `localhost:8080` for `/`, `/image-compressor`, `/image-resizer`, `/image-format-converter`, `/exif-viewer`, `/favicon-generator` and screenshot with Playwright (viewport 1280×1800 AND 390×844). Compare against the checklist.
4. Fix in one batched parallel edit; never leave half-applied.

## Forbidden strings scan

```bash
rg -niP '\b(step\s*\d|setup time|zero setup|tsx?|npm|library|canvas api|exif-js|jszip|browser-image-compression|drawImage|toBlob|JSZip|console\.log|TODO|FIXME|lorem|placeholder)\b' src/routes src/components
rg -nP '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]' src/routes src/components   # emoji as icon
rg -n 'Diagnostics|debug|verification|dev mode' src/routes src/components -i
```

Any hit in JSX text, headings, alt text, aria-label, or toast/notice copy = fix it.

## Copy checklist (apply to every visible string)

- **No ordinals leaking from internal arrays.** `Step 01`, `Step 1`, `Tool #2`, `index: 3` must never render. If a tool list has a `step` field, use it for ordering only — never display it.
- **No library / API / file-format jargon.** Never show: jszip, exif-js, canvas, drawImage, toBlob, MIME, EXIF tag IDs, "Web Worker", "blob", "buffer", npm package names. Say *zip file*, *photo info*, *runs in your browser*, *image*, *file*.
- **No dev-status copy.** "Zero setup", "no setup time", "works offline-first", "production-ready", "v1.0", "beta" — strip.
- **No emoji as icon.** Use `lucide-react` SVG. Emoji is allowed only inside intentional editorial sentences, never as a UI affordance.
- **Plain language for ages 8–80.** Prefer *make smaller* over *compress*, *change format* over *convert*, *photo info* over *EXIF metadata* (use the technical term once in the page title, plain term in body).
- **Consistent verbs.** Tool cards always end with the same CTA ("Open tool"). Result panels always offer "Download" + "Start over". Don't mix "Reset", "Clear", "New".
- **Trust strip:** equal column count (3 or 4, not mixed). Each item: short label + short value, both ≤ 24 chars.
- **Breadcrumb:** `Home / <Tool Name>` — never include the step number, never include the tool category twice.
- **Buttons:** sentence case, verb-first, ≤ 3 words. "Get started — it's free" is fine; "Click here to begin now" is not.
- **Numbers:** use the `num` (tabular-nums) class for any number that updates live (file size, percent, dimensions).

## Layout / alignment checklist

- Tool cards use a `grid-cols-[auto_minmax(0,1fr)_auto]` row so the right-side chip never wraps under the icon.
- `SiteHeader` and `ToolLayout` use `truncate` + `min-w-0` on long text containers.
- 360 px width must show: hero CTA without horizontal scroll, tool cards stacked, breadcrumb single-line truncated.
- Touch targets ≥ 44 px (`min-h-12` on primary actions).
- Replace any decorative emoji with a framed lucide SVG inside `size-12 rounded-2xl bg-primary-soft text-primary`.

## After fixing

- Re-run the forbidden-strings scan — must return zero hits.
- Screenshot all 6 routes at 1280 and 390 viewports, view each one, confirm the chip on tool cards shows the category (e.g. "Compress", "Resize") not "Step 1".
- Run `bunx vitest run` if tests exist for changed files.
- Report to the user: list of strings changed (before → after), files touched, and the screenshot you verified.

## Known gotchas

- `src/components/ToolLayout.tsx` has a `TOOLS` array with a `step: "01"` field. That field controls **sort order only**. Never render it.
- `src/routes/index.tsx` `TrustStat` icons need a matching import in the top `lucide-react` line — remove unused imports when you remove a stat.
- The home page tool cards and the per-tool hero eyebrow both pull from the same `TOOLS` array — fix the source, not each call site.
