# Coding Conventions

**Analysis Date:** 2026-06-02

## Naming Patterns

**Files:**
- React components: PascalCase matching the component name — `PostCard.tsx`, `SiteHeader.tsx`, `LoginForm.tsx`
- CSS Modules: PascalCase matching the component — `PostCard.module.css`, `SiteHeader.module.css`
- Hooks: camelCase prefixed with `use` — `useInfinitePosts.ts`, `submitHandler.ts` (when exporting a hook `useLoginSubmit`)
- Utilities/libs: camelCase — `cookies.ts`, `uploads.ts`, `schemas.ts`
- Constant/data files: `index.ts` or descriptive camelCase — `const/index.ts`, `const/seo.ts`
- Test files: same name as subject with `.test.` infix — `PostCard.test.tsx`, `useInfinitePosts.test.tsx`
- Story files: same name as subject with `.stories.` infix — `PostCard.stories.tsx`

**Functions:**
- Regular functions: camelCase — `buildUrl`, `getAuthorInitials`, `hasCookie`, `toProxiedUrl`
- React components: PascalCase named exports — `export function PostCard(...)`, `export function SiteHeader()`
- React hooks: camelCase prefixed with `use` — `useInfinitePosts`, `useLoginSubmit`, `useUser`
- Boolean-returning functions: prefixed with `is`/`has` — `isChromeHidden`, `hasCookie`

**Variables:**
- camelCase throughout — `fetchMock`, `basePost`, `submitError`, `isFetchingRef`
- Constants at module scope: SCREAMING_SNAKE_CASE — `ROUTES`, `NAV_LINKS`, `AUTH_COOKIES`, `POSTS_PAGE_SIZE`, `EASE`, `API_URL`
- Type-only object maps: SCREAMING_SNAKE_CASE — `AUTH_COOKIES`, `SOCIAL_LINKS`

**Types and Interfaces:**
- PascalCase, prefer `type` over `interface` — `type Post`, `type UserContextValue`, `type LoginValues`
- Props types named `[ComponentName]Props` — `type PostCardProps`, `type CoverComposerProps`
- Handle types named `[ComponentName]Handle` — `type CoverComposerHandle`
- Exported enum-like objects use `as const` — `ROUTES`, `AUTH_COOKIES`

## Code Style

