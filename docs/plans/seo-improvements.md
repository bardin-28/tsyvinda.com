# Plan: SEO improvement pass (2026-09)

## Goal

Close the SEO gaps that remain after the June 2026 audit (`seo-audit-output/`),
and add the discovery surfaces the site still lacks — icons, feed, AI-crawler
posture, article-level signals — without changing the site's visual design.

Baseline health from the last audit: **82/100**. The metadata / canonical /
JSON-LD foundation is strong; what is left is a mix of one real correctness bug
(OG image for image-less posts), several missing assets, and measurement.

---

## Current state (verified in code, 2026-09-15)

Already in place and correct — do **not** redo:

| Area | State |
|------|-------|
| Metadata API | `src/app/layout.tsx` — `metadataBase`, title template, robots/googleBot directives, OG + Twitter, `keywords`, `authors`/`creator`/`publisher` |
| Per-route metadata | `about`, `contacts`, `blog`, `blog/[slug]`, `privacy-policy` each own a `const/seo.ts` with canonical + OG + Twitter |
| Gated routes | `login`, `registration`, `profile`, `reset-password`, `blog/cover` all `robots: { index: false, follow: false }` |
| JSON-LD | `Person`, `WebSite`, `SiteNavigationElement` (root); `WebPage` + `BreadcrumbList` per route; `ProfilePage`, `ContactPage`, `Blog`, `ItemList`, `BlogPosting`; `@id` entity graph wired correctly |
| Sitemap | `src/app/sitemap.ts` — static routes + up to 50 posts, `revalidate = 3600`, backend failure degrades to static list |
| robots.ts | Allows `/`, disallows `/api/`, declares host + sitemap |
| Rendering | Blog index and articles are ISR-prerendered; crawlers get real HTML and links |
| Duplicate H1 on posts | **Fixed** — `demoteHeadings()` in `src/app/blog/[slug]/page.tsx` shifts body `h1…h5` down one level |
| Images | All `<img>` go through `next/image` with real `alt` |
| OG card | `src/app/opengraph-image.tsx` — branded 1200×630 `ImageResponse`, inherited site-wide |

---

## Findings → actions

### 🔴 P0 — correctness

#### P0-1. Article OG image falls back to a 260×260 avatar

`src/app/blog/[slug]/const/seo.ts`:

```ts
const image = post.imageUrl || `${SITE_URL}${AVATAR.url}`; // avatar.jpg is 260×260
```

Any post without `imageUrl` ships `summary_large_image` pointing at a 260×260
square. X/LinkedIn/Slack require ≥ 1200×630 for the large card — the card
silently degrades or drops. The root `opengraph-image.tsx` is *not* used,
because the explicit `openGraph.images` on the article overrides it.

**Fix:** add `src/app/blog/[slug]/opengraph-image.tsx` — a per-post
`ImageResponse` (post title + date + branded frame, reusing the mark/palette
from the root card), and change the fallback to omit `openGraph.images`
entirely when `post.imageUrl` is absent so the route-level image route wins.
Also declare `width`/`height`/`type` on the explicit image when `imageUrl`
exists.

**Effort:** M. **Files:** `blog/[slug]/const/seo.ts`, new `blog/[slug]/opengraph-image.tsx`.

#### P0-2. `GA_ID=GA_ID` in `.env.production`

The literal placeholder string is truthy, so `layout.tsx` loads
`googletagmanager.com/gtag/js?id=GA_ID` — a broken tag: no analytics, plus a
wasted third-party request on every page. This is also why the audit could not
get field CWV data.

**Fix:** set the real measurement ID (or blank it out), and harden the gate to
ignore obvious placeholders:

```ts
const GA_ID = /^G-[A-Z0-9]+$/.test(process.env.GA_ID ?? "") ? process.env.GA_ID! : "";
```

**Effort:** XS. **Files:** `.env.production`, `src/app/layout.tsx`.

---

### 🟠 P1 — missing discovery surfaces

#### P1-1. Favicon sizes fail Google's requirements; no `favicon.ico`; no PWA icons

