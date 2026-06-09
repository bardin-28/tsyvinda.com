import { test, expect } from "@playwright/test";

import { POSTS } from "./fixtures/posts.mjs";

// Blog list and article are server-rendered (ISR) from the mock backend that the
// Playwright config points API_URL at. These specs assert the SSR HTML carries
// the fixture content and that list → article navigation works.

const [firstPost, secondPost] = POSTS;

test.describe("blog list", () => {
  test("renders a card per fixture post", async ({ page }) => {
    await page.goto("/blog");

    for (const post of POSTS) {
      await expect(
        page.getByRole("link", { name: `Read article: ${post.title}` }),
      ).toBeVisible();
    }
  });
});

test.describe("blog article", () => {
  test("navigating a card opens the article with its title as h1", async ({ page }) => {
    await page.goto("/blog");

    await page
      .getByRole("link", { name: `Read article: ${firstPost.title}` })
      .click();

    await expect(page).toHaveURL(new RegExp(`/blog/${firstPost.slug}$`));
    await expect(page.locator("h1")).toHaveText(firstPost.title);
  });

  test("a second article renders its own content", async ({ page }) => {
    await page.goto(`/blog/${secondPost.slug}`);

    await expect(page.locator("h1")).toHaveText(secondPost.title);
    await expect(page.locator("article")).toContainText("Second post body");
  });
});
