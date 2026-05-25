"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_LINKS, SOCIAL_NAV, isChromeHidden } from "@/shared/const";
import { NAME } from "@/shared/lib/site";

import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  const pathname = usePathname();

  if (isChromeHidden(pathname)) return null;

  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <nav className={styles.nav} aria-label="Footer">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </Link>
          ))}
        </nav>

        <ul className={styles.social} aria-label="Social links">
          {SOCIAL_NAV.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className={styles.socialLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
              >
                {item.icon}
              </a>
            </li>
          ))}
        </ul>

        <p className={styles.copyright}>
          © {year} {NAME}
        </p>
      </div>
    </footer>
  );
}
