import { defineConfig, devices } from "@playwright/test";

// webServer commands run with cwd = config file's directory by default; anchor
// them at the repo root (where `npm run test:e2e` is invoked) so relative paths
// and npm scripts resolve correctly.
const REPO_ROOT = process.cwd();

// E2E suite runs against a production build (next build + next start), so ISR
// routes and noindex metadata behave exactly as in production. All /api/* calls
// are intercepted in the specs, so no live backend is required.

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;
const IS_CI = Boolean(process.env.CI);

// Mock backend port. The Next server's /api/* rewrite and its SSR data fetches
// both target API_URL, which we point at this local mock so blog content (server
// -rendered) is deterministic without a live backend.
const MOCK_API_PORT = 4010;
const MOCK_API_URL = `http://localhost:${MOCK_API_PORT}`;

// Second Next server with a Turnstile site key baked in, for the *.turnstile
// spec only. Any non-empty key flips useTurnstile to enabled; the spec stubs
// window.turnstile so the real Cloudflare script never loads (offline, no
// network). Built into a separate distDir so it never clobbers the main build.
const KEYED_PORT = 3001;
const KEYED_BASE_URL = `http://localhost:${KEYED_PORT}`;
const KEYED_DIST_DIR = ".next-e2e";
const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA";

// Always build here (not just `next start`) so the build runs with the mock
// backend already up and API_URL pointed at it. The /blog list is statically
// prerendered at build time, so reusing a build made without the mock would
// bake an empty list. The workflow's separate `npm run build` stays as a build
// sanity check; this is the build the e2e run actually serves.
const webServerCommand = "npm run build && npm run start";

export default defineConfig({
  testDir: "../../e2e",
  testMatch: "**/*.spec.ts",
  // Fail the build on a stray `test.only` left in a committed spec.
  forbidOnly: IS_CI,
  retries: IS_CI ? 2 : 0,
  // Serial server start is the bottleneck, not the specs; keep workers modest.
  workers: IS_CI ? 1 : undefined,
  reporter: IS_CI ? [["html", { open: "never" }], ["list"]] : [["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      // Keyless server; excludes the key-set Turnstile spec (matched by filename).
      testIgnore: /turnstile\.spec\.ts$/,
      use: { ...devices["Desktop Chrome"], baseURL: BASE_URL },
    },
    {
      name: "turnstile",
      // Key-set server on KEYED_PORT; only the Turnstile spec runs here.
      testMatch: /turnstile\.spec\.ts$/,
      use: { ...devices["Desktop Chrome"], baseURL: KEYED_BASE_URL },
    },
  ],
  webServer: [
    {
      // Mock backend first; the Next server's SSR fetches hit it on boot.
      command: "node e2e/mock-server/server.mjs",
      cwd: REPO_ROOT,
      port: MOCK_API_PORT,
      env: { MOCK_API_PORT: String(MOCK_API_PORT) },
      reuseExistingServer: !IS_CI,
      timeout: 30_000,
    },
    {
      command: webServerCommand,
      cwd: REPO_ROOT,
      url: BASE_URL,
      env: {
        // Route both the /api/* rewrite and server-side fetches to the mock.
        API_URL: MOCK_API_URL,
        // Force the default suite keyless: with no site key, useTurnstile is
        // disabled and execute() resolves "" so forms submit without a real
        // challenge. Overrides any NEXT_PUBLIC_TURNSTILE_SITE_KEY in .env*
        // (NEXT_PUBLIC_ vars are inlined at build time). The Turnstile-specific
        // project (Phase 4) sets a real test key instead.
        NEXT_PUBLIC_TURNSTILE_SITE_KEY: "",
      },
      reuseExistingServer: !IS_CI,
      // next build can exceed the default 60s on a cold cache.
      timeout: 180_000,
    },
    {
      // Key-set build for the Turnstile spec. Always builds its own distDir (the
      // workflow/default build is keyless), so it runs `next build` even in CI.
      command: `npm run build && npm run start -- -p ${KEYED_PORT}`,
      cwd: REPO_ROOT,
      url: KEYED_BASE_URL,
      env: {
        API_URL: MOCK_API_URL,
        NEXT_DIST_DIR: KEYED_DIST_DIR,
        NEXT_PUBLIC_TURNSTILE_SITE_KEY: TURNSTILE_TEST_SITE_KEY,
      },
      reuseExistingServer: !IS_CI,
      timeout: 180_000,
    },
  ],
});
