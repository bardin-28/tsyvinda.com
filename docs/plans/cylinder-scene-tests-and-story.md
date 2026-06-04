# Plan: CylinderScene — Unit Tests + Storybook Story

## Goal

Add Jest unit tests and a Storybook story for the existing `CylinderScene` three.js component at `src/app/(home)/CylinderScene/CylinderScene.tsx`. Files must be colocated with the component and use the project filename conventions (`.test.tsx`, `.stories.tsx`). No production code changes to `CylinderScene.tsx` itself.

---

## Requirements

- Test file `CylinderScene.test.tsx` placed next to the component.
- Story file `CylinderScene.stories.tsx` placed next to the component.
- Tests run under existing Jest tooling (`npm test`, `config/jest.config.ts`, jsdom env).
- Story renders under existing Storybook tooling (`npm run storybook`, `config/storybook`).
- No new npm packages.
- No modifications to `CylinderScene.tsx` source (purely additive coverage).

---

## Architectural decisions

- **Mock `three` at module level, not globally** — jsdom has no WebGL context, so `new THREE.WebGLRenderer()` throws `TypeError: Cannot read properties of null` in CI. Use `jest.mock("three", ...)` inside the test file with a thin stub that preserves the exact API surface the component touches (`WebGLRenderer`, `Scene`, `PerspectiveCamera`, `CylinderGeometry`, `CircleGeometry`, `TorusGeometry`, `RingGeometry`, `BufferGeometry`, `BufferAttribute`, `Mesh`, `Group`, `Points`, `MeshPhysicalMaterial`, `MeshBasicMaterial`, `PointsMaterial`, `AmbientLight`, `PointLight`, `Color`, `Clock`, and the const enums `PCFSoftShadowMap`, `ACESFilmicToneMapping`, `SRGBColorSpace`, `FrontSide`, `BackSide`, `DoubleSide`). The mock records `dispose()` calls so cleanup assertions are possible.
- **Deterministic `requestAnimationFrame`** — stub `window.requestAnimationFrame` to a noop and `cancelAnimationFrame` to record cancel calls. Prevents the animation loop from looping inside the test runner; lets us verify cleanup cancels the loop.
- **Observable behavior only** — assert on mount/unmount side effects (DOM nodes, listeners, dispose) rather than three.js internal state. The animation math and lighting positions are not load-bearing; the contract is "mounts a canvas, cleans up on unmount, respects mobile breakpoint."
- **Mobile branch covered via `window.innerWidth` stubbing** — wrap with `Object.defineProperty(window, "innerWidth", ...)` before render; assert renderer.setSize call args + camera constructor args.
- **Storybook story uses CSF3 + `layout: "fullscreen"`** — the component is `position: fixed; inset: 0; pointer-events: none`. Default Storybook centered layout would still show it (fixed escapes the container), but `fullscreen` removes the canvas padding so the scene reads correctly. No args/controls (the component takes no props).
- **Mobile viewport variant via `parameters.viewport`** — second story `Mobile` sets `defaultViewport: "mobile1"` so reviewers can sanity-check the responsive branch (smaller particle count, wider FOV) in the workshop.
- **No `next/dynamic` wrapper in the story** — Storybook does not SSR, so the SSR guard from the page is unnecessary. Import the component directly.

---

## Implementation Checklist

### [x] Phase 1 — Test scaffolding

- **Step 1** — Create `src/app/(home)/CylinderScene/CylinderScene.test.tsx`.
- **Step 2** — Add `jest.mock("three", () => { ... })` factory. Each mocked class records its constructor args on the instance and exposes a recorded `dispose: jest.fn()`. `WebGLRenderer` exposes `domElement: document.createElement("canvas")`, `setSize: jest.fn()`, `setPixelRatio: jest.fn()`, `render: jest.fn()`, `dispose: jest.fn()`, plus mutable fields `toneMapping`, `toneMappingExposure`, `outputColorSpace`, `shadowMap: { enabled: false, type: 0 }`.
- **Step 3** — Helper `mockViewport(width: number, height: number)` that sets `window.innerWidth` / `window.innerHeight` via `Object.defineProperty`.
- **Step 4** — Stub `window.requestAnimationFrame` → `() => 1`, `window.cancelAnimationFrame` → `jest.fn()` in `beforeEach`. Restore in `afterEach`.

