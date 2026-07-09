import type { Metadata } from "next";
import { AVATAR, SITE_URL, SOCIAL_LINKS } from "@/shared/lib/site";

export const ABOUT_PATH = "/about";
export const ABOUT_URL = `${SITE_URL}${ABOUT_PATH}`;

export const ABOUT_TITLE = "About — Vladyslav Tsyvinda";
export const ABOUT_TITLE_SHORT = "About";

export const ABOUT_DESCRIPTION =
  "Full-Stack Lead Developer with 6+ years delivering scalable React, Next.js, and TypeScript products across MedTech, FinTech, PropTech, TravelTech, and EdTech industries.";

export const ABOUT_KEYWORDS = [
  "Vladyslav Tsyvinda about",
  "Bardin28",
  "Software Engineer",
  "Front-end Lead",
  "Frontend Developer",
  "React engineer",
  "Next.js engineer",
  "TypeScript engineer",
  "Kyiv Software Engineer",
  "Ukrainian frontend developer",
];

export const aboutMetadata: Metadata = {
  title: ABOUT_TITLE_SHORT,
  description: ABOUT_DESCRIPTION,
  alternates: { canonical: ABOUT_PATH },
  keywords: ABOUT_KEYWORDS,
  openGraph: {
    type: "profile",
    url: ABOUT_URL,
    siteName: "Vladyslav Tsyvinda",
    title: ABOUT_TITLE,
    description: ABOUT_DESCRIPTION,
    locale: "en_US",
    // og:image inherited from app/opengraph-image.tsx (branded card).
  },
  twitter: {
    card: "summary_large_image",
    title: ABOUT_TITLE,
    description: ABOUT_DESCRIPTION,
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

export const profilePageSchema = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": `${ABOUT_URL}#profile`,
  url: ABOUT_URL,
  name: ABOUT_TITLE,
  description: ABOUT_DESCRIPTION,
  inLanguage: "en",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  primaryImageOfPage: {
    "@type": "ImageObject",
    url: `${SITE_URL}${AVATAR.url}`,
    width: AVATAR.width,
    height: AVATAR.height,
  },
  mainEntity: { "@id": `${SITE_URL}/#person` },
  breadcrumb: { "@id": `${ABOUT_URL}#breadcrumb` },
  about: { "@id": `${SITE_URL}/#person` },
  significantLink: [SOCIAL_LINKS.linkedin, SOCIAL_LINKS.telegram],
};

export const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": `${ABOUT_URL}#breadcrumb`,
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "About",
      item: ABOUT_URL,
    },
  ],
};
