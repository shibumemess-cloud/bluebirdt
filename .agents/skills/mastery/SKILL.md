---
name: mastery
description: Upgrade a newly added Bluebird image tool to production-grade mastery — improve UX, performance, accessibility, ease of use, feature completeness, and add input validation so the tool ships bug-free. Trigger whenever a new tool is added to the website or the user asks to "master", "polish", "harden", or "level up" an existing tool.
---

# Mastery — new-tool upgrade playbook

Run this every time a new tool lands in `src/routes/<slug>.tsx`. The goal: take a working v1 and ship a tool that feels like the best in its category.

Bluebird non-negotiables (apply to every pass):
- 100% client-side. No uploads, no server processing, no paid APIs, no AI models.
- Theme: Bluebird sky-blue, Outfit + Plus Jakarta Sans, soft-card surfaces, rounded-xl/2xl, min-h-12 tap targets.
- Reuse shared primitives: `FileDrop`, `ResultPanel`, `BeforeAfter`, `ProgressBar`, `HowItWorks`, `WarnBox`, `Field`, `ToolLayout`.
- Plain language for kids → seniors. No developer jargon, no library names in UI copy.

## Checklist — run top to bottom

### 1. UX & ease of use
- 2-pane layout: controls left, live preview/result right (stacks on mobile, preview first).
- Show the uploaded image preview immediately via `FileDrop` and the result via `ResultPanel previewUrl`.
- Sensible defaults so the tool produces a usable result with zero config.
- One primary CTA per screen; secondary actions de-emphasised.
- Format/preset chips (Email, Web, Social, Print …) where they save clicks.
- Empty, loading, success, and error states all designed — no blank panels.
- Sticky bottom action bar on mobile for the primary export.

### 2. Feature completeness ("master at its task")
- Read `bluebird-image-tools-research.docx`, `bluebird-tools-mastery-ui-research.docx`, and `bluebird-new-tools-roadmap.docx` if they exist for the tool's mastery spec.
- Add the category-defining feature competitors charge for (e.g. target-KB for compressor, social presets for resizer, payload types for QR, page-range for PDF→images).
- Batch mode + ZIP download (`jszip`) whenever the tool processes a single file usefully.
- Multiple export formats (PNG / JPG / WebP / SVG where applicable) + copy-to-clipboard + Web Share API on mobile.
- Presets saved to `localStorage` for power users; never store user files.

### 3. Performance
- Heavy loops (batch resize/compress/watermark, PDF render) run in a Web Worker via Vite's `?worker` import.
- Use `createImageBitmap` and `OffscreenCanvas` when available; fall back to `<canvas>` + `drawImage`.
- Revoke every `URL.createObjectURL` in a cleanup effect — no blob leaks.
- Lazy-load big libs (`pdfjs-dist`, `pdf-lib`, `qrcode`) with dynamic `import()` inside the handler, not at module top.
- Debounce live-preview re-renders (≥120ms) on slider input.

### 4. Accessibility (WCAG AA)
- Semantic landmarks; one `<h1>` per route.
- Every input has a visible `<label>` or `aria-label`; icon-only buttons get `aria-label`.
- Toggle groups use `role="radiogroup"` + `aria-pressed`/`aria-checked`.
- Live status announced via `aria-live="polite"` (progress, "image ready", errors).
- Focus-visible ring on every interactive element; tab order matches reading order.
- Tap targets ≥44×44px (min-h-11/12). No color-only state.
- `prefers-reduced-motion` respected — disable framer-motion transforms when set.

### 5. Validation — ship bug-free
Validate before any processing. Use the existing `validateImageFile` helper and extend per tool.
- File: correct MIME, non-empty, ≤20 MB (or tool-specific cap), readable as `Image`/`ArrayBuffer`.
- Numbers: clamp to min/max with `Math.max(min, Math.min(max, n))`; reject `NaN`.
- Strings (URLs, SSIDs, file names, page ranges): trim, length-limit, regex-check; use `zod` for structured inputs.
- Color hex: enforce `/^#([0-9a-f]{3}|[0-9a-f]{6})$/i`.
- Show inline errors with `WarnBox`; never `alert()`, never silent failures.
- Wrap every async handler in `try/catch` → user-facing toast/WarnBox + `console.error` for debugging.
- Pure helpers go in `src/lib/image-tool-helpers.ts` with Vitest coverage (target ≥3 cases: happy, edge, garbage).

### 6. SEO & metadata
- Route `head()` with unique `<title>` (<60 chars, keyword first), meta description (<160 chars), canonical, `og:title`, `og:description`, `og:image`, `twitter:image`.
- Generate a 1200×630 OG image under `src/assets/og/og-<slug>.jpg`.
- Add `WebApplication` JSON-LD with `"price": "0"` and a short `FAQPage` block.
- Append the new URL to `src/routes/sitemap[.]xml.ts`.
- Add the tool card to `TOOLS` in `src/components/ToolLayout.tsx` and to the home grid in `src/routes/index.tsx` (update the tool count copy).

### 7. Verify before claiming done
- `tsgo --noEmit` clean.
- `bunx vitest run` green (new helpers covered).
- Playwright smoke: upload → process → download works on a 1280×1800 viewport AND a mobile (390×844) viewport. Screenshot both.
- Read browser console: zero errors, zero React warnings.
- Run the `accessibility` skill audit on the new route.

## Output

End the pass with a short report: what features were added, what was validated, links to the screenshots, test results. Do not mark the tool "mastered" until every section above is satisfied or explicitly waived with a reason.
