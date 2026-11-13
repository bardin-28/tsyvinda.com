"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

import { isLocale } from "@/i18n/locales";
import { pathInLocale, readStoredLocale } from "@/shared/lib/localePreference";

/**
 * Sends a returning visitor to the language they picked before (remembered in localStorage),
 * once per page load and only to a page that exists in that language (its hreflang link).
 * Crawlers have no stored choice, so every URL stays indexable in its own language.
 */
export function LocalePreference() {
  const router = useRouter();
  const currentLocale = useLocale();

  useEffect(() => {
    const stored = readStoredLocale();
    if (!stored || !isLocale(currentLocale) || stored === currentLocale) return;
    const hasVersion = document.head.querySelector(
      `link[rel="alternate"][hreflang="${stored}"]`,
    );
    if (hasVersion) router.replace(pathInLocale(stored));
    // Only on the first render of a page load; in-app navigation keeps the language
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
