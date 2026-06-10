"use client";

import { motion } from "framer-motion";
import { PostsList } from "../PostsList/PostsList";
import {
  useInfinitePosts,
  POSTS_PAGE_SIZE,
  type InitialPostsData,
} from "../../hooks/useInfinitePosts";
import styles from "../../page.module.css";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type BlogViewProps = {
  initialData?: InitialPostsData;
};

export function BlogView({ initialData }: BlogViewProps) {
  const { items, isLoading, isLoadingMore, hasMore, error, loadMore, retry } =
    useInfinitePosts(POSTS_PAGE_SIZE, initialData);

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
            Notes on <span className={styles.titleAccent}>building software</span>
          </h1>
          <p className={styles.lead}>
            Articles on frontend engineering, React, Next.js, TypeScript, and
            shipping production-grade web products.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
        >
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
      </main>
    </div>
  );
}
