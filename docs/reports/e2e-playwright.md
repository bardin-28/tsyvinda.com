# Report: End-to-end tests with Playwright (E2E-PW)

**Status**: ✅ Delivered — Phases 1–6 complete
**Date**: 2026-06-09
**Plan**: `docs/plans/e2e-playwright.md`
**Branch / PR**: `feat/turnstile-forms` → (no PR yet)

---

## 1. Goal

Add a Playwright end-to-end suite alongside the existing Jest unit tests, covering
the public site (nav + content), blog rendering, the login flow, and the Cloudflare
Turnstile-protected submit path. The suite runs against a production build with no
live backend — all data is mocked. A CI `test` stage (lint + unit + build + e2e)
now gates deploy: the SSH deploy runs only after the gate passes on a push to `main`.

---

## 2. Scope delivered

### Pages / routes

No application routes were added or changed. Existing routes are exercised by the
suite: `/`, `/about`, `/contacts`, `/blog`, `/blog/[slug]`, `/login`, `/profile`.

### Components

No application components added or changed. Test infrastructure added under `e2e/`:

| Artifact | Type | Module | Reuses |
| --- | --- | --- | --- |
| `mock-server/server.mjs` | Node http backend | `e2e` | `fixtures/posts.mjs` |
| `helpers/auth.ts` | `page.route` interceptors | `e2e` | `fixtures/user.mjs` |
| `helpers/turnstileStub.ts` | `addInitScript` stub | `e2e` | — |
| `fixtures/{posts,user}.mjs` | data fixtures | `e2e` | — |

### API consumed (mocked)

| Method | Path | Layer | Shape in → out |
| --- | --- | --- | --- |
| GET | `/posts` | mock backend (SSR) | `—` → `{ items, nextCursor }` |
| GET | `/posts/:slug` | mock backend (SSR) | `—` → `Post` / 404 |
| POST | `/api/auth/login` | `page.route` (browser) | `{ email, password, cf-turnstile-response }` → `User` + `has_session` |
| GET | `/api/profile` | `page.route` (browser) | `—` → `User` |

---

## 3. Tech used & why

| Choice | Why | Alternative rejected (and why) |
| --- | --- | --- |
| `@playwright/test` | Only new dep; first-class Next support, request interception, multi-project, trace viewer | Cypress — heavier, weaker multi-server/project story |
| Node `http` mock backend (`.mjs`) | SSR data is fetched in Node; `page.route` can't reach it. Plain ESM runs with bare `node`, zero build step | `msw/node` — another dep; not approved and unnecessary |
| `page.route` for auth | Login/profile fetches are client-side, so per-test browser interception is the right layer | Routing auth through the mock backend — loses per-test control of success/error |
| `addInitScript` Turnstile stub | Deterministic, offline; real widget needs network + yields non-deterministic tokens | Real Cloudflare test key — network dependency + flakiness |
| Second keyed build via `NEXT_DIST_DIR` | `NEXT_PUBLIC_*` is inlined at build time, so the enabled-Turnstile path needs its own build; separate dist dir avoids clobbering | One build — cannot represent both keyless and keyed states |

- **Production build for e2e** — `next build` + `next start`, so ISR (`/blog`) and
  `noindex` (`/login`) behave as in production. Cost: slower than `next dev`.
- **Two Playwright projects** — `chromium` (keyless, :3000) and `turnstile`
  (keyed, :3001), selected by filename regex `/turnstile\.spec\.ts$/`.

---

## 4. State management

N/A — no application state changed. Test-side "state": fixtures are static modules;
the login `page.route` handler seeds a `has_session` cookie via
`context.addCookies` to satisfy the `proxy` middleware after a mocked login.

---

## 5. Security

- **AuthN / route gating** — Verified, not changed. `src/proxy.ts` gates `/profile`
  on `has_session`/`refresh`; the login spec confirms an unauthenticated visit is
  redirected to `/login?from=…` and that a (mocked) session is required to land on
  `/profile`.
- **Token handling** — Unchanged. Tests never read HttpOnly `access`/`refresh`;
  only the JS-visible `has_session` flag is seeded, matching the real contract.
- **Input validation** — The login spec asserts the Zod rules (required email,
  email format, min password length) surface as inline errors.
- **XSS / sanitization** — N/A — no rendering code changed.
- **Data exposure** — Fixtures use synthetic data (`user@example.com`); no real PII.
- **CORS / cookies** — Suite relies on the existing `credentials: 'include'` flow;
  nothing changed.
- **Dependencies** — One new devDependency (`@playwright/test`), approved. Browser
  binary fetched via `playwright install`, not committed.
- **Turnstile** — The keyless build forces an empty site key in test env only; the
  real key in `.env*` is untouched. The stub keeps the bypass inside the test
  harness, never in app code.

---

## 6. File layout

```
e2e/
  fixtures/    posts.mjs  user.mjs
  helpers/     auth.ts  turnstileStub.ts
  mock-server/ server.mjs
  README.md
  smoke.spec.ts  public-nav.spec.ts  blog.spec.ts  login.spec.ts  turnstile.spec.ts
config/
  jest/        jest.config.ts  jest.setup.ts
  playwright/  playwright.config.ts  tsconfig.e2e.json
```

Touched outside `e2e/`:

