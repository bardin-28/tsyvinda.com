"use client";

import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/shared/const";
import type { Post } from "@/api/posts";
import { toProxiedUrl } from "@/shared/lib/uploads";
import styles from "./PostCard.module.css";

type PostCardProps = {
  post: Post;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

function getAuthorInitials(firstName: string, lastName: string): string {
  const first = firstName.trim().charAt(0).toUpperCase();
  const last = lastName.trim().charAt(0).toUpperCase();
  return `${first}${last}` || "•";
}

export function PostCard({ post }: PostCardProps) {
  const { slug, title, description, author, createdAt } = post;
  const imageUrl = toProxiedUrl(post.imageUrl);
  const authorImageUrl = toProxiedUrl(author.profileImageUrl);
  const authorName = `${author.firstName} ${author.lastName}`.trim();
  const formattedDate = (() => {
    const parsed = new Date(createdAt);
    return Number.isNaN(parsed.getTime()) ? "" : dateFormatter.format(parsed);
  })();

  return (
    <Link
      href={ROUTES.blogPost(slug)}
      className={styles.card}
      aria-label={`Read article: ${title}`}
    >
      <div className={styles.imageWrap}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={styles.image}
          />
        ) : (
          <div className={styles.imageFallback}>No image</div>
        )}
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        {description && <p className={styles.description}>{description}</p>}

        <div className={styles.meta}>
          <div className={styles.authorAvatar}>
            {authorImageUrl ? (
              <Image
                src={authorImageUrl}
                alt={authorName || "Author"}
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
          {authorName && <span className={styles.authorName}>{authorName}</span>}
          {formattedDate && (
            <>
              <span className={styles.dot} aria-hidden="true" />
              <time dateTime={createdAt}>{formattedDate}</time>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
