import type { Post } from "@/api/posts";
import {
  buildArticleMetadata,
  buildArticlePageSchema,
  buildArticleSchema,
  countWords,
  resolveArticleSeo,
  type ArticleSeoCopy,
} from "./seo";

const copy: ArticleSeoCopy = {
  siteName: "Site",
  homeName: "Home",
  blogName: "Blog",
  blogPath: "/blog",
  postPaths: { en: "/blog/hello-world", uk: "/blog/hello-world" },
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
    const metadata = buildArticleMetadata({ ...post, locales: ["en"] }, "en", {
      ...copy,
      postPaths: { en: "/blog/hello-world" },
    });
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

describe("article addresses", () => {
  it("follows the blog's address per language", () => {
    const metadata = buildArticleMetadata({ ...post, locale: "uk" }, "uk", {
      ...copy,
      blogPath: "/blog-uk",
      postPaths: { en: "/blog/hello-world", uk: "/notatky/hello-world" },
    });
    expect(metadata.alternates?.canonical).toBe("/uk/notatky/hello-world");
    expect(metadata.alternates?.languages).toMatchObject({
      en: "/blog/hello-world",
      uk: "/uk/notatky/hello-world",
    });
  });
});

describe("buildArticleSchema", () => {
  it("uses the date shown and the main category", () => {
    expect(buildArticleSchema(post, "uk", copy)).toMatchObject({
      inLanguage: "uk",
      url: "https://tsyvinda.com/uk/blog/hello-world",
      datePublished: "2026-08-07T09:00:00.000Z",
      articleSection: "Frontend",
      keywords: "Frontend, Security",
    });
  });
});

describe("buildArticleSchema author and length", () => {
  it("describes another author inline and counts the body words", () => {
    const schema = buildArticleSchema(
      { ...post, htmlContent: "<p>One two&nbsp;three</p><p>four</p>" },
      "en",
      copy,
    );
    expect(schema.author).toEqual({
      "@type": "Person",
      name: "Ada Admin",
      image: undefined,
    });
    expect(schema.wordCount).toBe(4);
  });

  it("links the site owner to the site-wide Person node", () => {
    const schema = buildArticleSchema(
      {
        ...post,
        author: {
          ...post.author,
          firstName: "Vladyslav",
          lastName: "Tsyvinda",
        },
      },
      "en",
      copy,
    );
    expect(schema.author).toEqual({ "@id": "https://tsyvinda.com/#person" });
  });
});

describe("countWords", () => {
  it("ignores tags and returns 0 for an empty body", () => {
    expect(countWords("<p>Hello <strong>big</strong> world</p>")).toBe(3);
    expect(countWords("<p></p>")).toBe(0);
  });
});

describe("buildArticlePageSchema", () => {
  it("wraps the article and breadcrumb in a WebPage of this language", () => {
    expect(buildArticlePageSchema(post, "uk", copy)).toMatchObject({
      "@type": "WebPage",
      "@id": "https://tsyvinda.com/uk/blog/hello-world#webpage",
      inLanguage: "uk",
      name: "Hello world",
      mainEntity: { "@id": "https://tsyvinda.com/uk/blog/hello-world#article" },
      breadcrumb: {
        "@id": "https://tsyvinda.com/uk/blog/hello-world#breadcrumb",
      },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: "https://cdn.example/cover.jpg",
      },
    });
  });
});
