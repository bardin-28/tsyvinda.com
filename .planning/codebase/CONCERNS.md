---
last_mapped_commit: 3269083
mapped_date: 2026-06-02
focus: concerns
---

# Concerns

Technical debt, bugs, security issues, performance risks, and fragile areas in the codebase. Reference material for planning — surface these before they bite during execution.

## Tech Debt

| Area | Issue | Files | Impact |
|------|-------|-------|--------|
| Three.js scenes | Scene setup/animation code copy-pasted across 4 components — no shared abstraction | `src/app/(home)/components/CylinderScene/`, `src/app/blog/.../BlogScene`, `src/app/about/components/AboutScene/`, blog cover `CoverComposer` | Changes (e.g. brand colour, disposal) must be made in 4 places; drift risk |
| `Post` type | `imageUrl`, `description`, `profileImageUrl` typed non-optional but UI already treats them as nullable | blog types | Type lies about runtime shape; defensive checks scattered |
| `RequestOptions` API | Internal `_isRetry` flag exposed on the public options interface | `src/shared/api/index.ts` | Leaky abstraction; callers can set internal flag |
| Mobile detection | `isMobile` snapshot at mount, not updated on resize | scene components | Wrong layout if viewport crosses breakpoint after mount |
| Font loading | Roboto weight 500 used in `CoverComposer` canvas but not loaded via `next/font` | blog cover composer | Falls back to system font in generated cover image |
| Doc drift | CLAUDE.md documents auth refresh as `GET /auth/refresh`; code sends POST | `CLAUDE.md` vs `src/shared/api/index.ts` | Misleading docs |

## Security

| Severity | Issue | Location | Notes |
|----------|-------|----------|-------|
| High | `post.htmlContent` rendered via `dangerouslySetInnerHTML` without HTML sanitization (only backslash-unescaping) | `src/app/blog/[slug]/page.tsx` | XSS risk if backend content is ever attacker-influenced. Add sanitizer (e.g. DOMPurify) |
| Medium | Image proxy allows any HTTPS hostname (`hostname: "**"`) | `next.config.ts` | SSRF / open image proxy; scope to known hosts |
| Low | `console.log('UNAUTHORIZED')` left in production API client | `src/shared/api/index.ts` | Noise; remove |

## Performance

- **Three.js RAF loops run while tab hidden** — animation continues when `document.hidden`; wastes CPU/GPU. Gate on `visibilitychange`.
- **`CoverComposer` recreates WebGL context on every size change** — destroys + rebuilds renderer instead of `setSize`. Expensive.
- **`BlogBackground` dynamic import fires before pathname check** on `/blog/cover` — loads scene chunk it then discards.

## Fragile Areas

- **`demoteHeadings`** — regex on raw HTML. `h6` would demote to invalid `h7`; multiline tag attributes break the match. Brittle string transform on markup.
- **Scene disposal arrays** — geometries/materials/textures must be manually added to disposal arrays on unmount (documented in CLAUDE.md). Easy to forget when adding a mesh → GPU memory leak on route change.
- **`useInfinitePosts`** — mutable-ref-as-source-of-truth pattern; fragile if additional `useEffect` triggers are introduced.

## Test Coverage Gaps

- No tests for `BlogScene`, `AboutScene`, or `CoverComposer`.
- No tests for `about/page.tsx` or `login/LoginForm`.
- No tests for `demoteHeadings` / `sanitizeHtmlContent` utilities in `blog/[slug]/page.tsx`.

---
*Mapped 2026-06-02. Findings are observations, not a mandate to fix — prioritize per phase goals.*
