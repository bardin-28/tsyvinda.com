// Minimal mock backend for the e2e suite. The Next server's `/api/*` rewrite
// and its server-side data fetches (blog list + article are SSR) both target
// `API_URL`, which the Playwright config points here. Browser-only Playwright
// `page.route` cannot intercept those server-side fetches, so a real HTTP
// backend is required for deterministic SSR content.
//
// Plain ESM, run with `node e2e/mock-server/server.mjs`. Port from MOCK_API_PORT
// (default 4010). Extended with auth endpoints in a later phase.

import { createServer } from "node:http";

import { buildPostsPage, findPostBySlug } from "../fixtures/posts.mjs";

const PORT = Number(process.env.MOCK_API_PORT ?? 4010);

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

  // Blog list — GET /posts
  if (req.method === "GET" && pathname === "/posts") {
    sendJson(res, 200, buildPostsPage());
    return;
  }

  // Single article — GET /posts/:slug
  const postMatch = pathname.match(/^\/posts\/([^/]+)$/);
  if (req.method === "GET" && postMatch) {
    const post = findPostBySlug(decodeURIComponent(postMatch[1]));
    if (post) {
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
