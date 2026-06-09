import { test, expect } from "@playwright/test";

import { mockLoginSuccess } from "./helpers/auth";
import { installTurnstileStub, STUB_TURNSTILE_TOKEN } from "./helpers/turnstileStub";

// Runs only on the "turnstile" project: a Next build with a Turnstile site key
// baked in (useTurnstile enabled). window.turnstile is stubbed so the real
// Cloudflare script never loads. Proves the token obtained from the invisible
// challenge is forwarded in the login request body.

// Shared contract field name (src/shared/turnstile/constants.ts) that the
// frontend sends and Cloudflare siteverify expects.
const TURNSTILE_TOKEN_FIELD = "cf-turnstile-response";

const VALID_EMAIL = "user@example.com";
const VALID_PASSWORD = "password123";

test("forwards the Turnstile token in the login request", async ({ page }) => {
  await installTurnstileStub(page);
  const { getLoginBody } = await mockLoginSuccess(page);

  await page.goto("/login");
  await page.locator("#email").fill(VALID_EMAIL);
  await page.locator("#password").fill(VALID_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/profile$/);

  const body = getLoginBody() as Record<string, unknown>;
  expect(body[TURNSTILE_TOKEN_FIELD]).toBe(STUB_TURNSTILE_TOKEN);
  expect(body.email).toBe(VALID_EMAIL);
});