**Formatting:**
- No Prettier config detected — formatting is maintained manually
- Double quotes for JSX attribute strings; single quotes for non-JSX TS strings (mixed in codebase: `api/index.ts` uses single quotes, `PostCard.tsx` uses double quotes — follow the file's existing style)
- Trailing commas in multi-line objects and arrays
- Semicolons present throughout

**Linting:**
- ESLint flat config at `eslint.config.mjs`
- Rule sets: `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`
- No custom rule overrides beyond the ignores list
- TypeScript strict mode enabled in `tsconfig.json` (`"strict": true`)

## Import Organization

**Order (observed pattern):**
1. React/framework imports — `import { useState, useEffect } from "react"`, `import Link from "next/link"`
2. Third-party libraries — `import { motion } from "framer-motion"`, `import * as THREE from "three"`
3. Internal `@/` alias imports — `import { ROUTES } from "@/shared/const"`, `import { API } from "@/api"`
4. Relative sibling imports — `import styles from "./PostCard.module.css"`, `import { validate } from "./validation"`

**Path Aliases:**
- `@/*` maps to `./src/*` — use for all cross-directory imports
- Example: `import { useUser } from "@/shared/contexts/UserContext"` not `../../shared/contexts/UserContext`

**Barrel Files:**
- `src/shared/components/index.ts` — re-exports all shared components
- `src/shared/const/index.ts` — re-exports all constants and nav helpers
- `src/app/login/components/LoginForm/index.ts` — re-exports `LoginForm`
- `src/app/login/components/LoginForm/validation/index.ts` — re-exports schema/validation helpers
- Within-component imports use direct relative paths, not the barrel

## `"use client"` Directive

- Required at the top of any file using React hooks, browser APIs, or event handlers
- Server components (no hooks, no browser APIs) omit it — e.g. `src/app/blog/[slug]/page.tsx`
- Three.js scenes are always client components and always loaded via `next/dynamic` with `ssr: false`

## Error Handling

**API errors:**
- `ApiError` class in `src/api/index.ts` carries `status: number` and `data: unknown`
- Catch blocks check `instanceof ApiError` before accessing typed fields:
  ```typescript
  if (err instanceof ApiError) {
    const data = err.data as { message?: string } | null;
    setSubmitError(data?.message ?? "Login failed");
  } else {
    setSubmitError("Unexpected error. Try again.");
  }
  ```
- Hook-level errors stored in `error: Error | null` state — components decide display

**Context errors:**
- `useUser()` throws synchronously if called outside `UserProvider`:
  ```typescript
  if (ctx === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  ```

**Try/finally pattern:**
- `setLoading(false)` / `setSubmitting(false)` always in `finally` block — never in both try and catch

**Single debug `console.log`:**
- `src/api/index.ts:84` contains `console.log('UNAUTHORIZED')` inside the 401 retry catch — this is a leftover debug log, not an intentional logging strategy

## Logging

There is no structured logging library. The single `console.log` at `src/api/index.ts:84` is the only console usage in production code and appears incidental.

## Comments

**When to comment:**
- JSDoc-style block comments on utilities that need behavioral context — `src/shared/lib/uploads.ts` and `src/shared/const/navigation.ts` both have leading block comments
- Inline comments for non-obvious side-effect cleanup (`// Close on Escape (and return focus to the trigger) and on outside click.`)
- No comments for self-explanatory code

**Pattern:**
```typescript
/**
 * Converts an absolute upload URL … to a root-relative path …
 * so requests are proxied through the Next.js server …
 */
export function toProxiedUrl(url: string | null | undefined): string | undefined {
```

## Function Design

**Size:** Functions are small and focused. Multi-step logic is split into helpers (e.g. `buildUrl`, `refreshTokens`, `getAuthorInitials`, `wrapText`).

**Parameters:**
- Destructured at the function signature level:
  ```typescript
  export function PostCard({ post }: PostCardProps) { ... }
  const { body, params, headers, _isRetry, ...rest } = options;
  ```
- Options objects used for optional config — `type RequestOptions`, `type UseLoginSubmitOptions`

**Return values:**
- Explicit return types only where needed for clarity (e.g. `function isActive(...): boolean`)
- Async functions return `Promise<T>` inferred from the body
- `void` operator used to intentionally discard promises: `void fetchPage(null, true)`, `void logout()`

**Callbacks and closures:**
- Memoize with `useCallback` for all functions passed as props or used in `useEffect` deps
- `useRef` for values that must not trigger re-renders (`isFetchingRef`, `cursorRef`, `hasMoreRef`)

## Module Design

**Exports:**
- Named exports throughout — no default exports for components (`export function SiteHeader()`)
- Exception: Next.js page and layout files use default exports as required by App Router (`export default function About()`)
- API module exports `API` object + `ApiError` class as named exports from `src/api/index.ts`

**Const modules:**
- Route-local data lives in `[route]/const/index.ts` or `[route]/const/seo.ts`
- Shared constants in `src/shared/const/` barrel
- No magic strings — all route paths via `ROUTES.*`

## Three.js Scenes

- All scenes are loaded via `next/dynamic` with `ssr: false` — never imported statically
- Every geometry, material, and renderer created in a scene must be added to disposal arrays and called in the cleanup `useEffect` return function
- Scenes set `aria-hidden="true"` on their mount container since they are decorative

## Form Validation

- Formik handles form state; Zod defines the schema; a bridge adapter converts Zod errors to Formik's error shape
- Schema defined in `validation/schema.ts`, adapter in `validation/index.ts`
- `validateOnBlur: true`, `validateOnChange: false` is the standard Formik config

---

*Convention analysis: 2026-06-02*
