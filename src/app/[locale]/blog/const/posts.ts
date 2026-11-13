/**
 * Posts per page for the blog feed — the server prefetch (page.tsx) and the
 * client infinite scroll (useInfinitePosts) must agree on it.
 *
 * Lives here, not in the "use client" hook module: a server component that
 * imports a value from a client module gets a client reference instead of the
 * value, so `getPosts({ limit })` sent a stringified function to the API.
 */
export const POSTS_PAGE_SIZE = 10;