- `next.config.ts` — added env-driven `distDir` (`NEXT_DIST_DIR ?? ".next"`) so the
  keyed e2e build uses a separate output dir.
- `package.json` — `@playwright/test` devDep + `test:e2e` / `test:e2e:ui` /
  `test:e2e:report` scripts.
- `tsconfig.json` — `exclude: ["node_modules", "e2e"]` (keep e2e out of the
  Next/Jest build); Next auto-added `.next-e2e/types` include globs.
- `eslint.config.mjs` — ignore `.next-e2e/**`, `playwright-report/**`,
  `test-results/**`, `blob-report/**`.
- `.gitignore` — ignore `/.next-e2e/`, `/playwright-report`, `/test-results`,
  `/blob-report`, `/e2e/.auth`.
- `.github/workflows/deploy.yml` — reworked into a `test` gate (lint → unit →
  build → e2e, on PR + push `main`) and a `deploy` job (`needs: test`, push-`main`
  only) holding the unchanged SSH deploy step.

Deleted / replaced: none.

---

## 7. Accessibility & i18n

- **a11y** — Specs assert via accessible roles/names (`getByRole("menuitem")`,
  `getByRole("button", { name: "Sign in" })`, the post card `aria-label`), which
  doubles as a light accessibility check of those affordances. No a11y changes made.
- **i18n** — N/A — project has no i18n layer; copy is asserted as literal strings.

---

## 8. UX states & responsiveness

- **Loading** — N/A — no UI added.
- **Empty** — N/A for now; empty blog-list state is a documented follow-up.
- **Error** — The login spec covers the inline backend-error state (`role="alert"`).
- **Responsive** — Not exercised; viewport-matrix testing is a documented follow-up.

---

## 9. Performance

- **Code-splitting / lazy** — N/A — no app code added.
- **Memoization** — N/A.
- **Bundle impact** — None; `@playwright/test` is a devDependency, not shipped.
- **Suite cost** — Two production builds per full run (keyless + keyed). Mitigated
  in Phase 6: CI builds the keyless app once and the keyed build runs only for the
  Turnstile project.

---

## 10. Testing & Storybook

| File | Tests | Coverage |
| --- | --- | --- |
| `smoke.spec.ts` | 1 | home boots + title |
| `public-nav.spec.ts` | 6 | 4 routes (one h1 + title), header nav, footer nav |
| `blog.spec.ts` | 3 | list cards, list→article nav, second article |
| `login.spec.ts` | 5 | noindex, Zod errors, happy path, inline error, keyless token |
| `turnstile.spec.ts` | 1 | token forwarded in `cf-turnstile-response` |

**Total: 5 files / 16 tests / all passing.**

- **Stories** — N/A — no new components, so no `.stories` files.
- Discoveries: SSR blog data needs a real backend (mock server, not `page.route`);
  `.env.local` bakes the Turnstile key so "keyless" must be forced in test env;
  `getByRole("alert")` also matches Next's route announcer; the Turnstile project
  regex must match the bare `turnstile.spec.ts` filename.

---

## 11. CI / build status

| Step | Result |
| --- | --- |
| `npm run lint` | ✅ No issues |
| `npm test` (Jest unit) | ✅ 19 suites / 88 tests |
| `npm run build` | ✅ Production build OK |
| `npm run test:e2e` | ✅ 16/16 (chromium + turnstile) |
| `npm run build-storybook` | Not re-run — no Storybook surface changed |

> Enforced in CI by `.github/workflows/deploy.yml`: the `test` job runs lint →
> unit → build → e2e on every PR and on push to `main`; the `deploy` job
> (`needs: test`) runs only on push to `main`. A failed gate blocks deploy.

---

## 12. Decisions & deviations

- **Mock HTTP backend instead of `page.route` for content** — The plan assumed
  `page.route` for all `/api/*`. Blog list + article are SSR (fetched in Node), which
  `page.route` cannot intercept, so a Node mock backend at `API_URL` was added.
  `page.route` is retained for client-side auth. (Shared model untouched.)
- **Forced-keyless default build** — Added `NEXT_PUBLIC_TURNSTILE_SITE_KEY: ""` to
  the default server's test env after discovering `.env.local` bakes the key in.
- **`next.config.ts` `distDir` knob** — Added (env-driven, defaults to `.next`) only
  because the keyed/keyless dual build requires isolated outputs. This is a shared
  config file; the change is opt-in and inert for normal dev/build/deploy.
- **Project selection by regex** — `*.turnstile.spec.ts` glob did not match the bare
  `turnstile.spec.ts`; switched both projects to `/turnstile\.spec\.ts$/`.

---

## 13. Known issues / risks

- Full local run does two production builds (~slower). CI splits this (Phase 6).
- `reuseExistingServer` is on locally; a stale dev server on 3000/3001 with a
  different `API_URL`/key would be reused and skew results. CI starts fresh.
- Chromium-only; no Firefox/WebKit coverage yet.

---

## 14. Out of scope (follow-ups)

- **Branch protection** requiring the `test` check on PRs — GitHub repo setting,
  not a file; must be enabled manually by the maintainer for the gate to actually
  block merges (the workflow runs it, but only branch protection enforces it).
- Empty/error states for the blog list; responsive/viewport matrix; cross-browser.
- Registration / reset-password / profile-edit form e2e coverage.
