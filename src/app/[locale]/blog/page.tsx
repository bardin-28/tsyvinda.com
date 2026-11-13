import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { getPostCategories, getPosts, type PostCategory } from "@/api/posts";
import { routing } from "@/i18n/routing";
import { jsonLd } from "@/shared/lib/schemas";
import { BlogTopics } from "./components/BlogTopics/BlogTopics";
import { BlogView } from "./components/BlogView/BlogView";
import { POSTS_PAGE_SIZE } from "./const/posts";
import { loadBlogSeoCopy } from "./const/copy";
import { buildBlogItemListSchema } from "./const/seo";
import type { InitialPostsData } from "./hooks/useInfinitePosts";

// ISR: prerender the list as static HTML (so crawlers see real posts/links),
// refreshed periodically.
export const revalidate = 300;

type BlogPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  // Fetch posts at render so crawlers receive real content and links in the
  // HTML. Swallow failures into a shell rather than throwing: this route is
  // statically prerendered at build time, so a throw would fail the whole
  // build (and an unreachable backend must not block deploys).
  let initialData: InitialPostsData | undefined;
  try {
    const page = await getPosts({ limit: POSTS_PAGE_SIZE, locale });
    initialData = { items: page.items, nextCursor: page.nextCursor };
  } catch {
    initialData = undefined;
  }
  // Filter chips; without them the blog still works, just unfiltered.
  let categories: PostCategory[] = [];
  try {
    categories = await getPostCategories(locale);
  } catch {
    categories = [];
  }

  const posts = initialData?.items ?? [];
  const seoCopy = await loadBlogSeoCopy(locale);

  return (
    <>
      {posts.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd(buildBlogItemListSchema(posts, locale, seoCopy)),
          }}
        />
      )}

      <BlogView initialData={initialData} categories={categories}>
        <BlogTopics />
      </BlogView>
    </>
  );
}
