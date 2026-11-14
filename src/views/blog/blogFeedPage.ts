import { getPosts, type PostsPage } from "@/api/posts";
import type { Locale } from "@/i18n/locales";

import { POSTS_PAGE_SIZE } from "./const/posts";

/**
 * Page `page` (1-based) of the blog feed in `locale`. The API pages by cursor, so earlier pages
 * are walked to reach it. Null when the feed has fewer pages (the caller renders a 404).
 */
export async function getBlogFeedPage(
  locale: Locale,
  page: number,
): Promise<PostsPage | null> {
  let cursor: string | undefined;
  for (let current = 1; ; current++) {
    const result = await getPosts({ cursor, limit: POSTS_PAGE_SIZE, locale });
    if (current === page) {
      return page > 1 && result.items.length === 0 ? null : result;
    }
    if (!result.nextCursor) return null;
    cursor = result.nextCursor;
  }
}
