import type { Post } from "@/api/posts";
import {
  buildArticleMetadata,
  buildArticleSchema,
  resolveArticleSeo,
  type ArticleSeoCopy,
} from "./seo";

const copy: ArticleSeoCopy = {
  siteName: "Site",
  homeName: "Home",
  blogName: "Blog",
};

const post: Post = {
  id: "p1",
  locale: "en",
  locales: ["en", "uk"],
  slug: "hello-world",
  title: "Hello world",
  description: "The lead",
  htmlContent: "<p>Body</p>",
  imageUrl: "https://cdn.example/cover.jpg",
  coverAlt: "Orange knot on a dark background",
  author: {
    id: "u1",
    firstName: "Ada",
    lastName: "Admin",
    profileImageUrl: null,
  },
  categories: [
    { id: "c1", name: "Frontend", slug: "frontend" },
    { id: "c2", name: "Security", slug: "security" },
  ],
  publishedAt: "2026-08-07T09:00:00.000Z",
  seoTitle: null,
  seoDescription: null,
  ogImageUrl: null,
  canonicalUrl: null,
  createdAt: "2026-08-01T00:00:00.000Z",
  updatedAt: "2026-08-10T00:00:00.000Z",
};

describe("resolveArticleSeo", () => {
  it("falls back to title, lead, cover (with its alt) and the post's own URL", () => {
    expect(resolveArticleSeo(post)).toEqual({
      title: "Hello world",
      description: "The lead",
      image: "https://cdn.example/cover.jpg",
      imageAlt: "Orange knot on a dark background",
      canonicalOverride: null,
    });
  });

  it("uses the admin's SEO overrides when set", () => {
    const seo = resolveArticleSeo({
      ...post,
      seoTitle: "SEO title",
      seoDescription: "SEO description",
      ogImageUrl: "https://cdn.example/og.jpg",
      canonicalUrl: "https://medium.com/@me/hello",
    });
    expect(seo).toEqual({
      title: "SEO title",
      description: "SEO description",
      image: "https://cdn.example/og.jpg",
      // the cover's alt text doesn't describe a different social image
      imageAlt: "SEO title",
      canonicalOverride: "https://medium.com/@me/hello",
    });
  });
});

describe("buildArticleMetadata", () => {
  it("publishes the 'date shown' and the categories as section/tags", () => {
    const metadata = buildArticleMetadata(post, "en", copy);
    expect(metadata.openGraph).toMatchObject({
      publishedTime: "2026-08-07T09:00:00.000Z",
      section: "Frontend",
      tags: ["Frontend", "Security"],
    });
    expect(metadata.keywords).toEqual(["Frontend", "Security"]);
  });

  it("links the language versions and uses the Ukrainian URL and og:locale", () => {
    const metadata = buildArticleMetadata(
      { ...post, locale: "uk" },
      "uk",
      copy,
    );
    expect(metadata.alternates).toEqual({
      canonical: "/uk/blog/hello-world",
      languages: {
        en: "/blog/hello-world",
        uk: "/uk/blog/hello-world",
        "x-default": "/blog/hello-world",
      },
    });
    expect(metadata.openGraph).toMatchObject({
      url: "https://tsyvinda.com/uk/blog/hello-world",
      locale: "uk_UA",
      alternateLocale: ["en_US"],
    });
  });

  it("only lists languages the post is translated into", () => {
    const metadata = buildArticleMetadata(
      { ...post, locales: ["en"] },
      "en",
      copy,
    );
    expect(metadata.alternates?.languages).toEqual({
      en: "/blog/hello-world",
      "x-default": "/blog/hello-world",
    });
  });

  it("keeps an admin canonical override", () => {
    const metadata = buildArticleMetadata(
      { ...post, canonicalUrl: "https://medium.com/@me/hello" },
      "en",
      copy,
    );
    expect(metadata.alternates?.canonical).toBe("https://medium.com/@me/hello");
  });
});

describe("buildArticleSchema", () => {
  it("uses the date shown and the main category", () => {
    expect(buildArticleSchema(post, "uk")).toMatchObject({
      inLanguage: "uk",
      url: "https://tsyvinda.com/uk/blog/hello-world",
      datePublished: "2026-08-07T09:00:00.000Z",
      articleSection: "Frontend",
      keywords: "Frontend, Security",
    });
  });
});
