import { SITE_URL } from "./site";

/**
 * How crawlers may use the content once they have it (https://contentsignals.org):
 * search indexing and AI answers that link back are allowed, model training is not.
 */
export const CONTENT_SIGNAL = "search=yes, ai-input=yes, ai-train=no";

/**
 * `/robots.txt`. Hand-written instead of Next's `MetadataRoute.Robots`, which cannot emit the
 * `Content-Signal` line. Everything is crawlable except the API proxy.
 */
export function buildRobotsTxt(): string {
  const lines: string[] = [
    "# Content signals: search=yes (index and show in search results),",
    "# ai-input=yes (use in AI answers with a link back), ai-train=no (no model training).",
    "User-Agent: *",
    `Content-Signal: ${CONTENT_SIGNAL}`,
    "Allow: /",
    "Disallow: /api/",
    "",
    `Host: ${SITE_URL}`,
    `Sitemap: ${SITE_URL}/sitemap.xml`,
  ];
  return `${lines.join("\n")}\n`;
}