`public/favicon/` holds `favicon.svg` (180×180 viewBox), `favicon_32.png`,
`favicon_64.png`, `favicon.png` (180×180). Measured with `file` — all square,
all valid PNG.

Google's favicon requirements for Search are: **square, a multiple of 48×48 px**
(48, 96, 144, 192 …), a supported format (ICO, PNG, GIF, JPEG, SVG), declared
with a `rel="icon"` link tag in `<head>`, and reachable by Googlebot (not
blocked in robots.txt).

Checked against that list:

| Requirement | State |
|-------------|-------|
| Supported format | ✓ PNG + SVG |
| Square | ✓ 32×32, 64×64, 180×180 |
| **Multiple of 48×48** | ✗ **32, 64 and 180 are all non-multiples** (48·⅔, 48·1⅓, 48·3.75) |
| `rel="icon"` link tag in `<head>` | ✓ emitted by `metadata.icons` in `src/app/layout.tsx` |
| Not blocked in robots.txt | ✓ `robots.ts` only disallows `/api/`; the Cloudflare managed block is `Allow: /` for `*` and restricts AI bots only, not Googlebot |

So the one failing criterion is sizing — Google may downscale from a source it
doesn't consider a clean multiple, or skip the raster set and fall back to the
SVG. Two further gaps:

- No `/favicon.ico` at the site root. Legacy crawlers, feed readers, and some
  social scrapers request it unconditionally and get a 404.
- `src/app/manifest.ts` lists only 32/64/180. A PWA manifest needs **192×192**
  and **512×512**, plus at least one `purpose: "maskable"` icon, or the install
  prompt and Android home-screen icon are rejected.

**Fix:**

1. Re-export the raster set at multiples of 48 from `favicon.svg`:
   `favicon_48.png`, `favicon_96.png`, `favicon_144.png`, `favicon_192.png`.
   Keep `favicon.png` (180) only as the `apple-touch-icon` — Apple's spec wants
   180, and it is not what Google reads.
2. Add `favicon_512.png` + `favicon_512_maskable.png` for the manifest (512 is
   for PWA install, not the Search favicon, so the ×48 rule doesn't apply).
3. Add `app/icon.ico` (or `public/favicon.ico`) — bundle 48×48 and 96×96.
4. Update `metadata.icons` in `layout.tsx` to list the 48/96/144/192 PNGs with
   explicit `sizes`, keeping the SVG first (`rel="icon" type="image/svg+xml"`).
5. Extend `manifest.ts` icons to 192 + 512 + maskable; add `id: "/"`,
   `scope: "/"`, `lang: "en"`, `categories`.
6. Keep every icon path outside `/api/` so the robots rule never touches it.

Verify after deploy with Search Console's URL Inspection (rendered HTML shows
the resolved icon link) — Google re-crawls favicons on its own cadence, so the
change is not instant in the SERP.

**Effort:** S.

#### P1-2. No RSS/Atom feed

The blog has no feed and no `<link rel="alternate" type="application/rss+xml">`.
Feeds are still a live discovery channel for a technical blog (readers,
aggregators, newsletter tooling) and give crawlers a second freshness signal.

**Fix:** add `src/app/feed.xml/route.ts` — a `Route Handler` returning RSS 2.0
built from `getPosts()` (same source as the sitemap, same `revalidate = 3600`,
same try/catch degradation). Reference it from root metadata:

```ts
alternates: { canonical: "/", types: { "application/rss+xml": "/feed.xml" } }
```

**Effort:** S. **Files:** new `app/feed.xml/route.ts`, `app/layout.tsx`.

#### P1-3. AI-crawler posture is Cloudflare-managed and closed — decide it

Live `robots.txt` (captured in `seo-audit-output/robots.txt`) shows Cloudflare
prepending a managed block that `Disallow: /` for `GPTBot`, `ClaudeBot`,
`CCBot`, `Google-Extended`, `Applebot-Extended`, `Amazonbot`, `Bytespider`,
`meta-externalagent`, plus `Content-Signal: search=yes, ai-train=no`. The app's
own `robots.ts` rules are appended *after* it.

Effect: the site is effectively uncitable in ChatGPT / Claude / Perplexity /
Meta AI. Google AI Overviews still works (it uses plain Googlebot, unblocked).

