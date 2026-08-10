import { getPosts } from "@/api/posts";
import { BlogTopics } from "./components/BlogTopics/BlogTopics";
import { BlogView } from "./components/BlogView/BlogView";
import { buildBlogItemListSchema } from "./const/seo";
import {
  POSTS_PAGE_SIZE,
  type InitialPostsData,
} from "./hooks/useInfinitePosts";

// ISR: prerender the list as static HTML (so crawlers see real posts/links),
// refreshed periodically.
export const revalidate = 300;

export default async function BlogPage() {
  // Fetch posts at render so crawlers receive real content and links in the
  // HTML. Swallow failures into a shell rather than throwing: this route is
  // statically prerendered at build time, so a throw would fail the whole
  // build (and an unreachable backend must not block deploys).
  let initialData: InitialPostsData | undefined;
  try {
    const page = await getPosts({ limit: POSTS_PAGE_SIZE });
    initialData = { items: page.items, nextCursor: page.nextCursor };
  } catch {
    initialData = undefined;
  }

  const posts = initialData?.items ?? [];

  return (
    <>
      {posts.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildBlogItemListSchema(posts)),
          }}
        />
      )}

      <BlogView initialData={initialData}>
        <BlogTopics />
      </BlogView>
    </>
  );
}
