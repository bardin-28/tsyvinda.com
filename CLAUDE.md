# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal website for Vladyslav Tsyvinda. Public pages come from the API's CMS (see "CMS pages"): `/` (home), about, contacts, blog (+ articles under the blog address), privacy and cookie policy — their content, SEO and **per-language addresses** are edited in the admin panel (defaults `/about`, `/contacts`, `/blog`, `/privacy-policy`, `/cookie-policy`). Fixed routes: `/login` (authenticated area, `noindex`), `/blog/cover` (internal generator, auth-gated via `src/proxy.ts`, `noindex`). `src/proxy.ts` runs on every page: it also adds `X-Robots-Tag: noindex, nofollow` while search engine indexing is off in the admin (Settings → General; read via `shared/lib/indexing.ts`, 60 s cache), and `sitemap.ts` returns no URLs then. Auth talks to a separate backend via a Next rewrite proxy. Deployed at https://tsyvinda.com.

Stack: Next.js 16 (App Router) + React 19 + TypeScript. Tailwind is **not** used — styling is per-route CSS Modules (`page.module.css`) plus a single `globals.css`. Animations via `framer-motion`. Smooth momentum scrolling via `lenis` (the home page is wrapped in `SmoothScroll`). 3D scenes via `three` (raw `THREE.WebGLRenderer`, no `@react-three/fiber`). Forms via `formik` + `zod`. UI primitives from `antd ^6` (dark theme via `AntdProvider`). Unit tests: Jest 30 + `next/jest` + Testing Library, jsdom env. Component workshop: Storybook 10 with `@storybook/nextjs`.

## Commands

```bash
npm run dev              # next dev — http://localhost:3000
npm run dev:https        # next dev on https://local.tsyvinda.com:443 (needs ./certs/local.tsyvinda.com{,-key}.pem)
npm run dev:local        # next dev on :3000, served at https://tsyvinda.local by ../be's nginx-proxy (fe-proxy service); API_URL=https://api.tsyvinda.local, mkcert CA trusted, distDir .next-local. tsyvinda.local is in allowedDevOrigins.
npm run build            # next build (incremental: tsconfig.tsbuildinfo)
npm run start            # serve the production build
npm run lint             # eslint (flat config, next/core-web-vitals + next/typescript)
npm test                 # jest --config config/jest/jest.config.ts
npm run test:watch
npm run test:ci          # writes /coverage
npm run storybook        # storybook dev on :6006, config dir config/storybook
npm run build-storybook  # static build → /storybook-static
```

`dev`, `build`, and the `storybook` scripts set `NODE_OPTIONS='--max-old-space-size=4096'` — keep this when modifying scripts.

File-name conventions are enforced by config, **not** convention alone:
- Tests: `src/**/*.test.{ts,tsx}` — anything else is invisible to Jest.
- Stories: `src/**/*.stories.@(ts|tsx|mdx)` — anything else is invisible to Storybook.

Tooling configuration lives under `config/`, each tool in its own subfolder: `config/jest/{jest.config.ts,jest.setup.ts}`, `config/playwright/{playwright.config.ts,tsconfig.e2e.json}`, `config/storybook/{main,preview}.ts`. `npm test` passes `--config config/jest/jest.config.ts`; bare `jest` will not find it. `npm run test:e2e` passes `-c config/playwright/playwright.config.ts`. Storybook reads `config/storybook` via the `-c config/storybook` flag in the npm scripts — there is **no** `.storybook/` directory; do not run `npx storybook init` without `--config-dir config/storybook` or it will create one.

Path alias: `@/*` → `./src/*` (set in `tsconfig.json`; mirrored in Jest `moduleNameMapper`).

## Architecture

All app code lives under `src/app/` (App Router). Key files:

