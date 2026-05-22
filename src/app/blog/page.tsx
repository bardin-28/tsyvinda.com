"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ROUTES } from "@/shared/const";
import { AuthButton } from "@/shared/components";
import { PostsList } from "./components/PostsList/PostsList";
import { useInfinitePosts } from "./hooks/useInfinitePosts";
import styles from "./page.module.css";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function BlogPage() {
  const { items, isLoading, isLoadingMore, hasMore, error, loadMore, retry } =
    useInfinitePosts();

  return (
    <div className={styles.page}>
      <div className={styles.noise} aria-hidden="true" />

      <motion.nav
        className={styles.topNav}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <Link href={ROUTES.HOME} className={styles.backLink} aria-label="Back to home">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          <span>Home</span>
        </Link>
        <AuthButton />
      </motion.nav>

      <main className={styles.main}>
        <motion.section
          className={styles.hero}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <span className={styles.eyebrow}>
            <span className={styles.dot} aria-hidden="true" />
            Blog
          </span>
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
