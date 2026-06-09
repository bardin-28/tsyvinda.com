# Plan: End-to-end tests with Playwright (E2E-PW)

## Goal

Add a Playwright end-to-end test suite alongside the existing Jest unit tests.
Cover the public site (nav + content), blog rendering, the login form flow, and
the Cloudflare Turnstile-protected form path. Backend (`/api/*`) is mocked via
Playwright request interception so the suite is deterministic and needs no live
backend.

---

## Requirements

_List of provided requirements from customer_

- Add e2e tests with Playwright in addition to the current unit tests.
- Cover **Public nav + content**: Home, `/about`, `/contacts`, `/blog` render;
  header/footer nav links navigate; SEO basics (title, single `h1`).
- Cover **Login form**: Zod validation errors, mocked happy-path submit + redirect,
  `noindex` robots meta on `/login`.
- Cover **Forms + Turnstile**: invisible Turnstile token is obtained and forwarded
  in the request body on submit (recent feature on this branch).
- Cover **Blog rendering**: `/blog` list and `/blog/[slug]` article render from
  mocked API data.
- Install `@playwright/test` as the only new devDependency (approved).
- Config under `config/`, specs under top-level `e2e/` (approved).
- **CI/CD: add a test/lint stage that gates deploy.** Lint + unit + build + e2e
  must pass before the SSH deploy runs. Runs on PRs (early feedback) and on push
  to `main` (deploy gate). Full e2e (incl. Turnstile key-set project) in the gate.

---

## Architectural decisions

- **`@playwright/test` only** — single new devDependency. Browser binaries fetched
  with `npx playwright install chromium` (not committed). No other packages.
- **Config at `config/playwright.config.ts`** — mirrors the existing `config/`
  convention (jest, storybook already live there). `testDir` points at `../e2e`.
- **Specs in top-level `e2e/`** — kept out of `src/` so Jest (`src/**/*.test.tsx`)
  and Playwright never collide on file globs. No `.test.tsx` under `e2e/`; Playwright
  files use `*.spec.ts`.
- **`webServer` runs `next build` + `next start`** — production server, not `next dev`.
  ISR routes (`/blog`) and `noindex` metadata match prod behaviour, and HMR noise is
  avoided. `reuseExistingServer: !process.env.CI` so local reruns are fast.
  Port 3000, `API_URL` left default (backend never actually called — all `/api/*`
  intercepted).
- **API mocked via `page.route('**/api/**', …)`** — fixtures returned per route
  (`/api/posts`, `/api/posts/:slug`, `/api/auth/login`, `/api/profile`). No live
  backend, no flakiness. Fixtures live in `e2e/fixtures/`.
- **Turnstile: two modes**
  - *Keyless (default)* — `NEXT_PUBLIC_TURNSTILE_SITE_KEY` unset, so `useTurnstile`
    is disabled and `execute()` resolves `""`. Public/login/blog specs run this way;
    forms submit without a challenge. This is the existing keyless dev contract.
  - *Key-set (Turnstile spec only)* — build/run a second server with the test site
    key set, and stub `window.turnstile` via `page.addInitScript` to mimic the
    explicit-render widget (`render`/`execute`/`reset`/`remove`), firing the success
    `callback` with a known token. The spec asserts that token reaches the
    `cf-turnstile-response` field of the intercepted login request.
- **Chromium-only project to start** — one browser keeps CI fast; cross-browser can
  be added later by extending `projects[]`.
- **Cookie/auth shape** — login happy path: intercept `POST /api/auth/login` to
  return 200 and `Set-Cookie: has_session=1`, then intercept `GET /api/profile`
  with a user fixture so `UserProvider.refetch()` succeeds and the app redirects to
  `/profile`.
- **Lint scope** — add `e2e/` to ESLint coverage (or ignore) so the new files don't
  break `npm run lint`; keep `e2e/` out of the Next/Jest `tsconfig` build via a
  dedicated `config/tsconfig.e2e.json` referenced by the Playwright config only.
