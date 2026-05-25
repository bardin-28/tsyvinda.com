"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { NAV_LINKS, ROUTES, isChromeHidden } from "@/shared/const";
import { NAME } from "@/shared/lib/site";
import { useUser } from "@/shared/contexts/UserContext";
import { Logo } from "../Logo/Logo";

import styles from "./SiteHeader.module.css";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const panelVariants = {
  hidden: { opacity: 0, y: -12, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.32, ease: EASE, staggerChildren: 0.05, delayChildren: 0.06 },
  },
  exit: { opacity: 0, y: -12, scale: 0.97, transition: { duration: 0.2, ease: EASE } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: EASE } },
};

function isActive(pathname: string, href: string): boolean {
  if (href === ROUTES.HOME) return pathname === ROUTES.HOME;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const { user, logout } = useUser();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  // Close on Escape (and return focus to the trigger) and on outside click.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        triggerRef.current?.focus();
      }
    };
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        close();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen, close]);

  if (isChromeHidden(pathname)) return null;

  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <Link href={ROUTES.HOME} className={styles.brand} aria-label={`${NAME} — home`}>
          <Logo className={styles.brandLogo} />
        </Link>

        <div className={styles.menuWrap} ref={containerRef}>
          <button
            type="button"
            ref={triggerRef}
            className={styles.trigger}
            onClick={toggle}
            aria-label="Toggle navigation menu"
            aria-haspopup="menu"
            aria-expanded={isOpen}
            aria-controls="site-menu"
          >
            <span className={styles.triggerLabel}>{isOpen ? "Close" : "Menu"}</span>
            <span className={`${styles.burger} ${isOpen ? styles.burgerOpen : ""}`} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.nav
                id="site-menu"
                role="menu"
                aria-label="Site"
                className={styles.panel}
                variants={panelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {NAV_LINKS.map((link) => (
                  <motion.div key={link.href} variants={itemVariants}>
                    <Link
                      href={link.href}
                      role="menuitem"
                      className={`${styles.item} ${
                        isActive(pathname, link.href) ? styles.itemActive : ""
                      }`}
                      aria-current={isActive(pathname, link.href) ? "page" : undefined}
                      onClick={close}
                    >
                      <span>{link.label}</span>
                      <span className={styles.itemArrow} aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14" />
                          <path d="M12 5l7 7-7 7" />
                        </svg>
                      </span>
                    </Link>
                  </motion.div>
                ))}

                <motion.div variants={itemVariants} className={styles.authRow}>
                  {user ? (
                    <button
                      type="button"
                      role="menuitem"
                      className={styles.authAction}
                      onClick={() => {
                        close();
                        void logout();
                      }}
                    >
                      <span>Log out</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <path d="M16 17l5-5-5-5" />
                        <path d="M21 12H9" />
                      </svg>
                    </button>
                  ) : (
                    <Link
                      href={ROUTES.LOGIN}
                      role="menuitem"
                      className={styles.authAction}
                      onClick={close}
                    >
                      <span>Sign in</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                        <path d="M10 17l5-5-5-5" />
                        <path d="M15 12H3" />
                      </svg>
                    </Link>
                  )}
                </motion.div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
