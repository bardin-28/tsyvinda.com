"use client";

import { useEffect } from "react";
import Link from "next/link";

import { ROUTES } from "@/shared/const";

import styles from "./status.module.css";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

// Root error boundary. Renders for uncaught errors thrown anywhere in the
// route tree below the root layout. Returns a 5xx so crawlers retry the URL.
export default function GlobalError({ error, reset }: ErrorProps) {
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
        <h1 className={styles.headline}>Something went wrong</h1>
        <p className={styles.lead}>
          An unexpected error stopped this page from loading. Try again, or head
          back home if it keeps happening.
        </p>
        <div className={styles.actions}>
          <button type="button" className={styles.button} onClick={reset}>
            Try again
          </button>
          <Link href={ROUTES.HOME} className={styles.buttonGhost}>
            Back home
          </Link>
        </div>
        {error.digest ? <p className={styles.digest}>Ref: {error.digest}</p> : null}
      </main>
    </div>
  );
}
