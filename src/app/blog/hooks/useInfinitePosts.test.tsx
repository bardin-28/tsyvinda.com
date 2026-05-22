import { act, renderHook, waitFor } from "@testing-library/react";
import type { Post, PostsPage } from "@/api/posts";
import { getPosts } from "@/api/posts";
import { useInfinitePosts } from "./useInfinitePosts";

jest.mock("@/api/posts", () => ({
  ...jest.requireActual("@/api/posts"),
  getPosts: jest.fn(),
}));

const getPostsMock = getPosts as jest.MockedFunction<typeof getPosts>;

const makePost = (id: string): Post => ({
  id,
  title: `Post ${id}`,
  description: "",
  htmlContent: "",
  imageUrl: "",
  author: { id: "u", firstName: "A", lastName: "B", profileImageUrl: "" },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
});

const page = (ids: string[], nextCursor: string | null): PostsPage => ({
  items: ids.map(makePost),
  nextCursor,
});

beforeEach(() => {
  getPostsMock.mockReset();
});

describe("useInfinitePosts", () => {
  it("loads the first page on mount", async () => {
    getPostsMock.mockResolvedValueOnce(page(["1", "2"], "cursor-1"));

    const { result } = renderHook(() => useInfinitePosts(10));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.items).toHaveLength(2);
    expect(result.current.hasMore).toBe(true);
    expect(getPostsMock).toHaveBeenCalledWith({ cursor: undefined, limit: 10 });
  });

  it("loads more using the previous nextCursor and appends items", async () => {
    getPostsMock
      .mockResolvedValueOnce(page(["1", "2"], "cursor-1"))
      .mockResolvedValueOnce(page(["3", "4"], null));

    const { result } = renderHook(() => useInfinitePosts(10));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.loadMore();
    });
    await waitFor(() => expect(result.current.isLoadingMore).toBe(false));

    expect(result.current.items.map((p) => p.id)).toEqual(["1", "2", "3", "4"]);
    expect(result.current.hasMore).toBe(false);
    expect(getPostsMock).toHaveBeenLastCalledWith({
      cursor: "cursor-1",
      limit: 10,
    });
  });

  it("does not fetch more when hasMore is false", async () => {
    getPostsMock.mockResolvedValueOnce(page(["1"], null));

    const { result } = renderHook(() => useInfinitePosts(10));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.loadMore();
    });

    expect(getPostsMock).toHaveBeenCalledTimes(1);
  });

  it("captures errors from getPosts", async () => {
    getPostsMock.mockRejectedValueOnce(new Error("network"));

    const { result } = renderHook(() => useInfinitePosts(10));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.items).toHaveLength(0);
  });

  it("retry refetches the first page when items is empty", async () => {
    getPostsMock
      .mockRejectedValueOnce(new Error("nope"))
      .mockResolvedValueOnce(page(["1"], null));

    const { result } = renderHook(() => useInfinitePosts(10));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.retry();
    });
    await waitFor(() => expect(result.current.items).toHaveLength(1));
    expect(result.current.error).toBeNull();
  });
});
