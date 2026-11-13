import type { Metadata } from "next";

import { postDate, postKeywords, postSlug, type Post } from "@/api/posts";
import { OG_LOCALES, type Locale } from "@/i18n/locales";
import { absoluteUrl, INDEXABLE_ROBOTS } from "@/i18n/seo";
import type { LocalizedPaths } from "@/shared/cms";
import { localizedPathsAlternates } from "@/shared/cms/metadata";
import { AVATAR, NAME, SITE_URL } from "@/shared/lib/site";

/** Translated labels and the addresses the article metadata and schemas need. */
export type ArticleSeoCopy = {
  siteName: string;
  homeName: string;
  blogName: string;
  /** Unprefixed path of the blog page in the article's language (CMS address) */
  blogPath: string;
  /** Unprefixed path of the article per language it is translated into */
  postPaths: LocalizedPaths;
};

/** Absolute URL of the article in `locale`. */
export function buildArticleUrl(
  slug: string,
  locale: Locale,
  copy: ArticleSeoCopy,
): string {
  return absoluteUrl(
    copy.postPaths[locale] ?? `${copy.blogPath}/${slug}`,
    locale,
  );
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
  const url = buildArticleUrl(postSlug(post, locale), locale, copy);
  const authorName = `${post.author.firstName} ${post.author.lastName}`.trim();
  const seo = resolveArticleSeo(post);
  const categoryNames = post.categories.map((category) => category.name);
  const keywords = postKeywords(post);
  // hreflang only for the languages this post is translated into
  const alternates = localizedPathsAlternates(copy.postPaths, locale);

  return {
    title: seo.title,
    description: seo.description,
    alternates: seo.canonicalOverride
      ? { ...alternates, canonical: seo.canonicalOverride }
      : alternates,
    authors: authorName ? [{ name: authorName }] : undefined,
    keywords: keywords.length > 0 ? keywords : undefined,
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

/** Approximate word count of the article body (HTML tags and entities stripped). */
export function countWords(html: string): number {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&[#a-z0-9]+;/gi, " ")
    .trim();
  return text ? text.split(/\s+/).length : 0;
}

/**
 * Article author: the site owner links to the site-wide `Person` node (with its
 * sameAs/occupation), anyone else is described inline.
 */
function articleAuthor(post: Post) {
  const authorName = `${post.author.firstName} ${post.author.lastName}`.trim();
  if (!authorName || authorName === NAME)
    return { "@id": `${SITE_URL}/#person` };
  return {
    "@type": "Person",
    name: authorName,
    image: post.author.profileImageUrl || undefined,
  };
}

export function buildArticleSchema(
  post: Post,
  locale: Locale,
  copy: ArticleSeoCopy,
) {
  const url = buildArticleUrl(postSlug(post, locale), locale, copy);
  const wordCount = countWords(post.htmlContent);

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
    keywords: postKeywords(post).join(", ") || undefined,
    dateModified: post.updatedAt,
    inLanguage: locale,
    isPartOf: { "@id": `${absoluteUrl(copy.blogPath, locale)}#blog` },
    wordCount: wordCount || undefined,
    author: articleAuthor(post),
    publisher: { "@id": `${SITE_URL}/#person` },
  };
}

/** `WebPage` holding the article: links the `BlogPosting`, breadcrumb and site together. */
export function buildArticlePageSchema(
  post: Post,
  locale: Locale,
  copy: ArticleSeoCopy,
) {
  const url = buildArticleUrl(postSlug(post, locale), locale, copy);
  const seo = resolveArticleSeo(post);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: seo.title,
    description: seo.description,
    inLanguage: locale,
    datePublished: postDate(post),
    dateModified: post.updatedAt,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    primaryImageOfPage: { "@type": "ImageObject", url: seo.image },
    mainEntity: { "@id": `${url}#article` },
    breadcrumb: { "@id": `${url}#breadcrumb` },
  };
}

export function buildArticleBreadcrumb(
  post: Post,
  locale: Locale,
  copy: ArticleSeoCopy,
) {
  const url = buildArticleUrl(postSlug(post, locale), locale, copy);
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
        item: absoluteUrl(copy.blogPath, locale),
      },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };
}