This is a **decision, not a bug**. Two coherent positions:

- **Open for citation** — in the Cloudflare dashboard allow `GPTBot`,
  `ClaudeBot`, `CCBot`; set `Content-Signal: search=yes, ai-input=yes, ai-train=no`
  (allow grounding, still refuse training). Then add `public/llms.txt`
  summarising the site and linking the canonical URLs.
- **Stay closed** — leave as-is, and note the intent in `CLAUDE.md` so future
  audits stop flagging it.

For a personal brand site whose whole purpose is being found by recruiters and
clients, the first option is the stronger default.

**Effort:** S (config) + S (`llms.txt`) after the decision.

#### P1-4. Home and About `<h1>` render as one word

`NAME_WORDS = ["Vladyslav", "Tsyvinda"]` and `HEADLINE_WORDS = ["Software",
"Engineer"]` are mapped to adjacent `<span>`s with no whitespace between text
nodes. The visual gap comes from CSS, so the accessible name and the crawler's
text extraction read `VladyslavTsyvinda` / `SoftwareEngineer`.

**Fix:** join with a real space — `{" "}` between spans, or put the full string
in the `h1` and split for animation with `aria-hidden` wrappers plus an
`sr-only` full-text node.

**Effort:** XS. **Files:** `app/(home)/page.tsx`, `app/about/page.tsx`.

---

### 🟡 P2 — signal quality

#### P2-1. Two `BreadcrumbList` blocks on every article

`blog/layout.tsx` emits `blogBreadcrumbSchema` (Home → Blog) and the article
page emits `buildArticleBreadcrumb()` (Home → Blog → Post). Both land in the
same document. Down from three at audit time, but still ambiguous.

**Fix:** move `blogBreadcrumbSchema` out of the shared blog layout into
`blog/page.tsx`, so the index emits its breadcrumb and articles emit only their
own.

**Effort:** S.

#### P2-2. Sitemap `lastModified` is "now" for every static route

`const lastModified = new Date()` is evaluated per render (hourly revalidate),
so `/`, `/about`, `/contacts`, `/privacy-policy` all claim to have changed in
the last hour, forever. Dishonest freshness signals get discounted.

**Fix:** hardcode a per-route `lastModified` constant updated when the page
content actually changes (privacy policy already has
`PRIVACY_POLICY_UPDATED_AT_ISO` — use it), or derive from git/build metadata.
Keep the live `post.updatedAt` for articles, which is correct today.

**Effort:** S.

#### P2-3. Sitemap caps at 50 posts and has no pagination awareness

`getPosts({ limit: 50 })`. Past 50 articles, new posts silently stop appearing.

**Fix:** loop with the cursor until exhausted (the API already returns
`nextCursor`), with a hard safety ceiling.

**Effort:** S.

#### P2-4. Article schema is thin

`buildArticleSchema` omits `articleSection`, `keywords`, `wordCount`,
`timeRequired`, and `articleBody`/`speakable`. These are cheap to derive from
the post payload and improve article-rich-result eligibility and topical
classification.

**Fix:** extend the builder; derive `wordCount` from the sanitised HTML,
`keywords` from post topics/tags if the API exposes them.

**Effort:** S–M (depends on backend fields; may need a `Post` type extension).

#### P2-5. `Person` schema has no GitHub

`sameAs` lists LinkedIn and Telegram only. For a developer entity, GitHub is
the single strongest corroborating profile for Google's Knowledge Graph.
`email` is also absent from the schema while being public on `/contacts`.

**Fix:** add the GitHub URL to `SOCIAL_LINKS` and `personSchema.sameAs`;
optionally add `email` and `url` to the `Person`. Consider also surfacing
GitHub in `SOCIAL_NAV` so it appears in the footer and on `/contacts`.

**Effort:** XS (schema) / S (if adding to nav + tests).

#### P2-6. No blog taxonomy

`BlogTopics` renders topic copy as static `<h3>` text, not links. There are no
`/blog/topic/<slug>` (or tag) routes, so the site has no topical hub pages —
the main structural lever for a technical blog's long-tail rankings.

