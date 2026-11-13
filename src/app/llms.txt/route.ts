import { getTranslations } from "next-intl/server";

import { getPosts, postDate, type Post } from "@/api/posts";
import { LOCALES, type Locale } from "@/i18n/locales";
import { absoluteUrl } from "@/i18n/seo";
import { pagePath, postPath, type PageKey, type RouteMap } from "@/shared/cms";
import { getRouteMap, getWebsitePage } from "@/shared/cms/api";
import { isIndexingEnabled } from "@/shared/lib/indexing";
import {
  buildLlmsTxt,
  type LlmsLink,
  type LlmsLocaleSection,
} from "@/shared/lib/llms";
import { SITE_URL } from "@/shared/lib/site";

// Same cadence as the sitemap: new posts and the admin indexing switch show up within minutes
export const revalidate = 300;

/** Newest posts listed per language (same cap as the sitemap). */
const POSTS_PER_LOCALE = 50;

/** CMS pages listed per language, then the legal pages under "Optional". */
const MAIN_PAGES: PageKey[] = ["home", "about", "blog", "contacts"];
const LEGAL_PAGES: PageKey[] = ["privacy-policy", "cookie-policy"];

const TEXT_HEADERS = { "Content-Type": "text/plain; charset=utf-8" };

/** Published posts in `locale`; an empty list when the API is unavailable. */
async function loadPosts(locale: Locale): Promise<Post[]> {
  try {
    return (await getPosts({ limit: POSTS_PER_LOCALE, locale })).items;
  } catch {
    return [];
  }
}

function postLink(post: Post, locale: Locale, routeMap: RouteMap): LlmsLink {
  const publishedOn = postDate(post).slice(0, 10);
  const lead = post.seoDescription || post.description;
  return {
    title: post.title,
    url: absoluteUrl(postPath(routeMap, post.slug, locale), locale),
    description: lead ? `${lead} (${publishedOn})` : publishedOn,
  };
}

/** A CMS page as an llms.txt link (its SEO title and description); null while unpublished. */
async function pageLink(
  key: PageKey,
  locale: Locale,
): Promise<LlmsLink | null> {
  const page = await getWebsitePage(key, locale).catch(() => null);
  const path = page?.paths[locale];
  if (!page || !path || page.seo.noindex) return null;
  return {
    title: key === "home" ? page.title : page.seo.title,
    url: absoluteUrl(path, locale),
    description: page.seo.description,
  };
}

const isLink = (link: LlmsLink | null): link is LlmsLink => link !== null;

async function loadLocaleSection(
  locale: Locale,
  routeMap: RouteMap,
): Promise<LlmsLocaleSection> {
  const posts = await loadPosts(locale);
  const pages = await Promise.all(
    MAIN_PAGES.map((key) => pageLink(key, locale)),
  );
  return {
    locale,
    pages: pages.filter(isLink),
    posts: posts.map((post) => postLink(post, locale, routeMap)),
  };
}

/** `/llms.txt` — Markdown site map for language models (https://llmstxt.org). */
export async function GET(): Promise<Response> {
  // Indexing off (admin: Settings → General): advertise nothing, like the sitemap
  if (!(await isIndexingEnabled())) {
    return new Response("Not found\n", { status: 404, headers: TEXT_HEADERS });
  }

  const [defaultLocale] = LOCALES;
  const common = await getTranslations({
    locale: defaultLocale,
    namespace: "common",
  });
  const routeMap = await getRouteMap();
  const sections = await Promise.all(
    LOCALES.map((locale) => loadLocaleSection(locale, routeMap)),
  );
  const legal = await Promise.all(
    LEGAL_PAGES.map((key) => pageLink(key, defaultLocale)),
  );
  const englishLanguageNames = new Intl.DisplayNames(["en"], {
    type: "language",
  });
  const languageNames = LOCALES.map(
    (locale) => englishLanguageNames.of(locale) ?? locale,
  );

  const body = buildLlmsTxt({
    name: common("site.name"),
    summary: common("site.description"),
    details: [
      `${common("site.jobTitle")} based in ${common("site.city")}, ${common("site.country")}.`,
      `The site is available in ${languageNames.join(" and ")}: English URLs have no prefix, other languages are prefixed (e.g. ${absoluteUrl(pagePath(routeMap, "about", "uk"), "uk")}).`,
      "Blog posts may exist in only some languages.",
    ].join(" "),
    sections,
    optional: [
      ...legal.filter(isLink),
      { title: "Sitemap", url: `${SITE_URL}/sitemap.xml` },
    ],
  });

  return new Response(body, { headers: TEXT_HEADERS });
}
