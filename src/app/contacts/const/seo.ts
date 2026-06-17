import type { Metadata } from "next";
import { NAME, SITE_URL } from "@/shared/lib/site";

export const CONTACTS_PATH = "/contacts";
export const CONTACTS_URL = `${SITE_URL}${CONTACTS_PATH}`;

export const CONTACTS_TITLE = "Contacts — Vladyslav Tsyvinda";
export const CONTACTS_TITLE_SHORT = "Contacts";

export const CONTACTS_DESCRIPTION =
  "Get in touch with Vladyslav Tsyvinda — software engineer & front-end lead. Reach out on LinkedIn, Telegram, or by email.";

export const CONTACTS_KEYWORDS = [
  "Vladyslav Tsyvinda contact",
  "Bardin28 contact",
  "hire frontend developer",
  "contact React engineer",
  "contact Next.js developer",
  "Vladyslav Tsyvinda email",
  "Vladyslav Tsyvinda LinkedIn",
];

export const contactsMetadata: Metadata = {
  title: CONTACTS_TITLE_SHORT,
  description: CONTACTS_DESCRIPTION,
  alternates: { canonical: CONTACTS_PATH },
  keywords: CONTACTS_KEYWORDS,
  openGraph: {
    type: "profile",
    url: CONTACTS_URL,
    siteName: NAME,
    title: CONTACTS_TITLE,
    description: CONTACTS_DESCRIPTION,
    locale: "en_US",
    // og:image inherited from app/opengraph-image.tsx (branded card).
  },
  twitter: {
    card: "summary_large_image",
    title: CONTACTS_TITLE,
    description: CONTACTS_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export const contactsPageSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "@id": `${CONTACTS_URL}#webpage`,
  url: CONTACTS_URL,
  name: CONTACTS_TITLE,
  description: CONTACTS_DESCRIPTION,
  inLanguage: "en",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#person` },
  mainEntity: { "@id": `${SITE_URL}/#person` },
  breadcrumb: { "@id": `${CONTACTS_URL}#breadcrumb` },
};

export const contactsBreadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": `${CONTACTS_URL}#breadcrumb`,
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Contacts", item: CONTACTS_URL },
  ],
};
