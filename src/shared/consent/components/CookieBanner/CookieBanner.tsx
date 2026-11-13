"use client";

import { Button } from "antd";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Link } from "@/i18n/navigation";
import { usePagePath } from "@/shared/cms";

import { useConsent } from "../../ConsentProvider";

import styles from "./CookieBanner.module.css";

const BANNER_TITLE_ID = "cookie-banner-title";

/**
 * First-visit consent bar, fixed to the bottom of the page. Shown only in the browser and only
 * until the visitor accepts, rejects or saves a custom choice. "Reject all" has the same size
 * and weight as "Accept all".
 */
export function CookieBanner() {
  const cookiePolicyPath = usePagePath("cookie-policy");
  const t = useTranslations("common.consent.banner");
  const { isReady, hasDecided, acceptAll, rejectAll, openPreferences } =
    useConsent();

  if (!isReady || hasDecided) return null;

  return (
    <section
      className={styles.banner}
      role="region"
      aria-labelledby={BANNER_TITLE_ID}
    >
      <div className={styles.inner}>
        <div className={styles.copy}>
          <h2 id={BANNER_TITLE_ID} className={styles.title}>
            {t("title")}
          </h2>
          <p className={styles.text}>
            {t.rich("text", {
              link: (chunks: ReactNode) => (
                <Link href={cookiePolicyPath} className={styles.link}>
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </div>

        <div className={styles.actions}>
          <Button
            type="text"
            className={styles.settingsButton}
            onClick={openPreferences}
          >
            {t("settings")}
          </Button>
          <Button className={styles.choiceButton} onClick={rejectAll}>
            {t("rejectAll")}
          </Button>
          <Button
            type="primary"
            className={styles.choiceButton}
            onClick={acceptAll}
          >
            {t("acceptAll")}
          </Button>
        </div>
      </div>
    </section>
  );
}
