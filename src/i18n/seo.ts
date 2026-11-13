import type { Metadata } from "next";

import { SITE_URL } from "@/shared/lib/site";

import {
  DEFAULT_LOCALE,
  LOCALES,
  OG_LOCALES,
  localizePath,
  type Locale,
} from "./locales";

/** Absolute URL of `path` (unprefixed, e.g. "/about") in `locale`. */
export function absoluteUrl(path: string, locale: Locale): string {
  const localized = localizePath(path, locale);
  return localized === "/" ? SITE_URL : `${SITE_URL}${localized}`;
}

/**
 * Absolute URL of the generated share card (app/[locale]/opengraph-image.tsx, id "card").
 * Pages that set their own `openGraph`/`twitter` objects must list it explicitly: Next.js
 * replaces those objects wholesale, so the card inherited from the layout segment is dropped.
 */
export function defaultShareImageUrl(locale: Locale): string {
  return `${SITE_URL}/${locale}/opengraph-image/card`;
}

/**
 * Canonical + hreflang links for a page that exists in `available` languages. `x-default`
 * points to English (or the first available language when there is no English version).
 */
export function localizedAlternates(
  path: string,
  locale: Locale,
  available: readonly Locale[] = LOCALES,
): NonNullable<Metadata["alternates"]> {
  const languages: Record<string, string> = {};
  for (const language of available) {
    languages[language] = localizePath(path, language);
  }
  const fallback = available.includes(DEFAULT_LOCALE)
    ? DEFAULT_LOCALE
    : available[0];
  if (fallback) languages["x-default"] = localizePath(path, fallback);
  return { canonical: localizePath(path, locale), languages };
}

/** Indexable page defaults (the proxy still adds noindex while indexing is off in the admin). */
export const INDEXABLE_ROBOTS: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1,
  },
};

export type PageMetadataInput = {
  locale: Locale;
  /** Unprefixed path, e.g. "/about" */
  path: string;
  /** `<title>` (the layout template adds " — <name>") */
  title: string;
  /** Social card title, usually the full "Page — Name" */
  socialTitle: string;
  description: string;
  siteName: string;
  keywords?: string[];
  openGraphType?: "website" | "profile";
  /** Languages the page exists in (hreflang); all by default */
  availableLocales?: readonly Locale[];
};

/**
 * Metadata of an indexable page in one language: title/description, canonical + hreflang,
 * OpenGraph (with og:locale and its alternates) and the Twitter card, both using the generated
 * card from app/[locale]/opengraph-image.tsx (one per language).
 */
export function pageMetadata(input: PageMetadataInput): Metadata {
  const available = input.availableLocales ?? LOCALES;
  const image = defaultShareImageUrl(input.locale);
  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    alternates: localizedAlternates(input.path, input.locale, available),
    openGraph: {
      type: input.openGraphType ?? "website",
      url: absoluteUrl(input.path, input.locale),
      siteName: input.siteName,
      title: input.socialTitle,
      description: input.description,
      locale: OG_LOCALES[input.locale],
      alternateLocale: available
        .filter((language) => language !== input.locale)
        .map((language) => OG_LOCALES[language]),
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.socialTitle,
      description: input.description,
      images: [image],
    },
    robots: INDEXABLE_ROBOTS,
  };
}
