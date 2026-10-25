"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./PostCoverImage.module.css";

type PostCoverImageProps = {
  src: string | null | undefined;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
};

/**
 * Post cover that fills its (position: relative) parent. Shows a placeholder when the post has
 * no image or the image fails to load.
 */
export function PostCoverImage({ src, alt, sizes, priority = false, className }: PostCoverImageProps) {
  // Remember which src failed, so a new src gets a fresh attempt without resetting state in an effect.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (!src || src === failedSrc) {
    return (
      <div className={styles.placeholder} role="img" aria-label={`${alt} (no cover image)`}>
        <svg
          className={styles.placeholderIcon}
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
        <span>No image</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className ? `${styles.image} ${className}` : styles.image}
      onError={() => setFailedSrc(src)}
    />
  );
}
