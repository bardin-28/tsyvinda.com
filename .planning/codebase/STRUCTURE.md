# Codebase Structure

**Analysis Date:** 2026-06-02

## Directory Layout

```
test-fe/
├── src/
│   ├── api/                    # HTTP client layer — all backend communication
│   │   ├── index.ts            # API object, ApiError, request() with 401 retry
│   │   ├── auth.ts             # login(), logout()
│   │   ├── posts.ts            # getPosts(), getPostBySlug(), Post types
│   │   ├── index.client.test.ts
│   │   └── index.server.test.ts
│   ├── app/                    # Next.js App Router — all routes
│   │   ├── layout.tsx          # Root layout: providers, metadata, JSON-LD, chrome
│   │   ├── opengraph-image.tsx # Site-wide branded OG image (next/og, 1200×630)
│   │   ├── sitemap.ts          # File-based sitemap
│   │   ├── robots.ts           # File-based robots.txt
│   │   ├── manifest.ts         # PWA manifest
│   │   ├── (home)/             # Route group — URL stays "/"
│   │   │   ├── page.tsx        # Home page (client, CylinderScene via dynamic)
│   │   │   ├── globals.css     # ONLY global stylesheet in the codebase
│   │   │   ├── page.module.css
│   │   │   ├── components/
│   │   │   │   └── CylinderScene/
│   │   │   │       ├── CylinderScene.tsx   # THREE.js hero scene
│   │   │   │       ├── CylinderScene.test.tsx
│   │   │   │       └── CylinderScene.stories.tsx
│   │   │   └── const/
│   │   │       └── index.tsx   # Animation variants, copy, EASE
│   │   ├── about/
│   │   │   ├── layout.tsx      # About metadata
│   │   │   ├── page.tsx        # About page (client, AboutScene via dynamic)
│   │   │   ├── page.module.css
│   │   │   ├── components/
│   │   │   │   └── AboutScene/
│   │   │   │       └── AboutScene.tsx      # THREE.js background scene
│   │   │   └── const/
│   │   │       ├── index.ts    # Bio data: STACK, EXPERIENCE, EDUCATION, STATS
│   │   │       └── seo.ts      # About-page SEO metadata + JSON-LD
│   │   ├── blog/
│   │   │   ├── layout.tsx      # Blog metadata + BlogBackground + JSON-LD
│   │   │   ├── page.tsx        # Blog list (ISR server, revalidate 300 s)
│   │   │   ├── page.module.css
│   │   │   ├── components/
│   │   │   │   ├── BlogBackground/
│   │   │   │   │   └── BlogBackground.tsx  # Decorative CSS background
│   │   │   │   ├── BlogScene/
│   │   │   │   │   └── BlogScene.tsx       # THREE.js blog scene
│   │   │   │   ├── BlogView/
│   │   │   │   │   └── BlogView.tsx        # Client shell: hero + PostsList
│   │   │   │   ├── PostCard/
│   │   │   │   │   ├── PostCard.tsx        # Single post card
│   │   │   │   │   ├── PostCard.test.tsx
│   │   │   │   │   └── PostCard.stories.tsx
│   │   │   │   └── PostsList/
│   │   │   │       ├── PostsList.tsx       # Grid + load-more + error states
│   │   │   │       ├── PostsList.test.tsx
│   │   │   │       └── PostsList.stories.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useInfinitePosts.ts     # Cursor-pagination hook
│   │   │   │   └── useInfinitePosts.test.tsx
│   │   │   ├── const/
│   │   │   │   └── seo.ts      # Blog SEO metadata + JSON-LD
│   │   │   ├── [slug]/
│   │   │   │   ├── page.tsx    # Article page (ISR, revalidate 3600 s)
│   │   │   │   ├── page.module.css
│   │   │   │   └── const/
│   │   │   │       └── seo.ts  # buildArticleMetadata, buildArticleSchema
│   │   │   └── cover/          # Auth-gated internal tool (noindex)
│   │   │       ├── layout.tsx  # Cover metadata (noindex)
│   │   │       ├── page.tsx    # Cover generator page
│   │   │       ├── components/
│   │   │       │   ├── CoverComposer.tsx   # THREE.js + Canvas compositor
│   │   │       │   └── CoverControls.tsx   # Controls panel
│   │   │       └── const/
│   │   │           └── index.ts    # Size presets, default state, SCENE_BG_COLOR
│   │   ├── contacts/
│   │   │   ├── layout.tsx      # Contacts metadata
│   │   │   ├── page.tsx        # Contacts page
│   │   │   ├── page.test.tsx
│   │   │   └── const/
│   │   │       └── seo.ts
│   │   └── login/
│   │       ├── layout.tsx      # Login metadata (noindex)
│   │       ├── page.tsx        # Login page
│   │       └── components/
│   │           └── LoginForm/
│   │               ├── LoginForm.tsx       # Formik + antd form
│   │               ├── submitHandler.ts    # useLoginSubmit hook
│   │               ├── index.ts            # Barrel export
│   │               └── validation/
│   │                   ├── schema.ts       # Zod schema + validate()
│   │                   └── index.ts
│   ├── proxy.ts                # Next.js middleware — auth gate for /blog/cover
│   └── shared/
│       ├── components/         # Cross-route UI components
│       │   ├── index.ts        # Barrel: AuthButton, Logo, SiteHeader, SiteFooter
│       │   ├── AuthButton/
│       │   │   └── AuthButton.tsx
│       │   ├── Logo/
│       │   │   ├── Logo.tsx
│       │   │   ├── Logo.test.tsx
│       │   │   └── Logo.stories.tsx
│       │   ├── SiteHeader/
│       │   │   ├── SiteHeader.tsx
│       │   │   ├── SiteHeader.module.css
│       │   │   ├── SiteHeader.test.tsx
│       │   │   └── SiteHeader.stories.tsx
│       │   └── SiteFooter/
│       │       ├── SiteFooter.tsx
│       │       ├── SiteFooter.module.css
│       │       ├── SiteFooter.test.tsx
│       │       └── SiteFooter.stories.tsx
│       ├── const/              # App-wide constants
│       │   ├── index.ts        # Barrel re-export
│       │   ├── routes.ts       # ROUTES object — single source for all paths
│       │   ├── navigation.ts   # NAV_LINKS, CHROME_HIDDEN_ROUTES, isChromeHidden
│       │   └── social.tsx      # SOCIAL_NAV — contact channels for footer + /contacts
│       ├── contexts/
│       │   └── UserContext.tsx  # UserProvider, useUser(), User type
│       ├── lib/                # Pure utility functions
│       │   ├── cookies.ts      # getCookie, hasCookie, deleteCookie, AUTH_COOKIES
│       │   ├── schemas.ts      # JSON-LD schema builders (Person, WebSite, etc.)
│       │   ├── site.ts         # Site-wide constants: NAME, SITE_URL, AVATAR, etc.
│       │   └── uploads.ts      # toProxiedUrl() — converts backend URLs to /api paths
│       └── providers/
│           └── AntdProvider.tsx  # antd dark theme + brand token config
├── config/
│   ├── jest.config.ts          # Jest config (pass via npm test; bare jest won't find it)
│   └── storybook/
│       ├── main.ts             # Storybook main config
│       └── preview.ts          # Storybook preview config
├── public/
│   ├── favicon/                # favicon.svg, favicon_32.png, favicon_64.png, favicon.png
│   └── images/
│       └── avatar.jpg          # 260×260 avatar (also 88×88 on home)
├── docker/
│   └── nginx-proxy/            # nginx aux config for production reverse-proxy
├── docs/                       # Internal docs
├── plans/                      # Planning files
├── .planning/
│   └── codebase/               # GSD codebase map documents
├── .claude/
│   └── skills/                 # Project Claude skills
├── Dockerfile                  # Production container (node:lts, npm install, build, start)
├── docker-compose.yml          # App + nginxproxy + acme-companion (Let's Encrypt)
├── next.config.ts              # Next.js config: /api/* → API_URL rewrite
├── tsconfig.json               # TypeScript config: @/* → ./src/* alias
└── .env.example                # Documents required env vars (committed)
```

