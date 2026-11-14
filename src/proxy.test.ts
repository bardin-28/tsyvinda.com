/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { isIndexingEnabled } from "@/shared/lib/indexing";
import {
  MARKDOWN_PATH_HEADER,
  MARKDOWN_ROUTE,
} from "@/shared/lib/markdown/markdownRoute";
import { NOINDEX_HEADER, config, proxy } from "./proxy";

jest.mock("@/shared/lib/indexing", () => ({ isIndexingEnabled: jest.fn() }));

const mockIndexing = isIndexingEnabled as jest.MockedFunction<
  typeof isIndexingEnabled
>;

const requestFor = (path: string, cookie?: string) =>
  new NextRequest(`https://tsyvinda.com${path}`, {
    headers: cookie ? { cookie } : undefined,
  });

describe("proxy", () => {
  beforeEach(() => mockIndexing.mockReset());

  it("leaves pages indexable while indexing is on", async () => {
    mockIndexing.mockResolvedValue(true);
    const response = await proxy(requestFor("/blog/hello"));
    expect(response.headers.get("X-Robots-Tag")).toBeNull();
  });

  it("marks every page noindex while indexing is off", async () => {
    mockIndexing.mockResolvedValue(false);
    for (const path of ["/", "/about", "/blog/hello"]) {
      const response = await proxy(requestFor(path));
      expect(response.headers.get("X-Robots-Tag")).toBe(NOINDEX_HEADER);
    }
  });

  it("still redirects signed-out visitors away from protected routes", async () => {
    mockIndexing.mockResolvedValue(true);
    const response = await proxy(requestFor("/profile"));
    expect(response.status).toBeGreaterThanOrEqual(300);
    expect(response.status).toBeLessThan(400);
  });

  it("lets signed-in visitors through to protected routes", async () => {
    mockIndexing.mockResolvedValue(false);
    const response = await proxy(requestFor("/profile", "has_session=1"));
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("X-Robots-Tag")).toBe(NOINDEX_HEADER);
  });
});

describe("proxy markdown for agents", () => {
  beforeEach(() => mockIndexing.mockResolvedValue(true));

  const withAccept = (path: string, accept: string) =>
    new NextRequest(`https://tsyvinda.com${path}`, { headers: { accept } });

  it("rewrites pages to their Markdown version when the agent asks for it", async () => {
    const response = await proxy(withAccept("/uk/about", "text/markdown, text/html;q=0.8"));
    const rewrite = new URL(response.headers.get("x-middleware-rewrite") ?? "");
    expect(rewrite.pathname).toBe(MARKDOWN_ROUTE);
    // Rewritten request headers travel as x-middleware-request-<name>
    expect(
      response.headers.get(`x-middleware-request-${MARKDOWN_PATH_HEADER}`),
    ).toBe("/uk/about");
  });

  it("keeps HTML for browsers and for agents refusing Markdown", async () => {
    for (const accept of ["text/html,application/xhtml+xml,*/*;q=0.8", "text/markdown;q=0, text/html"]) {
      const response = await proxy(withAccept("/about", accept));
      expect(response.headers.get("x-middleware-rewrite")).toContain("/en/about");
    }
  });

  it("never serves Markdown in place of a sign-in redirect", async () => {
    const response = await proxy(withAccept("/profile", "text/markdown"));
    expect(response.status).toBeGreaterThanOrEqual(300);
    expect(response.status).toBeLessThan(400);
  });
});

describe("proxy matcher", () => {
  const matcher = new RegExp(`^${config.matcher[0]}$`);

  it("skips everything under /_next/, the dev HMR socket included", () => {
    for (const path of [
      "/_next/webpack-hmr",
      "/_next/static/chunks/app.js",
      "/_next/image",
    ]) {
      expect(matcher.test(path)).toBe(false);
    }
  });

  it("still runs on pages", () => {
    for (const path of ["/", "/about", "/uk/blog/post", "/blog"]) {
      expect(matcher.test(path)).toBe(true);
    }
  });
});

describe("proxy languages", () => {
  beforeEach(() => mockIndexing.mockResolvedValue(true));

  it("serves unprefixed paths as English and /uk paths as Ukrainian", async () => {
    const english = await proxy(requestFor("/about"));
    expect(english.headers.get("x-middleware-rewrite")).toContain("/en/about");
    const ukrainian = await proxy(requestFor("/uk/about"));
    // Already prefixed: passed through, neither redirected nor rewritten to English
    expect(ukrainian.headers.get("location")).toBeNull();
    expect(ukrainian.headers.get("x-middleware-rewrite") ?? "").not.toContain(
      "/en/",
    );
  });

  it("redirects /en/… to the unprefixed English URL", async () => {
    const response = await proxy(requestFor("/en/about"));
    expect(response.headers.get("location")).toBe("https://tsyvinda.com/about");
  });

  it("sends signed-out visitors to the sign-in page in their language", async () => {
    const response = await proxy(requestFor("/uk/profile"));
    expect(response.headers.get("location")).toMatch(
      /^https:\/\/tsyvinda\.com\/uk(\/login\?from=%2Fuk%2Fprofile)?$/,
    );
  });

  it("still marks Ukrainian pages noindex while indexing is off", async () => {
    mockIndexing.mockResolvedValue(false);
    const response = await proxy(requestFor("/uk/blog"));
    expect(response.headers.get("X-Robots-Tag")).toBe(NOINDEX_HEADER);
  });
});
