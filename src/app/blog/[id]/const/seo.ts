import type { Metadata } from "next";
import type { Post } from "@/api/posts";
import { AVATAR, NAME, SITE_URL } from "@/shared/lib/site";
import { BLOG_URL } from "../../const/seo";

export function buildArticleUrl(id: string): string {
  return `${BLOG_URL}/${id}`;
}

export function buildArticleMetadata(post: Post): Metadata {
  const url = buildArticleUrl(post.id);
  const authorName = `${post.author.firstName} ${post.author.lastName}`.trim();
  const image = post.imageUrl || `${SITE_URL}${AVATAR.url}`;

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.id}` },
    authors: authorName ? [{ name: authorName }] : undefined,
    openGraph: {
      type: "article",
      url,
      siteName: NAME,
      title: post.title,
      description: post.description,
      locale: "en_US",
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      authors: authorName ? [authorName] : undefined,
      images: [
        {
          url: image,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
  };
}

export function buildArticleSchema(post: Post) {
  const url = buildArticleUrl(post.id);
  const authorName = `${post.author.firstName} ${post.author.lastName}`.trim();

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    mainEntityOfPage: url,
    url,
    headline: post.title,
    description: post.description,
    image: post.imageUrl ? [post.imageUrl] : [`${SITE_URL}${AVATAR.url}`],
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    inLanguage: "en",
    isPartOf: { "@id": `${BLOG_URL}#blog` },
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

export function buildArticleBreadcrumb(post: Post) {
  const url = buildArticleUrl(post.id);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: BLOG_URL },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };
}
