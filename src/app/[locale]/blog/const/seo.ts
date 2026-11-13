import type { Metadata } from "next";

import type { Post } from "@/api/posts";
import type { Locale } from "@/i18n/locales";
import { absoluteUrl, pageMetadata } from "@/i18n/seo";
import { ROUTES } from "@/shared/const";
import { SITE_URL } from "@/shared/lib/site";

export const BLOG_PATH = ROUTES.BLOG;

/** Translated texts of the blog index's metadata and schemas (`blog.seo` + `common`). */
export type BlogSeoCopy = {
  title: string;
  socialTitle: string;
  description: string;
  keywords: string[];
  siteName: string;
  homeName: string;
};

export function blogUrl(locale: Locale): string {
  return absoluteUrl(BLOG_PATH, locale);
}

export function buildBlogMetadata(locale: Locale, copy: BlogSeoCopy): Metadata {
  return pageMetadata({
    locale,
    path: BLOG_PATH,
    title: copy.title,
    socialTitle: copy.socialTitle,
    description: copy.description,
    siteName: copy.siteName,
    keywords: copy.keywords,
  });
}

export function buildBlogSchema(locale: Locale, copy: BlogSeoCopy) {
  const url = blogUrl(locale);
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${url}#blog`,
    url,
    name: copy.socialTitle,
    description: copy.description,
    inLanguage: locale,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    author: { "@id": `${SITE_URL}/#person` },
    publisher: { "@id": `${SITE_URL}/#person` },
  };
}

/**
 * `ItemList` of the posts rendered on the index, emitted alongside the `Blog`
 * schema. Gives crawlers an explicit, ordered list of the articles this page
 * links to instead of leaving them to infer it from the markup.
 */
export function buildBlogItemListSchema(
  posts: Post[],
  locale: Locale,
  copy: BlogSeoCopy,
) {
  const listUrl = blogUrl(locale);
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${listUrl}#posts`,
    name: copy.socialTitle,
    description: copy.description,
    numberOfItems: posts.length,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    itemListElement: posts.map((post, index) => {
      const url = absoluteUrl(ROUTES.blogPost(post.slug), locale);
      return {
        "@type": "ListItem",
        position: index + 1,
        url,
        item: {
          "@type": "BlogPosting",
          "@id": `${url}#article`,
          url,
          mainEntityOfPage: url,
          headline: post.title,
          description: post.description,
          image: post.imageUrl ? [post.imageUrl] : undefined,
          datePublished: post.publishedAt ?? post.createdAt,
          dateModified: post.updatedAt,
          inLanguage: locale,
          isPartOf: { "@id": `${listUrl}#blog` },
          author: { "@id": `${SITE_URL}/#person` },
          publisher: { "@id": `${SITE_URL}/#person` },
        },
      };
    }),
  };
}

export function buildBlogBreadcrumbSchema(locale: Locale, copy: BlogSeoCopy) {
  const url = blogUrl(locale);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: copy.homeName,
        item: absoluteUrl("/", locale),
      },
      { "@type": "ListItem", position: 2, name: copy.title, item: url },
    ],
  };
}
