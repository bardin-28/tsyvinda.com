import { DEFAULT_ROUTE_MAP, pagePath, postPath, postPaths } from "./routes";
import type { RouteMap } from "./schemas";

const map: RouteMap = {
  pages: {
    about: { en: "/about", uk: "/pro-mene" },
    blog: { en: "/blog" },
  },
};

describe("CMS paths", () => {
  it("uses the page's address in the language", () => {
    expect(pagePath(map, "about", "uk")).toBe("/pro-mene");
  });

  it("falls back to English, then to the default slug", () => {
    expect(pagePath(map, "blog", "uk")).toBe("/blog");
    expect(pagePath(map, "contacts", "uk")).toBe("/contacts");
    expect(pagePath(DEFAULT_ROUTE_MAP, "privacy-policy", "en")).toBe(
      "/privacy-policy",
    );
  });

  it("puts posts under the blog address", () => {
    expect(postPath(map, "hello", "en")).toBe("/blog/hello");
    expect(postPaths(map, "hello", ["en", "uk"])).toEqual({
      en: "/blog/hello",
      uk: "/blog/hello",
    });
  });
});
