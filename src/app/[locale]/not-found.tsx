import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/shared/const";

import styles from "./status.module.css";

export async function generateMetadata() {
  const t = await getTranslations("common.notFound");
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default async function NotFound() {
  const t = await getTranslations("common.notFound");
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
        <h1 className={styles.headline}>{t("headline")}</h1>
        <p className={styles.lead}>{t("lead")}</p>
        <div className={styles.actions}>
          <Link href={ROUTES.HOME} className={styles.button}>
            {t("home")}
          </Link>
          <Link href={ROUTES.BLOG} className={styles.buttonGhost}>
            {t("blog")}
          </Link>
        </div>
      </main>
    </div>
  );
}
