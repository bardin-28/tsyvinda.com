import { cache } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations } from "next-intl/server";

import { ApiError } from "@/api";
import { getPostBySlug, postDate, type Post } from "@/api/posts";
import type { Locale } from "@/i18n/locales";
import { Link } from "@/i18n/navigation";
import { pagePath, type LocalizedPaths } from "@/shared/cms";
import { getRouteMap } from "@/shared/cms/api";
import { jsonLd } from "@/shared/lib/schemas";
import { PostCoverImage } from "../blog/components/PostCoverImage/PostCoverImage";
import {
  buildArticleBreadcrumb,
  buildArticleMetadata,
  buildArticlePageSchema,
  buildArticleSchema,
  type ArticleSeoCopy,
} from "./const/seo";
import styles from "./PostView.module.css";

/** A blog post at `<blog path>/<slug>`, as resolved by the catch-all route. */
export type PostViewProps = {
  slug: string;
  locale: Locale;
  /** The post's unprefixed path per language it is translated into (from the API) */
  paths: LocalizedPaths;
};

/** The post in `locale`; null when it does not exist or has no version in that language. */
const loadPost = cache(
  async (slug: string, locale: Locale): Promise<Post | null> => {
    try {
      return await getPostBySlug(slug, locale);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }
  },
);

function getAuthorInitials(firstName: string, lastName: string): string {
  const first = firstName.trim().charAt(0).toUpperCase();
  const last = lastName.trim().charAt(0).toUpperCase();
  return `${first}${last}` || "•";
}

async function loadSeoCopy(
  locale: Locale,
  paths: LocalizedPaths,
): Promise<ArticleSeoCopy> {
  const t = await getTranslations({ locale, namespace: "common" });
  const routeMap = await getRouteMap();
  return {
    siteName: t("site.name"),
    homeName: t("nav.home"),
    blogName: t("nav.blog"),
    blogPath: pagePath(routeMap, "blog", locale),
    postPaths: paths,
  };
}

function sanitizeHtmlContent(raw: string): string {
  return raw
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, "\\");
}

// The page header already renders the canonical <h1> (post.title), but the
// stored body markup often opens with its own <h1>, producing two H1s per
// article. Shift every body heading down one level (h1→h2 … h5→h6) so the
// page keeps a single H1 while preserving the body's relative hierarchy.
// Process from h5 downward to avoid re-shifting headings on later passes.
function demoteHeadings(html: string): string {
  let result = html;
  for (let level = 5; level >= 1; level -= 1) {
    const open = new RegExp(`<h${level}(\\s|>|/)`, "gi");
    const close = new RegExp(`</h${level}>`, "gi");
    result = result
      .replace(open, `<h${level + 1}$1`)
      .replace(close, `</h${level + 1}>`);
  }
  return result;
}

/** Metadata of a post; a "not found" title when it has no version in `locale`. */
export async function postMetadata({
  slug,
  locale,
  paths,
}: PostViewProps): Promise<Metadata> {
  const post = await loadPost(slug, locale);
  if (!post) {
    const t = await getTranslations({ locale, namespace: "blog.article" });
    return {
      title: t("notFound"),
      robots: { index: false, follow: false },
    };
  }
  return buildArticleMetadata(post, locale, await loadSeoCopy(locale, paths));
}

export async function PostView({ slug, locale, paths }: PostViewProps) {
  const post = await loadPost(slug, locale);
  if (!post) notFound();

  const t = await getTranslations({ locale, namespace: "blog.article" });
  const format = await getFormatter({ locale });
  const formatDate = (value: string): string => {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? ""
      : format.dateTime(parsed, { dateStyle: "long" });
  };
  const seoCopy = await loadSeoCopy(locale, paths);

  const authorName = `${post.author.firstName} ${post.author.lastName}`.trim();
  // "Date shown" set in the admin; updated only when it differs by day
  const publishedAt = postDate(post);
  const createdLabel = formatDate(publishedAt);
  const updatedLabel = formatDate(post.updatedAt);
  const showUpdated = updatedLabel && updatedLabel !== createdLabel;

  return (
    <div className={styles.page}>
      <div className={styles.noise} aria-hidden="true" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(buildArticlePageSchema(post, locale, seoCopy)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(buildArticleSchema(post, locale, seoCopy)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(buildArticleBreadcrumb(post, locale, seoCopy)),
        }}
      />

      <main className={styles.main}>
        <header className={styles.header}>
          {post.categories.length > 0 && (
            <ul className={styles.categories} aria-label={t("categories")}>
              {post.categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`${seoCopy.blogPath}?category=${encodeURIComponent(category.slug)}`}
                    className={styles.category}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <h1 className={styles.title}>{post.title}</h1>
          {post.description && (
            <p className={styles.description}>{post.description}</p>
          )}

          <div className={styles.meta}>
            <div className={styles.authorAvatar}>
              {post.author.profileImageUrl ? (
                <Image
                  src={post.author.profileImageUrl}
                  alt={authorName || t("author")}
                  width={40}
                  height={40}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div className={styles.authorAvatarFallback}>
                  {getAuthorInitials(
                    post.author.firstName,
                    post.author.lastName,
                  )}
                </div>
              )}
            </div>
            <div className={styles.authorBlock}>
              {authorName && (
                <span className={styles.authorName}>{authorName}</span>
              )}
              <div className={styles.metaDates}>
                {createdLabel && (
                  <time dateTime={publishedAt}>{createdLabel}</time>
                )}
                {showUpdated && (
                  <>
                    <span className={styles.metaSep}>·</span>
                    <span>
                      {t("updated")}{" "}
                      <time dateTime={post.updatedAt}>{updatedLabel}</time>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className={styles.heroImage}>
          <PostCoverImage
            src={post.imageUrl}
            alt={post.coverAlt || post.title}
            sizes="(max-width: 820px) 100vw, 820px"
            priority
          />
        </div>

        <article
          className={styles.article}
          dangerouslySetInnerHTML={{
            __html: demoteHeadings(sanitizeHtmlContent(post.htmlContent)),
          }}
        />

        <div className={styles.footer}>
          <Link href={seoCopy.blogPath} className={styles.footerLink}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            <span>{t("back")}</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