- **CI: gate-before-deploy in one workflow** — rework `.github/workflows/deploy.yml`
  into two jobs: `test` (lint → unit → build → e2e) and `deploy` (existing SSH step)
  with `deploy.needs: test` and `if: github.ref == 'refs/heads/main' && github.event_name == 'push'`.
  Triggers extended to `pull_request` + `push: main`. PRs run `test` only (no deploy);
  push to `main` runs `test` then `deploy`. A red `test` job blocks deploy entirely.
- **CI build runs once** — `test` job runs `npm run build` as an explicit step, then
  e2e uses `webServer: npm run start` (reusing that build) instead of rebuilding.
  Locally the Playwright config still builds on demand (`reuseExistingServer: !CI`).
  Turnstile key-set project rebuilds with its env in CI (separate, unavoidable).
- **CI Playwright deps** — `npx playwright install --with-deps chromium` step before e2e.
- **Node version** — pin CI `actions/setup-node` to the project's Node (lts, matches Dockerfile `node:lts`); `npm ci` not `npm install` for reproducible installs.

---

## API Endpoints

_Intercepted (mocked) — not implemented. Listed for fixture coverage._

| Method | Endpoint            | Description                                        |
|--------|---------------------|----------------------------------------------------|
| GET    | `/api/posts`        | Blog list — returns `{ items, nextCursor }` fixture |
| GET    | `/api/posts/:slug`  | Single post — returns `Post` fixture                |
| POST   | `/api/auth/login`   | Login — 200 + `Set-Cookie: has_session=1`           |
| GET    | `/api/profile`      | Current user — user fixture (post-login `refetch`)  |

---

## Implementation Checklist

### ✅ Phase 1 — Tooling: install, config, scripts, smoke test

- **Step 1** — Add `@playwright/test` to `devDependencies`; run install + `npx playwright install chromium`.
- **Step 2** — Create `config/playwright.config.ts`: `testDir: '../e2e'`, Chromium project,
  `webServer` = `npm run build && npm run start` on `http://localhost:3000`,
  `reuseExistingServer: !CI`, `baseURL`, trace `on-first-retry`.
- **Step 3** — Create `config/tsconfig.e2e.json` (extends root, includes `../e2e`) for Playwright type-checking only.
- **Step 4** — Add npm scripts: `test:e2e` (`playwright test -c config/playwright.config.ts`),
  `test:e2e:ui` (`--ui`), `test:e2e:report` (`playwright show-report`).
- **Step 5** — Update `.gitignore`: `/playwright-report/`, `/test-results/`, `/e2e/.auth/`, `/blob-report/`.
- **Step 6** — Extend ESLint flat config so `e2e/**` lints clean (or is ignored).
- **Step 7** — Add `e2e/smoke.spec.ts`: Home (`/`) loads, has expected `<title>`. Run `npm run test:e2e` green.

### ✅ Phase 2 — Public nav + content + blog rendering

- **Step 1** — `e2e/fixtures/posts.ts`: typed `PostsPage` + `Post` fixtures matching `src/api/posts.ts`.
- **Step 2** — `e2e/helpers/mockApi.ts`: reusable `page.route('**/api/**', …)` router dispatching to fixtures.
- **Step 3** — `e2e/public-nav.spec.ts`: `/`, `/about`, `/contacts` render; assert single `h1`,
  non-empty `<title>`; header `NAV_LINKS` + footer links navigate to correct routes.
- **Step 4** — `e2e/blog.spec.ts`: `/blog` shows mocked post cards; clicking a card → `/blog/[slug]`
  renders the article title/content from the `/api/posts/:slug` fixture.
- **Step 5** — Run suite green.

### ✅ Phase 3 — Login form flow

