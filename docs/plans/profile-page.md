# Plan: Authenticated Profile Page (PROFILE)

## Goal

Add a `/profile` page for authenticated users that displays all profile fields the backend exposes. Fields render read-only by default; an **Edit** button switches editable fields into an inputtable state, validated with Zod, saved via `PATCH /profile`. **Cancel** restores the last saved values.

---

## Requirements

_From customer + Swagger (`GET`/`PATCH` `/profile`)._

- Page reachable only by authenticated users.
- Show every field returned by `GET /profile`: `id`, `firstName`, `lastName`, `email`, `profileImageUrl`, `emailVerified`, `createdAt`.
- All fields read-only on load. Clicking **Edit** makes the editable fields inputtable; **Save** commits, **Cancel** reverts.
- Editable fields are exactly what `PATCH /profile` accepts: `firstName`, `lastName`, profile image (upload `image`, or clear via `removeImage="true"`).
- Read-only / non-editable: `id`, `email`, `emailVerified`, `createdAt` (backend exposes no PATCH field for them).
- Form uses Formik + Zod validation (matches existing `LoginForm` pattern).
- Image rules: jpeg/png/webp, max 5 MB, `image` and `removeImage` are mutually exclusive.

---

## API contract (verified against live Swagger)

`GET /profile` → `200`:
```json
{
  "id": "uuid",
  "firstName": "Vladyslav",
  "lastName": "Tsyvinda",
  "email": "vladyslav@tsyvinda.com",
  "profileImageUrl": null,
  "emailVerified": true,
  "createdAt": "2026-05-20T21:32:36.216Z"
}
```

`PATCH /profile` — `multipart/form-data`, all parts optional:
- `firstName` — string
- `lastName` — string
- `removeImage` — `"true"` to clear existing image
- `image` — binary (jpeg/png/webp, ≤5 MB), mutually exclusive with `removeImage`

Returns the updated profile (same shape as GET).

---

## Architectural decisions

- **Fix the `User` type to match `/profile`** — current `User = { id; email; name?; avatar? }` does not match the live response and `UserContext` already calls `GET /profile`. Replace with `{ id; email; firstName; lastName; profileImageUrl: string | null; emailVerified: boolean; createdAt: string }`. Grep confirms `name`/`avatar` are never read anywhere (only the type defines them), so this is a required correction, not opportunistic refactor — explained in Phase 1 summary.
- **New API module `src/api/profile.ts`** — `getProfile()` and `updateProfile(form: FormData)`. Keeps endpoint calls colocated like `src/api/auth.ts`. The shared `API` helper already forwards `FormData` untouched (no `Content-Type` set → browser adds the multipart boundary), so multipart works without helper changes.
- **Route + auth gate** — add `ROUTES.PROFILE = "/profile"` (and `Route` union member). Extend `src/proxy.ts` matcher to cover `/profile`, reusing the existing optimistic cookie check + `from` redirect. Page route `/profile` does not collide with the `/api/:path*` rewrite.
- **Per-route folder convention** — `src/app/profile/{page.tsx, layout.tsx, page.module.css}` + `components/ProfileForm/` + `const/`. `layout.tsx` sets `robots: noindex` (authed area, like `/login`).
- **Read-only ↔ edit via local state** — `ProfileForm` holds an `isEditing` boolean. In read mode it renders static value rows; in edit mode the editable fields become antd `Input` / image control inside one Formik form. Non-editable fields stay static in both modes.
- **Image handling** — antd `Upload` (controlled, `beforeUpload` returns `false` to prevent auto-POST) holds a pending `File`. State machine per save: pending file → append `image`; user cleared an existing image → append `removeImage="true"`; otherwise omit both. Client-side validate type + size before enabling save.
- **Submit + context sync** — on success, response updates `UserContext` via `setUser`, exits edit mode, shows success feedback. Errors surface inline (reuse `ApiError` shape like `submitHandler.ts`).
- **Profile entry point** — `AuthButton` currently only shows Log out when authed; add a profile link next to it (or a small menu) so the page is reachable from chrome. Keep scope minimal: a "Profile" `Link` shown when `user` is present.

---

## Implementation Checklist

### ☑ Phase 1 — Data layer (types + API module)