**Fix (larger, separate phase):** add tag support to the post model, a
`/blog/tags/[tag]` route with `CollectionPage` + `ItemList` schema, tag links on
post pages, and tag pages in the sitemap.

**Effort:** L — plan separately once post volume justifies it.

#### P2-7. No Search Console verification in metadata

Nothing in `layout.tsx` `verification`. Verification is presumably done by DNS,
but adding the meta tag makes the property survive DNS changes.

**Fix:** `verification: { google: process.env.GSC_VERIFICATION }` gated on the
env var.

**Effort:** XS.

---

### 🔵 P3 — measurement and hygiene

- **P3-1. Core Web Vitals are still unmeasured.** Once P0-2 lands, watch mobile
  **INP** on `/` — `ScrollOloidScene` (three.js, `ssr: false`) plus Lenis smooth
  scroll and framer-motion is the main-thread risk. Add `useReportWebVitals`
  to send real CWV to GA, and re-run PSI with an API key.
- **P3-2. Consider dropping `<meta name="keywords">`.** Ignored by Google;
  currently maintained in five places (`site.ts` + four `const/seo.ts`). Zero
  upside, non-zero maintenance.
- **P3-3. `CLAUDE.md` line 45 is stale** — says the sitemap lists "`/` and
  `/about` only"; it lists 13+ URLs. Sync it, and document the AI-crawler
  decision from P1-3 there.
- **P3-4. Move `seo-audit-output/` out of the repo root** or add it to
  `.gitignore` — it is generated audit scratch (HTML dumps, Python probes), not
  source.

---

## Suggested execution order

| # | Item | Priority | Effort |
|---|------|----------|--------|
| 1 | P0-2 Fix `GA_ID` + harden gate | 🔴 | XS |
| 2 | P1-4 H1 word spacing | 🟠 | XS |
| 3 | P2-1 One breadcrumb per page | 🟡 | S |
| 4 | P0-1 Per-post OG image route | 🔴 | M |
| 5 | P1-1 Favicon ×48 sizes + favicon.ico + 192/512/maskable + manifest | 🟠 | S |
| 6 | P1-2 RSS feed + `alternates.types` | 🟠 | S |
| 7 | P1-3 AI-crawler decision (+ `llms.txt` if opening) | 🟠 | S + decision |
| 8 | P2-2 Honest sitemap `lastModified` | 🟡 | S |
| 9 | P2-3 Paginate sitemap posts | 🟡 | S |
| 10 | P2-5 GitHub in `sameAs` / socials | 🟡 | XS–S |
| 11 | P2-4 Richer `BlogPosting` fields | 🟡 | S–M |
| 12 | P2-7 GSC verification meta | 🟡 | XS |
| 13 | P3-1 Web Vitals reporting + INP check on `/` | 🔵 | S–M |
| 14 | P3-2/3/4 Hygiene | 🔵 | XS |
| 15 | P2-6 Blog taxonomy | 🟡 | L — separate plan |

Items 1–3 are a single small commit's worth of work and remove two of the three
findings the last audit left open.

---

## Testing

Per project convention (Jest + RTL for units, Playwright for e2e):

- **Unit** — `feed.xml` route handler (valid XML, escapes titles, degrades to an
  empty channel when the API throws); `buildArticleMetadata` (no `openGraph.images`
  when `post.imageUrl` is absent); `sitemap()` (pagination loop, stable
  `lastModified`); `buildArticleSchema` (new fields).
- **Component** — home/about hero renders an accessible name containing a space
  (`getByRole("heading", { name: "Vladyslav Tsyvinda" })` must pass — this is
  the regression guard for P1-4).
- **E2E** — `/feed.xml` returns 200 + `application/rss+xml`; `/favicon.ico`
  and each `/favicon/favicon_{48,96,144,192}.png` return 200; an article page contains exactly one `BreadcrumbList` JSON-LD
  block; `/blog/cover`, `/login`, `/profile` keep `noindex`.

## Out of scope

- Visual/design changes.
- Backend changes beyond whatever P2-4/P2-6 need from the posts API.
- Content strategy (post cadence, keyword targeting) — separate exercise.
