import { getTranslations } from "next-intl/server";

import { getPostCategories, getPosts, type PostCategory } from "@/api/posts";
import { DEFAULT_PAGE_PATHS } from "@/shared/cms";

import { JsonLd } from "../JsonLd";
import type { CmsViewProps } from "../types";
import { BlogBackground } from "./components/BlogBackground/BlogBackground";
import { BlogView } from "./components/BlogView/BlogView";
import { POSTS_PAGE_SIZE } from "./const/posts";
import {
  buildBlogBreadcrumbSchema,
  buildBlogItemListSchema,
  buildBlogPageSchema,
  buildBlogSchema,
  type BlogSeoCopy,
} from "./const/seo";
import type { InitialPostsData } from "./hooks/useInfinitePosts";

/**
 * The blog index (CMS page `blog`): hero, posts feed and topics in the editor's order. The first
 * page of posts and the category chips are fetched here so crawlers get real links in the HTML.
 */
export async function BlogPageView({ page, locale }: CmsViewProps) {
  // Failures render a shell rather than an error: the feed retries in the browser
  let initialData: InitialPostsData | undefined;
  try {
    const posts = await getPosts({ limit: POSTS_PAGE_SIZE, locale });
    initialData = { items: posts.items, nextCursor: posts.nextCursor };
  } catch {
    initialData = undefined;
  }
  let categories: PostCategory[] = [];
  try {
    categories = await getPostCategories(locale);
  } catch {
    categories = [];
  }

  const posts = initialData?.items ?? [];
  const common = await getTranslations({ locale, namespace: "common" });
  const copy: BlogSeoCopy = {
    title: page.title,
    socialTitle: page.seo.socialTitle,
    description: page.seo.description,
    homeName: common("nav.home"),
    path: page.paths[locale] ?? DEFAULT_PAGE_PATHS.blog,
  };

  return (
    <>
      <JsonLd
        schemas={[
          buildBlogPageSchema(locale, copy, posts),
          buildBlogSchema(locale, copy, posts),
          buildBlogBreadcrumbSchema(locale, copy),
          ...(posts.length > 0
            ? [buildBlogItemListSchema(posts, locale, copy)]
            : []),
        ]}
      />
      <BlogBackground />
      <BlogView
        blocks={page.blocks}
        initialData={initialData}
        categories={categories}
      />
    </>
  );
}
