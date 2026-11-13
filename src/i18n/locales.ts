/** Languages the website is published in. English is the default and has no URL prefix. */
export const LOCALES = ["en", "uk"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** localStorage key holding the visitor's chosen language. */
export const LOCALE_STORAGE_KEY = "locale";

/** `og:locale` / `inLanguage` values per language. */
export const OG_LOCALES: Record<Locale, string> = {
  en: "en_US",
  uk: "uk_UA",
};

/** Names in the header language dropdown, each in its own language. */
export const LOCALE_LABELS: Record<Locale, { short: string; name: string }> = {
  en: { short: "EN", name: "English" },
  uk: { short: "UA", name: "Українська" },
};

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && (LOCALES as readonly string[]).includes(value)
  );
}

/**
 * Public path of `path` (unprefixed, e.g. "/blog/hello") in `locale`: English stays as is,
 * other languages get a "/<locale>" prefix ("/" → "/uk").
 */
export function localizePath(path: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/** Splits a public path into its language and the unprefixed path ("/uk/blog" → uk, "/blog"). */
export function splitLocalePath(pathname: string): {
  locale: Locale;
  path: string;
} {
  const [, first, ...rest] = pathname.split("/");
  if (isLocale(first) && first !== DEFAULT_LOCALE) {
    return { locale: first, path: `/${rest.join("/")}` };
  }
  return { locale: DEFAULT_LOCALE, path: pathname };
}
