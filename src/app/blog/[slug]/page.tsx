import { cache } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError } from "@/api";
import { getPostBySlug, type Post } from "@/api/posts";
import { ROUTES } from "@/shared/const";
import {
  buildArticleBreadcrumb,
  buildArticleMetadata,
  buildArticleSchema,
} from "./const/seo";
import styles from "./page.module.css";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

// ISR on demand: each article renders full SSR HTML on first request, then is
// cached for an hour. Crawlers get complete markup without coupling the build
// to backend availability (no generateStaticParams, so the build never fetches
// per-slug — avoids prerender failures when the API is unreachable at build).
export const revalidate = 3600;

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "long" });

const loadPost = cache(async (slug: string): Promise<Post | null> => {
  try {
    return await getPostBySlug(slug);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
});

function getAuthorInitials(firstName: string, lastName: string): string {
  const first = firstName.trim().charAt(0).toUpperCase();
  const last = lastName.trim().charAt(0).toUpperCase();
  return `${first}${last}` || "•";
}

function formatDate(value: string): string {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : dateFormatter.format(parsed);
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

export async function generateMetadata(
  { params }: ArticlePageProps
): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) {
    return {
      title: "Article not found",
      robots: { index: false, follow: false },
    };
  }
  return buildArticleMetadata(post);
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) notFound();

  const authorName = `${post.author.firstName} ${post.author.lastName}`.trim();
  const createdLabel = formatDate(post.createdAt);
  const updatedLabel = formatDate(post.updatedAt);
  const showUpdated = updatedLabel && updatedLabel !== createdLabel;

  return (
    <div className={styles.page}>
      <div className={styles.noise} aria-hidden="true" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildArticleSchema(post)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildArticleBreadcrumb(post)) }}
      />

      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>{post.title}</h1>
          {post.description && <p className={styles.description}>{post.description}</p>}

          <div className={styles.meta}>
            <div className={styles.authorAvatar}>
              {post.author.profileImageUrl ? (
                <Image
                  src={post.author.profileImageUrl}
                  alt={authorName || "Author"}
                  width={40}
                  height={40}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div className={styles.authorAvatarFallback}>
                  {getAuthorInitials(post.author.firstName, post.author.lastName)}
                </div>
              )}
            </div>
            <div className={styles.authorBlock}>
              {authorName && <span className={styles.authorName}>{authorName}</span>}
              <div className={styles.metaDates}>
                {createdLabel && (
                  <time dateTime={post.createdAt}>{createdLabel}</time>
                )}
                {showUpdated && (
                  <>
                    <span className={styles.metaSep}>·</span>
                    <span>
                      Updated{" "}
                      <time dateTime={post.updatedAt}>{updatedLabel}</time>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {post.imageUrl && (
          <div className={styles.heroImage}>
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              sizes="(max-width: 820px) 100vw, 820px"
              priority
            />
          </div>
        )}

        <article
          className={styles.article}
          dangerouslySetInnerHTML={{ __html: demoteHeadings(sanitizeHtmlContent(post.htmlContent)) }}
        />

        <div className={styles.footer}>
          <Link href={ROUTES.BLOG} className={styles.footerLink}>
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
            <span>Back to all posts</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
