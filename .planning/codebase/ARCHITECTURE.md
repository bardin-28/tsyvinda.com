<!-- refreshed: 2026-06-02 -->
# Architecture

**Analysis Date:** 2026-06-02

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────┐
│                        Browser / Client                              │
├──────────────────┬───────────────────┬──────────────────────────────┤
│  Route Pages     │  Shared Chrome    │   3D Scenes (WebGL)          │
│  (App Router)    │  SiteHeader /     │   CylinderScene              │
│  `src/app/`      │  SiteFooter       │   AboutScene                 │
│                  │  `src/shared/`    │   BlogScene                  │
│                  │  `components/`    │   CoverComposer              │
└──────┬───────────┴─────────┬─────────┴──────────────────────────────┘
       │                     │
       ▼                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  Shared State & Providers                            │
│  AntdProvider (`src/shared/providers/AntdProvider.tsx`)             │
│  UserProvider  (`src/shared/contexts/UserContext.tsx`)              │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   API Client Layer                                   │
│  `src/api/index.ts` — fetch wrapper with auto-refresh               │
│  `src/api/auth.ts` — login/logout                                   │
│  `src/api/posts.ts` — blog post queries                             │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Next.js Rewrite Proxy  →  Backend API (separate origin)            │
│  `/api/*`  →  `${API_URL}/*`  (default http://localhost:4000)       │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Root layout | Providers, fonts, GA, global JSON-LD schemas, chrome | `src/app/layout.tsx` |
| AntdProvider | antd dark theme + brand orange token | `src/shared/providers/AntdProvider.tsx` |
| UserProvider | Auth state, `/profile` fetch, logout | `src/shared/contexts/UserContext.tsx` |
| SiteHeader | Animated nav menu, active-link detection, chrome suppression | `src/shared/components/SiteHeader/SiteHeader.tsx` |
| SiteFooter | Footer links from `NAV_LINKS` + `SOCIAL_NAV` | `src/shared/components/SiteFooter/SiteFooter.tsx` |
| API module | Typed fetch wrapper, 401 retry, X-Timezone header | `src/api/index.ts` |
| proxy (middleware) | Gate `/blog/cover` behind session cookie check | `src/proxy.ts` |
| CylinderScene | Raw THREE.js home hero, full-screen fixed, SSR-disabled | `src/app/(home)/components/CylinderScene/CylinderScene.tsx` |
| AboutScene | Raw THREE.js about background, SSR-disabled | `src/app/about/components/AboutScene/AboutScene.tsx` |
| BlogScene | Raw THREE.js blog background | `src/app/blog/components/BlogScene/BlogScene.tsx` |
| CoverComposer | Canvas compositor: THREE.js scene + 2D text overlay, export JPEG | `src/app/blog/cover/components/CoverComposer.tsx` |
| BlogView | Client shell for infinite-scroll post list, accepts SSR seed | `src/app/blog/components/BlogView/BlogView.tsx` |
| useInfinitePosts | Cursor-pagination hook, deduplicates initial SSR data | `src/app/blog/hooks/useInfinitePosts.ts` |
| LoginForm | Formik + Zod form wired to login API, redirects on success | `src/app/login/components/LoginForm/LoginForm.tsx` |

## Pattern Overview

**Overall:** Next.js App Router with per-route client components and ISR server components.

**Key Characteristics:**
- Root `layout.tsx` is a Server Component; most page files are `"use client"` because they use Framer Motion or THREE.js
- Static/metadata concerns (Metadata API, JSON-LD) live in layouts and server page segments; runtime/interactive concerns live in client components
- A single shared `API` object (`src/api/index.ts`) handles all HTTP — no route-specific fetch clients
- 3D scenes are always loaded via `next/dynamic` with `{ ssr: false }` to prevent WebGL/`window` access during SSR
- Route-local data (copy, animation constants, SEO metadata) is isolated in per-route `const/` files rather than being inline in page components

## Layers

**Infrastructure Layer:**
- Purpose: Next.js config, middleware, container, CI
- Location: `next.config.ts`, `src/proxy.ts`, `Dockerfile`, `.github/workflows/`
- Contains: rewrite rules, auth gate, build config
- Depends on: nothing app-level
- Used by: Next.js runtime

**API Client Layer:**
- Purpose: Typed HTTP communication with the backend
- Location: `src/api/`
- Contains: `index.ts` (request function + `API` object + `ApiError`), `auth.ts`, `posts.ts`
- Depends on: `src/shared/lib/cookies.ts` (for session-flag check on 401)
- Used by: shared contexts, route hooks, server-side page functions

**Shared Layer:**
- Purpose: Cross-route constants, contexts, providers, utility functions, chrome components
- Location: `src/shared/`
- Contains: `const/` (routes, nav, social), `contexts/UserContext.tsx`, `providers/AntdProvider.tsx`, `lib/` (cookies, schemas, site, uploads), `components/` (SiteHeader, SiteFooter, Logo, AuthButton)
- Depends on: API client layer
- Used by: all route segments

**Route Layer:**
- Purpose: Page-specific UI, 3D scenes, forms, data fetching
- Location: `src/app/`
- Contains: page files, per-route `components/`, per-route `const/`
- Depends on: shared layer, API client layer
- Used by: Next.js router

## Data Flow

### Public Blog List (ISR + infinite scroll)

1. Server renders `src/app/blog/page.tsx` — calls `getPosts()` directly via `src/api/posts.ts` (on the server, `API_URL` is the direct backend origin, not `/api`)
2. `initialData` is passed as a prop to `BlogView` (`src/app/blog/components/BlogView/BlogView.tsx`)
3. `BlogView` calls `useInfinitePosts` (`src/app/blog/hooks/useInfinitePosts.ts`) with the seed data
4. Hook hydrates from seed, subsequent "load more" clicks call `getPosts()` client-side (via `/api` rewrite → backend)
5. Posts render in `PostsList` → `PostCard` (`src/app/blog/components/PostCard/PostCard.tsx`); image URLs are rewritten via `toProxiedUrl` (`src/shared/lib/uploads.ts`)

### Article Page (ISR SSR)

1. `src/app/blog/[slug]/page.tsx` calls `loadPost(slug)` (React `cache`-memoized)
2. `generateMetadata` and the page component share the same cached call
3. Article HTML is sanitized (`sanitizeHtmlContent`) and headings are demoted (`demoteHeadings`) before `dangerouslySetInnerHTML`
4. JSON-LD article schema injected inline as `<script type="application/ld+json">`

### Auth Flow

1. User visits `/blog/cover` → `src/proxy.ts` checks `refresh` or `has_session` cookie
2. If absent, redirects to `/login?from=/blog/cover`
3. `LoginForm` submits via `login()` (`src/api/auth.ts`) → backend sets `access`, `refresh` (HttpOnly), `has_session` (JS-readable)
4. `submitHandler.ts` calls `setUser()` on `UserContext` then `router.push(redirectTo)`
5. Subsequent API calls include credentials automatically; on 401 the API client retries once via `POST /auth/refresh` (only if `has_session` is present)
6. Logout: `UserContext.logout()` calls `POST /auth/logout` then client-side clears all three cookie names

### Three.js Scene Lifecycle

1. Scene component loaded via `dynamic(() => import(...), { ssr: false })`
2. `useEffect` creates `WebGLRenderer`, scene, camera, geometries, materials
3. `requestAnimationFrame` loop runs until cleanup
4. Cleanup disposes every geometry, material, and renderer and removes all event listeners — required to prevent GPU memory leaks on route changes

**State Management:**
- Auth/user state: React context (`UserContext`) — single source of truth, initialized from `has_session` cookie
- UI state: local `useState` within components (nav open/close, form submission)
- Server data: React `cache()` for deduplication within a request (article page)
- Infinite scroll state: custom hook `useInfinitePosts` using `useRef` for cursor/lock tracking and `useState` for rendered list

## Key Abstractions

**`API` object (`src/api/index.ts`):**
- Purpose: Single typed HTTP client used everywhere — both client-side and server-side
- Examples: `API.get<T>('/posts')`, `API.post('/auth/logout')`
- Pattern: On the server, base URL is `API_URL` (direct origin); on the client, base URL is `/api` (rewrite proxy). Selection is `isServer = typeof window === 'undefined'`

**`ROUTES` constant (`src/shared/const/routes.ts`):**
- Purpose: Single source of all route strings; prevents raw path strings in code
- Examples: `ROUTES.HOME`, `ROUTES.BLOG`, `ROUTES.blogPost(slug)`, `ROUTES.BLOG_COVER`
- Pattern: Use `ROUTES.*` everywhere; never write `/blog`, `/login`, etc. as bare strings

**Per-route `const/` files:**
- Purpose: Isolate page copy, animation constants, SEO metadata from JSX
- Examples: `src/app/(home)/const/index.tsx`, `src/app/about/const/index.ts`, `src/app/blog/[slug]/const/seo.ts`
- Pattern: Page component imports named exports from `./const`; no inline data objects in page JSX

**CSS Modules per route:**
- Purpose: Scoped styles with zero class-name collisions
- Examples: `src/app/(home)/page.module.css`, `src/app/about/page.module.css`
- Pattern: Each route/component has its own `.module.css`; no utility classes from Tailwind

## Entry Points

**Root layout:**
- Location: `src/app/layout.tsx`
- Triggers: Every request
- Responsibilities: HTML shell, font loading, global metadata, JSON-LD schemas, GA script, provider wrapping, chrome rendering

**Next.js proxy (middleware):**
- Location: `src/proxy.ts`
- Triggers: Any request matching `/blog/cover` or `/blog/cover/*`
- Responsibilities: Optimistic auth gate — redirect unauthenticated users to `/login?from=/blog/cover`

**API client:**
- Location: `src/api/index.ts`
- Triggers: Any call to `API.get/post/put/patch/delete`
- Responsibilities: URL construction (client vs server origin), header injection, body serialization, 401 retry, error normalization to `ApiError`

**Blog page (ISR server component):**
- Location: `src/app/blog/page.tsx`
- Triggers: HTTP request to `/blog`, revalidated every 300 s
- Responsibilities: Initial post fetch for SSR seed, hands data to `BlogView`

**Article page (ISR server component):**
- Location: `src/app/blog/[slug]/page.tsx`
- Triggers: HTTP request to `/blog/[slug]`, revalidated every 3600 s
- Responsibilities: Fetch post, generate metadata, sanitize and demote HTML content, render full article markup

## Architectural Constraints

- **SSR / WebGL:** THREE.js scenes must always be loaded via `next/dynamic` with `{ ssr: false }`. Importing them statically will crash during server render because they reference `window`/WebGL APIs.
- **GPU disposal:** Every geometry and material created in a THREE.js `useEffect` must be added to a disposal array and disposed in the cleanup function. The pattern is established in `CylinderScene.tsx`; deviating causes GPU memory leaks on route navigation.
- **HttpOnly cookies:** `access` and `refresh` cookies are HttpOnly — never read or write them from JS. Only `has_session` is observable client-side. All cookie operations go through `src/shared/lib/cookies.ts`.
- **Global state:** The only module-level singleton is the antd theme object in `AntdProvider.tsx`. All other shared state is React context.
- **Brand colour:** `#fd7e14` appears in four places that must stay in sync: `manifest.ts` theme colour, `AntdProvider.tsx` token, THREE.js material colours, and CSS Module styles. Change all together.
- **Image proxy:** Backend upload URLs must be converted to root-relative paths via `toProxiedUrl()` (`src/shared/lib/uploads.ts`) before passing to `next/image`. This prevents leaking the backend origin and ensures requests are proxied through Next.js.

## Anti-Patterns

### Direct backend URL in `next/image` src

**What happens:** Passing `post.imageUrl` (absolute URL from backend) directly to `<Image src={post.imageUrl}>` without calling `toProxiedUrl`.
**Why it's wrong:** Exposes the backend API origin to the client; bypasses the Next.js proxy; can break `next/image` domain allowlist.
**Do this instead:** `const src = toProxiedUrl(post.imageUrl)` → pass `src` to `<Image>` (as done in `PostCard.tsx`).

### Static import of THREE.js scene components

**What happens:** `import CylinderScene from "./components/CylinderScene/CylinderScene"` at the top of a page file (not via `dynamic`).
**Why it's wrong:** Next.js will attempt to server-render the component, which crashes because THREE.js accesses `window` and `WebGLRenderingContext`.
**Do this instead:** `const CylinderScene = dynamic(() => import("..."), { ssr: false })` (as done in `src/app/(home)/page.tsx`).

### Raw path strings instead of ROUTES

**What happens:** Writing `href="/blog"` or `router.push("/login")` directly in component code.
**Why it's wrong:** Decentralises route definitions; a rename requires a grep across all files.
**Do this instead:** `href={ROUTES.BLOG}` / `router.push(ROUTES.LOGIN)` — import from `@/shared/const`.

### Omitting geometry/material disposal

**What happens:** Adding a new mesh/material to a THREE.js scene without including it in the `dispose()` cleanup.
**Why it's wrong:** GPU memory is not freed on route change; repeated navigation accumulates leaks that degrade performance.
**Do this instead:** Add every geometry and material to the disposal arrays in the `useEffect` cleanup, as shown in `CylinderScene.tsx` lines 300–305.

## Error Handling

**Strategy:** `ApiError` class centralises HTTP errors; components catch and display inline.

**Patterns:**
- `API` functions throw `ApiError(message, status, data)` for non-2xx responses
- Components/hooks catch `ApiError` specifically to extract `err.data.message` for user-facing copy
- ISR server components (`blog/page.tsx`) swallow fetch errors and fall back to `undefined` seed so the client renders a loading shell rather than a 500
- Auth 401 triggers one automatic token refresh before surfacing the error to the caller

## Cross-Cutting Concerns

**Logging:** `console.log('UNAUTHORIZED')` on failed token refresh (single call in `src/api/index.ts`). No structured logging framework.
**Validation:** Zod schemas in `src/app/login/components/LoginForm/validation/schema.ts`; Formik bridges Zod validation to the form UI.
**Authentication:** Cookie-based; `UserContext` holds client-side user state; `src/proxy.ts` enforces server-side route protection; API client handles token refresh transparently.
**SEO / Structured Data:** JSON-LD schemas built in `src/shared/lib/schemas.ts` and injected in `layout.tsx`. Per-route schemas (article, breadcrumb) built in route-local `const/seo.ts` files.

---

*Architecture analysis: 2026-06-02*
