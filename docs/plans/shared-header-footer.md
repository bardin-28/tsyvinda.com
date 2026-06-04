# Plan: Shared Header & Footer (site-wide chrome)

## Goal

Add a single shared `SiteHeader` and `SiteFooter` rendered on every route via the root layout, replacing the per-page corner navigation. The header exposes one "Menu" pill button that opens an animated dropdown panel (inspired by eventbeds.com) containing links to all pages plus a Sign in / Log out action. Both header and footer can be suppressed per route via a config list (cover generator excluded by default).

---

## Requirements

- Shared header on all pages, replacing existing per-page top navs and the corner `AuthButton`.
- Header = one button with a dropdown and a polished open/close animation (eventbeds-style overlay panel).
- Dropdown links to every page except `/blog/cover`: Home, About, Blog, plus the Login action.
- Auth handled inside the menu: "Sign in" when logged out, "Log out" when logged in (reuse `useUser`).
- Shared footer on all pages containing: nav links, social links, copyright + name.
- Must be possible to render a page without header/footer (opt-out mechanism).
- Follow project conventions: CSS Modules, framer-motion, explicit types, `ROUTES.*`, no new packages, unit tests + stories for new components.

---

## Architectural decisions

- **Root-layout chrome** — `SiteHeader` and `SiteFooter` mount once in `src/app/layout.tsx` (inside `UserProvider`), so every route inherits them. No per-page wiring.
- **Config-driven opt-out** — `CHROME_HIDDEN_ROUTES` in shared nav config. Header/Footer read `usePathname()` and render `null` when the current path matches (exact or nested). `/blog/cover` is excluded by default; adding a route to the list removes chrome from it. Satisfies "page without header/footer".
- **Shared navigation config** — `src/shared/const/navigation.ts` exports `NAV_LINKS` (Home/About/Blog) and `CHROME_HIDDEN_ROUTES`. Single source for both header and footer.
- **Shared social config** — `src/shared/const/social.tsx` exports `SOCIAL_NAV` (label + href from existing `SOCIAL_LINKS` + inline SVG icon) for the footer. Home page keeps its own copy for now (no opportunistic refactor); a follow-up can adopt the shared config.
- **Both components are client components** — header needs interactivity (`useState`, framer-motion, `useUser`, `usePathname`); footer needs `usePathname` for the hide rule. Both still SSR their markup, preserving SEO.
- **Menu interaction & a11y** — `aria-expanded`/`aria-controls` on the trigger, `role="menu"`/`role="menuitem"` on the panel, close on Escape / outside click / route change / link click, focus moves into the panel on open and back to the trigger on close.
- **Stacking** — header is `position: fixed; top: 0` with a high `z-index` (above the fixed three.js/background layers); footer sits in normal document flow with its own `z-index` above page backgrounds. Page top spacing already accommodates the previous fixed corner nav, so removing per-page navs and adding the fixed header is visually equivalent.
- **Auth action in menu** — reuse `useUser().user` / `logout()`. Logged out → link to `ROUTES.LOGIN` ("Sign in"); logged in → button calling `logout()` ("Log out"). Mirrors current `AuthButton` behavior, which is then removed from pages.

---

## Implementation Checklist

### ☑ Phase 1 — Shared config + SiteHeader (done)

- **Step 1** — Create `src/shared/const/navigation.ts`: `NavLink` type, `NAV_LINKS` (Home/About/Blog via `ROUTES`), `CHROME_HIDDEN_ROUTES = [ROUTES.BLOG_COVER]`; re-export from `src/shared/const/index.ts`.
- **Step 2** — Create `src/shared/const/social.tsx`: `SocialNavItem` type, `SOCIAL_NAV` (LinkedIn/Telegram/Instagram/Email from `SOCIAL_LINKS` with inline SVG icons).
- **Step 3** — Create `src/shared/components/SiteHeader/SiteHeader.tsx` + `.module.css`: fixed top bar, brand/name link to Home, "Menu" pill trigger, framer-motion dropdown panel with `NAV_LINKS` (active state via `usePathname`) and auth action, all a11y + close behaviors, responsive. Returns `null` on hidden routes.
- **Step 4** — Export `SiteHeader` from `src/shared/components/index.ts`.

### ☑ Phase 2 — SiteFooter + layout integration (done)

- **Step 1** — Create `src/shared/components/SiteFooter/SiteFooter.tsx` + `.module.css`: nav links (`NAV_LINKS`), social links (`SOCIAL_NAV`), copyright + `NAME`. Returns `null` on hidden routes.
- **Step 2** — Export `SiteFooter` from barrel.
- **Step 3** — Mount `<SiteHeader />` and `<SiteFooter />` in `src/app/layout.tsx` inside `UserProvider`.
- **Step 4** — Add minimal stacking/spacing rules to `(home)/globals.css` (body min-height, footer above fixed backgrounds).

### ☑ Phase 3 — Remove per-page navs (done)

- **Step 1** — Home `(home)/page.tsx`: remove `motion.nav`/`topNav` + `AuthButton` import; adjust `page.module.css` if spacing shifts.
- **Step 2** — About `about/page.tsx`: remove `topNav` + `AuthButton`; adjust CSS.
- **Step 3** — Login `login/page.tsx`: remove `topNav`; adjust CSS.
- **Step 4** — Blog `components/BlogView/BlogView.tsx`: remove `topNav` (Home link + `AuthButton`); adjust `blog/page.module.css`.
- **Step 5** — Article `[slug]/components/ArticleNav.tsx`: remove or keep only contextual back-link — decision: remove the standalone nav (header covers it); keep the in-article "Back to all posts" footer link already in `[slug]/page.tsx`.

### ☑ Phase 4 — Tests, stories, verification (done)

- **Step 1** — `SiteHeader.test.tsx`: renders trigger; opens/closes panel; shows nav links + active state; shows "Sign in" / "Log out" per `useUser` mock; returns null on `/blog/cover`.
- **Step 2** — `SiteFooter.test.tsx`: renders nav + social + copyright; null on `/blog/cover`.
- **Step 3** — `SiteHeader.stories.tsx` + `SiteFooter.stories.tsx`.
- **Step 4** — Run `npm run lint` and `npm test -- --watchman=false`; fix failures.

---

## Important Notes

- **No new packages** — framer-motion, next/link, next/navigation already present.
- **Cover generator** — `/blog/cover` excluded from chrome via `CHROME_HIDDEN_ROUTES`, not from the route tree.
- **Brand orange `#fd7e14`** stays consistent with `AntdProvider` token and existing CSS modules.
- **Social icon duplication** — footer gets a shared `SOCIAL_NAV`; home page intentionally left unrefactored (scope control), flagged for a later cleanup.
- **`npm test` requires `--watchman=false`** in this sandbox (watchman cannot write `~/Library/LaunchAgents`).
- **Plan deviation (Phase 3 / blog fix):** removed the route-change auto-close effect from `SiteHeader` — React 19 lint blocks both the effect and the render-ref patterns. Menu links call `close()` on click; Escape + outside-click cover the rest.
- **Plan deviation (article ISR):** the earlier `generateStaticParams` (from the soft-404 fix) was **removed**. A production build prerenders each listed slug, calling `getPostBySlug`; when the API host is unreachable at build time the render throws and the whole build fails (observed: `ENOTFOUND api.tsyvinda.com`). Article pages now use `revalidate` only → ISR on demand (full SSR HTML on first request, cached for an hour). Same SEO benefit, no build-time backend coupling.
