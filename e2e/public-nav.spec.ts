import { test, expect } from "@playwright/test";

// Public, unauthenticated routes: each renders, exposes exactly one <h1>, and a
// non-empty <title>. Header navigation lives behind a hamburger menu
// (role="menuitem"); the footer exposes the same NAV_LINKS as direct links.

const PUBLIC_ROUTES = [
  { path: "/", name: "home" },
  { path: "/about", name: "about" },
  { path: "/contacts", name: "contacts" },
  { path: "/blog", name: "blog" },
] as const;

test.describe("public routes render", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route.name} (${route.path}) has one h1 and a title`, async ({ page }) => {
      await page.goto(route.path);

      await expect(page).toHaveTitle(/.+/);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toBeVisible();
    });
  }
});

test.describe("header navigation", () => {
  test("hamburger menu navigates to About then Contacts", async ({ page }) => {
    await page.goto("/");

    const toggle = page.getByRole("button", { name: "Toggle navigation menu" });

    await toggle.click();
    await page.getByRole("menuitem", { name: "About" }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.locator("h1")).toBeVisible();

    await toggle.click();
    await page.getByRole("menuitem", { name: "Contacts" }).click();
    await expect(page).toHaveURL(/\/contacts$/);
    await expect(page.locator("h1")).toBeVisible();
  });
});

test.describe("footer navigation", () => {
  test("footer link navigates to Blog", async ({ page }) => {
    await page.goto("/about");

    await page.locator("footer").getByRole("link", { name: "Blog" }).click();
    await expect(page).toHaveURL(/\/blog$/);
    await expect(page.locator("h1")).toBeVisible();
  });
});
