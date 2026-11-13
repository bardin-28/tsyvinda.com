// Minimal mock backend for the e2e suite. The Next server's `/api/*` rewrite
// and its server-side data fetches (blog list + article are SSR) both target
// `API_URL`, which the Playwright config points here. Browser-only Playwright
// `page.route` cannot intercept those server-side fetches, so a real HTTP
// backend is required for deterministic SSR content.
//
// Plain ESM, run with `node e2e/mock-server/server.mjs`. Port from MOCK_API_PORT
// (default 4010). Also serves the CMS (routes, pages) from fixtures/cms.json.

import { readFileSync } from "node:fs";
import { createServer } from "node:http";

import {
  buildPostsPage,
  findPostBySlug,
  postsInLocale,
} from "../fixtures/posts.mjs";

const PORT = Number(process.env.MOCK_API_PORT ?? 4010);

/** CMS content: a snapshot of the API's seeded pages (see `_note` in the file). */
const CMS = JSON.parse(
  readFileSync(new URL("../fixtures/cms.json", import.meta.url), "utf8"),
);

/**
 * What lives at an unprefixed path in a language, like the API's GET /routes/resolve:
 * a CMS page, or a post under the blog page's address. Null = nothing (404).
 * @param {string} path
 * @param {string} locale
 */
function resolveRoute(path, locale) {
  for (const [key, paths] of Object.entries(CMS.routes.pages)) {
    if (paths[locale] === path) return { kind: "page", key, paths };
  }
  const blogPath = CMS.routes.pages.blog?.[locale];
  if (blogPath && path.startsWith(`${blogPath}/`)) {
    const slug = path.slice(blogPath.length + 1);
    const post = findPostBySlug(slug);
    if (post && post.locales.includes(locale)) {
      const paths = Object.fromEntries(
        post.locales.map((postLocale) => [
          postLocale,
          `${CMS.routes.pages.blog[postLocale]}/${slug}`,
        ]),
      );
      return { kind: "post", slug, paths };
    }
  }
  return null;
}

/**
 * @param {import('node:http').ServerResponse} res
 * @param {number} status
 * @param {unknown} body
 */
function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
  const { pathname } = url;

  // CMS: route map, path resolution and pages
  if (req.method === "GET" && pathname === "/routes") {
    sendJson(res, 200, CMS.routes);
    return;
  }
  if (req.method === "GET" && pathname === "/routes/resolve") {
    const resolved = resolveRoute(
      url.searchParams.get("path") ?? "/",
      url.searchParams.get("locale") ?? "en",
    );
    if (resolved) sendJson(res, 200, resolved);
    else sendJson(res, 404, { error: { code: "ROUTE_NOT_FOUND", message: "Nothing at this path" } });
    return;
  }
  const pageMatch = pathname.match(/^\/pages\/([^/]+)$/);
  if (req.method === "GET" && pageMatch) {
    const page = CMS.pages[`${pageMatch[1]}:${url.searchParams.get("locale") ?? "en"}`];
    if (page) sendJson(res, 200, page);
    else sendJson(res, 404, { error: { code: "PAGE_NOT_FOUND", message: "Page not found" } });
    return;
  }
  if (req.method === "GET" && pathname === "/post-categories") {
    sendJson(res, 200, []);
    return;
  }
  if (req.method === "GET" && pathname === "/site-settings") {
    sendJson(res, 200, { indexingEnabled: true, updatedAt: null });
    return;
  }

  // Blog list — GET /posts
  if (req.method === "GET" && pathname === "/posts") {
    // Mirror the real API's validation: a non-numeric limit is a 400, so a
    // broken server-side fetch shows up as a missing SSR list, not a silent pass.
    const limit = url.searchParams.get("limit");
    if (limit !== null && !/^\d+$/.test(limit)) {
      sendJson(res, 400, { error: { code: "VALIDATION_FAILED", message: "limit must be an integer" } });
      return;
    }
    sendJson(res, 200, buildPostsPage(postsInLocale(url.searchParams.get("locale"))));
    return;
  }

  // Single article — GET /posts/:slug
  const postMatch = pathname.match(/^\/posts\/([^/]+)$/);
  if (req.method === "GET" && postMatch) {
    const post = findPostBySlug(decodeURIComponent(postMatch[1]));
    const locale = url.searchParams.get("locale") ?? "en";
    // Like the API: a post with no version in the requested language is a 404
    if (post && post.locales.includes(locale)) {
      sendJson(res, 200, post);
    } else {
      sendJson(res, 404, { message: "Post not found" });
    }
    return;
  }

  sendJson(res, 404, { message: `No mock handler for ${req.method} ${pathname}` });
});

server.listen(PORT, () => {
  // Surfaced in Playwright's webServer logs.
  console.log(`[e2e mock-server] listening on http://localhost:${PORT}`);
});
