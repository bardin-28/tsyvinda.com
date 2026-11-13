/**
 * When the content of each static page last changed (ISO date). Feeds the JSON-LD `dateModified`
 * and the sitemap `lastmod`, so search engines and AI crawlers get a real freshness signal.
 * **Update the date when you change a page's copy** (texts in `src/messages`, page `const/`).
 * Blog pages don't need this: their dates come from the posts. Privacy: see its `const/seo.ts`.
 */
export const PAGE_UPDATED_AT = {
  home: "2026-11-13",
  about: "2026-11-13",
  contacts: "2026-11-13",
} as const;
