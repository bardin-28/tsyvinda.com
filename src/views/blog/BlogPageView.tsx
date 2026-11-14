import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { getPostCategories, type PostCategory, type PostsPage } from "@/api/posts";
import { DEFAULT_PAGE_PATHS } from "@/shared/cms";

import { JsonLd } from "../JsonLd";
import type { CmsViewProps } from "../types";
import { BlogBackground } from "./components/BlogBackground/BlogBackground";
import { BlogView } from "./components/BlogView/BlogView";
import { getBlogFeedPage } from "./blogFeedPage";
import {
  buildBlogBreadcrumbSchema,
  buildBlogItemListSchema,
  buildBlogPageSchema,
  buildBlogSchema,
  type BlogSeoCopy,
} from "./const/seo";
import type { InitialPostsData } from "./hooks/useInfinitePosts";

type BlogPageViewProps = CmsViewProps & {
  /** Feed page from `?page=` (1 = newest posts) */
  feedPage: number;
};

/**
 * The blog index (CMS page `blog`): hero, posts feed and topics in the editor's order. The
 * requested page of posts (`?page=N`, newest first) and the category chips are fetched here so
 * crawlers get real links in the HTML, including the link to the next page.
 */
export async function BlogPageView({ page, locale, feedPage }: BlogPageViewProps) {
  // API failures render a shell rather than an error (the feed retries in the browser);
  // a page past the end of the feed is a 404
  let feed: PostsPage | null | undefined;
  try {
    feed = await getBlogFeedPage(locale, feedPage);
  } catch {
    feed = undefined;
  }
  if (feed === null) notFound();
  const initialData: InitialPostsData | undefined = feed
    ? { items: feed.items, nextCursor: feed.nextCursor, page: feedPage }
    : undefined;
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
    socialTitle: page.seo.title,
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
        blogPath={copy.path}
      />
    </>
  );
}
