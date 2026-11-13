"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { LOCALES, LOCALE_LABELS, isLocale, type Locale } from "@/i18n/locales";
import { pathInLocale, storeLocale } from "@/shared/lib/localePreference";

import styles from "./LanguageSwitcher.module.css";

/**
 * Header language dropdown. Picking a language remembers it in localStorage and opens the same
 * page in that language (or its home page when the page has no translation).
 */
export function LanguageSwitcher() {
  const t = useTranslations("common.language");
  const router = useRouter();
  const rawLocale = useLocale();
  const currentLocale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    const handlePointerDown = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen]);

  const choose = (locale: Locale) => {
    setIsOpen(false);
    storeLocale(locale);
    if (locale !== currentLocale) router.push(pathInLocale(locale));
  };

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        ref={triggerRef}
        className={styles.trigger}
        onClick={() => setIsOpen((previous) => !previous)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="language-menu"
        aria-label={`${t("label")}: ${LOCALE_LABELS[currentLocale].name}`}
        title={t("choose")}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span>{LOCALE_LABELS[currentLocale].short}</span>
        <svg
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <ul
          id="language-menu"
          role="listbox"
          aria-label={t("choose")}
          className={styles.menu}
        >
          {LOCALES.map((locale) => (
            <li key={locale} role="presentation">
              <button
                type="button"
                role="option"
                lang={locale}
                aria-selected={locale === currentLocale}
                className={`${styles.option} ${locale === currentLocale ? styles.optionActive : ""}`}
                onClick={() => choose(locale)}
              >
                <span className={styles.optionShort}>
                  {LOCALE_LABELS[locale].short}
                </span>
                <span>{LOCALE_LABELS[locale].name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
