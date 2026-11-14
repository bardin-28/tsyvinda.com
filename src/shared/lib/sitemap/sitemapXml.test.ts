import { buildSitemapXml } from "./sitemapXml";

describe("buildSitemapXml", () => {
  const xml = buildSitemapXml([
    {
      url: "https://tsyvinda.com/blog/a&b",
      lastModified: new Date("2026-11-01T10:00:00.000Z"),
      changeFrequency: "weekly",
      priority: 0.6,
      alternates: { languages: { uk: "https://tsyvinda.com/uk/blog/a-b" } },
    },
    { url: "https://tsyvinda.com/minimal" },
  ]);

  it("writes the sitemap fields in schema order", () => {
    expect(xml).toContain(
      [
        "<url>",
        "<loc>https://tsyvinda.com/blog/a&amp;b</loc>",
        "<lastmod>2026-11-01T10:00:00.000Z</lastmod>",
        "<changefreq>weekly</changefreq>",
        "<priority>0.6</priority>",
        "</url>",
      ].join("\n"),
    );
  });

  it("is a plain sitemaps.org document without XHTML elements", () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).not.toContain("xhtml");
  });

  it("omits optional fields that are not set", () => {
    expect(xml).toContain("<url>\n<loc>https://tsyvinda.com/minimal</loc>\n</url>");
  });
});
