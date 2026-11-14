"use client";

import { useCallback, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import type { PostCategory } from "@/api/posts";
import type { Block, BlockData } from "@/shared/cms";
import { RichTextSection } from "@/views/shared/RichTextSection/RichTextSection";
import { BlogTopics } from "../BlogTopics/BlogTopics";
import { PostsList } from "../PostsList/PostsList";
import { CategoryFilter } from "../CategoryFilter/CategoryFilter";
import {
  BLOG_PAGE_PARAM,
  POSTS_PAGE_SIZE,
  blogPageHref,
} from "../../const/posts";
import {
  useInfinitePosts,
  type InitialPostsData,
} from "../../hooks/useInfinitePosts";
import styles from "../../BlogView.module.css";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const CATEGORY_PARAM = "category";

type BlogViewProps = {
  /** CMS sections of the blog page, in the editor's order */
  blocks: Block[];
  initialData?: InitialPostsData;
  categories?: PostCategory[];
  /** Unprefixed address of the blog in this language, e.g. "/blog" */
  blogPath: string;
};

// `?category=` is the source of truth for the filter; this event tells subscribers it changed.
const CATEGORY_CHANGE_EVENT = "blog:category-change";

function subscribeToCategory(onChange: () => void): () => void {
  window.addEventListener("popstate", onChange);
  window.addEventListener(CATEGORY_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(CATEGORY_CHANGE_EVENT, onChange);
  };
}

const readCategoryParam = (): string | null =>
  new URLSearchParams(window.location.search).get(CATEGORY_PARAM);

// The page is statically prerendered: on the server there is no URL, so no filter.
const serverCategoryParam = (): string | null => null;

function BlogHero({ data }: { data: BlockData<"blogHero"> }) {
  return (
    <motion.section
      className={styles.hero}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <h1 className={styles.title}>
        {data.titleStart}
        {data.titleAccent && (
          <>
            {" "}
            <span className={styles.titleAccent}>{data.titleAccent}</span>
          </>
        )}
      </h1>
      {data.lead && <p className={styles.lead}>{data.lead}</p>}
    </motion.section>
  );
}

export function BlogView({
  blocks,
  initialData,
  categories = [],
  blogPath,
}: BlogViewProps) {
  const categoryParam = useSyncExternalStore(
    subscribeToCategory,
    readCategoryParam,
    serverCategoryParam,
  );
  // Ignore unknown slugs (renamed/removed categories in old links)
  const category =
    categoryParam && categories.some((known) => known.slug === categoryParam)
      ? categoryParam
      : null;

  const selectCategory = useCallback((slug: string | null) => {
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set(CATEGORY_PARAM, slug);
    else url.searchParams.delete(CATEGORY_PARAM);
    // A filtered feed starts from its first page
    url.searchParams.delete(BLOG_PAGE_PARAM);
    window.history.replaceState(null, "", url);
    window.dispatchEvent(new Event(CATEGORY_CHANGE_EVENT));
  }, []);

  const { items, isLoading, isLoadingMore, hasMore, error, page, loadMore, retry } =
    useInfinitePosts(POSTS_PAGE_SIZE, initialData, category);
  const firstPage = category === null ? (initialData?.page ?? 1) : 1;

  return (
    <div className={styles.page}>
      <div className={styles.noise} aria-hidden="true" />

      <main className={styles.main}>
        {blocks.map((block) => {
          switch (block.type) {
            case "blogHero":
              return <BlogHero key={block.id} data={block.data} />;
            case "blogTopics":
              return <BlogTopics key={block.id} data={block.data} />;
            case "richText":
              return (
                <RichTextSection
                  key={block.id}
                  data={block.data}
                  anchor={block.anchor}
                />
              );
            case "blogFeed":
              return (
                <motion.section
                  key={block.id}
                  id={block.anchor ?? undefined}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
                >
                  <CategoryFilter
                    categories={categories}
                    selected={category}
                    onSelect={selectCategory}
                  />
                  <PostsList
                    items={items}
                    isLoading={isLoading}
                    isLoadingMore={isLoadingMore}
                    hasMore={hasMore}
                    error={error}
                    onLoadMore={loadMore}
                    onRetry={retry}
                    pagination={
                      // Page links only for the unfiltered feed (filters are not paged by URL)
                      category === null
                        ? {
                            newerHref:
                              firstPage > 1
                                ? blogPageHref(blogPath, firstPage - 1)
                                : null,
                            olderHref: hasMore
                              ? blogPageHref(blogPath, page + 1)
                              : null,
                          }
                        : undefined
                    }
                  />
                </motion.section>
              );
            default:
              return null;
          }
        })}
      </main>
    </div>
  );
}
