import { test, expect } from "@playwright/test";

import { AUTH_UI_ENABLED } from "../src/shared/const/features";

// While AUTH_UI_ENABLED is off the website has no sign-in surface: content is
// managed from the admin panel. The auth pages 404, the header menu has no
// auth items, and session-gated routes bounce visitors to the home page.
test.skip(AUTH_UI_ENABLED, "website auth UI is enabled");

const AUTH_ROUTES = ["/login", "/registration", "/reset-password"] as const;

test.describe("auth UI disabled", () => {
  for (const path of AUTH_ROUTES) {
    test(`${path} responds 404`, async ({ page }) => {
      const response = await page.goto(path);

      expect(response?.status()).toBe(404);
    });
  }

  test("session-gated routes redirect home without a session", async ({ page }) => {
    for (const path of ["/profile", "/blog/cover"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/$/);
    }
  });

  test("header menu has no Sign in or Profile items", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Toggle navigation menu" }).click();

    await expect(page.getByRole("menuitem", { name: "Home" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: /sign in/i })).toHaveCount(0);
    await expect(page.getByRole("menuitem", { name: "Profile" })).toHaveCount(0);
  });
});
