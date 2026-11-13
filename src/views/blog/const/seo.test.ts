import type { Post } from "@/api/posts";
import {
  buildBlogPageSchema,
  buildBlogSchema,
  latestPostUpdate,
  type BlogSeoCopy,
} from "./seo";

const copy: BlogSeoCopy = {
  title: "Blog",
  socialTitle: "Blog — Site",
  description: "Notes",
  homeName: "Home",
  path: "/blog",
};

function postUpdatedAt(updatedAt: string): Post {
  return { updatedAt } as Post;
}

describe("latestPostUpdate", () => {
  it("returns the newest updatedAt, or undefined without posts", () => {
    expect(
      latestPostUpdate([
        postUpdatedAt("2026-08-06T10:00:00.000Z"),
        postUpdatedAt("2026-11-12T21:53:39.173Z"),
        postUpdatedAt("2026-05-23T00:00:00.000Z"),
      ]),
    ).toBe("2026-11-12T21:53:39.173Z");
    expect(latestPostUpdate([])).toBeUndefined();
  });
});

describe("blog index freshness", () => {
  const posts = [
    postUpdatedAt("2026-08-06T10:00:00.000Z"),
    postUpdatedAt("2026-11-12T21:53:39.173Z"),
  ];

  it("dates the Blog and CollectionPage by the newest post", () => {
    expect(buildBlogSchema("en", copy, posts).dateModified).toBe(
      "2026-11-12T21:53:39.173Z",
    );
    expect(buildBlogPageSchema("uk", copy, posts).dateModified).toBe(
      "2026-11-12T21:53:39.173Z",
    );
  });

  it("omits dateModified when there are no posts", () => {
    expect(buildBlogSchema("en", copy).dateModified).toBeUndefined();
  });
});
