# Plan: Forgot / Reset Password page (AUTH-FP)

## Goal

Add a public `/reset-password` route that handles the full self-service password recovery flow. The same route serves two modes, selected by the presence of a `token` query parameter:

- **Request mode** (`/reset-password`, no token) — user enters their email; FE calls `POST /auth/forgot-password`.
- **Reset mode** (`/reset-password?token=…`) — token from the reset email is in the URL; user sets a new password; FE calls `POST /auth/reset-password`.

> Decisions: route path `/reset-password`; on reset success auto-redirect to `/login` (~2s) + manual link; build phase-by-phase with review between phases.

---

## Requirements

_From the request + backend contract (`test-be/src/modules/auth`)._

- New page for the forgot-password form.
- The reset token arrives in a **query parameter** (`?token=…`) — the reset email links back to `/reset-password?token=…`; the page reads it from the URL and drives the reset form with it.
- Talk to the backend `Auth` endpoints through the existing `/api` proxy:
  - `POST /auth/forgot-password` — body `{ email }`. Always returns `200` with a generic message (no account enumeration). 5 req/min rate limit.
  - `POST /auth/reset-password` — body `{ token, password, confirmPassword }`. Returns `200` on success, `400` on bad/expired token or weak password.
- Mirror backend validation so the FE fails fast:
  - email: required, valid email, ≤ 255 chars.
  - password: 8–72 chars, must contain a letter and a digit.
  - confirmPassword: must equal password.
  - token: 32–128 chars (treat as opaque; only used to gate the reset form).

---

## Architectural decisions

- **Single route, two modes** — one `/reset-password` page chooses Request vs Reset mode from `searchParams.get("token")`. Matches the email-link UX (the email points back to `/reset-password?token=…`) and keeps a single noindex route to maintain.
- **Route constant** — add `RESET_PASSWORD: "/reset-password"` to `ROUTES` and the `Route` union in `src/shared/const/routes.ts`. No raw path strings (per CLAUDE.md).
- **API layer** — extend `src/api/auth.ts` with two typed functions: `requestPasswordReset(email)` and `resetPassword(payload)`. Keep request/response types colocated there, consistent with `login`/`logout`.
- **Forms** — Formik + Zod + antd, mirroring `LoginForm` exactly (field render-props, `validateOnBlur`, `validateOnChange={false}`, antd `status="error"`). Two small form components instead of one branchy component, so each has a single responsibility:
  - `RequestResetForm` — email field → `requestPasswordReset`.
  - `ResetPasswordForm` — new password + confirm fields → `resetPassword(token)`.
- **Validation colocated** — `components/<Form>/validation/{schema.ts,index.ts}` per the existing LoginForm convention (Zod schema + `initialValues` + `validate` adapter).
- **Submit handlers** — `useRequestResetSubmit` / `useResetPasswordSubmit` hooks (mirroring `useLoginSubmit`) own the API call, `ApiError` handling, success state, and (reset success) redirect to `/login`.
- **Success states** — both forms render an inline success panel instead of the form once done:
  - Request: "If an account exists for that email, a reset link is on its way." (mirrors backend generic copy; no enumeration).
  - Reset: success message + auto-redirect to `/login` after a short delay, plus a manual "Go to sign in" link.
- **Page chrome** — reuse the login visual shell (animated blobs, noise, `AboutScene`, framer-motion stagger). Per the per-route CSS Modules convention, the page gets its own colocated `page.module.css` (same approach login/about already take — chrome is duplicated per route by design, not shared).
- **noindex** — `reset-password/layout.tsx` sets `robots: { index: false, follow: false, … }` and `alternates.canonical`, mirroring `login/layout.tsx`. Not added to `sitemap.ts`.
- **Login link** — add a "Forgot password?" link on the login card pointing at `ROUTES.RESET_PASSWORD`.
- **Brand orange `#fd7e14`** — already a CSS var / token in the reused styles; no new brand-color site added.

---

## Implementation Checklist

### ✅ Phase 1 — Routing + API + validation foundation

- **Step 1** — Add `RESET_PASSWORD: "/reset-password"` to `ROUTES` and `"/reset-password"` to the `Route` union in `src/shared/const/routes.ts`.
- **Step 2** — Extend `src/api/auth.ts`:
  - `type ForgotPasswordResponse = { message: string }`.
  - `type ResetPasswordPayload = { token: string; password: string; confirmPassword: string }`.
  - `requestPasswordReset(email: string): Promise<ForgotPasswordResponse>` → `API.post('/auth/forgot-password', { email })`.
  - `resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }>` → `API.post('/auth/reset-password', payload)`.

