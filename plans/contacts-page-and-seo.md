# Plan: Contacts page + site-wide SEO pass

## Goal

Add a dedicated `/contacts` page holding the contact channels (currently on the
home hero), simplify the home hero to a single "Get in touch" CTA, repoint the
about-page contact CTA, and close the remaining SEO gaps across the site —
most notably the missing OpenGraph/Twitter card image.

---

## Requirements

- New `/contacts` route: hero + contact channels (LinkedIn, Telegram, Instagram, Email). Channels only — no form.
- Home: move the 4 social links to `/contacts`; replace them with one "Get in touch" button → `/contacts`; remove the "More about me" and "Read the blog" links.
- About: the "Let's build something" CTA must point users to `/contacts` (today it links to `/`).
- Generate a branded OpenGraph/Twitter card image used across pages.
- Full SEO review: nav, sitemap, JSON-LD, canonicals, robots, metadata — fix everything findable.
- Project conventions: CSS Modules, framer-motion, `ROUTES.*`, explicit types, no new packages, tests for new components.

---

## Architectural decisions

- **`/contacts` structure** — mirror the about/blog pattern: `contacts/page.tsx` (client, animated), `contacts/layout.tsx` (metadata + JSON-LD), `contacts/const/seo.ts`. Reuse the shared `SOCIAL_NAV` (`src/shared/const/social.tsx`) for the channel list — single source, already in use by the footer.
- **Home de-duplication** — home stops owning social links. Delete the home-local `LINKS`/`SocialLink` config and its CSS; the channels now live only in `SOCIAL_NAV` + `/contacts`. Home gets a single CTA button to `/contacts`.
- **Shared chrome already covers nav** — that's why the home "More about me / Read the blog" links are dropped; header menu (Home/About/Blog/Contacts) is the canonical nav.
- **OG image via `next/og`** — `src/app/opengraph-image.tsx` (`ImageResponse`, edge runtime) renders a branded card (name, role, VT mark, dark/orange theme). A root-level image route auto-populates `og:image` + `twitter:image` for every page; Twitter cards upgraded to `summary_large_image`.
- **Contacts JSON-LD** — `ContactPage` + `BreadcrumbList`, consistent with the existing per-route schema approach.
- **No new packages** — `next/og` ships with Next; framer-motion/next already present.

---

## SEO audit (findings → action)

Already solid: `metadataBase`, per-route canonicals, `robots` index/follow + googleBot directives, JSON-LD (Person/WebSite/WebPage/Breadcrumb/SiteNavigation), sitemap incl. posts, manifest, `noindex` on `/login` and `/blog/cover`, article `BlogPosting` + breadcrumb.

To fix:
- **No OG/Twitter image** (text-only) → add `opengraph-image.tsx`; set `twitter.card: summary_large_image` on root/about/blog/contacts.
- **`/contacts` missing** from `NAV_LINKS`, sitemap, and `siteNavigationSchema` → add.
- **About CTA dead-ends** to `/` for "contact channels" → repoint to `/contacts`.
- **No `ContactPage` schema** for the new route → add it + breadcrumb.
- **Footer/header nav** auto-pick up Contacts via `NAV_LINKS` (no extra work).

---

## Implementation Checklist

### ☑ Phase 1 — Routing, nav, sitemap, navigation schema (done)

- **Step 1** — `routes.ts`: add `CONTACTS: "/contacts"` + `"/contacts"` to the `Route` union.
- **Step 2** — `navigation.ts`: add `{ label: "Contacts", href: ROUTES.CONTACTS }` to `NAV_LINKS` (header + footer inherit).
- **Step 3** — `sitemap.ts`: add `/contacts` static entry (priority ~0.8).
- **Step 4** — `schemas.ts`: add a Contacts `SiteNavigationElement` entry.

### ☑ Phase 2 — Contacts page (done)

- **Step 1** — `contacts/const/seo.ts`: title/description/keywords, `contactsMetadata` (canonical `/contacts`, OG, twitter), `contactsPageSchema` (`ContactPage`), `contactsBreadcrumbSchema`.
- **Step 2** — `contacts/layout.tsx`: export metadata, inject JSON-LD scripts.
- **Step 3** — `contacts/page.tsx` (client) + `contacts/page.module.css`: hero (eyebrow, title, lead) + animated channel cards from `SOCIAL_NAV`; reuse blobs/noise background style.

### ☑ Phase 3 — Home cleanup (done)

- **Step 1** — `(home)/page.tsx`: remove the social `LINKS` block and the secondary links; add a single "Get in touch" CTA → `ROUTES.CONTACTS`.
- **Step 2** — `(home)/const/index.tsx`: remove `LINKS` + `SocialLink` (now unused).
- **Step 3** — `(home)/page.module.css`: remove `.links/.link/.link*`, `.secondaryLinks/.aboutLink/.blogLink`; add `.cta*` button style.

### ☑ Phase 4 — About CTA + OG image (done)

- **Step 1** — `about/page.tsx`: repoint the CTA `Link` from `ROUTES.HOME` to `ROUTES.CONTACTS` (label "Get in touch").
- **Step 2** — `src/app/opengraph-image.tsx`: `next/og` branded card; `alt`, size 1200×630.
- **Step 3** — upgrade `twitter.card` to `summary_large_image` in root layout + about/blog/contacts SEO.

### ☑ Phase 5 — Tests, docs, verification (done)

- **Step 1** — `contacts/page.test.tsx`: renders hero + all `SOCIAL_NAV` channels with correct hrefs.
- **Step 2** — update `CLAUDE.md` IA note (home is hero+CTA, `/contacts` holds channels).
- **Step 3** — `npm run lint`, `npm test -- --watchman=false`, `npm run build`.

---

## Important Notes

- **`next/og` runtime** — `opengraph-image.tsx` runs on the edge runtime; keep it dependency-free (inline styles, no external fetch unless cached).
- **`npm test` requires `--watchman=false`** in this sandbox.
- **CLAUDE.md** currently says home is the "contacts hero" — that changes; update it.
