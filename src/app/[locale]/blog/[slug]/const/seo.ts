import type { Metadata } from "next";

import { postDate, type Post } from "@/api/posts";
import { OG_LOCALES, type Locale } from "@/i18n/locales";
import { absoluteUrl, INDEXABLE_ROBOTS, localizedAlternates } from "@/i18n/seo";
import { ROUTES } from "@/shared/const";
import { AVATAR, SITE_URL } from "@/shared/lib/site";

/** Translated labels the article metadata and schemas need. */
export type ArticleSeoCopy = {
  siteName: string;
  homeName: string;
  blogName: string;
};

export function buildArticleUrl(slug: string, locale: Locale): string {
  return absoluteUrl(ROUTES.blogPost(slug), locale);
}

/**
 * Search/social fields of this language version with the admin's SEO overrides applied:
 * SEO title → title, SEO description → lead, OG image → cover → avatar,
 * canonical URL → the post's own URL in this language.
 */
export function resolveArticleSeo(post: Post) {
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.description || undefined;
  const image = post.ogImageUrl || post.imageUrl || `${SITE_URL}${AVATAR.url}`;
  // Alt text belongs to the cover; a dedicated OG image falls back to the title.
  const imageAlt = (!post.ogImageUrl && post.coverAlt) || title;
  return {
    title,
    description,
    image,
    imageAlt,
    canonicalOverride: post.canonicalUrl,
  };
}

export function buildArticleMetadata(
  post: Post,
  locale: Locale,
  copy: ArticleSeoCopy,
): Metadata {
  const path = ROUTES.blogPost(post.slug);
  const url = buildArticleUrl(post.slug, locale);
  const authorName = `${post.author.firstName} ${post.author.lastName}`.trim();
  const seo = resolveArticleSeo(post);
  const categoryNames = post.categories.map((category) => category.name);
  // hreflang only for the languages this post is translated into
  const alternates = localizedAlternates(path, locale, post.locales);

  return {
    title: seo.title,
    description: seo.description,
    alternates: seo.canonicalOverride
      ? { ...alternates, canonical: seo.canonicalOverride }
      : alternates,
    authors: authorName ? [{ name: authorName }] : undefined,
    keywords: categoryNames.length > 0 ? categoryNames : undefined,
    openGraph: {
      type: "article",
      url,
      siteName: copy.siteName,
      title: seo.title,
      description: seo.description,
      locale: OG_LOCALES[locale],
      alternateLocale: post.locales
        .filter((language) => language !== locale)
        .map((language) => OG_LOCALES[language]),
      publishedTime: postDate(post),
      modifiedTime: post.updatedAt,
      authors: authorName ? [authorName] : undefined,
      section: categoryNames[0],
      tags: categoryNames.length > 0 ? categoryNames : undefined,
      images: [{ url: seo.image, alt: seo.imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [seo.image],
    },
    robots: INDEXABLE_ROBOTS,
  };
}

export function buildArticleSchema(post: Post, locale: Locale) {
  const url = buildArticleUrl(post.slug, locale);
  const authorName = `${post.author.firstName} ${post.author.lastName}`.trim();

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    mainEntityOfPage: url,
    url,
    headline: post.title,
    description: post.seoDescription || post.description || undefined,
    image: [resolveArticleSeo(post).image],
    datePublished: postDate(post),
    articleSection: post.categories[0]?.name,
    keywords:
      post.categories.map((category) => category.name).join(", ") || undefined,
    dateModified: post.updatedAt,
    inLanguage: locale,
    isPartOf: { "@id": `${absoluteUrl(ROUTES.BLOG, locale)}#blog` },
    author: authorName
      ? {
          "@type": "Person",
          name: authorName,
          image: post.author.profileImageUrl || undefined,
        }
      : { "@id": `${SITE_URL}/#person` },
    publisher: { "@id": `${SITE_URL}/#person` },
  };
}

export function buildArticleBreadcrumb(
  post: Post,
  locale: Locale,
  copy: ArticleSeoCopy,
) {
  const url = buildArticleUrl(post.slug, locale);
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
      {
        "@type": "ListItem",
        position: 2,
        name: copy.blogName,
        item: absoluteUrl(ROUTES.BLOG, locale),
      },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };
}
