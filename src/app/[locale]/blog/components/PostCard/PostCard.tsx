"use client";

import Image from "next/image";
import { useFormatter, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/shared/const";
import { postDate, type Post } from "@/api/posts";
import { PostCoverImage } from "../PostCoverImage/PostCoverImage";
import styles from "./PostCard.module.css";

type PostCardProps = {
  post: Post;
};

function getAuthorInitials(firstName: string, lastName: string): string {
  const first = firstName.trim().charAt(0).toUpperCase();
  const last = lastName.trim().charAt(0).toUpperCase();
  return `${first}${last}` || "•";
}

export function PostCard({ post }: PostCardProps) {
  const t = useTranslations("blog.card");
  const format = useFormatter();
  const { slug, title, description, author } = post;
  const publishedAt = postDate(post);
  const authorImageUrl = author.profileImageUrl || undefined;
  const authorName = `${author.firstName} ${author.lastName}`.trim();
  const formattedDate = (() => {
    const parsed = new Date(publishedAt);
    return Number.isNaN(parsed.getTime())
      ? ""
      : format.dateTime(parsed, { dateStyle: "medium" });
  })();

  return (
    <Link
      href={ROUTES.blogPost(slug)}
      className={styles.card}
      aria-label={t("readArticle", { title })}
    >
      <div className={styles.imageWrap}>
        <PostCoverImage
          src={post.imageUrl}
          alt={post.coverAlt || title}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={styles.image}
        />
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        {description && <p className={styles.description}>{description}</p>}

        {post.categories.length > 0 && (
          <ul className={styles.tags} aria-label={t("categories")}>
            {post.categories.map((category) => (
              <li key={category.id} className={styles.tag}>
                {category.name}
              </li>
            ))}
          </ul>
        )}

        <div className={styles.meta}>
          <div className={styles.authorAvatar}>
            {authorImageUrl ? (
              <Image
                src={authorImageUrl}
                alt={authorName || t("author")}
                width={28}
                height={28}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div className={styles.authorAvatarFallback}>
                {getAuthorInitials(author.firstName, author.lastName)}
              </div>
            )}
          </div>
          {authorName && (
            <span className={styles.authorName}>{authorName}</span>
          )}
          {formattedDate && (
            <>
              <span className={styles.dot} aria-hidden="true" />
              <time dateTime={publishedAt}>{formattedDate}</time>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
