import { getPostBySlug, getPosts, postDate, postSlug, type Post } from "@/api/posts";
import { ApiError } from "@/api";
import { splitLocalePath, type Locale } from "@/i18n/locales";
import { absoluteUrl } from "@/i18n/seo";
import { postPath } from "@/shared/cms/routes";
import { getRouteMap, getWebsitePage, resolveRoute } from "@/shared/cms/api";
import type { PageKey } from "@/shared/cms/schemas";

import {
  cmsPageToMarkdown,
  postToMarkdown,
  type MarkdownLink,
} from "./pageMarkdown";

/** Posts listed in the blog page's Markdown (same cap as the sitemap and llms.txt). */
const BLOG_FEED_LIMIT = 50;

export type PageMarkdownResult =
  | { kind: "markdown"; markdown: string; canonicalUrl: string }
  | { kind: "redirect"; location: string; permanent: boolean }
  | { kind: "not-found" };

const NOT_FOUND: PageMarkdownResult = { kind: "not-found" };

/** Next may hand over percent-encoded segments (Cyrillic slugs); the API wants them decoded. */
function decodePath(path: string): string {
  try {
    return decodeURI(path);
  } catch {
    return path;
  }
}

async function blogFeed(locale: Locale): Promise<MarkdownLink[]> {
  const [routeMap, posts] = await Promise.all([
    getRouteMap(),
    getPosts({ limit: BLOG_FEED_LIMIT, locale })
      .then((page) => page.items)
      .catch((): Post[] => []),
  ]);
  return posts.map((post) => ({
    title: post.title,
    url: absoluteUrl(postPath(routeMap, postSlug(post, locale), locale), locale),
    description: `${post.seoDescription || post.description || ""} (${postDate(post).slice(0, 10)})`.trim(),
  }));
}

async function pageMarkdown(
  key: PageKey,
  locale: Locale,
): Promise<PageMarkdownResult> {
  const page = await getWebsitePage(key, locale);
  if (!page) return NOT_FOUND;
  const ownPath = page.paths[locale] ?? "/";
  const url = absoluteUrl(ownPath, locale);
  const posts = key === "blog" ? await blogFeed(locale) : [];
  const markdown = cmsPageToMarkdown(page, {
    url,
    resolveUrl: (path) => absoluteUrl(path, locale),
    posts,
  });
  return { kind: "markdown", markdown, canonicalUrl: url };
}

async function postMarkdown(
  slug: string,
  locale: Locale,
): Promise<PageMarkdownResult> {
  try {
    const [post, routeMap] = await Promise.all([
      getPostBySlug(slug, locale),
      getRouteMap(),
    ]);
    const url = absoluteUrl(postPath(routeMap, postSlug(post, locale), locale), locale);
    return { kind: "markdown", markdown: postToMarkdown(post, url), canonicalUrl: url };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return NOT_FOUND;
    throw error;
  }
}

/**
 * The Markdown version of the public page at `pathname` (as the visitor requested it, with the
 * language prefix): what the catch-all page route would render, as text for AI agents.
 */
export async function resolvePageMarkdown(
  pathname: string,
): Promise<PageMarkdownResult> {
  const { locale, path } = splitLocalePath(decodePath(pathname));
  const normalizedPath = path.length > 1 ? path.replace(/\/+$/, "") : path;
  if (normalizedPath === "/" || normalizedPath === "") {
    return pageMarkdown("home", locale);
  }

  const route = await resolveRoute(normalizedPath, locale);
  if (!route) return NOT_FOUND;
  if (route.kind === "redirect") {
    return { kind: "redirect", location: route.location, permanent: route.permanent };
  }
  if (route.kind === "post") return postMarkdown(route.slug, locale);
  return pageMarkdown(route.key, locale);
}
