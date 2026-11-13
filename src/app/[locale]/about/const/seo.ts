import type { Metadata } from "next";

import type { Locale } from "@/i18n/locales";
import { absoluteUrl, pageMetadata } from "@/i18n/seo";
import { ROUTES } from "@/shared/const";
import { AVATAR, SITE_URL, SOCIAL_LINKS } from "@/shared/lib/site";

export const ABOUT_PATH = ROUTES.ABOUT;

/** Translated texts of the about page's metadata and schemas (`about.seo` + `common`). */
export type AboutSeoCopy = {
  title: string;
  socialTitle: string;
  description: string;
  keywords: string[];
  siteName: string;
  homeName: string;
};

export function aboutUrl(locale: Locale): string {
  return absoluteUrl(ABOUT_PATH, locale);
}

export function buildAboutMetadata(
  locale: Locale,
  copy: AboutSeoCopy,
): Metadata {
  return pageMetadata({
    locale,
    path: ABOUT_PATH,
    title: copy.title,
    socialTitle: copy.socialTitle,
    description: copy.description,
    siteName: copy.siteName,
    keywords: copy.keywords,
    openGraphType: "profile",
  });
}

export function buildProfilePageSchema(locale: Locale, copy: AboutSeoCopy) {
  const url = aboutUrl(locale);
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${url}#profile`,
    url,
    name: copy.socialTitle,
    description: copy.description,
    inLanguage: locale,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: `${SITE_URL}${AVATAR.url}`,
      width: AVATAR.width,
      height: AVATAR.height,
    },
    mainEntity: { "@id": `${SITE_URL}/#person` },
    breadcrumb: { "@id": `${url}#breadcrumb` },
    about: { "@id": `${SITE_URL}/#person` },
    significantLink: [SOCIAL_LINKS.linkedin, SOCIAL_LINKS.telegram],
  };
}

export function buildAboutBreadcrumbSchema(locale: Locale, copy: AboutSeoCopy) {
  const url = aboutUrl(locale);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: copy.homeName,
        item: absoluteUrl("/", locale),
      },
      { "@type": "ListItem", position: 2, name: copy.title, item: url },
    ],
  };
}