### ✅ Phase 2 — Page shell, layout, dual-mode switch

- **Step 1** — `src/app/reset-password/layout.tsx` — noindex metadata mirroring `login/layout.tsx` (title "Reset password", canonical `/reset-password`).
- **Step 2** — `src/app/reset-password/page.module.css` — copy the login page shell (page/blobs/noise/main/heroWrap/eyebrow/dot/headline/lead/card + responsive), plus a `.successPanel`, `.muted`, and `.backLink` style.
- **Step 3** — `src/app/reset-password/page.tsx` — client page: read `token` via `useSearchParams`, render Request vs Reset hero copy + the matching form inside the animated card, wrapped in `<Suspense>` (needed for `useSearchParams`). Reuse `AboutScene`, blobs, noise, framer-motion variants.

### ✅ Phase 3 — Forms, validation, submit handlers

- **Step 1** — `components/RequestResetForm/` — `validation/{schema.ts,index.ts}` (email schema), `submitHandler.ts` (`useRequestResetSubmit` → `requestPasswordReset`, success flag, `ApiError` message), `RequestResetForm.tsx`, `RequestResetForm.module.css` (or reuse a shared form module), `index.ts`.
- **Step 2** — `components/ResetPasswordForm/` — `validation/{schema.ts,index.ts}` (password + confirmPassword Zod with letter/digit + match refine), `submitHandler.ts` (`useResetPasswordSubmit({ token })` → `resetPassword`, success + redirect to `ROUTES.LOGIN`), `ResetPasswordForm.tsx` (antd `Input.Password` × 2), `index.ts`. Guard: if `token` is empty/invalid-length, render an inline "invalid or expired link" panel with a link back to request mode.
- **Step 3** — Wire both forms into `page.tsx`; add the "Forgot password?" link to `login/page.tsx`.

### ✅ Phase 4 — Tests + stories

- **Step 1** — Unit tests (`*.test.tsx`): `RequestResetForm` (validation error, success panel on resolve, error panel on `ApiError`) and `ResetPasswordForm` (mismatch + weak-password validation, success/redirect, invalid-token guard). Mock `@/api/auth`.
- **Step 2** — Stories (`*.stories.tsx`): default / error / success states for both forms.
- **Step 3** — Run `npm run lint` and `npm test` for the new files; fix fallout.

---

## Important Notes

- **Do not install packages** — Formik, Zod, antd, framer-motion are all already present.
- **Token is opaque** — the FE only length-checks the token to decide whether to show the reset form; the backend is the source of truth for validity (`400` → show error). Never log it.
- **No enumeration** — request-mode success copy must stay generic regardless of whether the email exists, matching the backend's identical `200` responses.
- **Auth cookies** — this flow sets no session; do **not** touch `UserContext` / `has_session`. After a successful reset, send the user to `/login` to sign in normally.
- **Chrome duplication is intentional** — per-route CSS Modules; copying the login shell into this route is the established pattern, not a refactor target.

---

## File manifest (new unless noted)

```
src/shared/const/routes.ts                                   (edit: +RESET_PASSWORD)
src/api/auth.ts                                              (edit: +2 fns/types)
src/app/login/page.tsx                                       (edit: +forgot link)
src/app/reset-password/layout.tsx
src/app/reset-password/page.tsx
src/app/reset-password/page.module.css
src/app/reset-password/components/RequestResetForm/RequestResetForm.tsx
src/app/reset-password/components/RequestResetForm/RequestResetForm.module.css
src/app/reset-password/components/RequestResetForm/submitHandler.ts
src/app/reset-password/components/RequestResetForm/index.ts
src/app/reset-password/components/RequestResetForm/validation/{schema.ts,index.ts}
src/app/reset-password/components/ResetPasswordForm/ResetPasswordForm.tsx
src/app/reset-password/components/ResetPasswordForm/ResetPasswordForm.module.css
src/app/reset-password/components/ResetPasswordForm/submitHandler.ts
src/app/reset-password/components/ResetPasswordForm/index.ts
src/app/reset-password/components/ResetPasswordForm/validation/{schema.ts,index.ts}
src/app/reset-password/components/RequestResetForm/RequestResetForm.test.tsx
src/app/reset-password/components/ResetPasswordForm/ResetPasswordForm.test.tsx
src/app/reset-password/components/RequestResetForm/RequestResetForm.stories.tsx
src/app/reset-password/components/ResetPasswordForm/ResetPasswordForm.stories.tsx
```
