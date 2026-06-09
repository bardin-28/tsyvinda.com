# tsyvinda.com

Personal website for Vladyslav Tsyvinda — [tsyvinda.com](https://tsyvinda.com).

Public routes: `/` (intro hero), `/about` (bio/stack/experience), `/contacts`,
`/blog` (+ `/blog/[slug]` articles). Authenticated area: `/login`, `/registration`,
`/reset-password`, `/profile`. Auth talks to a separate backend through a Next
rewrite proxy.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- Styling: per-route **CSS Modules** + one `globals.css` (no Tailwind)
- Animations: `framer-motion` · 3D: raw `three` (`THREE.WebGLRenderer`)
- Forms: `formik` + `zod` · UI primitives: `antd ^6` (dark theme)
- Bot protection: Cloudflare **Turnstile** (invisible) on auth forms
- Unit tests: **Jest 30** + Testing Library (jsdom) · E2E: **Playwright**
- Component workshop: **Storybook 10**

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

For end-to-end auth testing (HttpOnly `Secure` cookies need HTTPS):

```bash
npm run dev:https    # https://local.tsyvinda.com:443
```

Needs `./certs/local.tsyvinda.com{,-key}.pem`.

## Commands

| Command | What |
| --- | --- |
| `npm run dev` | Dev server on :3000 |
| `npm run dev:https` | Dev server on https://local.tsyvinda.com:443 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (flat config) |
| `npm test` | Jest unit tests (`config/jest/jest.config.ts`) |
| `npm run test:watch` | Jest watch mode |
| `npm run test:ci` | Jest with coverage → `/coverage` |
| `npm run test:e2e` | Playwright e2e (`config/playwright/playwright.config.ts`) |
| `npm run test:e2e:ui` | Playwright UI mode |
| `npm run test:e2e:report` | Open the last Playwright HTML report |
| `npm run storybook` | Storybook on :6006 |
| `npm run build-storybook` | Static Storybook → `/storybook-static` |

## Project layout

```
src/
  app/             App Router routes (route groups, per-route components/ + const/)
  shared/          api client, contexts, providers, const, cross-page components
  api/             typed backend calls (posts, auth, profile)
  proxy.ts         middleware gating /profile and /blog/cover on a session cookie
config/
  jest/            jest.config.ts  jest.setup.ts
  playwright/      playwright.config.ts  tsconfig.e2e.json
  storybook/       main.ts  preview.tsx
e2e/               Playwright specs, fixtures, mock backend (see e2e/README.md)
docs/              plans/ and reports/
```

Path alias: `@/*` → `./src/*`.

## Testing

- **Unit** — `src/**/*.test.{ts,tsx}`, run with `npm test`.
- **E2E** — Playwright suite under `e2e/`, run with `npm run test:e2e`. Runs
  against a production build with a mocked backend (no live API). Covers public
  nav + content, blog rendering, login flow, and the Turnstile-protected submit
  path. Details in [`e2e/README.md`](./e2e/README.md).

## API client

Lightweight `fetch` wrapper at `src/api/index.ts`. Cookie-based auth (`credentials: 'include'`). Auto JSON serialize/parse, query params, `ApiError` on non-2xx, single 401 retry via `/auth/refresh`.

```ts
import { API, ApiError } from '@/api';

// GET
const user = await API.get<User>('/profile');

// GET with query params
const list = await API.get<User[]>('/users', {
  params: { page: 1, limit: 20, search: 'john' },
});

// POST JSON
const created = await API.post<User>('/users', {
  name: 'John',
  email: 'john@example.com',
});

// PUT / PATCH
await API.put<User>('/users/42', { name: 'Jane' });
await API.patch<User>('/users/42', { name: 'Jane' });

// DELETE
await API.delete<void>('/users/42');

// FormData (skips JSON serialization)
const fd = new FormData();
fd.append('file', file);
await API.post('/upload', fd);

// Custom headers and abort
const controller = new AbortController();
const data = await API.get<Thing>('/thing', {
  headers: { 'X-Custom': '1' },
  signal: controller.signal,
});

// Error handling
try {
  await API.get('/secret');
} catch (e) {
  if (e instanceof ApiError) {
    console.log(e.status, e.data);
  }
}

// Raw escape hatch
await API.request<T>('/path', { method: 'POST', body: { foo: 1 } });
```

Behavior:
- Cookies sent on every request — no token storage on the client.
- `X-Timezone` header auto-set from `Intl.DateTimeFormat`.
- JSON body auto-serialized; `Content-Type: application/json` set unless body is `FormData` / `Blob` / `string`.
- Response auto-parsed: JSON when `Content-Type` includes `application/json`, otherwise text.
- 401 → calls `GET /auth/refresh` once (only when `has_session` is present), retries original request. Second 401 throws.
- Non-2xx throws `ApiError { status, data }`.

## Auth & API proxy

`next.config.ts` rewrites `/api/:path*` → `${API_URL}/:path*` (default
`http://localhost:4000`); frontend code always calls relative `/api/…`. Auth is
cookie-based: the backend sets `access` + `refresh` (HttpOnly) and `has_session`
(JS-readable). Only `has_session` is observable client-side.

## Environment

| Var | Purpose |
| --- | --- |
| `API_URL` | Backend origin for the `/api` proxy (default `http://localhost:4000`) |
| `GA_ID` | Google Analytics measurement ID (GA skipped if unset) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key (forms run keyless if empty) |

`.env.example` is committed; `.env.local` / `.env.production` are gitignored.

## Deployment

Containerised via the root `Dockerfile` (`node:lts`, `npm install`, `next build`,
`npm start` on port 3000). `compose.yaml` runs the app behind
`nginxproxy/nginx-proxy` + `acme-companion` for Let's Encrypt TLS.

CI (`.github/workflows/deploy.yml`): a `test` job runs lint → unit → build → e2e
on every PR and on push to `main`; the `deploy` job (`needs: test`) runs the SSH
deploy only after the gate passes on a push to `main`.