- `src/app/layout.tsx` — root layout. Owns Metadata API (`metadataBase: https://tsyvinda.com`), JSON-LD `Person` + `WebSite` schemas (from `@/shared/lib/schemas`), GA via the consent module's `GoogleAnalytics` (loads only after analytics consent, see Cookie consent), and wraps children in `<AntdProvider><UserProvider>`. Loads Roboto via `next/font/google` as `--font-roboto`. Imports `./(home)/globals.css` — the only global stylesheet.
- `src/app/(home)/page.tsx` — home, route group keeps URL `/`. Client component. Wrapped in `SmoothScroll` (`./components/SmoothScroll`, a `lenis` provider, reduced-motion-aware). `ScrollOloidScene` loaded via `next/dynamic` with `ssr: false` — do **not** import statically; SSR will break on `window`/WebGL.
- `src/app/(home)/components/ScrollOloidScene/ScrollOloidScene.tsx` — full-screen fixed three.js scene: a metallic oloid that tumbles, its rotation coupled to page-scroll progress (read from `window.scrollY`, smoothed). Cleanup disposes every geometry/material/renderer and removes all listeners (incl. `scroll`). **If you add a new geometry/material/texture, add it to the disposal arrays — otherwise you leak GPU memory on route changes.**
- `src/app/about/page.tsx` — client. Metadata in `src/app/about/layout.tsx`. `AboutScene` (`src/app/about/components/AboutScene/AboutScene.tsx`) follows the same disposal rule.
- `src/app/login/page.tsx` — login route. `LoginForm` (`./components/LoginForm`) uses Formik + Zod + antd `Input`/`Button`. `layout.tsx` sets `robots: noindex`.
- `src/app/sitemap.ts`, `src/app/manifest.ts` — file-based metadata routes. `/robots.txt` is a route handler (`app/robots.txt/route.ts` + `shared/lib/robots.ts`) because it carries a `Content-Signal: search=yes, ai-input=yes, ai-train=no` line that `MetadataRoute.Robots` can't emit. Sitemap lists `/` and `/about` only (login is excluded). Manifest theme color is brand orange `#fd7e14`.

### Shared layout (`src/shared/`)

- `api/index.ts` — `API.{get,post,put,patch,delete,request}` + `ApiError`. Always `credentials: 'include'`, auto-sets `X-Timezone`, JSON-serializes non-`FormData/Blob/string` bodies. On 401, retries once via `GET /auth/refresh` — but **only if** `has_session` cookie is present (otherwise returns the 401 to the caller).
- `api/auth.ts` — `login(credentials)`, `logout()`.
- `lib/cookies.ts` — `getCookie`, `hasCookie`, `deleteCookie`, `AUTH_COOKIES = { ACCESS: 'access', REFRESH: 'refresh', SESSION_FLAG: 'has_session' }`. `access` + `refresh` are HttpOnly (backend-managed; JS cannot read or delete). `has_session` is the JS-visible flag the FE uses to decide whether to attempt `/auth/me` or refresh.
- `lib/site.ts`, `lib/schemas.ts` — site constants and JSON-LD builders.
- `contexts/UserContext.tsx` — `UserProvider` + `useUser()`. Fetches `GET /auth/me` only when `has_session` is present. `logout()` calls `POST /auth/logout` then clears all three cookie names client-side (best effort — HttpOnly clears come from the backend `Set-Cookie`). `useUser()` throws outside provider.
- `providers/AntdProvider.tsx` — antd dark algorithm + `#fd7e14` token.
- `const/routes.ts` — `ROUTES = { HOME, ABOUT, CONTACTS, BLOG, BLOG_COVER, LOGIN, blogPost(slug) }`. **Use `ROUTES.*`, not raw path strings.**
- `const/pageUpdatedAt.ts` — `PAGE_UPDATED_AT.home`: `dateModified` of the home JSON-LD in `(home)/layout.tsx`. CMS pages use their publish date (sitemap `lastmod`, JSON-LD); legal pages their "Last updated" date.
- `const/navigation.ts` — `NAV_LINKS` (Home/About/Blog/Contacts) drive the shared header + footer; `CHROME_HIDDEN_ROUTES` / `isChromeHidden()` suppress chrome (e.g. `/blog/cover`).
- `const/social.tsx` — `SOCIAL_NAV` (label/href/handle/icon) is the single source for contact channels (footer + `/contacts`).
- `app/opengraph-image.tsx` — site-wide branded OG/Twitter card (`next/og`); pages that set `openGraph`/`twitter` must list it explicitly via `defaultShareImageUrl(locale)` (`i18n/seo.ts`) — Next.js replaces those objects wholesale, so the inherited card is dropped otherwise (articles use the post image).
- `components/` — cross-page UI (e.g. `AuthButton`). Barrel re-export from `src/shared/components/index.ts`.

