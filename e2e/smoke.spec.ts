import { test, expect } from "@playwright/test";

// Phase 1 smoke check: the production server boots and the home route renders.
// Deeper coverage (nav, blog, login, Turnstile) lands in later specs.
test.describe("smoke", () => {
  test("home route loads with a non-empty title", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator("body")).toBeVisible();
  });
});
