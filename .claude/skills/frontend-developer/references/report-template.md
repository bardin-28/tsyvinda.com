# Report: {Feature name} ({JIRA issue number. ex. ARC-123})

**Status**: ⬜ Planned · 🚧 In progress · ✅ Delivered
**Date**: YYYY-MM-DD
**Plan**: `docs/plans/{feature-slug}.md` <!-- if a plan exists -->
**Branch / PR**: `feature/{slug}` → #{PR}

---

## 1. Goal

One paragraph: what this feature delivers and the problem it solves. State what was
**deliberately deferred** so scope is unambiguous.

---

## 2. Scope delivered

### Pages / routes
<!-- omit if no routing surface -->

| Route | Component | Auth | Notes |
| ----- | --------- | ---- | ----- |
| `/x` | `(XContent)` | authed | added to `ROUTES` / `ROUTES_ARR` |

### Components
<!-- presentational + container components added/changed -->

| Component | Type | Module | Reuses |
| --------- | ---- | ------ | ------ |
| `XForm` | container | `modules/X` | `CustomInput`, `CustomButton` |

### API consumed
<!-- omit if no HTTP surface — thunks / React Query calls this feature hits -->

| Method | Path | Layer | Shape in → out |
| ------ | ---- | ----- | -------------- |
| POST | `/x` | RTK thunk `createX` | `{...}` → `{...}` |

---

## 3. Tech used & why

For each notable library / pattern: **what** + **why this over the alternative**.
Make the trade-off explicit, not just the choice. Prefer existing project deps —
flag any new package (must be approved before adding, per SKILL.md).

| Choice | Why | Alternative rejected (and why) |
| ------ | --- | ------------------------------ |
| `lib@x` | <reason it fits this project> | `other` — <why not> |

- **<Pattern / decision>** — what it is, why chosen, what it costs.

---

## 4. State management

- **Redux slice** — new/changed slice, dynamic reducer injection (`ReducerManager.add`), declared in `StateSchema`.
- **Selectors** — one-per-file selectors added.
- **React Query** — query keys, cache/invalidation strategy, server-state vs client-state split.
- **URL state** — pagination/filter params read from search params to keep URL ↔ state in sync.
- **Forms** — React Hook Form + Zod schema location and validation rules.

---

## 5. Security

Cover every item that applies; write `N/A — <reason>` for the rest.

- **AuthN / route gating** — `AuthedAdminLayout` vs `UnAuthedAdminLayout`; what renders for unauthenticated users; role/permission gating on UI.
- **Token handling** — auth token in `localStorage`, attached via request interceptor; never rendered into the DOM or logged; 401 refresh flow untouched/affected.
- **Input validation** — Zod schema on all form input; length/format caps mirrored client-side.
- **XSS / sanitization** — no `dangerouslySetInnerHTML` without sanitize; untrusted strings escaped; URL/href validation.
- **Data exposure** — what fields rendered to the user; PII not leaked into logs/console/error toasts.
- **CORS / cookies** — `withCredentials` requests; no token in query string.
- **Dependencies** — any new package's security posture; confirmed/approved before adding.

---

## 6. File layout

```
src/modules/{name}/
  api/
  components/
    ({Name}Content)/
  store/
    slice/
    selectors/
  ...
```

Touched outside the module:

- `src/shared/const/routes.tsx` — ...
- `src/shared/...` — ...

Deleted / replaced:

- `...`

---

## 7. Accessibility & i18n

- **a11y** — ARIA labels on interactive elements, keyboard nav, focus management, contrast.
- **i18n** — all user-facing strings via i18next; new keys + namespaces added; no hardcoded copy.

---

## 8. UX states & responsiveness

- **Loading** — skeletons / spinners on async surfaces.
- **Empty** — empty-data handling.
- **Error** — error boundaries / toast / inline messages.
- **Responsive** — mobile breakpoints verified; hover/transition states added.

---

## 9. Performance

- **Code-splitting / lazy** — lazily loaded routes/components, if any.
- **Memoization** — `memo`/`useMemo`/`useCallback` on hot paths; list virtualization.
- **Bundle impact** — notable size change from new deps; tree-shaking confirmed.
- **Render cost** — avoided unnecessary re-renders (selector granularity, stable refs).

---

## 10. Testing & Storybook

| File | Tests | Coverage |
| ---- | ----- | -------- |
| `X.test.tsx` | N | ... |

**Total: N files / N tests / status.**

- **Stories** — `.stories` files added for new important components.
- Note test discoveries / gotchas (mock shapes, async render quirks, RTL queries).

---

## 11. CI / build status

| Step | Result |
| ---- | ------ |
| `npm run eslint` | |
| `npm run stylelint` | |
| `npm run test:unit` | |
| `npm run build:prod` | |
| `npm run storybook` (build) | |

> Pre-commit hooks (Husky) run `eslint:fix`, `eslint`, `stylelint:fix`, `stylelint`, `test:unit`.

---

## 12. Decisions & deviations

- **<Decision>** — what changed vs the plan and why. Flag anything that touched a shared
  model/component (per SKILL.md: change only when the task requires it — say what & why).

---

## 13. Known issues / risks

- ...

---

## 14. Out of scope (follow-ups)

- ...