## Directory Purposes

**`src/api/`:**
- Purpose: All HTTP communication with the backend, centralised in a single typed client
- Contains: The `API` object, `ApiError`, per-domain query files (`auth.ts`, `posts.ts`)
- Key files: `src/api/index.ts` (core client), `src/api/posts.ts` (post types and queries)

**`src/app/`:**
- Purpose: Next.js App Router — every route segment lives here
- Contains: `layout.tsx` files, `page.tsx` files, per-route `components/` and `const/` folders
- Key files: `src/app/layout.tsx` (root), `src/app/blog/page.tsx` (ISR), `src/app/blog/[slug]/page.tsx` (ISR)

**`src/shared/`:**
- Purpose: Everything used by more than one route
- Contains: `components/` (chrome UI), `const/` (ROUTES, NAV_LINKS), `contexts/` (auth), `lib/` (utilities), `providers/` (antd)
- Key files: `src/shared/const/routes.ts`, `src/shared/contexts/UserContext.tsx`, `src/shared/lib/site.ts`

**`config/`:**
- Purpose: Tooling configuration outside the repo root
- Contains: Jest config, Storybook config
- Key files: `config/jest.config.ts` (must pass `--config config/jest.config.ts`), `config/storybook/main.ts`

**`public/`:**
- Purpose: Static assets served directly
- Contains: Favicons, avatar image
- Note: No static `public/og.png` — OG image is generated by `src/app/opengraph-image.tsx`

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root layout — wraps every page with providers and chrome
- `src/proxy.ts`: Next.js middleware — auth gate for `/blog/cover`
- `src/api/index.ts`: HTTP client — entry point for all API calls

