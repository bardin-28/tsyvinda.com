import { defineRouting } from "next-intl/routing";

import { DEFAULT_LOCALE, LOCALES } from "./locales";

/**
 * English lives at "/…", Ukrainian at "/uk/…". The language never comes from the browser or a
 * cookie: the URL decides, so shared links and search engines always get the same page. The
 * visitor's own choice is remembered in localStorage (see LocalePreference).
 */
export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "as-needed",
  localeDetection: false,
  localeCookie: false,
});
