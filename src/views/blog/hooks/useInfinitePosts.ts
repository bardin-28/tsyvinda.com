"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";

import { getPosts, type Post } from "@/api/posts";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/locales";
import { POSTS_PAGE_SIZE } from "../const/posts";

export type InitialPostsData = {
  items: Post[];
  nextCursor: string | null;
  /** Feed page the items are (`?page=N`, 1 = newest) */
  page: number;
};

export type UseInfinitePostsState = {
  items: Post[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: Error | null;
  /** Last feed page shown (grows as infinite scroll loads more) */
  page: number;
  loadMore: () => void;
  retry: () => void;
};

/**
 * Cursor-paged blog feed. `initialData` (server-rendered, unfiltered) seeds the first page;
 * changing `category` (a category slug, or null for all) restarts from page one.
 */
export function useInfinitePosts(
  pageSize: number = POSTS_PAGE_SIZE,
  initialData?: InitialPostsData,
  category: string | null = null,
): UseInfinitePostsState {
  const rawLocale = useLocale();
  // Posts and category names come back in the page's language
  const locale: Locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const isSeeded = initialData !== undefined && category === null;

  const [items, setItems] = useState<Post[]>(isSeeded ? initialData.items : []);
  const [isLoading, setIsLoading] = useState<boolean>(!isSeeded);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(
    isSeeded ? Boolean(initialData.nextCursor) : true,
  );
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState<number>(isSeeded ? initialData.page : 1);

  const isFetchingRef = useRef<boolean>(false);
  const cursorRef = useRef<string | null>(
    isSeeded ? initialData.nextCursor : null,
  );
  const hasMoreRef = useRef<boolean>(
    isSeeded ? Boolean(initialData.nextCursor) : true,
  );
  // Responses for a category the user has already left are dropped.
  const requestIdRef = useRef<number>(0);
  const seededCategoryRef = useRef<string | null | undefined>(
    isSeeded ? null : undefined,
  );

  const fetchPage = useCallback(
    async (nextCursor: string | null, isInitial: boolean) => {
      if (isFetchingRef.current && !isInitial) return;
      const requestId = ++requestIdRef.current;
      isFetchingRef.current = true;
      setError(null);
      if (isInitial) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const result = await getPosts({
          cursor: nextCursor ?? undefined,
          limit: pageSize,
          category: category ?? undefined,
          locale,
        });
        if (requestId !== requestIdRef.current) return;

        setItems((prev) => (isInitial ? result.items : [...prev, ...result.items]));
        setPage((previous) => (isInitial ? 1 : previous + 1));
        cursorRef.current = result.nextCursor;
        const more = Boolean(result.nextCursor);
        hasMoreRef.current = more;
        setHasMore(more);
      } catch (e) {
        if (requestId !== requestIdRef.current) return;
        setError(e instanceof Error ? e : new Error("Failed to load posts"));
      } finally {
        if (requestId === requestIdRef.current) {
          isFetchingRef.current = false;
          if (isInitial) {
            setIsLoading(false);
          } else {
            setIsLoadingMore(false);
          }
        }
      }
    },
    [pageSize, category, locale],
  );

  // First page for the current category (skipped when the server already seeded it).
  useEffect(() => {
    if (seededCategoryRef.current === category) return;
    seededCategoryRef.current = category;
    void fetchPage(null, true);
  }, [category, fetchPage]);

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

  return { items, isLoading, isLoadingMore, hasMore, error, page, loadMore, retry };
}
