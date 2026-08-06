import type { Metadata } from "next";
import { NAME, SITE_URL } from "@/shared/lib/site";

export const PRIVACY_POLICY_PATH = "/privacy-policy";
export const PRIVACY_POLICY_URL = `${SITE_URL}${PRIVACY_POLICY_PATH}`;

export const PRIVACY_POLICY_TITLE = "Privacy Policy — Vladyslav Tsyvinda";
export const PRIVACY_POLICY_TITLE_SHORT = "Privacy Policy";

export const PRIVACY_POLICY_DESCRIPTION =
  "How tsyvinda.com collects, uses, stores, and protects personal data, including cookies, accounts, third-party services, and contact details.";

/** Date shown as "Last updated" in the page body. */
export const PRIVACY_POLICY_UPDATED_AT = "August 6, 2026";

/** ISO form of PRIVACY_POLICY_UPDATED_AT, used for JSON-LD and <time>. */
export const PRIVACY_POLICY_UPDATED_AT_ISO = "2026-08-06";

/** Contact address published for privacy requests. */
export const PRIVACY_POLICY_EMAIL = "bardindeveloper@gmail.com";

export const privacyPolicyMetadata: Metadata = {
  title: PRIVACY_POLICY_TITLE_SHORT,
  description: PRIVACY_POLICY_DESCRIPTION,
  alternates: { canonical: PRIVACY_POLICY_PATH },
  openGraph: {
    type: "website",
    url: PRIVACY_POLICY_URL,
    siteName: NAME,
    title: PRIVACY_POLICY_TITLE,
    description: PRIVACY_POLICY_DESCRIPTION,
    locale: "en_US",
    // og:image inherited from app/opengraph-image.tsx (branded card).
  },
  twitter: {
    card: "summary_large_image",
    title: PRIVACY_POLICY_TITLE,
    description: PRIVACY_POLICY_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const privacyPolicyPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${PRIVACY_POLICY_URL}#webpage`,
  url: PRIVACY_POLICY_URL,
  name: PRIVACY_POLICY_TITLE,
  description: PRIVACY_POLICY_DESCRIPTION,
  inLanguage: "en",
  dateModified: PRIVACY_POLICY_UPDATED_AT_ISO,
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#person` },
  breadcrumb: { "@id": `${PRIVACY_POLICY_URL}#breadcrumb` },
};

export const privacyPolicyBreadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": `${PRIVACY_POLICY_URL}#breadcrumb`,
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    {
      "@type": "ListItem",
      position: 2,
      name: "Privacy Policy",
      item: PRIVACY_POLICY_URL,
    },
  ],
};
