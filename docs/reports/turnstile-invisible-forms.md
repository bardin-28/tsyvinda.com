# Report: Cloudflare Turnstile invisible check on all forms (frontend)

**Status**: ✅ Delivered
**Date**: 2026-06-05
**Plan**: `docs/plans/turnstile-invisible-forms.md`
**Branch / PR**: `feat/registration-page` (current working branch) → not yet opened

---

## 1. Goal

Adds a Cloudflare Turnstile invisible (managed / interaction-only) bot check to every form in the app. The challenge runs on submit; the form awaits a verification token before calling its API, and the token is sent to the backend as `cf-turnstile-response`. No extra npm packages were added — the widget is driven through the raw Cloudflare browser script and `window.turnstile`. **Deliberately deferred:** backend verification of the token against Cloudflare `siteverify` is out of scope (to be implemented by the backend team); until then the token is sent but unverified, so the gate only affects the client UI.

---

## 2. Scope delivered

### Components

| Component | Type | Module | Reuses |
| --------- | ---- | ------ | ------ |
| `useTurnstile` | hook | `shared/turnstile` | `loadTurnstile`, `constants` |
| `loadTurnstile` | util | `shared/turnstile` | — |
| `LoginForm` | container | `app/login/.../LoginForm` | `useTurnstile`, `useLoginSubmit` |
| `RegisterForm` | container | `app/registration/.../RegisterForm` | `useTurnstile`, `useRegisterSubmit` |
| `RequestResetForm` | container | `app/reset-password/.../RequestResetForm` | `useTurnstile`, `useRequestResetSubmit` |
| `ResetPasswordForm` | container | `app/reset-password/.../ResetPasswordForm` | `useTurnstile`, `useResetPasswordSubmit` |
| `ProfileForm` | container | `app/profile/.../ProfileForm` | `useTurnstile`, `useProfileSubmit` |

### API consumed

| Method | Path | Layer | Shape in → out |
| ------ | ---- | ----- | -------------- |
| POST | `/auth/login` | `api/auth.login(credentials, token)` | `{email, password, cf-turnstile-response}` → `User` |
| POST | `/auth/register` | `api/auth.register(payload, token)` | `{...register, cf-turnstile-response}` → `{message}` |
| POST | `/auth/forgot-password` | `api/auth.requestPasswordReset(email, token)` | `{email, cf-turnstile-response}` → `{message}` |
| POST | `/auth/reset-password` | `api/auth.resetPassword(payload, token)` | `{token, password, confirmPassword, cf-turnstile-response}` → `{message}` |
| PATCH | `/profile` | `api/profile.updateProfile(form, token)` | `FormData` (+ `cf-turnstile-response`) → `User` |

---

## 3. Tech used & why

| Choice | Why | Alternative rejected (and why) |
| ------ | --- | ------------------------------ |
| Raw Cloudflare `api.js` + `window.turnstile` | Requirement: no extra packages; full control of explicit render | `react-turnstile` / `@marsidev/react-turnstile` — new dependency, disallowed |
| Singleton script loader | One `<script>` shared by all 5 forms; avoids duplicate loads | Per-form `next/script` — duplicate tags / no shared promise |
| Hook-injected `verifyTurnstile` into submit handlers | Reuses each form's existing `submitError` UI; keeps logic in `submitHandler` (project convention) | Wrapping Formik `onSubmit` in the form — would duplicate error rendering |

- **Keyless no-op** — when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is empty, `useTurnstile` is disabled and `execute()` resolves `""`. Cost: a disabled key silently skips the check; benefit: Jest/Storybook/keyless dev run unchanged.
- **`execution: "execute"` + `appearance: "interaction-only"`** — the widget is invisible until a submit triggers it, and only surfaces UI if Cloudflare demands interaction.

---

## 4. State management

- **Forms** — Formik + Zod (existing). No schema changes; the Turnstile token is not a form field — it is obtained imperatively at submit time via `execute()`.
- **Hook-local refs** — `useTurnstile` holds the widget id, API handle, and the single in-flight challenge (resolve/reject + timeout) in refs; no global/Redux state.
- **URL state** — unchanged.

---

## 5. Security

- **AuthN / route gating** — unchanged. Profile remains behind `requireAuth`; its Turnstile check runs client-side only.
- **Token handling** — the Turnstile token is a short-lived verification token, sent in the request body as `cf-turnstile-response`. It is never persisted, logged, or rendered into the DOM. Auth cookie/401-refresh flow untouched.
- **Input validation** — existing Zod schemas unchanged.
- **XSS / sanitization** — no `dangerouslySetInnerHTML`; the Cloudflare script loads from the official origin only.
- **⚠️ Verification gap** — **the backend does not yet verify the token.** Until it validates `cf-turnstile-response` against Cloudflare `siteverify`, the check is bypassable and provides no real bot protection. Tracked as a follow-up.
- **Dependencies** — no new packages added.

---

## 6. File layout

