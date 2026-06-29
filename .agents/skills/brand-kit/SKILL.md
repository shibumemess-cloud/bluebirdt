---
name: brand-kit
description: Bluebird brand kit — invoke on ANY UI, UX, theme, layout, copy, logo, color, typography, spacing, animation, or new-page change to keep the website visually and verbally consistent. Run before shipping any visual change.
---

# Bluebird Brand Kit

Single source of truth for the Bluebird visual + verbal system. Read this every time a UI/UX change is requested and audit your diff against the checklist at the bottom before declaring done.

## 1. Brand essence

- **Name:** Bluebird
- **Tagline:** Browser Tools
- **Promise:** Friendly tools that run on your device. Nothing ever uploads.
- **Personality:** calm, trustworthy, generous, plain-spoken. Built for kids → grandparents.
- **No-go:** developer jargon, library names in UI, emojis as decoration, AI-generated cliché purple gradients, hype words ("revolutionary", "AI-powered", "blazing fast").

## 2. Logo

- **Component:** `src/components/BluebirdLogo.tsx` exports `BluebirdMark` (square mark) and `BluebirdLogo` (mark + wordmark).
- **File:** `public/bluebird-logo.svg` is the canonical SVG (favicon + Organization JSON-LD).
- **Construction:** geometric bird-in-flight built from two overlapping wing/body paths + a single beak triangle + eye dot. Custom-drawn for Bluebird — must not be replaced by any third-party icon (e.g. `lucide-react` `Bird`).
- **Colors:** body gradient `#1E66F5 → #0B3FB0`, wing gradient `#5BA8FF → #1E66F5`, beak `#FFC04D`, eye `#F8FAFF`. Never recolor outside these values.
- **Clearspace:** keep at least the height of the beak (≈ 1/6 of mark size) on every side.
- **Minimum size:** mark 20px square; lockup 24px tall.
- **Placement:** every page header (sticky top-left), every footer (bottom-left), favicon, apple-touch-icon, social card, and Organization JSON-LD `logo` field. Do not embed it inside other graphics, watermarks, or tool output.
- **Responsive:** the SVG is fluid — use Tailwind size utilities (`size-8`/`size-9`/`size-10`). Never set a fixed `width`/`height` attribute.
- **Motion:** subtle `group-hover:scale-105` only. Always pair with `motion-reduce:transform-none`.

## 3. Color tokens (do not hardcode)

All color comes from CSS variables in `src/styles.css`. Never write `text-white`, `bg-[#xxxxxx]`, or raw hex in components — use semantic tokens.

| Token | Role |
| --- | --- |
| `--background` / `--foreground` | page surface + body text |
| `--primary` / `--primary-foreground` | brand blue actions |
| `--primary-soft` | tinted hover/active backgrounds |
| `--card` / `--card-foreground` | elevated surfaces |
| `--muted` / `--muted-foreground` | secondary text, dividers |
| `--accent` | warm sunshine accent (used sparingly) |
| `--border` | hairlines |
| `--ring` | focus ring |

Brand blue anchor: `oklch(0.55 0.20 255)`. Sunshine accent (beak): `#FFC04D` only inside the logo.

## 4. Typography

- **Display:** Outfit (headings, brand wordmark, large numbers).
- **Body:** Plus Jakarta Sans (paragraphs, labels, buttons).
- **Base:** 17px / line-height 1.6 for accessibility.
- **Scale:** `text-3xl/4xl` heroes, `text-xl/2xl` section headers, `text-base` body, `text-sm` captions.
- **Never** introduce Inter, Poppins, Roboto, system-ui or serifs.

## 5. Layout & spacing

- Max content width: `max-w-6xl`, page padding `px-4 sm:px-6`.
- Tool pages: 2-pane grid (controls left / live preview right), stacks on mobile with preview first.
- Tap targets: `min-h-12` on primary actions, `min-h-11` on secondary.
- Radii: `rounded-xl` controls, `rounded-2xl` cards, `rounded-full` chips/pills.
- Surfaces: soft-card on light background, `shadow-soft` for elevation. No harsh `shadow-2xl`.
- Grid gaps: `gap-4` mobile, `gap-6` desktop. Section spacing `py-12 sm:py-16`.

## 6. Motion

- Library: `framer-motion`. Default transition `{ duration: 0.25, ease: "easeOut" }`.
- Use motion to confirm actions (upload accepted, file ready), not to decorate.
- Every transform/scale animation must respect `prefers-reduced-motion`.

## 7. Voice & copy

- Lead with the user benefit, never the mechanism.
- Sentence case for headings and buttons. No ALL CAPS except the `.eyebrow` utility.
- Verbs over nouns ("Compress photo" not "Compression").
- Banned in user-facing copy: API, server, endpoint, library names, "AI", "powered by", "zero-setup", "blazing", emojis as bullets.

## 8. Accessibility floor

- WCAG AA contrast on every text/background pair.
- One `<h1>` per route. Semantic landmarks (`header`, `main`, `footer`, `nav`).
- Every interactive element has visible focus ring (`focus-visible:ring-2 ring-ring`).
- Icon-only buttons require `aria-label`.
- Status updates use `aria-live="polite"`.

## 9. Responsive rules (mobile → ultrawide)

- Mobile-first Tailwind. Test at 360, 390, 768, 1024, 1280, 1536.
- Header collapses category nav under `md:`. Logo + wordmark always visible.
- Logo never crops or distorts — uses SVG, fluid sizing.
- No horizontal scroll at 320px width.

## 10. Where to apply

Touch all of these when a brand/visual change ships:
- `src/components/BluebirdLogo.tsx` (mark + lockup)
- `src/components/ToolLayout.tsx` (`SiteHeader`, `SiteFooter`)
- `src/routes/__root.tsx` (favicon, apple-touch-icon, Organization JSON-LD, theme-color)
- `src/styles.css` (tokens, fonts)
- `public/bluebird-logo.svg`, `public/site.webmanifest`
- Any new route's `head()` block (title, description, og:image)

## 11. Pre-ship checklist

Before claiming any visual change done, confirm every item:

- [ ] No hardcoded hex / `text-white` / `bg-black` introduced.
- [ ] Fonts still Outfit + Plus Jakarta Sans.
- [ ] `BluebirdMark` is the only bird/logo on screen (no `lucide` `Bird`, no emoji).
- [ ] Header + footer logo render at every breakpoint without overflow.
- [ ] Favicon + apple-touch-icon point at the canonical mark.
- [ ] All interactive elements ≥44×44px and have focus rings.
- [ ] Copy is plain language, no dev jargon, no emoji decorations.
- [ ] Motion respects `prefers-reduced-motion`.
- [ ] Build + typecheck green; Playwright screenshots at 390×844 and 1280×800 look right.