### Per-route folder convention

Each route uses `components/` and `const/` subfolders:
- `(home)/components/ScrollOloidScene/…`, `(home)/components/SmoothScroll/…`, `(home)/const/index.tsx`
- `about/components/AboutScene/…`, `about/const/{index.ts,seo.ts}`
- `login/components/LoginForm/…`

Page-local data/copy lives in `const/`; route-only components in `components/`. **Do not** add `data.ts` / `*-meta.ts` files at the route root — that pattern was removed.

### Styling

- `(home)/globals.css` is the only global CSS. Everything else is colocated CSS Modules.
- Brand colour `#fd7e14` (orange) appears in **four** places — change all together: `manifest.ts` theme, `AntdProvider` token, three.js materials, and CSS Module styles.

### Assets

- `public/favicon/*` — referenced from `layout.tsx` metadata icons.
- `public/images/avatar.jpg` — default hero photo (`AVATAR`); Home/About heroes show the CMS `avatar` (uploaded in the admin) when set. JSON-LD still uses `AVATAR`.
- OG/Twitter card is generated by `app/opengraph-image.tsx` (`next/og`, 1200×630, branded). No static `public/og.png`.

## CMS pages

Plan/report: `docs/plans/cms-pages.md`, `docs/reports/cms-pages.md` (API side: `../be/docs/…/cms-pages.md`).

- `src/shared/cms/` — `schemas.ts` (zod copy of the API contract: page keys, every section's `data`; **change it
  when the API changes a section**), `parsePage.ts` (bad envelope throws, a drifted section is dropped + logged),
  `api.ts` (server only: `getWebsitePage`, `resolveRoute`, `getRouteMap` — fetch cache 60 s + tags; route map
  falls back to default slugs), `routes.ts` (`pagePath`, `postPath`, `DEFAULT_PAGE_PATHS`), `RouteMapProvider`
  + `usePagePath(key)` / `usePaths()` for client links, `Markup` (`<accent>`, `<strong>`, `<br>` only),
  `RichText` (HTML sanitized by the API), `metadata.ts` (`cmsPageMetadata`, per-language hreflang; `og:title`/Twitter
  title = `shareTitle()` = "<OG title> — <site name>" (Home: the title alone), the editor's OG title is `seo.title`;
  `seo.socialTitle` is deprecated and unused).
- `src/app/[locale]/[...rest]/page.tsx` — **load-bearing catch-all**: resolves the path with the API → page view by
  key, blog post (`views/post/PostView`), 308/307 redirect (old or other-language slug, admin redirect), or
  the localised 404. Home keeps `(home)/page.tsx` (fixed address) and reads CMS page `home`.
- `src/views/<page>/` — one view per CMS page (`AboutView`, `ContactsView`, `BlogPageView`/`BlogView`,
  `LegalView` for both policies, `PostView`), rendering sections in the editor's order; shared sections in
  `views/shared/` (`CtaBanner`, `RichTextSection`); JSON-LD in `views/structuredData.ts`.
- **Never hard-code a CMS page path**: use `usePagePath("about")` (client) or `pagePath(await getRouteMap(), …)`
  (server). `NAV_LINKS` / `LEGAL_LINKS` carry a `pageKey`. `ROUTES.ABOUT` etc. are only the default slugs.