```
src/shared/turnstile/
  types.ts            # window.turnstile typings (no @types pkg)
  constants.ts        # site key, script src, token field, timeout
  loadTurnstile.ts    # singleton script loader
  useTurnstile.ts     # hook: render invisible widget, execute()
  index.ts            # barrel
  loadTurnstile.test.ts
  useTurnstile.test.tsx
```

Touched outside the module:

- `src/api/auth.ts` — `login`/`register`/`requestPasswordReset`/`resetPassword` take a `turnstileToken` arg, send `cf-turnstile-response`.
- `src/api/profile.ts` — `updateProfile` appends `cf-turnstile-response` to `FormData`.
- `src/app/login/.../LoginForm.tsx` + `submitHandler.ts`
- `src/app/registration/.../RegisterForm.tsx` + `submitHandler.ts`
- `src/app/reset-password/.../RequestResetForm.tsx` + `submitHandler.ts`
- `src/app/reset-password/.../ResetPasswordForm.tsx` + `submitHandler.ts`
- `src/app/profile/.../ProfileForm.tsx` + `submitHandler.ts`
- 5 `*.module.css` — added `.turnstile` (out-of-flow, 0×0) container rule.
- 4 form test files — mock `@/shared/turnstile`, assert the token arg.

Deleted / replaced: none.

---

## 7. Accessibility & i18n

- **a11y** — the invisible container has no interactive role; existing form labels/ARIA unchanged. Cloudflare manages its own challenge-overlay a11y when interaction is required.
- **i18n** — project has no i18n layer; the one new user-facing string ("Verification failed. Please try again.") follows the existing inline-copy pattern in each `submitHandler`.

---

## 8. UX states & responsiveness

- **Loading** — existing `isSubmitting` button states reused; `execute()` runs before the API call, inside the same submit cycle.
- **Empty** — N/A.
- **Error** — challenge failure routes to each form's existing `submitError` alert ("Verification failed. Please try again.").
- **Responsive** — `.turnstile` is absolutely positioned at 0×0, out of flex flow, so it adds no layout shift on any breakpoint.

---

## 9. Performance

- **Code-splitting / lazy** — the Cloudflare script loads lazily on first form mount (not in the root layout), shared across forms via a cached promise.
- **Memoization** — `execute`/`reset`/`failPending`/`resolvePending` are `useCallback`-stable; the render effect depends only on `isEnabled`.
- **Bundle impact** — no new npm deps; the external script is not bundled.
- **Render cost** — refs (not state) hold the widget/challenge, avoiding re-renders on challenge lifecycle.

---

## 10. Testing & Storybook

| File | Tests | Coverage |
| ---- | ----- | -------- |
| `loadTurnstile.test.ts` | 3 | singleton, shared promise, error-clears-cache |
| `useTurnstile.test.tsx` | 3 | disabled no-op, token resolve, error reject |

**Total: 2 new files / 6 new tests / all pass. Full suite: 88/88 pass.**

- **Stories** — none added; the widget is invisible with no visual states (hook/util, not presentational). Covered by unit tests.
- **Gotchas:** (1) `jest.isolateModules` created a dual-React instance (null `useRef`) — replaced with a mocked `./constants` live getter for the site key. (2) Hook test needs a real DOM node for `containerRef` — used a harness component, assigning the hook result in an effect (lint forbids render-phase reassignment / ref access). (3) 4 existing form tests now mock `@/shared/turnstile` for determinism and assert the `""` token arg.

---

## 11. CI / build status

| Step | Result |
| ---- | ------ |
| `npm run lint` | ✅ pass |
| `npm test` | ✅ 88/88 pass |
| `npm run build` | ✅ pass (15 routes, TypeScript ✓) |
| `npm run build-storybook` | ✅ pass (asset-size warnings only, pre-existing) |

> `npm run build` and `npm run build-storybook` were run with the command sandbox disabled — `next/font` needs network access to Google Fonts and Next stats `.env*` files, both blocked by the sandbox. Not code-related.

---

## 12. Decisions & deviations

- **Token sent, not discarded** — an earlier plan revision had the check FE-only with the token discarded; the final requirement sends `cf-turnstile-response` so the backend can verify later. Backend implementation itself was then scoped out at the user's request.
- **Submit-handler injection** — `verifyTurnstile` is passed into each existing `submitHandler` hook rather than wrapping Formik `onSubmit`, to reuse the existing `submitError` UI. This changed 5 hook signatures (additive) and the 5 API function signatures (additive token arg). No shared models were refactored.

---

## 13. Known issues / risks

- **No backend verification yet** (see §5) — the gate is client-side only and bypassable until the backend validates the token.
- **Site key must be `NEXT_PUBLIC_`-prefixed** — a non-public var would be `undefined` in the browser and silently disable the check.
- **Field-name contract** — `cf-turnstile-response` is defined once on the FE (`TURNSTILE_TOKEN_FIELD`); the backend must read the same key.

---

## 14. Out of scope (follow-ups)

- Backend `siteverify` verification of `cf-turnstile-response` on the 5 endpoints (login, register, forgot-password, reset-password, profile).
- Setting `NEXT_PUBLIC_TURNSTILE_SITE_KEY` per environment and the backend secret key in `test-be`.
