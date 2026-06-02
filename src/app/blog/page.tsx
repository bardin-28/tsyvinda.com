import { getPosts } from "@/api/posts";
import { BlogView } from "./components/BlogView/BlogView";
import {
  POSTS_PAGE_SIZE,
  type InitialPostsData,
} from "./hooks/useInfinitePosts";

// ISR: prerender the list as static HTML (so crawlers see real posts/links),
// refreshed periodically.
export const revalidate = 300;

export default async function BlogPage() {
  // Fetch posts at render so crawlers receive real content and links in the
  // HTML. Do NOT swallow a failure into an empty shell: a 200 page with no
  // posts (or the client-side "Could not load posts" error) gets flagged as a
  // Soft 404. Letting the error propagate renders blog/error.tsx with a 5xx
  // status, which Google retries instead of indexing as a valid empty page.
  const page = await getPosts({ limit: POSTS_PAGE_SIZE });
  const initialData: InitialPostsData = {
    items: page.items,
    nextCursor: page.nextCursor,
  };

  return <BlogView initialData={initialData} />;
}
