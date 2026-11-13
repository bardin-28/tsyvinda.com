import { API } from "@/api";
import type { Locale } from "@/i18n/locales";

export type PostAuthor = {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
};

export type PostCategory = {
  id: string;
  name: string;
  /** Filter key: /blog?category=<slug> */
  slug: string;
};

export type Post = {
  id: string;
  /** Language of the translated fields (title, text, cover, SEO) */
  locale: Locale;
  /** Languages the post is translated into (for hreflang and the language switch) */
  locales: Locale[];
  slug: string;
  title: string;
  description: string | null;
  htmlContent: string;
  imageUrl: string | null;
  coverAlt: string | null;
  author: PostAuthor;
  /** Ordered: the first is the main category */
  categories: PostCategory[];
  /** "Date shown"; the public API only returns published posts, which always have one */
  publishedAt: string | null;
  /** SEO overrides; null = derived from title / description / cover / own URL */
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageUrl: string | null;
  canonicalUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PostsPage = {
  items: Post[];
  nextCursor: string | null;
};

export type GetPostsParams = {
  cursor?: string;
  limit?: number;
  /** Category slug */
  category?: string;
  /** Only posts translated into this language, in this language */
  locale: Locale;
};

export function getPosts(params: GetPostsParams): Promise<PostsPage> {
  const { cursor, limit, category, locale } = params;
  return API.get<PostsPage>("/posts", {
    params: {
      cursor: cursor ?? undefined,
      limit: limit ?? undefined,
      category: category ?? undefined,
      locale,
    },
  });
}

/** The post in `locale`; 404s (ApiError) when it has no version in that language. */
export function getPostBySlug(slug: string, locale: Locale): Promise<Post> {
  return API.get<Post>(`/posts/${slug}`, { params: { locale } });
}

/** Categories with at least one published post in `locale`, A–Z, names in that language. */
export function getPostCategories(locale: Locale): Promise<PostCategory[]> {
  return API.get<PostCategory[]>("/post-categories", { params: { locale } });
}

/** The date a post shows as published (falls back to creation for safety). */
export function postDate(
  post: Pick<Post, "publishedAt" | "createdAt">,
): string {
  return post.publishedAt ?? post.createdAt;
}
