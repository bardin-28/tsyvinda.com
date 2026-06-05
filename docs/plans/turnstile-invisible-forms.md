# Plan: Cloudflare Turnstile invisible check on all forms (frontend)

## Goal

Add a Cloudflare Turnstile invisible (managed / interaction-only) bot check to every form in the app. The challenge runs on submit; the frontend sends the resulting token to the backend as `cf-turnstile-response` so the backend can verify it server-side (backend verification is **out of scope here** — implemented separately by the backend team). Frontend only: `test-fe`. No new npm packages — the widget uses the raw Cloudflare browser script and `window.turnstile`.

---

## Requirements

_List of provided requirements from customer_

- Connect Cloudflare Turnstile invisible check to all forms.
- The Turnstile **site key** already exists in the frontend env as `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
- Do not install extra packages — use the native Cloudflare script.
- **Frontend parts only** — obtain the token and send it; backend verification is done separately.
- Token transport: body field **`cf-turnstile-response`** (Cloudflare's standard field name).
- Cover all 5 forms: login, registration, request password reset, reset password, profile update.

---

## Architectural decisions

_Provide list of planned decisions with short description_

- **Self-contained `src/shared/turnstile/` module** — All client Turnstile logic in one folder (loader, hook, types, constants, barrel). Forms depend only on `useTurnstile`; removing the feature means deleting the folder and unwiring 5 call sites.
- **Singleton script loader** — `loadTurnstile()` injects `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit` once, caches the load promise, SSR-guarded. All 5 hook instances share one `<script>`. No `layout.tsx` edit — loads lazily only on form pages.
- **`useTurnstile()` hook** — Returns `{ containerRef, execute, reset, isEnabled }`. Renders an invisible/interaction-only widget into `containerRef` when the script is ready; `execute(): Promise<string>` runs the challenge and resolves the token (rejects on error/timeout).
- **Graceful no-op when key absent** — With an empty `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (keyless dev, Jest, Storybook), `useTurnstile` returns `isEnabled: false` and `execute` resolves to `""`. Keeps existing tests/Storybook green without per-form conditionals.
- **Token sent as `cf-turnstile-response`** — Each form's `submitHandler` awaits `execute()`, then passes the token to the API function, which adds `'cf-turnstile-response': token` to the JSON body (profile appends it to the existing `FormData`). On `execute()` rejection the handler sets the existing `submitError` state and bails before the API call.
- **Explicit local typings** — `types.ts` declares the minimal `window.turnstile` surface (`render`, `execute`, `reset`, `remove`) + `Window` augmentation. No `@types` package.

---

## API Endpoints

_No new endpoints. The following existing endpoints gain a `cf-turnstile-response` field in the request the frontend sends (backend reads/verifies it separately):_

| Method   | Endpoint                | Turnstile field location                          |
|----------|-------------------------|---------------------------------------------------|
| POST     | `/auth/login`           | JSON body `cf-turnstile-response`                 |
| POST     | `/auth/register`        | JSON body `cf-turnstile-response`                 |
| POST     | `/auth/forgot-password` | JSON body `cf-turnstile-response`                 |
| POST     | `/auth/reset-password`  | JSON body `cf-turnstile-response`                 |
| PATCH    | `/profile`              | multipart/form-data field `cf-turnstile-response` |

---

## Implementation Checklist

### [x] Phase 1 — Core Turnstile module + unit tests

- **Step 1** — `src/shared/turnstile/types.ts`: `TurnstileApi`, `TurnstileRenderOptions`, `Window` augmentation.
- **Step 2** — `src/shared/turnstile/constants.ts`: `TURNSTILE_SITE_KEY` (`process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""`), `TURNSTILE_SCRIPT_SRC`, `TURNSTILE_EXECUTE_TIMEOUT_MS`, `TURNSTILE_TOKEN_FIELD = "cf-turnstile-response"`.
- **Step 3** — `src/shared/turnstile/loadTurnstile.ts`: SSR-guarded singleton script loader returning `Promise<TurnstileApi>`.
- **Step 4** — `src/shared/turnstile/useTurnstile.ts`: the hook (invisible `execution: "execute"`, `appearance: "interaction-only"` widget; `execute`/`reset`/`isEnabled`; `turnstile.remove` on unmount).
- **Step 5** — `src/shared/turnstile/index.ts`: barrel.
- **Step 6** — Tests: `loadTurnstile.test.ts` (singleton + SSR guard); `useTurnstile.test.tsx` (no-key no-op; mocked `window.turnstile` resolves token; error-callback rejects). Run `npm test`.

### [x] Phase 2 — Wiring: forms + submit handlers + API functions

- **Step 1** — `src/api/auth.ts`: add a `turnstileToken` parameter to `login`, `register`, `requestPasswordReset`, `resetPassword`; include `[TURNSTILE_TOKEN_FIELD]: turnstileToken` in each POST body.
- **Step 2** — `src/api/profile.ts`: `updateProfile` appends `cf-turnstile-response` to the `FormData` (token passed by the caller).
- **Step 3** — `LoginForm`: `useLoginSubmit` awaits injected `verifyTurnstile()`, passes token to `login`; `LoginForm.tsx` mounts `useTurnstile()` + invisible container.
- **Step 4** — `RegisterForm`: same wiring through `useRegisterSubmit` + `register`.
- **Step 5** — `RequestResetForm`: same through `useRequestResetSubmit` + `requestPasswordReset`.
- **Step 6** — `ResetPasswordForm`: same through `useResetPasswordSubmit` + `resetPassword`.
- **Step 7** — `ProfileForm`: `useProfileSubmit` awaits `verifyTurnstile()`, passes token to `updateProfile`; `ProfileForm.tsx` mounts `useTurnstile()` + invisible container.
- **Step 8** — Add an invisible-container CSS rule per affected module so the empty widget div causes no layout shift.

### [x] Phase 3 — Verify

- **Step 1** — `npm run lint` — clean.
- **Step 2** — `npm test` — all suites pass (existing form/api tests + new turnstile tests).
- **Step 3** — `npm run build` — production build succeeds.
- **Step 4** — `npm run build-storybook` — Storybook static build succeeds (keyless no-op keeps stories rendering).
- **Step 5** — Write the report to `docs/reports/turnstile-invisible-forms.md`.

---

## Important Notes

- **Backend verification is out of scope.** The frontend sends `cf-turnstile-response`; until the backend validates it against Cloudflare `siteverify`, the token is unchecked and the gate only affects the client UI. The field name is the contract the backend must read.
- **Site key must stay `NEXT_PUBLIC_`-prefixed** — the widget renders client-side; a non-public var is `undefined` in the browser.
- **Field name `cf-turnstile-response` defined once** as `TURNSTILE_TOKEN_FIELD` and reused across all 5 API calls.
- **Keyless no-op** — empty `NEXT_PUBLIC_TURNSTILE_SITE_KEY` makes `execute()` resolve to `""`, so Jest/Storybook/keyless dev keep working with no per-form conditionals.
- **No Storybook story** — the widget is invisible with no visual states; `useTurnstile` is a hook/util, covered by unit tests instead.
- **Profile is behind auth** — included per "all forms".
