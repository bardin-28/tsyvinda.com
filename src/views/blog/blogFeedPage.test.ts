/**
 * @jest-environment node
 */
import { getPosts, type Post } from "@/api/posts";

import { getBlogFeedPage } from "./blogFeedPage";
import { blogPageHref, parseBlogPage } from "./const/posts";

jest.mock("@/api/posts", () => ({ getPosts: jest.fn() }));

const mockGetPosts = getPosts as jest.MockedFunction<typeof getPosts>;
const post = (id: string) => ({ id }) as Post;

describe("getBlogFeedPage", () => {
  beforeEach(() => {
    mockGetPosts.mockReset();
    // Three pages: a → b → c (last)
    mockGetPosts.mockImplementation(async ({ cursor }) => {
      if (!cursor) return { items: [post("a")], nextCursor: "c1" };
      if (cursor === "c1") return { items: [post("b")], nextCursor: "c2" };
      return { items: [post("c")], nextCursor: null };
    });
  });

  it("walks the cursors to the requested page", async () => {
    expect((await getBlogFeedPage("en", 1))?.items).toEqual([post("a")]);
    expect((await getBlogFeedPage("uk", 3))?.items).toEqual([post("c")]);
    expect(mockGetPosts).toHaveBeenLastCalledWith(
      expect.objectContaining({ cursor: "c2", locale: "uk" }),
    );
  });

  it("returns null past the last page", async () => {
    expect(await getBlogFeedPage("en", 4)).toBeNull();
  });
});

describe("parseBlogPage", () => {
  it("reads whole page numbers, 1 when absent", () => {
    expect(parseBlogPage(undefined)).toBe(1);
    expect(parseBlogPage("2")).toBe(2);
  });

  it("rejects anything else", () => {
    for (const raw of ["0", "-1", "1.5", "abc", "02", "51", ["2", "3"]]) {
      expect(parseBlogPage(raw)).toBeNull();
    }
  });
});

describe("blogPageHref", () => {
  it("keeps page 1 at the blog address and adds ?page= for the rest", () => {
    expect(blogPageHref("/blog", 1)).toBe("/blog");
    expect(blogPageHref("/blog", 3)).toBe("/blog?page=3");
  });
});
