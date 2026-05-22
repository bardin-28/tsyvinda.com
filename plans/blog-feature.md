# Plan: Blog feature — posts list & article page

## Goal

Add `/blog` (list with cursor-based infinite scroll) and `/blog/[id]` (article detail) routes powered by the backend `/posts` API. Introduce a new 3D background scene with a distinct figure for the blog area, surface a link to the blog from the home page, and update SEO assets (sitemap, JSON-LD, navigation schema, metadata) to cover the new routes.

---

## Requirements

- New route `/blog` — paginated post list, infinite scroll, cursor pagination (`nextCursor`).
- New route `/blog/[id]` — single article view rendering `htmlContent`, hero image, author, dates.
- New 3D background scene with a new figure (different from cylinder + icosahedron). Used on both blog routes. Same fixed-overlay pattern as `CylinderScene` / `AboutScene`, with full disposal of geometries/materials/listeners on unmount.
- Home page (`/`) gets a link to `/blog` styled to match the existing `aboutLink` pill.
- SEO:
  - `sitemap.ts` includes `/blog`.
  - `siteNavigationSchema` in `src/shared/lib/schemas.ts` gets a Blog entry.
  - Blog list and article have their own `metadata` + JSON-LD (`Blog` / `BlogPosting` / `BreadcrumbList`).
- Cursor pagination via `IntersectionObserver` sentinel — no `react-query` (not in deps), no new packages.
- Real swagger contract for `GET /posts`: `{ items: Post[]; nextCursor: string | null }` with optional `cursor`/`limit` query params, plus `GET /posts/:id` for the detail view.
- Loading + empty + error states for list and detail.
- Per CLAUDE.md: brand orange `#fd7e14`, CSS Modules colocated, `ROUTES.*` for route constants, dynamic-import 3D scene with `ssr: false`.

---

## Architectural decisions

- **Posts API module** — `src/api/posts.ts` with `Post`, `PostAuthor`, `PostsPage` types and `getPosts({ cursor, limit })`, `getPostById(id)` thin wrappers over the shared `API` client (matches the existing `auth.ts` pattern, no new abstraction).
- **Routes registry** — extend `ROUTES` with `BLOG: '/blog'` and a `blogPost(id)` builder. Keeps URL strings out of components per the CLAUDE.md rule.
- **Route group** — `/blog` and `/blog/[id]` live directly under `src/app/blog/` (no group); `layout.tsx` injects shared SEO JSON-LD and the `BlogScene` background so the scene survives navigation between list and article (avoids GPU thrash from re-mounting per route).
- **3D scene — Knot figure** — `BlogScene` renders a `TorusKnotGeometry` with a wireframe outer shell and a brand-orange glass core, plus a particle field. New figure, not a reused icosahedron or cylinder. Disposal arrays cover every geometry/material per the CLAUDE.md leak rule.
- **Infinite scroll** — custom `useInfinitePosts` hook (`src/app/blog/hooks/useInfinitePosts.ts`) holding `items`, `cursor`, `isLoading`, `hasMore`, `error`. List component uses an `IntersectionObserver` sentinel at the end of the grid to trigger `fetchMore`. No external pagination libs.
- **Article HTML** — render `htmlContent` via `dangerouslySetInnerHTML` inside a scoped `.article` wrapper. Backend is trusted (own API); no client-side sanitization added (keep scope minimal — call out in Important Notes so we can revisit when posts open to untrusted authors).
- **Date formatting** — `Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })` inline. No `date-fns` package.
- **SEO** — colocate `blog/const/seo.ts` (list metadata + `Blog` JSON-LD + breadcrumb) and `blog/[id]/const/seo.ts` builders. Article page is a server component so it can call `getPostById` for `generateMetadata` and emit `BlogPosting` JSON-LD; the interactive bits (back link, share, etc.) stay client-side if needed.
- **Server vs client split** — list page is a client component (uses hooks, `IntersectionObserver`, `framer-motion`); article page is a server component to enable `generateMetadata` with real post data + better SEO. `BlogScene` is dynamic-imported with `ssr: false` from a small `BlogBackground` client wrapper used by the layout.

---

## Implementation Checklist

### [x] Phase 1 — Foundations: routes, API, types

- **Step 1** — Extend `src/shared/const/routes.ts`: add `BLOG: '/blog'` and `blogPost(id: string)` helper. Update `Route` type as needed.
- **Step 2** — Create `src/api/posts.ts`: export `PostAuthor`, `Post`, `PostsPage` types and `getPosts({ cursor, limit })` (cursor optional, defaults to undefined → first page), `getPostById(id)`.
- **Step 3** — Update `siteNavigationSchema` in `src/shared/lib/schemas.ts` to include the Blog entry.
- **Step 4** — Update `src/app/sitemap.ts` to include `/blog` (priority 0.7, `weekly`).

### [x] Phase 2 — Blog 3D background scene (new figure)

