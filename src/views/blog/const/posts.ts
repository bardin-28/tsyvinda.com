/**
 * Posts per page for the blog feed — the server prefetch (page.tsx) and the
 * client infinite scroll (useInfinitePosts) must agree on it.
 *
 * Lives here, not in the "use client" hook module: a server component that
 * imports a value from a client module gets a client reference instead of the
 * value, so `getPosts({ limit })` sent a stringified function to the API.
 */
export const POSTS_PAGE_SIZE = 10;

/** `/blog?page=N`: a crawlable page of the feed (infinite scroll still loads in place). */
export const BLOG_PAGE_PARAM = "page";

/** Highest page number served; the API pages by cursor, so page N costs N requests. */
export const MAX_BLOG_PAGE = 50;

/**
 * `?page=` → page number. Absent = 1; anything that is not a whole number from 1 to
 * MAX_BLOG_PAGE (or a repeated param) = null, which the page treats as not found.
 */
export function parseBlogPage(raw: string | string[] | undefined): number | null {
  if (raw === undefined) return 1;
  if (typeof raw !== "string" || !/^[1-9]\d*$/.test(raw)) return null;
  const page = Number(raw);
  return page <= MAX_BLOG_PAGE ? page : null;
}

/** Address of a feed page: page 1 is the blog itself, the others add `?page=N`. */
export function blogPageHref(blogPath: string, page: number): string {
  return page <= 1 ? blogPath : `${blogPath}?${BLOG_PAGE_PARAM}=${page}`;
}