- **Step 1** — `e2e/login.spec.ts`: `/login` page renders; assert `noindex` robots meta present.
- **Step 2** — Validation: submit empty → Zod email/password errors visible; bad email → email error.
- **Step 3** — Happy path: fill valid creds, intercept `POST /api/auth/login` (200 + `has_session`) and
  `GET /api/profile` (user fixture), assert redirect to `/profile`.
- **Step 4** — Error path: intercept login → 401 with `{ message }`, assert inline `role="alert"` error shown.
- **Step 5** — Run suite green.

### ✅ Phase 4 — Forms + Turnstile (key-set mode)

- **Step 1** — `e2e/helpers/turnstileStub.ts`: `addInitScript` that defines `window.turnstile`
  (`render`/`execute`/`reset`/`remove`) firing the success `callback` with token `"e2e-turnstile-token"`.
- **Step 2** — Add a second Playwright project `turnstile` whose `webServer`/env sets
  `NEXT_PUBLIC_TURNSTILE_SITE_KEY` to Cloudflare's test key, scoped to `*.turnstile.spec.ts`.
- **Step 3** — `e2e/turnstile.spec.ts`: on `/login`, install the stub, submit valid creds, capture the
  intercepted `POST /api/auth/login` body, assert it carries `cf-turnstile-response: "e2e-turnstile-token"`.
- **Step 4** — Assert keyless contract too: with no key, submit still fires login with empty token field
  (guards the `execute()` → `""` disabled path).
- **Step 5** — Run suite green.

### ✅ Phase 5 — Verify, document, report

- **Step 1** — Full run: `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e` — all green.
- **Step 2** — Short `e2e/README.md`: how to run, how API mocking + Turnstile stub work.
- **Step 3** — Write `docs/reports/e2e-playwright.md` from the report template; flag any plan deviations.

### ✅ Phase 6 — CI/CD: test stage gates deploy

- **Step 1** — Rework `.github/workflows/deploy.yml` triggers: `pull_request` (all branches into main) + `push: { branches: [main] }`.
- **Step 2** — Add `test` job (ubuntu-latest): checkout → `setup-node` (lts, npm cache) → `npm ci`
  → `npx playwright install --with-deps chromium` → `npm run lint` → `npm test` → `npm run build` → `npm run test:e2e`.
- **Step 3** — Set e2e `webServer` to `npm run start` (build already produced in the `build` step) so CI builds once.
- **Step 4** — Add `deploy` job: `needs: test`, `if: github.event_name == 'push' && github.ref == 'refs/heads/main'`,
  containing the existing SSH deploy step unchanged.
- **Step 5** — Upload `playwright-report/` as a CI artifact on failure (`if: failure()`) for debugging.
- **Step 6** — Validate workflow YAML (syntax + job graph). Document the new gate in the report.

---

## Important Notes

- **No live backend.** Every `/api/*` call is intercepted; nothing hits `API_URL`.
- **Two server modes** for Turnstile (keyless default + key-set project) — the key-set
  run rebuilds with `NEXT_PUBLIC_TURNSTILE_SITE_KEY` baked in (it is a build-time
  `NEXT_PUBLIC_` var), so it cannot share the keyless server.
- **HttpOnly cookies** (`access`/`refresh`) are never asserted from JS — only the
  JS-visible `has_session` flag drives the post-login UI, matching the real contract.
- **Do not** add `*.test.ts` under `e2e/` or `*.spec.ts` under `src/` — the two runners
  must stay on disjoint globs.
- **No package additions beyond `@playwright/test`** without asking.
- **Deploy stays SSH-based and unchanged** — Phase 6 only adds a gate in front of it;
  the `deploy` job body (build + `docker compose up`) is the current script verbatim.
- **Branch protection** (requiring the `test` check on PRs) is a GitHub repo setting,
  not a file — flag it in the report as a manual follow-up for the maintainer.
- Phase-by-phase: stop for developer review after each phase before continuing.