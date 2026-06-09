import type { Page } from "@playwright/test";

import { USER } from "../fixtures/user.mjs";

// Client-side auth calls (login submit, profile refetch, logout) run in the
// browser, so Playwright `page.route` can intercept them per-test — overriding
// the mock backend for these specific URLs without touching SSR content.

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

/**
 * Intercept `GET /api/profile` and return the user fixture (200).
 */
export async function mockProfile(page: Page, user: unknown = USER): Promise<void> {
  await page.route("**/api/profile", async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify(user),
    });
  });
}

/**
 * Happy-path login: `POST /api/auth/login` succeeds and the follow-up
 * `GET /api/profile` returns the user, so the app redirects to /profile.
 * Resolves with the intercepted login request body for assertions.
 */
export async function mockLoginSuccess(page: Page): Promise<{ getLoginBody: () => unknown }> {
  let loginBody: unknown = null;

  await page.route("**/api/auth/login", async (route) => {
    loginBody = route.request().postDataJSON();
    // The real backend sets has_session on login; the `proxy` middleware gates
    // /profile on it. Seed the JS-visible flag so the post-login navigation is
    // allowed through instead of bounced back to /login.
    await page.context().addCookies([
      { name: "has_session", value: "1", domain: "localhost", path: "/" },
    ]);
    await route.fulfill({
      status: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify(USER),
    });
  });

  await mockProfile(page);

  return { getLoginBody: () => loginBody };
}

/**
 * Failed login: `POST /api/auth/login` returns `status` with a `{ message }`
 * body the form surfaces inline.
 */
export async function mockLoginFailure(
  page: Page,
  status: number,
  message: string,
): Promise<void> {
  await page.route("**/api/auth/login", async (route) => {
    await route.fulfill({
      status,
      headers: JSON_HEADERS,
      body: JSON.stringify({ message }),
    });
  });
}
