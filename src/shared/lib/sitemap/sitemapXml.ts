import type { MetadataRoute } from "next";

/**
 * Plain sitemaps.org XML: `<loc>`, `<lastmod>`, `<changefreq>`, `<priority>` per URL.
 *
 * Language alternates (hreflang) are deliberately left out. They live in each page's `<head>`
 * and `Link` header, which search engines treat as equivalent. In the sitemap they would need
 * `<xhtml:link>` elements, and Chrome renders any XML holding XHTML-namespace elements as a bare
 * text page instead of the XML tree. Entries' `alternates` are therefore ignored here.
 */

const XML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => XML_ESCAPES[character]);
}

function lastModified(value: string | Date): string {
  return (value instanceof Date ? value : new Date(value)).toISOString();
}

function urlElement(entry: MetadataRoute.Sitemap[number]): string {
  const lines = [`<loc>${escapeXml(entry.url)}</loc>`];
  if (entry.lastModified) lines.push(`<lastmod>${lastModified(entry.lastModified)}</lastmod>`);
  if (entry.changeFrequency) lines.push(`<changefreq>${entry.changeFrequency}</changefreq>`);
  if (entry.priority !== undefined) lines.push(`<priority>${entry.priority}</priority>`);
  return `<url>\n${lines.join("\n")}\n</url>`;
}

export function buildSitemapXml(entries: MetadataRoute.Sitemap): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(urlElement),
    "</urlset>",
    "",
  ].join("\n");
}
