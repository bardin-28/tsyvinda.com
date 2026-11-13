// Server only: used by server components, route handlers and metadata (never bundled for the browser).

import { cache } from "react";

import { API, ApiError } from "@/api";
import type { Locale } from "@/i18n/locales";

import { parsePage } from "./parsePage";
import { DEFAULT_ROUTE_MAP } from "./routes";
import {
  routeMapSchema,
  routeResolutionSchema,
  type PageKey,
  type RouteMap,
  type RouteResolution,
  type WebsitePage,
} from "./schemas";

/** Seconds a CMS response is reused before the next visit refetches it (edits also revalidate by tag). */
export const CMS_REVALIDATE_SECONDS = 60;

/** Cache tags the API's revalidation webhook sends (be: CACHE_TAGS). */
export const CMS_TAGS = {
  routes: "routes",
  posts: "posts",
  page: (key: PageKey) => `page:${key}`,
  post: (slug: string) => `post:${slug}`,
} as const;

const isNotFound = (error: unknown): boolean =>
  error instanceof ApiError && error.status === 404;

/**
 * The published page in `locale`; null when it is not published there. Tagged with the page, so
 * saving it in the admin refreshes it.
 */
export const getWebsitePage = cache(
  async (key: PageKey, locale: Locale): Promise<WebsitePage | null> => {
    try {
      const raw = await API.get<unknown>(`/pages/${key}`, {
        params: { locale },
        next: {
          revalidate: CMS_REVALIDATE_SECONDS,
          tags: [CMS_TAGS.page(key)],
        },
      });
      return parsePage(raw);
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  },
);

/** What lives at an unprefixed path in `locale`; null when nothing does. */
export const resolveRoute = cache(
  async (path: string, locale: Locale): Promise<RouteResolution | null> => {
    try {
      const raw = await API.get<unknown>("/routes/resolve", {
        params: { path, locale },
        next: {
          revalidate: CMS_REVALIDATE_SECONDS,
          tags: [CMS_TAGS.routes, CMS_TAGS.posts],
        },
      });
      return routeResolutionSchema.parse(raw);
    } catch (error) {
      // 400 = a path the API can't even read (too long, bad encoding): nothing there either
      if (
        isNotFound(error) ||
        (error instanceof ApiError && error.status === 400)
      ) {
        return null;
      }
      throw error;
    }
  },
);

/**
 * Every published page's path per language (menus, links, sitemap). Falls back to the default
 * addresses when the API can't be reached, so the site chrome never fails to render.
 */
export const getRouteMap = cache(async (): Promise<RouteMap> => {
  try {
    const raw = await API.get<unknown>("/routes", {
      next: { revalidate: CMS_REVALIDATE_SECONDS, tags: [CMS_TAGS.routes] },
    });
    return routeMapSchema.parse(raw);
  } catch (error) {
    console.error(
      "[cms] route map unavailable, using default addresses",
      error,
    );
    return DEFAULT_ROUTE_MAP;
  }
});
