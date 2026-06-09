import { test, expect } from "@playwright/test";

import { mockLoginSuccess, mockLoginFailure } from "./helpers/auth";

// /login: noindex metadata, Zod client validation, and the submit flow with the
// auth backend mocked via page.route (login + profile are client-side fetches).
// Turnstile is keyless on this server, so execute() resolves "" and the form
// submits without a challenge.

const VALID_EMAIL = "user@example.com";
const VALID_PASSWORD = "password123";

test.describe("login page", () => {
  test("is marked noindex", async ({ page }) => {
    await page.goto("/login");

    const robots = page.locator('meta[name="robots"]');
    await expect(robots).toHaveAttribute("content", /noindex/);
  });

  test("shows Zod errors when submitting empty", async ({ page }) => {
    await page.goto("/login");

    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Email is required")).toBeVisible();
    await expect(
      page.getByText("Password must be at least 8 characters"),
    ).toBeVisible();
  });

  test("shows an email format error for an invalid address", async ({ page }) => {
    await page.goto("/login");

    await page.locator("#email").fill("not-an-email");
    await page.locator("#password").fill(VALID_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Invalid email")).toBeVisible();
  });
});

test.describe("login submit", () => {
  test("happy path redirects to /profile", async ({ page }) => {
    const { getLoginBody } = await mockLoginSuccess(page);

    await page.goto("/login");
    await page.locator("#email").fill(VALID_EMAIL);
    await page.locator("#password").fill(VALID_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible();

    // The submitted credentials reached the login request. Keyless contract:
    // with Turnstile disabled, execute() resolves "" so the token field is empty.
    const body = getLoginBody() as Record<string, unknown>;
    expect(body.email).toBe(VALID_EMAIL);
    expect(body.password).toBe(VALID_PASSWORD);
    expect(body["cf-turnstile-response"]).toBe("");
  });

  test("surfaces a backend error inline", async ({ page }) => {
    await mockLoginFailure(page, 401, "Invalid credentials");

    await page.goto("/login");
    await page.locator("#email").fill(VALID_EMAIL);
    await page.locator("#password").fill(VALID_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Invalid credentials")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});
