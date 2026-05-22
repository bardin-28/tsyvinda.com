"use client";

import { useEffect, useRef } from "react";
import type { Post } from "@/api/posts";
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
            <div className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
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
}: PostsListProps) {
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
      { rootMargin: "300px 0px" }
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
          <p>Could not load posts. Please try again.</p>
          <button type="button" className={styles.retry} onClick={onRetry}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <div className={styles.wrap}>
        <div className={styles.empty} role="status">
          <h2 className={styles.emptyTitle}>No posts yet</h2>
          <p className={styles.emptyText}>
            New articles will appear here. Check back soon.
          </p>
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
          <span>Loading more…</span>
        </div>
      )}

      {error && items.length > 0 && (
        <div className={styles.error} role="alert">
          <p>Could not load more posts.</p>
          <button type="button" className={styles.retry} onClick={onRetry}>
            Retry
          </button>
        </div>
      )}

      {!hasMore && !isLoadingMore && items.length > 0 && (
        <div className={styles.end}>— end of feed —</div>
      )}
    </div>
  );
}
