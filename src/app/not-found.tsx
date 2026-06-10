import type { Metadata } from "next";
import Link from "next/link";

import { ROUTES } from "@/shared/const";

import styles from "./status.module.css";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className={styles.page}>
      <div className={styles.blobs} aria-hidden="true">
        <span className={styles.blob1} />
        <span className={styles.blob2} />
        <span className={styles.blob3} />
      </div>
      <div className={styles.noise} aria-hidden="true" />

      <main className={styles.main}>
        <p className={styles.code}>404</p>
        <h1 className={styles.headline}>This page wandered off</h1>
        <p className={styles.lead}>
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
          Let&apos;s get you back on track.
        </p>
        <div className={styles.actions}>
          <Link href={ROUTES.HOME} className={styles.button}>
            Back home
          </Link>
          <Link href={ROUTES.BLOG} className={styles.buttonGhost}>
            Read the blog
          </Link>
        </div>
      </main>
    </div>
  );
}