- **Step 1** — Create `src/app/blog/components/BlogScene/BlogScene.tsx` — `TorusKnotGeometry`-based animated scene, dark overlay vignette, parallax on mouse + scroll, full disposal in cleanup. Uses brand `#fd7e14` + complementary accents.
- **Step 2** — Create `src/app/blog/components/BlogBackground/BlogBackground.tsx` — tiny client component that `next/dynamic`-imports `BlogScene` with `ssr: false`. Keeps the layout tree simple and avoids `'use client'` on the layout itself.

### [x] Phase 3 — Blog list page (`/blog`) with infinite scroll

- **Step 1** — `src/app/blog/layout.tsx` — server component. Renders `<BlogBackground />`, blog list JSON-LD (`Blog` + breadcrumb), and `{children}`. Exports list `metadata`.
- **Step 2** — `src/app/blog/const/seo.ts` — `BLOG_PATH`, `BLOG_URL`, `BLOG_TITLE`, `BLOG_DESCRIPTION`, `blogMetadata`, `blogSchema`, `blogBreadcrumbSchema`.
- **Step 3** — `src/app/blog/hooks/useInfinitePosts.ts` — load first page on mount, expose `loadMore()`. Guards against double-fetch and against firing when `nextCursor` is null.
- **Step 4** — `src/app/blog/components/PostCard/PostCard.tsx` (+ `PostCard.module.css`) — card with image (next/image), title, description (clamped), author (avatar+name), formatted date. Whole card is a `Link` to `ROUTES.blogPost(id)`.
- **Step 5** — `src/app/blog/components/PostsList/PostsList.tsx` (+ module CSS) — grid of `PostCard`s, sentinel `<div ref>` for `IntersectionObserver`, loading skeleton row, empty state, error state with retry.
- **Step 6** — `src/app/blog/page.tsx` — client component. Renders top nav (back-to-home link + `AuthButton`), hero heading ("Blog" + lede), `PostsList`. Uses the project's `framer-motion` patterns + page-local CSS Module.

### [x] Phase 4 — Article page (`/blog/[id]`)

- **Step 1** — `src/app/blog/[id]/page.tsx` — server component. `params` is `Promise<{ id: string }>` per Next 16. Fetch via `getPostById`; render hero image, title, author block, dates, `htmlContent` via `dangerouslySetInnerHTML`. `notFound()` on 404.
- **Step 2** — `src/app/blog/[id]/page.module.css` — article typography (h1-h4, p, a, ul/ol, pre/code, blockquote, img) scoped to the article wrapper. Generous reading width, dark theme.
- **Step 3** — `src/app/blog/[id]/const/seo.ts` — `buildArticleMetadata(post)` and `buildArticleSchema(post)` (`BlogPosting`) + `buildArticleBreadcrumb(post)` helpers.
- **Step 4** — Implement `generateMetadata` in the article page (fetch once, reuse for metadata and rendering via memoized helper, or simply fetch twice — call out the trade-off in the phase summary).
- **Step 5** — `src/app/blog/[id]/components/ArticleNav.tsx` — small client component for top nav (back to blog list + `AuthButton`).

### [x] Phase 5 — Home page link + cross-cutting polish

- **Step 1** — Add a "Read the blog" pill link in `src/app/(home)/page.tsx` next to or under the existing "More about me" link, using a new `styles.blogLink` (mirror `aboutLink` styling, change accent).
- **Step 2** — Update `src/app/about/page.tsx` `cta` block to include a blog link too (optional, keep if it reads well).
- **Step 3** — Re-verify `siteNavigationSchema` order + sitemap output.

### [x] Phase 6 — Tests & stories (key components only)

- **Step 1** — `PostCard.test.tsx` — renders title/description/author/date, link points at the correct route.
- **Step 2** — `PostsList.test.tsx` — renders items, shows empty state when zero items, shows skeleton when `isLoading`, calls `loadMore` when sentinel intersects (mock `IntersectionObserver`).
- **Step 3** — `useInfinitePosts.test.tsx` — mocks `getPosts`, asserts cursor advance and `hasMore=false` when `nextCursor` is null.
- **Step 4** — `PostCard.stories.tsx`, `PostsList.stories.tsx` — sample data, loading state, empty state.
- **Step 5** — `npm run lint` and `npm test` clean.

---

## Important Notes

- **HTML sanitization** — `htmlContent` is rendered with `dangerouslySetInnerHTML`. Since the backend is ours and posts are authored by the site owner, this is acceptable today. If posts ever open to third-party authors, swap in a sanitizer (e.g. `isomorphic-dompurify`) and revisit this comment.
- **No new packages** — pagination uses native `IntersectionObserver`; dates use `Intl.DateTimeFormat`; nothing added to `package.json`.
- **GPU disposal** — `BlogScene` must dispose every geometry, material, texture (if any), and `dispose()` the renderer + remove all listeners — same rule called out in CLAUDE.md for `CylinderScene` / `AboutScene`. Audit checklist before phase close.
- **Sitemap and JSON-LD** — both must be updated in the same phase as the route ships; missing nav schema entries cause Google sitelinks regressions.
- **NDA** — commits/PRs must not mention Anthropic/Claude or use `Co-Authored-By` trailers.