### [x] Phase 2 — Unit tests

- **Step 1** — `it("renders a fixed, aria-hidden mount div")` — asserts the wrapper div has `position: fixed`, `inset: 0`, `pointerEvents: none`, `aria-hidden="true"`, and contains exactly one `<canvas>` child after mount.
- **Step 2** — `it("uses desktop camera + renderer size on wide viewports")` — `mockViewport(1440, 900)`, render, assert `PerspectiveCamera` was called with `(42, 1440/900, 0.1, 100)` and `WebGLRenderer` instance `setSize` called with `(1440, 900)`.
- **Step 3** — `it("uses mobile camera on narrow viewports")` — `mockViewport(375, 812)`, assert `PerspectiveCamera` called with `(52, …)` and particle-count branch covered (assert `BufferAttribute` constructor called with a `Float32Array` of length `150 * 3` for positions).
- **Step 4** — `it("registers and removes window listeners")` — spy on `window.addEventListener` and `window.removeEventListener`; render + unmount; assert `mousemove`, `touchmove`, `resize` each added once and removed once.
- **Step 5** — `it("disposes renderer, geometries, and materials on unmount")` — capture references from the mocked-three module's call log; unmount; assert every recorded `dispose` was called at least once and that `cancelAnimationFrame` fired.
- **Step 6** — `it("updates camera + renderer on resize")` — render at 1440×900, fire `window.dispatchEvent(new Event("resize"))` after changing viewport to 800×600, assert camera's `updateProjectionMatrix` mock fired and `renderer.setSize` called with `(800, 600)`.

### [x] Phase 3 — Storybook story

- **Step 1** — Create `src/app/(home)/CylinderScene/CylinderScene.stories.tsx`.
- **Step 2** — Default export: `Meta<typeof CylinderScene>` with `title: "Home/CylinderScene"`, `component: CylinderScene`, `parameters: { layout: "fullscreen" }`, `tags: ["autodocs"]`.
- **Step 3** — `Default: StoryObj` — empty `args`, decorator that wraps render in a `<div style={{ minHeight: "100vh", background: "#080810" }}>` so the dark page background matches the production look.
- **Step 4** — `Mobile: StoryObj` — same render, `parameters: { viewport: { defaultViewport: "mobile1" } }` to exercise the `< 768` branch.

### [x] Phase 4 — Verify

- **Step 1** — `npm test` → all CylinderScene specs green, no jsdom WebGL errors.
- **Step 2** — `npm run build-storybook -- --quiet` → builds without "stories not found" warning; the two stories appear in `storybook-static/index.html` story index.
- **Step 3** — `npm run lint` → clean (no new warnings introduced).

---

## Important Notes

- The component currently leaks no memory because every geometry/material is in the disposal arrays in the cleanup function. The dispose test pins this contract — if future edits add a geometry or material without registering it, the test will fail by counting fewer than expected `dispose` invocations. This is intentional; do not weaken the assertion.
- Mocking `three` at file scope is preferred over module aliasing in `jest.config.ts`. A global alias would shadow `three` for every future test that legitimately needs a real `THREE.Color` instance; per-file mocks stay surgical.
- No accessibility tests are warranted — the element is `aria-hidden`, decorative, and has `pointer-events: none`; it is intentionally invisible to AT.
- No new dependencies. `@testing-library/react`, `jest-environment-jsdom`, and `@testing-library/jest-dom` are already devDeps.

---

## Files Touched

- `src/app/(home)/CylinderScene/CylinderScene.test.tsx` — new
- `src/app/(home)/CylinderScene/CylinderScene.stories.tsx` — new

No source files modified.
