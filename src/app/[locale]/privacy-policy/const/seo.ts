import type { Metadata } from "next";

import type { Locale } from "@/i18n/locales";
import { absoluteUrl, pageMetadata } from "@/i18n/seo";
import { ROUTES } from "@/shared/const";
import { EMAIL, SITE_URL } from "@/shared/lib/site";

export const PRIVACY_POLICY_PATH = ROUTES.PRIVACY_POLICY;

/** ISO date of the last policy update, used for JSON-LD and <time> (the shown date is translated). */
export const PRIVACY_POLICY_UPDATED_AT_ISO = "2026-08-06";

/** Contact address published for privacy requests. */
export const PRIVACY_POLICY_EMAIL = EMAIL;

/** Translated texts of the privacy policy's metadata and schemas (`privacy.seo` + `common`). */
export type PrivacyPolicySeoCopy = {
  title: string;
  socialTitle: string;
  description: string;
  siteName: string;
  homeName: string;
};

export function privacyPolicyUrl(locale: Locale): string {
  return absoluteUrl(PRIVACY_POLICY_PATH, locale);
}

export function buildPrivacyPolicyMetadata(
  locale: Locale,
  copy: PrivacyPolicySeoCopy,
): Metadata {
  return pageMetadata({
    locale,
    path: PRIVACY_POLICY_PATH,
    title: copy.title,
    socialTitle: copy.socialTitle,
    description: copy.description,
    siteName: copy.siteName,
  });
}

export function buildPrivacyPolicyPageSchema(
  locale: Locale,
  copy: PrivacyPolicySeoCopy,
) {
  const url = privacyPolicyUrl(locale);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: copy.socialTitle,
    description: copy.description,
    inLanguage: locale,
    dateModified: PRIVACY_POLICY_UPDATED_AT_ISO,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#person` },
    breadcrumb: { "@id": `${url}#breadcrumb` },
  };
}

export function buildPrivacyPolicyBreadcrumbSchema(
  locale: Locale,
  copy: PrivacyPolicySeoCopy,
) {
  const url = privacyPolicyUrl(locale);
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
