# Bluebird SEO Plan

A practical, phased plan to make Bluebird discoverable on Google, Bing, and AI search (ChatGPT, Perplexity, Gemini). Everything below is implementable on the current TanStack Start setup — no new infra, no paid tools required.

## Goals

1. Rank for "free [tool] online" intent (e.g. "image compressor online", "json formatter", "password generator").
2. Win the "privacy / works in browser / no upload" angle — our true differentiator.
3. Get every tool page indexed with rich previews, FAQ rich results, and clean Core Web Vitals.

---

## Phase 1 — Foundations (technical SEO)

Already in place: per-route `head()` metadata, JSON-LD on each tool, dynamic `sitemap.xml`, `robots.txt`, custom favicon, category structure.

Gaps to close:

1. **Publish the site** so canonical/og:url resolve to a real host and Google can crawl it.
2. **Submit to Google Search Console + Bing Webmaster Tools** after publish. Add the verification meta tag, then submit `/sitemap.xml`.
3. **Canonical audit** — confirm every leaf route declares `<link rel="canonical">` to itself (relative paths are fine pre-domain).
4. **Open Graph image per tool** — generate one branded 1200×630 OG card per tool (same Bluebird mark + tool name) so social/AI link previews look intentional.
5. **Breadcrumbs** — add `BreadcrumbList` JSON-LD on each tool route (Home > Category > Tool).
6. **Performance budget** — keep LCP < 2.5s. Lazy-load heavy libs (`pdfjs-dist`, `pdf-lib`, `qrcode`) via dynamic `import()` inside handlers, not module-scope.

## Phase 2 — Content & on-page

Each tool page already has hero + tool. Add below the fold, in this order:

1. **"How to use"** — 3–5 numbered steps with the tool's real verbs.
2. **"Why Bluebird"** — privacy (no upload), speed (browser-native), free forever.
3. **FAQ block (4–6 Qs)** wired to `FAQPage` JSON-LD. Target real long-tail queries (e.g. "Is it safe to compress images online?", "Does this strip EXIF GPS data?").
4. **Internal links** — every tool links to 2–3 related tools ("Also useful: Resize, Convert format"). This spreads PageRank and lifts crawl depth.
5. **Unique H1 per page** — never reuse the homepage H1.

## Phase 3 — Keyword targeting

Primary keyword per page (one each, in title + H1 + first paragraph + URL):

```text
/image-compressor        → "compress images online free"
/image-resizer           → "resize image online"
/image-format-converter  → "convert png to webp / jpg to png"
/exif-viewer             → "remove exif data from photo"
/favicon-generator       → "favicon generator"
/image-cropper           → "crop image online"
/rotate-flip             → "rotate image online"
/watermark               → "add watermark to image"
/color-picker            → "extract colors from image"
/images-to-pdf           → "convert images to pdf"
/pdf-to-images           → "pdf to jpg converter"
/qr-generator            → "qr code generator"
/password-generator      → "strong password generator"
/json-formatter          → "json formatter / validator"
/base64                  → "base64 encoder decoder"
/text-case-converter     → "text case converter"
```

Title template: `{Primary keyword} — Bluebird` (≤60 chars). Description: one sentence with primary keyword + "free, in your browser, no upload" (≤155 chars).

## Phase 4 — AI search (GEO / LLMO)

ChatGPT, Perplexity, and Gemini cite pages with clear, factual, structured copy.

1. Plain-language H2s phrased as questions ("How does the compressor work?").
2. Short, declarative answer paragraphs (≤60 words) directly under each H2.
3. JSON-LD `SoftwareApplication` per tool (price 0, OS "Web", `applicationCategory`).
4. `llms.txt` at site root summarizing what each tool does in one line.

## Phase 5 — Off-page & distribution

1. List Bluebird on: AlternativeTo, Product Hunt, Hacker News Show HN, awesome-privacy / awesome-webapps GitHub lists, Reddit r/webdev, r/InternetIsBeautiful.
2. Write 3 cornerstone blog posts (new `/blog/$slug` route):
   - "How browser-side image compression actually works"
   - "What EXIF data your photos leak — and how to strip it"
   - "PNG vs WebP vs AVIF in 2026"
3. Each post links back to the relevant tool(s).

## Phase 6 — Measurement

1. Search Console: weekly check on impressions, CTR, average position per tool.
2. Add a lightweight, cookieless analytics script (Plausible-style) only after publish.
3. Track Core Web Vitals via `web-vitals` package, log to console in dev.

---

## What I'll implement now (one shot)

Concrete code changes when you say go:

1. Add **FAQ JSON-LD + visible FAQ section** to every tool route (4–5 Qs each).
2. Add **BreadcrumbList JSON-LD** to every tool route.
3. Add **SoftwareApplication JSON-LD** to every tool route.
4. Add **"How to use" + "Why Bluebird" + related-tools** blocks via a shared `ToolSEOBlock` component.
5. Tighten every route's `title` / `description` against the keyword table above.
6. Create `public/llms.txt`.
7. Generate 16 branded 1200×630 OG images and wire `og:image` / `twitter:image` per route.

## Technical notes

- Pre-domain, keep canonical/og:url **relative**. After publish, switch `BASE_URL` in `sitemap[.]xml.ts` and in OG absolute URLs via a `getRequestOrigin` server fn.
- `FAQPage` JSON-LD must mirror the visible FAQ text verbatim or Google ignores it.
- Lazy-load `pdfjs-dist` and `pdf-lib` to keep tool-page JS under 200KB for LCP.

Say **"go"** and I'll ship steps 1–7 in the next turn.
