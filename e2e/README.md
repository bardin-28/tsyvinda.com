# End-to-end tests (Playwright)

Browser-level tests that exercise real routes against a production build. They
complement the Jest unit suite (`src/**/*.test.tsx`) — they do **not** replace it.

## Run

```bash
npm run test:e2e            # all projects (chromium + turnstile), headless
npm run test:e2e:ui         # Playwright UI mode (watch / pick tests)
npm run test:e2e:report     # open the last HTML report
npm run test:e2e -- --project=chromium    # keyless suite only
npm run test:e2e -- --project=turnstile   # Turnstile spec only
```

First run on a machine needs the browser binary once:

```bash
npx playwright install chromium          # local
npx playwright install --with-deps chromium   # CI / Linux
```

Config lives at `config/playwright/playwright.config.ts` (mirrors the `config/`
convention — Jest is under `config/jest/`, Storybook under `config/storybook/`).
Specs are `e2e/**/*.spec.ts`; they are kept out of `src/` so the two runners
never share a glob.

## How content is mocked

No live backend is required. Mocking happens at two layers:

1. **Mock HTTP backend** (`e2e/mock-server/server.mjs`, port 4010) — the blog list
   and articles are **server-rendered**, so their data is fetched in Node, not the
   browser. `page.route` (browser-only) cannot intercept those. The Playwright
   config points the Next server's `API_URL` at this mock, which serves
   `/posts` and `/posts/:slug` from `e2e/fixtures/posts.mjs`. The same mock also
   backs browser `/api/*` calls via the Next rewrite.

2. **`page.route` per test** (`e2e/helpers/auth.ts`) — client-side auth calls
   (login submit, profile refetch) run in the browser, so they are intercepted
   per-test to drive happy-path / error scenarios without touching the mock
   backend. The login interceptor also seeds the `has_session` cookie, which the
   `proxy` middleware (`src/proxy.ts`) requires to allow `/profile`.

Image URLs in fixtures are empty on purpose: the components fall back to
placeholders/initials, so the suite never fetches a remote image and stays
fully offline and deterministic.

## Turnstile

`useTurnstile` is enabled only when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set, and
that value is inlined at build time. So there are two server builds:

- **chromium project** (port 3000) — built with the key forced empty, so the
  widget is disabled and `execute()` resolves `""`. Forms submit without a
  challenge. The keyless contract is asserted in `login.spec.ts`.

- **turnstile project** (port 3001, `.next-e2e` build dir) — built with a test
  site key so the widget is enabled. `e2e/helpers/turnstileStub.ts` installs a
  fake `window.turnstile` via `addInitScript`, so the real Cloudflare script is
  never loaded. `turnstile.spec.ts` asserts the stubbed token is forwarded in the
  login request's `cf-turnstile-response` field.

The separate build dir (`NEXT_DIST_DIR=.next-e2e`, wired through `next.config.ts`)
keeps the keyed build from clobbering the default one.

## Layout

```
e2e/
  fixtures/        posts.mjs, user.mjs   — shared by mock server + specs
  helpers/         auth.ts (page.route), turnstileStub.ts
  mock-server/     server.mjs            — Node http backend for SSR data
  *.spec.ts        smoke, public-nav, blog, login, turnstile
config/
  jest/        jest.config.ts  jest.setup.ts
  playwright/  playwright.config.ts  tsconfig.e2e.json
```
