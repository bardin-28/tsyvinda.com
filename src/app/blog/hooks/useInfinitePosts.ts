"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getPosts, type Post } from "@/api/posts";

export const POSTS_PAGE_SIZE = 10;

export type UseInfinitePostsState = {
  items: Post[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: Error | null;
  loadMore: () => void;
  retry: () => void;
};

export function useInfinitePosts(pageSize: number = POSTS_PAGE_SIZE): UseInfinitePostsState {
  const [items, setItems] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const isFetchingRef = useRef<boolean>(false);
  const cursorRef = useRef<string | null>(null);
  const hasMoreRef = useRef<boolean>(true);

  const fetchPage = useCallback(
    async (nextCursor: string | null, isInitial: boolean) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      setError(null);
      if (isInitial) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const page = await getPosts({
          cursor: nextCursor ?? undefined,
          limit: pageSize,
        });

        console.info(page, 'poosttts')
        setItems((prev) => (isInitial ? page.items : [...prev, ...page.items]));
        cursorRef.current = page.nextCursor;
        const more = Boolean(page.nextCursor);
        hasMoreRef.current = more;
        setHasMore(more);
      } catch (e) {
        setError(e instanceof Error ? e : new Error("Failed to load posts"));
      } finally {
        isFetchingRef.current = false;
        if (isInitial) {
          setIsLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    },
    [pageSize]
  );

  useEffect(() => {
    void fetchPage(null, true);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (isFetchingRef.current || !hasMoreRef.current) return;
    void fetchPage(cursorRef.current, false);
  }, [fetchPage]);

  const retry = useCallback(() => {
    if (items.length === 0) {
      void fetchPage(null, true);
    } else {
      void fetchPage(cursorRef.current, false);
    }
  }, [fetchPage, items.length]);

  return { items, isLoading, isLoadingMore, hasMore, error, loadMore, retry };
}
