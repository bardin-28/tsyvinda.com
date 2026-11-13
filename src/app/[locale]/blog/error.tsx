"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

import styles from "./page.module.css";

type BlogErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

// Rendered when BlogPage's server-side post fetch throws. Returning this
// boundary yields a 5xx status, so search engines retry the URL rather than
// indexing an empty page as a Soft 404.
export default function BlogError({ error, reset }: BlogErrorProps) {
  const t = useTranslations("blog.error");
  useEffect(() => {
    console.error("Failed to render the blog list", error);
  }, [error]);

  return (
    <div className={styles.page}>
      <div className={styles.noise} aria-hidden="true" />

      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.title}>
            {t("titleStart")}{" "}
            <span className={styles.titleAccent}>{t("titleAccent")}</span>
          </h1>
          <p className={styles.lead}>{t("lead")}</p>
          <button type="button" className={styles.retry} onClick={reset}>
            {t("retry")}
          </button>
        </section>
      </main>
    </div>
  );
}
