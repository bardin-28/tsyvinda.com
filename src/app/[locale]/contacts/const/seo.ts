import type { Metadata } from "next";

import type { Locale } from "@/i18n/locales";
import { absoluteUrl, pageMetadata } from "@/i18n/seo";
import { ROUTES } from "@/shared/const";
import { SITE_URL } from "@/shared/lib/site";

export const CONTACTS_PATH = ROUTES.CONTACTS;

/** Translated texts of the contacts page's metadata and schemas (`contacts.seo` + `common`). */
export type ContactsSeoCopy = {
  title: string;
  socialTitle: string;
  description: string;
  keywords: string[];
  siteName: string;
  homeName: string;
};

export function contactsUrl(locale: Locale): string {
  return absoluteUrl(CONTACTS_PATH, locale);
}

export function buildContactsMetadata(
  locale: Locale,
  copy: ContactsSeoCopy,
): Metadata {
  return pageMetadata({
    locale,
    path: CONTACTS_PATH,
    title: copy.title,
    socialTitle: copy.socialTitle,
    description: copy.description,
    siteName: copy.siteName,
    keywords: copy.keywords,
    openGraphType: "profile",
  });
}

export function buildContactsPageSchema(locale: Locale, copy: ContactsSeoCopy) {
  const url = contactsUrl(locale);
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${url}#webpage`,
    url,
    name: copy.socialTitle,
    description: copy.description,
    inLanguage: locale,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#person` },
    mainEntity: { "@id": `${SITE_URL}/#person` },
    breadcrumb: { "@id": `${url}#breadcrumb` },
  };
}

export function buildContactsBreadcrumbSchema(
  locale: Locale,
  copy: ContactsSeoCopy,
) {
  const url = contactsUrl(locale);
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
