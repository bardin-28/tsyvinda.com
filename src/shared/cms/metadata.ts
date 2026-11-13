import type { Metadata } from "next";

import { LOCALES, OG_LOCALES, localizePath, type Locale } from "@/i18n/locales";
import { INDEXABLE_ROBOTS, absoluteUrl } from "@/i18n/seo";

import type { LocalizedPaths, WebsitePage } from "./schemas";

/**
 * Canonical + hreflang of a page whose address differs per language. `x-default` is English (or
 * the first language the page has).
 */
export function localizedPathsAlternates(
  paths: LocalizedPaths,
  locale: Locale,
): NonNullable<Metadata["alternates"]> {
  const languages: Record<string, string> = {};
  for (const language of LOCALES) {
    const path = paths[language];
    if (path) languages[language] = localizePath(path, language);
  }
  const fallback = LOCALES.find((language) => paths[language]);
  if (fallback) languages["x-default"] = languages[fallback]!;
  const own = paths[locale];
  return {
    canonical: own ? localizePath(own, locale) : undefined,
    languages,
  };
}

const NOINDEX: Metadata["robots"] = { index: false, follow: false };

export type CmsMetadataOptions = {
  siteName: string;
  openGraphType?: "website" | "profile";
  /** Home: the SEO title is the whole `<title>` (no " — <name>" template) */
  absoluteTitle?: boolean;
};

/**
 * Metadata of a CMS page in one language: SEO title/description/keywords from the editor, the
 * page's own address per language (canonical + hreflang), OpenGraph/Twitter (share image when the
 * editor set one, else the generated card) and `noindex` when the editor hid the page.
 */
export function cmsPageMetadata(
  page: WebsitePage,
  options: CmsMetadataOptions,
): Metadata {
  const { seo, locale } = page;
  const ownPath = page.paths[locale] ?? "/";
  const images = seo.ogImageUrl ? [{ url: seo.ogImageUrl }] : undefined;
  return {
    title: options.absoluteTitle ? { absolute: seo.title } : seo.title,
    description: seo.description,
    keywords: seo.keywords.length > 0 ? seo.keywords : undefined,
    alternates: localizedPathsAlternates(page.paths, locale),
    openGraph: {
      type: options.openGraphType ?? "website",
      url: absoluteUrl(ownPath, locale),
      siteName: options.siteName,
      title: seo.socialTitle,
      description: seo.description,
      locale: OG_LOCALES[locale],
      alternateLocale: page.locales
        .filter((language) => language !== locale)
        .map((language) => OG_LOCALES[language]),
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.socialTitle,
      description: seo.description,
      images: images?.map((image) => image.url),
    },
    robots: seo.noindex ? NOINDEX : INDEXABLE_ROBOTS,
  };
}
