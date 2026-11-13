"use client";

import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { usePaths } from "@/shared/cms";

import {
  LEGAL_LINKS,
  NAV_LINKS,
  SOCIAL_NAV,
  isChromeHidden,
} from "@/shared/const";
import { CookieSettingsButton } from "@/shared/consent";

import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  const pathname = usePathname();
  const t = useTranslations("common");

  const paths = usePaths();
  if (isChromeHidden(pathname)) return null;

  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <nav className={styles.nav} aria-label={t("footer.nav")}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.pageKey}
              href={paths.page(link.pageKey)}
              className={styles.navLink}
            >
              {t(`nav.${link.labelKey}`)}
            </Link>
          ))}
        </nav>

        <ul className={styles.social} aria-label={t("footer.social")}>
          {SOCIAL_NAV.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className={styles.socialLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t(`social.${item.labelKey}`)}
              >
                {item.icon}
              </a>
            </li>
          ))}
        </ul>

        <nav className={styles.legal} aria-label={t("footer.legal")}>
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.pageKey}
              href={paths.page(link.pageKey)}
              className={styles.legalLink}
            >
              {t(`nav.${link.labelKey}`)}
            </Link>
          ))}
          <CookieSettingsButton
            className={`${styles.legalLink} ${styles.legalButton}`}
          />
        </nav>

        <p className={styles.copyright}>
          {t("footer.rights", { year, name: t("site.name") })}
        </p>
      </div>
    </footer>
  );
}
