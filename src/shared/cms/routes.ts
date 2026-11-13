import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/locales";
import { ROUTES } from "@/shared/const/routes";

import type { LocalizedPaths, PageKey, RouteMap } from "./schemas";

/**
 * Each page's address before the API is asked (and while it can't be reached): the default
 * slugs the CMS seeds, the same in every language. Editors can change them in the admin panel.
 */
export const DEFAULT_PAGE_PATHS: Record<PageKey, string> = {
  home: ROUTES.HOME,
  about: ROUTES.ABOUT,
  contacts: ROUTES.CONTACTS,
  blog: ROUTES.BLOG,
  "privacy-policy": ROUTES.PRIVACY_POLICY,
  "cookie-policy": ROUTES.COOKIE_POLICY,
};

/** Route map with the default addresses in every language. */
export const DEFAULT_ROUTE_MAP: RouteMap = {
  pages: Object.fromEntries(
    Object.entries(DEFAULT_PAGE_PATHS).map(([key, path]) => [
      key,
      Object.fromEntries(LOCALES.map((locale) => [locale, path])),
    ]),
  ) as RouteMap["pages"],
};

/**
 * Unprefixed path of a page in `locale` ("/pro-mene"): the published one, else the page's English
 * address, else its default. Links stay usable even for a page missing in one language.
 */
export function pagePath(map: RouteMap, key: PageKey, locale: Locale): string {
  const paths: LocalizedPaths | undefined = map.pages[key];
  return paths?.[locale] ?? paths?.[DEFAULT_LOCALE] ?? DEFAULT_PAGE_PATHS[key];
}

/** Path of a blog post in `locale`: the blog page's path + the post's slug. */
export function postPath(map: RouteMap, slug: string, locale: Locale): string {
  return `${pagePath(map, "blog", locale)}/${slug}`;
}

/** Paths of a post in the languages it is translated into. */
export function postPaths(
  map: RouteMap,
  slug: string,
  locales: readonly Locale[],
): LocalizedPaths {
  return Object.fromEntries(
    locales.map((locale) => [locale, postPath(map, slug, locale)]),
  );
}
