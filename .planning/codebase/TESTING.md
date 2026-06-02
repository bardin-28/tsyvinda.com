# Testing Patterns

**Analysis Date:** 2026-06-02

## Test Framework

**Runner:**
- Jest 30 (`jest@^30.4.2`)
- Config: `config/jest.config.ts` (must be passed explicitly — bare `jest` won't find it)
- `next/jest` adapter wraps the config via `nextJest({ dir: "./" })`

**Assertion Library:**
- `@testing-library/jest-dom` ^6.9.1 — loaded globally via `config/jest.setup.ts`
- All `toBeInTheDocument()`, `toHaveAttribute()`, `toHaveTextContent()` matchers available without import

**Run Commands:**
```bash
npm test                          # jest --config config/jest.config.ts
npm run test:watch                # jest --config config/jest.config.ts --watch
npm run test:ci                   # jest --config config/jest.config.ts --ci --coverage (writes /coverage)
```

## Test File Organization

**Location:** Co-located with the subject file in the same directory

**Naming:** `[Subject].test.{ts,tsx}` — Jest is configured with `testMatch: ["<rootDir>/src/**/*.test.{ts,tsx}"]`. Anything else is invisible to Jest.

**Structure:**
```
src/
  api/
    index.ts
    index.client.test.ts          # Same module, two environments
    index.server.test.ts
  app/
    blog/
      components/
        PostCard/
          PostCard.tsx
          PostCard.test.tsx        # Co-located
          PostCard.stories.tsx
      hooks/
        useInfinitePosts.ts
        useInfinitePosts.test.tsx
    contacts/
      page.tsx
      page.test.tsx
  shared/
    components/
      Logo/
        Logo.tsx
        Logo.test.tsx
      SiteHeader/
        SiteHeader.tsx
        SiteHeader.test.tsx
      SiteFooter/
        SiteFooter.tsx
        SiteFooter.test.tsx
```

## Test Environment

**Default:** `jsdom` — set in `config/jest.config.ts` (`testEnvironment: "jsdom"`)

**Per-file override:** Use the `@jest-environment` docblock comment to switch environments:
```typescript
/**
 * @jest-environment node
 */
```
Example: `src/api/index.server.test.ts` uses `node` to test server-side URL construction; `src/api/index.client.test.ts` uses `jsdom` for cookie/browser behaviour.

## Test Structure

**Suite Organization:**
```typescript
describe("ComponentName", () => {
  // Setup at top of describe block
  let someRef: SomeType;

  beforeEach(() => {
    jest.clearAllMocks();           // Reset all mocks
    mockSetup();                    // Set default mock return values
  });

  afterEach(() => {
    // Restore spies
    spyRef.mockRestore();
  });

  it("describes the expected behaviour in plain English", () => {
    // Arrange
    // Act
    // Assert
  });
});
```

**Top-level lifecycle hooks** (outside `describe`) are used when setup applies to all suites in the file:
```typescript
beforeAll(() => {
  globalThis.IntersectionObserver = MockIntersectionObserver;
});

beforeEach(() => {
  observers.length = 0;            // Reset mutable shared state
  baseProps.onLoadMore.mockClear();
});
```

## Mocking

**Framework:** Jest built-in mocking (`jest.mock`, `jest.fn`, `jest.spyOn`)

**Module mocking — hook pattern:**
```typescript
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

jest.mock("@/shared/contexts/UserContext", () => ({
  useUser: jest.fn(),
}));

const usePathnameMock = usePathname as jest.MockedFunction<typeof usePathname>;
const useUserMock = useUser as jest.MockedFunction<typeof useUser>;

beforeEach(() => {
  jest.clearAllMocks();
  usePathnameMock.mockReturnValue("/");
});
```

**Module mocking — partial (spread actual):**
```typescript
jest.mock("@/api/posts", () => ({
  ...jest.requireActual("@/api/posts"),   // Keep types and non-mocked exports
  getPosts: jest.fn(),
}));

const getPostsMock = getPosts as jest.MockedFunction<typeof getPosts>;
```

**Dynamic module reload (environment-sensitive):**
```typescript
const loadApi = async () => {
  jest.resetModules();              // Force re-import to pick up new env/cookie state
  const mod = await import("./index");
  return mod;
};
```
Used in API tests where module-level constants (`isServer`, `SERVER_API_ORIGIN`) are set at import time.

**Full module mock (Three.js):**
When mocking a heavy dependency like `three`, replace the entire module with a hand-built registry of mock classes:
```typescript
jest.mock("three", () => {
  const disposables: DisposableMock[] = [];
  // ... mock classes push to registry arrays
  return { __registry: { disposables, ... }, WebGLRenderer, Scene, ... };
});

const registry = (THREE as unknown as { __registry: Registry }).__registry;
```
This lets tests assert that `dispose()` was called on every tracked object.

**Global API mocking (fetch):**
```typescript
const originalFetch = globalThis.fetch;

beforeEach(() => {
  fetchMock = jest.fn().mockResolvedValue(jsonResponse({ ok: true })) as FetchMock;
  globalThis.fetch = fetchMock as unknown as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;    // Always restore
});
```

**Browser API mocking (IntersectionObserver):**
```typescript
class MockIntersectionObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  callback: IntersectionObserverCallback;
  constructor(cb: IntersectionObserverCallback) {
    this.callback = cb;
    observers.push(this);
  }
  // ...
}

beforeAll(() => {
  (globalThis as unknown as { IntersectionObserver: typeof IntersectionObserver })
    .IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
});
```

**Window spy mocking:**
```typescript
rafSpy = jest.spyOn(window, "requestAnimationFrame").mockReturnValue(123);
cancelRafSpy = jest.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);

afterEach(() => {
  rafSpy.mockRestore();           // Always mockRestore() for spies
  cancelRafSpy.mockRestore();
});
```

**What to mock:**
- Next.js navigation hooks (`usePathname`, `useRouter`) — they require a router context
- React context hooks (`useUser`) — isolate component from context tree
- API functions (`getPosts`, `login`) — prevent real network requests
- Heavy third-party libraries (`three`) — prevent WebGL/GPU calls in jsdom
- Browser globals (`fetch`, `IntersectionObserver`, `requestAnimationFrame`) — jsdom doesn't implement them

**What NOT to mock:**
- `@testing-library/react` utilities
- Simple utility modules (`cookies.ts`, `uploads.ts`) — test them directly
- CSS Modules — proxied by `identity-obj-proxy` via `moduleNameMapper`

## Fixtures and Factories

**Inline factory functions** are the pattern — no separate fixture files:
```typescript
const makePost = (id: string, title: string): Post => ({
  id,
  slug: id,
  title,
  description: `${title} description`,
  htmlContent: "<p>x</p>",
  imageUrl: "https://example.com/img.jpg",
  author: { id: "u", firstName: "John", lastName: "Doe", profileImageUrl: "" },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
});
```

**Base object + spread** for variants:
```typescript
const basePost: Post = { id: "abc-123", slug: "abc-123", title: "...", ... };

// Variant:
const post: Post = { ...basePost, imageUrl: "" };
const post: Post = { ...basePost, author: { ...basePost.author, profileImageUrl: "" } };
```

**Base props object** for components with many props:
```typescript
const baseProps = {
  items: [] as Post[],
  isLoading: false,
  hasMore: false,
  error: null as Error | null,
  onLoadMore: jest.fn(),
  onRetry: jest.fn(),
};

// Usage:
render(<PostsList {...baseProps} isLoading hasMore />);
render(<PostsList {...baseProps} error={new Error("boom")} />);
```

**Response factory helpers** in API tests:
```typescript
const jsonResponse = (body: unknown, init: { status?: number } = {}): MockResponse => { ... };
const emptyResponse = (status: number): MockResponse => ({ ... });
```

## Coverage

**Requirements:** No threshold enforced in `jest.config.ts` — coverage is collected but no minimum is set.

**Collected from:**
```
src/**/*.{ts,tsx}
!src/**/*.stories.{ts,tsx}    # Stories excluded
!src/**/*.d.ts                 # Type declarations excluded
```

**View Coverage:**
```bash
npm run test:ci    # Writes to /coverage
```

## Test Types

**Unit Tests:**
- Scope: single component, hook, or module in isolation
- All current tests are unit tests
- Components tested via `@testing-library/react` `render()` + `screen` queries
- Hooks tested via `renderHook()` from `@testing-library/react`

**Integration Tests:**
- Not used. The API module tests (`index.client.test.ts`, `index.server.test.ts`) cover cross-module behaviour but are still isolated from the network via `fetch` mocking.

**E2E Tests:**
- Not present in this repository.

**Storybook:**
- Not a test runner, but serves as a visual workshop — `src/**/*.stories.@(ts|tsx|mdx)` co-located with components
- Stories use `@storybook/nextjs` and follow the `Meta<typeof Component>` / `StoryObj<typeof Component>` type pattern
- Config lives at `config/storybook/`, not `.storybook/`

## Common Patterns

**Async component/hook testing:**
```typescript
it("loads the first page on mount", async () => {
  getPostsMock.mockResolvedValueOnce(page(["1", "2"], "cursor-1"));

  const { result } = renderHook(() => useInfinitePosts(10));

  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.items).toHaveLength(2);
});
```

**Triggering state updates in hooks:**
```typescript
await act(async () => {
  result.current.loadMore();
});
await waitFor(() => expect(result.current.isLoadingMore).toBe(false));
```

**User interaction testing:**
```typescript
const user = userEvent.setup();     // Always use userEvent.setup(), not userEvent directly

await user.click(screen.getByRole("button", { name: /toggle navigation menu/i }));
await user.keyboard("{Escape}");
await waitForElementToBeRemoved(() => screen.queryByRole("menu"));
```

**Error testing:**
```typescript
await expect(API.get("/posts")).rejects.toBeInstanceOf(ApiError);

expect(err).toMatchObject({
  name: "ApiError",
  status: 500,
  data: { message: "boom" },
});
```

**Accessibility-first queries:**
- Prefer `getByRole` with accessible name over `getByText` or `getByTestId`:
  ```typescript
  screen.getByRole("heading", { name: "Building production-grade Next.js apps" })
  screen.getByRole("link", { name: /Read article/i })
  screen.getByRole("button", { name: /toggle navigation menu/i })
  screen.getByRole("time")
  screen.getByRole("alert")
  screen.getByRole("menu")
  screen.getByRole("menuitem", { name: "Home" })
  ```
- `getByText` used only for content without a semantic role
- `container.querySelector` used only when ARIA roles are not applicable (raw DOM structure assertions)

**Mount/unmount lifecycle:**
```typescript
it("disposes renderer on unmount", () => {
  const { unmount } = render(<CylinderScene />);
  // Capture state after mount
  const renderer = registry.renderers[0];

  unmount();                          // Trigger cleanup

  expect(renderer.dispose).toHaveBeenCalledTimes(1);
});
```

---

*Testing analysis: 2026-06-02*