- Page copy is in the CMS, not `src/messages` (namespaces `home`, `about`, `privacy` removed; `contacts`,
  `cookies`, `blog` keep UI strings only).
- `src/app/api/revalidate/route.ts` — the API's cache webhook (`Authorization: Bearer $REVALIDATE_SECRET`,
  `{ tags }` → `revalidateTag(tag, { expire: 0 })`); unset secret → 404 and edits appear within a minute.
- Sitemap and `llms.txt` list published pages at their CMS addresses (pages with `noindex` left out).

## AI agents

- **Markdown pages**: `src/proxy.ts` rewrites any public page requested with `Accept: text/markdown` to
  `app/agent-markdown/route.ts` (path passed in the `x-agent-markdown-path` request header — route handlers
  see the original URL after a rewrite). `shared/lib/markdown/`: `htmlToMarkdown` (post bodies, rich text),
  `pageMarkdown` (one `case` per CMS block type — **new block type ⇒ add it there**, TS enforces it),
  `resolvePageMarkdown` (path → page/post/redirect, same resolution as the catch-all route).
- **MCP**: `app/mcp/route.ts` — stateless Streamable HTTP JSON-RPC (`shared/lib/agent/mcpServer.ts`), read-only
  tools in `shared/lib/agent/toolDefinitions.ts` (data, browser-safe) + `agentTools.ts` (server implementations).
  Discovery card at `/.well-known/mcp/server-card.json` and `/.well-known/mcp.json` (`serverCard.ts`).
- **WebMCP**: `shared/components/WebMcpTools` (mounted in `[locale]/layout.tsx`) registers the same tools with
  `document.modelContext` / `navigator.modelContext` when present; each call goes to `/mcp`.
- `/mcp` and `/.well-known/` are excluded from the proxy matcher. JSON-LD also has an `Organization` node
  (personal brand, `founder` = the Person) for checkers that want a business entity.

## Languages (next-intl)

English (default, unprefixed: `/about`) and Ukrainian (`/uk/about`). All pages live under
`src/app/[locale]/`; `src/app/layout.tsx` only passes children through (the `<html lang>` is in
`[locale]/layout.tsx`). Config: `src/i18n/` — `locales.ts` (`LOCALES`, `localizePath`,
`splitLocalePath`, `OG_LOCALES`), `routing.ts` (`localePrefix: "as-needed"`, no browser/cookie
detection), `navigation.ts` (locale-aware `Link`/`useRouter`/`usePathname` — **use these, not
next/link**, hrefs stay unprefixed), `request.ts`, `messages.ts` (namespace list), `seo.ts`
(`pageMetadata`, `localizedAlternates`, `absoluteUrl`). Texts: `src/messages/<locale>/<namespace>.json`;
`messages.test.ts` fails on missing/empty keys. Tests render with `renderWithIntl` /
`IntlTestProvider` (`src/shared/testing/intl.tsx`); Jest transforms next-intl (ESM) via
`transformIgnorePatterns`.

- `src/proxy.ts` runs next-intl's middleware (after the auth gate and before the noindex header);
  its matcher skips `opengraph-image` (one card per language under `[locale]`).
- Header `LanguageSwitcher` saves the choice to localStorage (`locale`) and opens the page's hreflang
  alternate; `LocalePreference` redirects a returning visitor once per load to their stored language
  when the page has that version. Crawlers have no stored choice.
- Blog API calls pass `locale`; a post page 404s when the post has no version in that language and
  lists hreflang only for `post.locales`. Sitemap has every page in both languages with alternates.

## API & Auth