**Configuration:**
- `next.config.ts`: Next.js rewrites (`/api/*` → backend) and image domain config
- `tsconfig.json`: Path alias `@/*` → `./src/*`
- `config/jest.config.ts`: Jest configuration (jsdom, moduleNameMapper for `@/*`)
- `config/storybook/main.ts`: Storybook configuration

**Core Logic:**
- `src/shared/const/routes.ts`: All route path constants
- `src/shared/lib/site.ts`: All site-wide content constants (name, URL, avatar, social links)
- `src/shared/lib/schemas.ts`: JSON-LD schema builders
- `src/shared/contexts/UserContext.tsx`: Auth state management
- `src/app/blog/hooks/useInfinitePosts.ts`: Blog pagination state

**Testing:**
- `src/api/index.client.test.ts`, `src/api/index.server.test.ts`: API client tests
- `src/app/blog/components/PostCard/PostCard.test.tsx`: Component tests
- `src/app/blog/hooks/useInfinitePosts.test.tsx`: Hook tests

## Naming Conventions

**Files:**
- React components: `PascalCase.tsx` — e.g., `CylinderScene.tsx`, `PostCard.tsx`
- Non-component TypeScript: `camelCase.ts` — e.g., `submitHandler.ts`, `useInfinitePosts.ts`
- CSS Modules: `ComponentName.module.css` — co-located with the component
- Tests: `ComponentName.test.tsx` or `fileName.test.ts` — co-located with the subject
- Stories: `ComponentName.stories.tsx` — co-located with the component
- Barrel exports: `index.ts` (never `index.tsx` unless exporting JSX)

**Directories:**
- Route-level components: `components/ComponentName/ComponentName.tsx` (named folder + named file)
- Route-level constants: `const/index.ts` or `const/seo.ts`
- Shared components: `src/shared/components/ComponentName/ComponentName.tsx`

**Exports:**
- Named exports for all shared components and utilities (no default exports in `src/shared/`)
- Default exports for Next.js page and layout files (required by the framework)
- Barrel `index.ts` in `src/shared/components/` and `src/shared/const/` for clean import paths

## Where to Add New Code

**New public route (e.g., `/portfolio`):**
- Create `src/app/portfolio/layout.tsx` — metadata and SEO schemas
- Create `src/app/portfolio/page.tsx` — page component
- Create `src/app/portfolio/page.module.css` — scoped styles
- Create `src/app/portfolio/const/index.ts` — page copy and data
- Create `src/app/portfolio/components/` — page-specific components
- Add `{ label: "Portfolio", href: ROUTES.PORTFOLIO }` to `NAV_LINKS` in `src/shared/const/navigation.ts`
- Add `PORTFOLIO: "/portfolio"` to `ROUTES` in `src/shared/const/routes.ts`

**New THREE.js scene:**
- Create `src/app/<route>/components/<SceneName>/<SceneName>.tsx`
- Load in the page via `dynamic(() => import("..."), { ssr: false })`
- Follow the disposal pattern from `CylinderScene.tsx` — every geometry and material in cleanup arrays

**New API domain (e.g., comments):**
- Create `src/api/comments.ts` with typed query functions using `API.get/post`
- Export types from the same file; import `API` from `@/api`

**New shared component:**
- Create `src/shared/components/MyComponent/MyComponent.tsx`
- Add CSS Module at `src/shared/components/MyComponent/MyComponent.module.css`
- Add test at `src/shared/components/MyComponent/MyComponent.test.tsx`
- Re-export from `src/shared/components/index.ts`

**New cross-route constant:**
- Add to the appropriate file in `src/shared/const/` (`routes.ts`, `navigation.ts`, `social.tsx`)
- Re-export from `src/shared/const/index.ts` if not already

**New utility function:**
- Add to an existing `src/shared/lib/*.ts` file if it fits thematically (cookies, schemas, site, uploads)
- Create a new `src/shared/lib/myUtil.ts` if it is a distinct concern

**New route-local hook:**
- Create `src/app/<route>/hooks/useMyHook.ts`
- Add test at `src/app/<route>/hooks/useMyHook.test.tsx`

## Special Directories

**`.next/`:**
- Purpose: Next.js build output and cache
- Generated: Yes
- Committed: No

**`storybook-static/`:**
- Purpose: Static Storybook build output
- Generated: Yes (`npm run build-storybook`)
- Committed: No (gitignored)

**`coverage/`:**
- Purpose: Jest coverage report (`npm run test:ci`)
- Generated: Yes
- Committed: No

**`certs/`:**
- Purpose: Local TLS certificates for `npm run dev:https`
- Generated: Manually provisioned
- Committed: No (gitignored)

**`config/`:**
- Purpose: Tooling config (Jest, Storybook) kept out of the repo root
- Generated: No
- Committed: Yes

**`.planning/codebase/`:**
- Purpose: GSD codebase map documents written by Claude
- Generated: Yes (by `/gsd:map-codebase`)
- Committed: Yes (planning artifacts)

---

*Structure analysis: 2026-06-02*
