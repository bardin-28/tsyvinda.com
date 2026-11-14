import type { MetadataRoute } from "next";

import { getPosts, type Post } from "@/api/posts";
import { LOCALES, type Locale } from "@/i18n/locales";
import { absoluteUrl } from "@/i18n/seo";
import {
  PAGE_KEYS,
  type LocalizedPaths,
  type PageKey,
} from "@/shared/cms/schemas";
import { getRouteMap, getWebsitePage } from "@/shared/cms/api";
import { postPaths } from "@/shared/cms/routes";
import { isIndexingEnabled } from "@/shared/lib/indexing";
import { latestPostUpdate } from "@/views/blog/const/seo";


type SitemapEntry = MetadataRoute.Sitemap[number];

/** Crawl hints per CMS page. */
const PAGE_HINTS: Record<
  PageKey,
  { changeFrequency: SitemapEntry["changeFrequency"]; priority: number }
> = {
  home: { changeFrequency: "monthly", priority: 1 },
  about: { changeFrequency: "monthly", priority: 0.8 },
  contacts: { changeFrequency: "yearly", priority: 0.8 },
  blog: { changeFrequency: "weekly", priority: 0.7 },
  "privacy-policy": { changeFrequency: "yearly", priority: 0.3 },
  "cookie-policy": { changeFrequency: "yearly", priority: 0.3 },
};

/** hreflang alternates: every language the page or post exists in, at its own address. */
function languageAlternates(paths: LocalizedPaths) {
  return {
    languages: Object.fromEntries(
      (Object.entries(paths) as [Locale, string][]).map(([locale, path]) => [
        locale,
        absoluteUrl(path, locale),
      ]),
    ),
  };
}

/**
 * Last content change of a page in one language: the blog by its newest post, other pages by
 * their publish date. Null = leave the page out (unpublished there, or hidden from search).
 */
async function pageLastModified(
  key: PageKey,
  locale: Locale,
  posts: Post[],
): Promise<{ lastModified?: string } | null> {
  const page = await getWebsitePage(key, locale).catch(() => null);
  if (!page || page.seo.noindex) return null;
  if (key === "blog") return { lastModified: latestPostUpdate(posts) };
  return { lastModified: page.publishedAt };
}

/** One entry per language version of every published page and post, each listing its alternates. */
export async function sitemapEntries(): Promise<MetadataRoute.Sitemap> {
  // Indexing off (admin: Settings → General): nothing to submit to search engines
  if (!(await isIndexingEnabled())) return [];

  const routeMap = await getRouteMap();
  const postsByLocale = new Map<Locale, Post[]>();
  for (const locale of LOCALES) {
    try {
      postsByLocale.set(locale, (await getPosts({ limit: 50, locale })).items);
    } catch {
      // Backend unavailable — ship the pages rather than failing the route.
      postsByLocale.set(locale, []);
    }
  }

  const pageEntries: MetadataRoute.Sitemap = [];
  for (const key of PAGE_KEYS) {
    const paths = routeMap.pages[key] ?? {};
    for (const [locale, path] of Object.entries(paths) as [Locale, string][]) {
      const known = await pageLastModified(
        key,
        locale,
        postsByLocale.get(locale) ?? [],
      );
      if (!known) continue;
      // A missing lastmod is better than a made-up one (crawlers distrust dates that always change)
      pageEntries.push({
        url: absoluteUrl(path, locale),
        lastModified: known.lastModified
          ? new Date(known.lastModified)
          : undefined,
        ...PAGE_HINTS[key],
        alternates: languageAlternates(paths),
      });
    }
  }

  const postEntries: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    (postsByLocale.get(locale) ?? []).map((post) => {
      const paths = postPaths(routeMap, post);
      return {
        url: absoluteUrl(paths[locale]!, locale),
        lastModified: new Date(post.updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.6,
        alternates: languageAlternates(paths),
      };
    }),
  );

  return [...pageEntries, ...postEntries];
}
