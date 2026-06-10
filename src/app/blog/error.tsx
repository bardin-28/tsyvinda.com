"use client";

import { useEffect } from "react";

import styles from "./page.module.css";

type BlogErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

// Rendered when BlogPage's server-side post fetch throws. Returning this
// boundary yields a 5xx status, so search engines retry the URL rather than
// indexing an empty page as a Soft 404.
export default function BlogError({ error, reset }: BlogErrorProps) {
  useEffect(() => {
    console.error("Failed to render the blog list", error);
  }, [error]);

  return (
    <div className={styles.page}>
      <div className={styles.noise} aria-hidden="true" />

      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.title}>
            Couldn&apos;t load <span className={styles.titleAccent}>the blog</span>
          </h1>
          <p className={styles.lead}>
            Something went wrong while loading the latest articles. Please try
            again in a moment.
          </p>
          <button type="button" className={styles.retry} onClick={reset}>
            Try again
          </button>
        </section>
      </main>
    </div>
  );
}
