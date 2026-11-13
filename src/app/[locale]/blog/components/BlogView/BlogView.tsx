"use client";

import { useCallback, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import type { PostCategory } from "@/api/posts";
import { PostsList } from "../PostsList/PostsList";
import { CategoryFilter } from "../CategoryFilter/CategoryFilter";
import { POSTS_PAGE_SIZE } from "../../const/posts";
import {
  useInfinitePosts,
  type InitialPostsData,
} from "../../hooks/useInfinitePosts";
import styles from "../../page.module.css";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const CATEGORY_PARAM = "category";

type BlogViewProps = {
  initialData?: InitialPostsData;
  categories?: PostCategory[];
  /** Static, server-rendered content appended below the feed. */
  children?: React.ReactNode;
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

export function BlogView({
  initialData,
  categories = [],
  children,
}: BlogViewProps) {
  const t = useTranslations("blog.hero");
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
    window.history.replaceState(null, "", url);
    window.dispatchEvent(new Event(CATEGORY_CHANGE_EVENT));
  }, []);

  const { items, isLoading, isLoadingMore, hasMore, error, loadMore, retry } =
    useInfinitePosts(POSTS_PAGE_SIZE, initialData, category);

  return (
    <div className={styles.page}>
      <div className={styles.noise} aria-hidden="true" />

      <main className={styles.main}>
        <motion.section
          className={styles.hero}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <h1 className={styles.title}>
            {t("titleStart")}{" "}
            <span className={styles.titleAccent}>{t("titleAccent")}</span>
          </h1>
          <p className={styles.lead}>{t("lead")}</p>
        </motion.section>

        <motion.section
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
          />
        </motion.section>

        {children}
      </main>
    </div>
  );
}