- Backend lives at a separate origin. `next.config.ts` rewrites `/api/:path*` → `${API_URL}/:path*` (default `http://localhost:4000`). FE code always calls relative `/api/…`.
- Auth is cookie-based. Backend sets `access`, `refresh` (HttpOnly, Secure, `Domain=.tsyvinda.com`) and `has_session` (JS-readable) on login/refresh.
- Local dev gotcha: HttpOnly `Secure` cookies with `Domain=.tsyvinda.com` will **not** attach on `http://localhost:3000`. Use `npm run dev:https` (cert covers `local.tsyvinda.com`) for end-to-end auth testing.
- Never read/write `access` or `refresh` from JS — they are HttpOnly. Only `has_session` is observable client-side.

## Cookie consent

Module `src/shared/consent/` (self-contained; mounted in `[locale]/layout.tsx`):
`ConsentProvider`/`useConsent()` (choice read via `useSyncExternalStore`, so server HTML is never
"decided"), `CookieBanner` (first visit), `CookiePreferences` (antd Modal, "Your cookie options"),
`CookieSettingsButton` (footer legal row + Cookie Policy page), `GoogleAnalytics` (gtag only with
analytics consent; withdrawal sets `ga-disable-<ID>` and deletes `_ga*`). Choice is stored in the
`cookie_consent` cookie (`{ version, analytics, updatedAt }`, 6 months). Categories: **Strictly
necessary** (always on — includes the remembered `locale`) and **Analytics**. Bump
`CONSENT_VERSION` when categories change (everyone is asked again).

- **Adding a cookie / tracker:** list it in `src/views/legal/const/index.ts` (`COOKIE_ROWS`) +
  `cookies.list.rows` texts (en/uk), update the Cookie Policy's "Last updated" date in the admin panel; if it is not strictly
  necessary, gate it on `useConsent().preferences` like `GoogleAnalytics` and add it to the CSP.
- Tests: `renderWithConsent`, `clearConsentCookie`, `ignorePseudoElementStyles` in
  `src/shared/consent/testing.tsx` (antd modals call `getComputedStyle` with pseudo elements).

## Security headers

`src/shared/lib/securityHeaders.ts` → `next.config.ts` `headers()` for every route (+ `poweredByHeader: false`).
CSP uses `'unsafe-inline'` scripts because pages are prerendered/edge-cached (no per-request nonces);
`script-src-attr 'none'` still blocks inline event handlers. **A new third-party script, iframe, API
or font origin must be added to the CSP there** (today: GA, Turnstile, OSM tiles via `img-src https:`).
No COEP (would break Turnstile/GA/OSM). Dev adds `'unsafe-eval'` + `ws:` and skips HSTS/upgrade.

## Environment

- `API_URL` — backend origin for the `/api` proxy and the server-side CMS fetches. Default `http://localhost:4000`. Set per env.
- `REVALIDATE_SECRET` — bearer secret of `/api/revalidate` (same as the API's `WEBSITE_REVALIDATE_SECRET`); optional.
- `GA_ID` — Google Analytics measurement ID. If unset, `GoogleAnalytics` is not mounted; if set, gtag still loads **only after the visitor allows analytics cookies**.
- `.env.example` is committed; `.env.local` / `.env.production` are gitignored.

## Deployment

Containerised via root `Dockerfile` (`node:lts`, `npm install`, `next build`, `npm start` on port 3000). `compose.yaml` runs the app behind `nginxproxy/nginx-proxy` + `acme-companion` for Let's Encrypt TLS; auxiliary nginx config lives under `docker/nginx-proxy/`. Compose env vars are documented in `.env.example`.

## Important Notes

1. **Do not refactor existing models opportunistically.** Change a model only when the current task directly requires it, and explain what changed and why in the phase summary.
2. **Do not install new packages** without asking first. Check `package.json` before suggesting additions.
3. **NDA-affiliated repo** — never include `Co-Authored-By` trailers or mention Anthropic/Claude in commit messages, PR descriptions, or code comments.
4. **Never `git push` or `git commit` without explicit confirmation** from the developer. Committing or pushing to any remote branch requires asking first each time.

## Reviewability

Code audited by OpenAI Codex — clarity required: no magic, explicit types, descriptive variable names, no unnecessary abstractions.
