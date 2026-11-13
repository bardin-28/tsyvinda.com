import { postSlug, type Post } from "@/api/posts";
import type { Locale } from "@/i18n/locales";
import { absoluteUrl } from "@/i18n/seo";
import { SITE_URL } from "@/shared/lib/site";

/** The blog page's texts and address in one language (CMS page `blog` + `common.nav.home`). */
export type BlogSeoCopy = {
  title: string;
  socialTitle: string;
  description: string;
  homeName: string;
  /** Unprefixed path of the blog in this language ("/blog"); posts live under it */
  path: string;
};

export function blogUrl(locale: Locale, copy: BlogSeoCopy): string {
  return absoluteUrl(copy.path, locale);
}

/** Latest `updatedAt` of the listed posts: when the blog index last changed. */
export function latestPostUpdate(posts: Post[]): string | undefined {
  return posts.reduce<string | undefined>(
    (latest, post) =>
      !latest || post.updatedAt > latest ? post.updatedAt : latest,
    undefined,
  );
}

export function buildBlogSchema(
  locale: Locale,
  copy: BlogSeoCopy,
  posts: Post[] = [],
) {
  const url = blogUrl(locale, copy);
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${url}#blog`,
    url,
    name: copy.socialTitle,
    description: copy.description,
    inLanguage: locale,
    dateModified: latestPostUpdate(posts),
    isPartOf: { "@id": `${SITE_URL}/#website` },
    author: { "@id": `${SITE_URL}/#person` },
    publisher: { "@id": `${SITE_URL}/#person` },
  };
}

/** `CollectionPage` wrapping the blog index: ties the `Blog`, its post list and breadcrumb to the page. */
export function buildBlogPageSchema(
  locale: Locale,
  copy: BlogSeoCopy,
  posts: Post[] = [],
) {
  const url = blogUrl(locale, copy);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#webpage`,
    url,
    name: copy.socialTitle,
    description: copy.description,
    inLanguage: locale,
    dateModified: latestPostUpdate(posts),
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#person` },
    mainEntity: { "@id": `${url}#blog` },
    breadcrumb: { "@id": `${url}#breadcrumb` },
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
  const listUrl = blogUrl(locale, copy);
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${listUrl}#posts`,
    name: copy.socialTitle,
    description: copy.description,
    numberOfItems: posts.length,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    itemListElement: posts.map((post, index) => {
      const url = absoluteUrl(`${copy.path}/${postSlug(post, locale)}`, locale);
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
  const url = blogUrl(locale, copy);
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
