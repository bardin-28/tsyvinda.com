import type { MetadataRoute } from "next";

import { getPosts, type Post } from "@/api/posts";
import { LOCALES, type Locale } from "@/i18n/locales";
import { absoluteUrl } from "@/i18n/seo";
import { ROUTES } from "@/shared/const";
import { isIndexingEnabled } from "@/shared/lib/indexing";

// Short enough that switching indexing off in the admin empties the sitemap within minutes
export const revalidate = 300;

type SitemapEntry = MetadataRoute.Sitemap[number];

const STATIC_PAGES: {
  path: string;
  changeFrequency: SitemapEntry["changeFrequency"];
  priority: number;
}[] = [
  { path: ROUTES.HOME, changeFrequency: "monthly", priority: 1 },
  { path: ROUTES.ABOUT, changeFrequency: "monthly", priority: 0.8 },
  { path: ROUTES.CONTACTS, changeFrequency: "yearly", priority: 0.8 },
  { path: ROUTES.BLOG, changeFrequency: "weekly", priority: 0.7 },
  { path: ROUTES.PRIVACY_POLICY, changeFrequency: "yearly", priority: 0.3 },
];

/** hreflang alternates of a page available in `locales`. */
function languageAlternates(path: string, locales: readonly Locale[]) {
  return {
    languages: Object.fromEntries(
      locales.map((locale) => [locale, absoluteUrl(path, locale)]),
    ),
  };
}

/** One entry per language version of every page, each listing all versions as alternates. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Indexing off (admin: Settings → General): nothing to submit to search engines
  if (!(await isIndexingEnabled())) return [];

  const lastModified = new Date();
  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.flatMap((page) =>
    LOCALES.map((locale) => ({
      url: absoluteUrl(page.path, locale),
      lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: languageAlternates(page.path, LOCALES),
    })),
  );

  const postEntries: MetadataRoute.Sitemap = [];
  for (const locale of LOCALES) {
    let posts: Post[] = [];
    try {
      posts = (await getPosts({ limit: 50, locale })).items;
    } catch {
      // Backend unavailable — ship the static sitemap rather than failing the route.
    }
    for (const post of posts) {
      const path = ROUTES.blogPost(post.slug);
      postEntries.push({
        url: absoluteUrl(path, locale),
        lastModified: post.updatedAt ? new Date(post.updatedAt) : lastModified,
        changeFrequency: "weekly",
        priority: 0.6,
        alternates: languageAlternates(path, post.locales),
      });
    }
  }

  return [...staticEntries, ...postEntries];
}
