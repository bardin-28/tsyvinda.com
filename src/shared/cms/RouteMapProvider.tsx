"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useLocale } from "next-intl";

import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/locales";

import { DEFAULT_ROUTE_MAP, pagePath, postPath } from "./routes";
import type { PageKey, RouteMap } from "./schemas";

const RouteMapContext = createContext<RouteMap>(DEFAULT_ROUTE_MAP);

/** Gives client components the CMS addresses (loaded once per request by the locale layout). */
export function RouteMapProvider({
  routeMap,
  children,
}: {
  routeMap: RouteMap;
  children: ReactNode;
}) {
  return (
    <RouteMapContext.Provider value={routeMap}>
      {children}
    </RouteMapContext.Provider>
  );
}

function useCurrentLocale(): Locale {
  const locale = useLocale();
  return isLocale(locale) ? locale : DEFAULT_LOCALE;
}

/** Unprefixed path of a CMS page in the current language, for the i18n `Link` (`href`). */
export function usePagePath(key: PageKey): string {
  return pagePath(useContext(RouteMapContext), key, useCurrentLocale());
}

/** Builds paths of CMS pages and blog posts in the current language. */
export function usePaths(): {
  page: (key: PageKey) => string;
  post: (slug: string) => string;
} {
  const map = useContext(RouteMapContext);
  const locale = useCurrentLocale();
  return {
    page: (key) => pagePath(map, key, locale),
    post: (slug) => postPath(map, slug, locale),
  };
}
