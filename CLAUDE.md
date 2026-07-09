# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal website for Vladyslav Tsyvinda. Public routes: `/` (intro hero + "Get in touch" CTA), `/about` (bio/stack/experience), `/contacts` (contact channels), `/blog` (+ `/blog/[slug]` articles), `/login` (authenticated area, `noindex`), `/blog/cover` (internal generator, auth-gated via `src/proxy.ts`, `noindex`). Auth talks to a separate backend via a Next rewrite proxy. Deployed at https://tsyvinda.com.

Stack: Next.js 16 (App Router) + React 19 + TypeScript. Tailwind is **not** used — styling is per-route CSS Modules (`page.module.css`) plus a single `globals.css`. Animations via `framer-motion`. Smooth momentum scrolling via `lenis` (the home page is wrapped in `SmoothScroll`). 3D scenes via `three` (raw `THREE.WebGLRenderer`, no `@react-three/fiber`). Forms via `formik` + `zod`. UI primitives from `antd ^6` (dark theme via `AntdProvider`). Unit tests: Jest 30 + `next/jest` + Testing Library, jsdom env. Component workshop: Storybook 10 with `@storybook/nextjs`.

## Commands

```bash
npm run dev              # next dev — http://localhost:3000
npm run dev:https        # next dev on https://local.tsyvinda.com:443 (needs ./certs/local.tsyvinda.com{,-key}.pem)
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

- `src/app/layout.tsx` — root layout. Owns Metadata API (`metadataBase: https://tsyvinda.com`), JSON-LD `Person` + `WebSite` schemas (from `@/shared/lib/schemas`), GA bootstrap (`next/script` `afterInteractive`, gated on `process.env.GA_ID`), and wraps children in `<AntdProvider><UserProvider>`. Loads Roboto via `next/font/google` as `--font-roboto`. Imports `./(home)/globals.css` — the only global stylesheet.
- `src/app/(home)/page.tsx` — home, route group keeps URL `/`. Client component. Wrapped in `SmoothScroll` (`./components/SmoothScroll`, a `lenis` provider, reduced-motion-aware). `ScrollOloidScene` loaded via `next/dynamic` with `ssr: false` — do **not** import statically; SSR will break on `window`/WebGL.
- `src/app/(home)/components/ScrollOloidScene/ScrollOloidScene.tsx` — full-screen fixed three.js scene: a metallic oloid that tumbles, its rotation coupled to page-scroll progress (read from `window.scrollY`, smoothed). Cleanup disposes every geometry/material/renderer and removes all listeners (incl. `scroll`). **If you add a new geometry/material/texture, add it to the disposal arrays — otherwise you leak GPU memory on route changes.**
- `src/app/about/page.tsx` — client. Metadata in `src/app/about/layout.tsx`. `AboutScene` (`src/app/about/components/AboutScene/AboutScene.tsx`) follows the same disposal rule.
- `src/app/login/page.tsx` — login route. `LoginForm` (`./components/LoginForm`) uses Formik + Zod + antd `Input`/`Button`. `layout.tsx` sets `robots: noindex`.
- `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/manifest.ts` — file-based metadata routes. Sitemap lists `/` and `/about` only (login is excluded). Manifest theme color is brand orange `#fd7e14`.

### Shared layout (`src/shared/`)

- `api/index.ts` — `API.{get,post,put,patch,delete,request}` + `ApiError`. Always `credentials: 'include'`, auto-sets `X-Timezone`, JSON-serializes non-`FormData/Blob/string` bodies. On 401, retries once via `GET /auth/refresh` — but **only if** `has_session` cookie is present (otherwise returns the 401 to the caller).
- `api/auth.ts` — `login(credentials)`, `logout()`.
- `lib/cookies.ts` — `getCookie`, `hasCookie`, `deleteCookie`, `AUTH_COOKIES = { ACCESS: 'access', REFRESH: 'refresh', SESSION_FLAG: 'has_session' }`. `access` + `refresh` are HttpOnly (backend-managed; JS cannot read or delete). `has_session` is the JS-visible flag the FE uses to decide whether to attempt `/auth/me` or refresh.
- `lib/site.ts`, `lib/schemas.ts` — site constants and JSON-LD builders.
- `contexts/UserContext.tsx` — `UserProvider` + `useUser()`. Fetches `GET /auth/me` only when `has_session` is present. `logout()` calls `POST /auth/logout` then clears all three cookie names client-side (best effort — HttpOnly clears come from the backend `Set-Cookie`). `useUser()` throws outside provider.
- `providers/AntdProvider.tsx` — antd dark algorithm + `#fd7e14` token.
- `const/routes.ts` — `ROUTES = { HOME, ABOUT, CONTACTS, BLOG, BLOG_COVER, LOGIN, blogPost(slug) }`. **Use `ROUTES.*`, not raw path strings.**
- `const/navigation.ts` — `NAV_LINKS` (Home/About/Blog/Contacts) drive the shared header + footer; `CHROME_HIDDEN_ROUTES` / `isChromeHidden()` suppress chrome (e.g. `/blog/cover`).
- `const/social.tsx` — `SOCIAL_NAV` (label/href/handle/icon) is the single source for contact channels (footer + `/contacts`).
- `app/opengraph-image.tsx` — site-wide branded OG/Twitter card (`next/og`); per-route metadata `openGraph.images` is omitted so this card is inherited (articles override with the post image).
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
- `public/images/avatar.jpg` — 88×88, rendered via `next/image` with `priority`.
- OG/Twitter card is generated by `app/opengraph-image.tsx` (`next/og`, 1200×630, branded). No static `public/og.png`.

## API & Auth

- Backend lives at a separate origin. `next.config.ts` rewrites `/api/:path*` → `${API_URL}/:path*` (default `http://localhost:4000`). FE code always calls relative `/api/…`.
- Auth is cookie-based. Backend sets `access`, `refresh` (HttpOnly, Secure, `Domain=.tsyvinda.com`) and `has_session` (JS-readable) on login/refresh.
- Local dev gotcha: HttpOnly `Secure` cookies with `Domain=.tsyvinda.com` will **not** attach on `http://localhost:3000`. Use `npm run dev:https` (cert covers `local.tsyvinda.com`) for end-to-end auth testing.
- Never read/write `access` or `refresh` from JS — they are HttpOnly. Only `has_session` is observable client-side.

## Environment

- `API_URL` — backend origin for the `/api` proxy. Default `http://localhost:4000`. Set per env.
- `GA_ID` — Google Analytics measurement ID. If unset, GA `<Script>` tags are skipped.
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
