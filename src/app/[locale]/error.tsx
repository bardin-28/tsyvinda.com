"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

import { ROUTES } from "@/shared/const";

import styles from "./status.module.css";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

// Root error boundary. Renders for uncaught errors thrown anywhere in the
// route tree below the root layout. Returns a 5xx so crawlers retry the URL.
export default function GlobalError({ error, reset }: ErrorProps) {
  const t = useTranslations("common.error");
  useEffect(() => {
    console.error("Unhandled application error", error);
  }, [error]);

  return (
    <div className={styles.page}>
      <div className={styles.blobs} aria-hidden="true">
        <span className={styles.blob1} />
        <span className={styles.blob2} />
        <span className={styles.blob3} />
      </div>
      <div className={styles.noise} aria-hidden="true" />

      <main className={styles.main}>
        <p className={styles.code}>500</p>
        <h1 className={styles.headline}>{t("headline")}</h1>
        <p className={styles.lead}>{t("lead")}</p>
        <div className={styles.actions}>
          <button type="button" className={styles.button} onClick={reset}>
            {t("retry")}
          </button>
          <Link href={ROUTES.HOME} className={styles.buttonGhost}>
            {t("home")}
          </Link>
        </div>
        {error.digest ? (
          <p className={styles.digest}>
            {t("reference", { digest: error.digest })}
          </p>
        ) : null}
      </main>
    </div>
  );
}
