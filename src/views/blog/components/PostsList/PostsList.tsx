"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

import type { Post } from "@/api/posts";
import { Link } from "@/i18n/navigation";
import { PostCard } from "../PostCard/PostCard";
import styles from "./PostsList.module.css";

type PostsListProps = {
  items: Post[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: Error | null;
  onLoadMore: () => void;
  onRetry: () => void;
  /**
   * Plain links to the neighbouring feed pages (`?page=N`), rendered in the HTML so crawlers
   * reach every post; infinite scroll still loads older posts in place. Null = no such page.
   */
  pagination?: { newerHref: string | null; olderHref: string | null };
};

const SKELETON_COUNT = 6;

function SkeletonGrid() {
  return (
    <div className={styles.skeletonGrid} aria-hidden="true">
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <div key={i} className={styles.skeletonCard}>
          <div className={styles.skeletonImage} />
          <div className={styles.skeletonBody}>
            <div className={styles.skeletonLine} />
            <div
              className={`${styles.skeletonLine} ${styles.skeletonLineShort}`}
            />
            <div className={styles.skeletonLine} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PostsList({
  items,
  isLoading,
  isLoadingMore,
  hasMore,
  error,
  onLoadMore,
  onRetry,
  pagination,
}: PostsListProps) {
  const t = useTranslations("blog.list");
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, onLoadMore]);

  if (isLoading && items.length === 0) {
    return (
      <div className={styles.wrap} aria-busy="true" aria-live="polite">
        <SkeletonGrid />
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className={styles.wrap}>
        <div className={styles.error} role="alert">
          <p>{t("loadError")}</p>
          <button type="button" className={styles.retry} onClick={onRetry}>
            {t("retry")}
          </button>
        </div>
      </div>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <div className={styles.wrap}>
        <div className={styles.empty} role="status">
          <h2 className={styles.emptyTitle}>{t("emptyTitle")}</h2>
          <p className={styles.emptyText}>{t("emptyText")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.grid}>
        {items.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
      )}

      {isLoadingMore && (
        <div className={styles.loadingMore} role="status" aria-live="polite">
          <span className={styles.spinner} aria-hidden="true" />
          <span>{t("loadingMore")}</span>
        </div>
      )}

      {error && items.length > 0 && (
        <div className={styles.error} role="alert">
          <p>{t("loadMoreError")}</p>
          <button type="button" className={styles.retry} onClick={onRetry}>
            {t("retry")}
          </button>
        </div>
      )}

      {!hasMore && !isLoadingMore && items.length > 0 && (
        <div className={styles.end}>{t("end")}</div>
      )}

      {pagination && (pagination.newerHref || pagination.olderHref) && (
        <nav className={styles.pagination} aria-label={t("pagination")}>
          {pagination.newerHref && (
            <Link className={styles.pageLink} href={pagination.newerHref} rel="prev">
              {t("newerPosts")}
            </Link>
          )}
          {pagination.olderHref && (
            <Link className={styles.pageLink} href={pagination.olderHref} rel="next">
              {t("olderPosts")}
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
