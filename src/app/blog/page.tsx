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
  let initialData: InitialPostsData | undefined;
  try {
    const page = await getPosts({ limit: POSTS_PAGE_SIZE });
    initialData = { items: page.items, nextCursor: page.nextCursor };
  } catch {
    // Backend unavailable at render time — render the shell and let the client
    // fetch on mount rather than failing the route.
    initialData = undefined;
  }

  return <BlogView initialData={initialData} />;
}
