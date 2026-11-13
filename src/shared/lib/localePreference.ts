import {
  LOCALE_STORAGE_KEY,
  isLocale,
  localizePath,
  type Locale,
} from "@/i18n/locales";

/** The language the visitor picked in the header, or null (never picked / storage blocked). */
export function readStoredLocale(): Locale | null {
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function storeLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Storage blocked: the switch still works, it just is not remembered
  }
}

/**
 * Where this page lives in `locale`: the page's own hreflang link when it has one (so a blog
 * post goes to its translation, keeping ?query and #hash), otherwise that language's home page.
 * Returns a path on the current host.
 */
export function pathInLocale(locale: Locale, doc: Document = document): string {
  const alternate = doc.head.querySelector<HTMLLinkElement>(
    `link[rel="alternate"][hreflang="${locale}"]`,
  );
  if (!alternate?.href) return localizePath("/", locale);
  const target = new URL(alternate.href, window.location.href);
  return `${target.pathname}${window.location.search}${window.location.hash}`;
}