- **Step 1** — Update `User` type in `src/shared/contexts/UserContext.tsx` to the verified `/profile` shape (`id, email, firstName, lastName, profileImageUrl, emailVerified, createdAt`). Confirm `login()` return type in `src/api/auth.ts` still compiles (it reuses `User`).
- **Step 2** — Create `src/api/profile.ts`: `getProfile(): Promise<User>` (`API.get('/profile')`) and `updateProfile(form: FormData): Promise<User>` (`API.patch('/profile', form)`).
- **Step 3** — Point `UserContext.fetchUser` at `getProfile()` (currently inlines `API.get('/profile')`) for a single source of truth. No behavioural change.
- **Step 4** — `npx tsc --noEmit` (or `npm run build` typecheck) green.

### ☑ Phase 2 — Routing + auth gate + entry point

- **Step 1** — Add `PROFILE: "/profile"` to `ROUTES` and `"/profile"` to the `Route` union in `src/shared/const/routes.ts`.
- **Step 2** — Extend `src/proxy.ts` `config.matcher` to include `/profile` and `/profile/:path*`; set the redirect `from` param to the requested path (generalise the current hardcoded `BLOG_COVER`).
- **Step 3** — Scaffold route: `src/app/profile/page.tsx` (client, renders `ProfileForm`), `layout.tsx` (metadata: title "Profile", `robots: noindex` like login), `page.module.css` (page shell, reuse login/about visual language).
- **Step 4** — Add a "Profile" `Link` (→ `ROUTES.PROFILE`) in `AuthButton` shown only when `user` is truthy, beside Log out.

### ☑ Phase 3 — ProfileForm component

- **Step 1** — `components/ProfileForm/validation/schema.ts`: Zod schema for `firstName`, `lastName` (required, trimmed, 1–50 chars) + Formik `validate` adapter mirroring `LoginForm`. Image validated separately (type/size) since it is a `File`, not a string.
- **Step 2** — `const/` for static copy/config (field labels, accepted image MIME list, max-size constant, date formatter).
- **Step 3** — `ProfileForm.tsx`: read-only value rows for all fields; `isEditing` toggle; in edit mode render antd `Input` for first/last name and an avatar upload/remove control; `emailVerified` shown as a badge; `createdAt` formatted; `email`/`id` shown but never editable. Edit / Save / Cancel buttons. Loading state (uses `useUser().loading`), empty/error state when profile fails to load.
- **Step 4** — `submitHandler.ts`: build `FormData` (append changed `firstName`/`lastName`; `image` for a pending file; `removeImage="true"` when an existing image was cleared and no new file). Call `updateProfile`, `setUser(response)`, exit edit mode, surface `ApiError.message` inline.
- **Step 5** — `ProfileForm.module.css`: read/edit row styling, avatar preview, responsive (mobile single column), hover/focus states, transitions. Brand `#fd7e14` for primary affordances.
- **Step 6** — Accessibility: `aria-label`s on Edit/Save/Cancel and the image control, `role="alert"` on errors, labels tied to inputs, focus moved to first field on entering edit mode.
- **Step 7** — `npm run lint` clean.

### ☑ Phase 4 — Tests + story

- **Step 1** — `ProfileForm.test.tsx` (`src/app/profile/components/ProfileForm/ProfileForm.test.tsx`): renders read-only values; Edit reveals inputs; Zod errors on empty name; Save calls `updateProfile` with expected `FormData`; Cancel reverts. Mock `@/api/profile` and `useUser`.
- **Step 2** — `ProfileForm.stories.tsx`: states — read-only, editing, with avatar, without avatar, loading, error.
- **Step 3** — `npm test` (profile tests pass) + `npm run lint`. Re-check end-to-end, propose optimisations.

---

## Important Notes

- **`User` type change is task-required, not opportunistic** (CLAUDE.md rule 1) — the old shape never matched the API. Documented in Phase 1 summary.
- **No new packages** — antd 6, formik, zod, framer-motion all already in `package.json`.
- Auth gate in `proxy.ts` is optimistic (cookie presence only); backend stays source of truth on the PATCH call. Same trust model as existing `/blog/cover` gate.
- Multipart works through the existing `API` helper unchanged — do **not** set `Content-Type` for `FormData`.
- Brand orange `#fd7e14` lives in four places (CLAUDE.md) — only CSS Module styling is touched here; no token/manifest/three.js change needed.

---

## Out of scope

- Password change / email change (no backend field).
- Avatar cropping/resizing UI (upload raw file; backend validates).
