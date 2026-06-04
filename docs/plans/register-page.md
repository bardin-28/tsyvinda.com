# Plan: Registration page (`/registration`)

## Goal

Add a public `/registration` route with a registration form that posts to the
backend `POST /auth/register` endpoint, mirroring the existing login /
reset-password auth flows in structure, styling, and validation. On success the
backend sends a verification email and returns `201 { message }`; the form shows
a "check your inbox" confirmation panel instead of logging the user in.

---

## Requirements

- New page with a registration form wired to `POST /auth/register`
  (`https://api.tsyvinda.com/docs/#/Auth/post_auth_register`).
- Collect `firstName`, `lastName`, `email`, `password`, `confirmPassword`.
- Client validation mirroring the backend contract (see API section).
- Surface backend errors (e.g. `409` email already registered) inline.
- Success state: no auto-login — registration only triggers a verification
  email, so show a "verification email sent" confirmation panel.
- Follow existing per-route conventions, CSS Modules styling, accessibility,
  loading states, unit tests, and a Storybook story.

---

## Architectural decisions

- **Reuse the reset-password page shell** — `/registration` copies the
  `reset-password` page scaffold (animated blobs, noise overlay, `AboutScene`
  dynamic import, framer-motion stagger) for visual consistency. Page-level CSS
  is duplicated as a colocated `page.module.css` (the project keeps per-route
  CSS Modules; no shared auth layout exists today, and CLAUDE.md forbids
  opportunistic refactors).
- **`RegisterForm` colocated component** — under
  `src/app/registration/components/RegisterForm/` with the established
  `validation/` + `submitHandler.ts` split, matching `LoginForm` /
  `ResetPasswordForm`.
- **`register()` API helper in `src/api/auth.ts`** — add a typed `register()`
  function next to `login` / `resetPassword`, returning the `{ message }`
  response shape already used by the password-reset helpers
  (`PasswordResetMessage`).
- **Client schema mirrors backend `registerBodySchema`** — Zod schema with the
  same field limits and password policy; `confirmPassword` checked via
  `superRefine`, identical to `resetPasswordSchema`.
- **Submit handler returns `isSubmitted`** — like `useRequestResetSubmit`; the
  form swaps to a success panel (mail icon, "Check your inbox") on `201`. No
  router redirect, no `useUser` refetch (the user is not authenticated yet).
- **Route constant** — add `REGISTER: "/register"` to `ROUTES` and the `Route`
  union in `src/shared/const/routes.ts`.
- **Cross-links** — add a "Don't have an account? Create one" link on the login
  page, and a "Already have an account? Sign in" link in the register form
  footer.
- **`noindex` metadata** — `register/layout.tsx` mirrors `login` /
  `reset-password` (`robots: index:false`); sitemap is unchanged (it lists only
  `/` and `/about`).

---

## API Endpoints

| Method | Endpoint         | Description                                                                 |
|--------|------------------|-----------------------------------------------------------------------------|
| POST   | `/auth/register` | Register a user. `201 { message }` on success; `409` email already registered; `400` validation error. |

Request body (mirrors backend `registerBodySchema`):

| Field             | Rule                                                        |
|-------------------|-------------------------------------------------------------|
| `firstName`       | string, trimmed, 1–50 chars                                 |
| `lastName`        | string, trimmed, 1–50 chars                                 |
| `email`           | valid email, ≤255 chars                                     |
| `password`        | 8–72 chars, ≥1 letter and ≥1 digit                          |
| `confirmPassword` | must equal `password`                                       |

---

## Implementation Checklist

### ☑ Phase 1 — API helper + route constant

- **Step 1** — Add `RegisterPayload` type and `register()` to `src/api/auth.ts`
  (`API.post<PasswordResetMessage>('/auth/register', payload)`).
- **Step 2** — Add `REGISTER: "/register"` to `ROUTES` and `"/register"` to the
  `Route` union in `src/shared/const/routes.ts`.

### ☑ Phase 2 — RegisterForm component (validation + submit + UI)

- **Step 1** — `validation/schema.ts` + `validation/index.ts`: Zod
  `registerSchema` (firstName, lastName, email, password, confirmPassword) with
  `initialValues` and the `validate()` adapter used by Formik.
- **Step 2** — `submitHandler.ts`: `useRegisterSubmit()` returning
  `{ onSubmit, submitError, isSubmitted }`; calls `register()`, sets
  `isSubmitted` on success, maps `ApiError` → inline message.
- **Step 3** — `RegisterForm.tsx`: Formik form (antd `Input` / `Input.Password`,
  all fields stacked full-width), password hint, inline errors, `role="alert"`
  submit error, success panel ("Check your inbox" mail icon), footer link to
  login. `RegisterForm.module.css` colocated.
- **Step 4** — `index.ts` barrel for the component.

### ☑ Phase 3 — Route page, layout, styles, login cross-link

- **Step 1** — `src/app/registration/page.tsx` (page shell mirroring
  reset-password) + `page.module.css`.
- **Step 2** — `src/app/registration/layout.tsx` with `noindex` metadata.
- **Step 3** — Add "Create one" link to `src/app/login/page.tsx`.

### ☑ Phase 4 — Tests, story, verification

- **Step 1** — `RegisterForm.test.tsx`: weak password rejected, mismatched
  passwords rejected, successful submit shows confirmation, `409` backend
  message surfaced.
- **Step 2** — `RegisterForm.stories.tsx`: `Default` story.
- **Step 3** — Run `npm test`, `npm run lint`, `npm run build`; fix issues.

---

## Important Notes

- **No auto-login on register.** Backend only emails a verification link;
  `has_session` is not set, so the form must not redirect into the
  authenticated area or call `useUser().refetch()`.
- **Password policy must match the backend exactly** (8–72, letter + digit) to
  avoid a client/server validation mismatch.
- **Brand orange `#fd7e14`** stays consistent with the other auth pages via the
  reused CSS Module values; no new global colour.
- **Do not install packages** — formik, zod, antd, framer-motion are already
  present.
- Email verification / confirm-email landing page is **out of scope** for this
  task (separate `confirmEmailBodySchema` endpoint exists on the backend).
