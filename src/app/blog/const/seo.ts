import type { Metadata } from "next";
import { NAME, SITE_URL } from "@/shared/lib/site";

export const BLOG_PATH = "/blog";
export const BLOG_URL = `${SITE_URL}${BLOG_PATH}`;

export const BLOG_TITLE = "Blog — Vladyslav Tsyvinda";
export const BLOG_TITLE_SHORT = "Blog";

export const BLOG_DESCRIPTION =
  "Notes on frontend engineering, React, Next.js, TypeScript, and product delivery from Vladyslav Tsyvinda.";

export const BLOG_KEYWORDS = [
  "Vladyslav Tsyvinda blog",
  "Frontend engineering",
  "React",
  "Next.js",
  "TypeScript",
  "Software engineering notes",
  "Web development blog",
];

export const blogMetadata: Metadata = {
  title: BLOG_TITLE_SHORT,
  description: BLOG_DESCRIPTION,
  alternates: { canonical: BLOG_PATH },
  keywords: BLOG_KEYWORDS,
  openGraph: {
    type: "website",
    url: BLOG_URL,
    siteName: NAME,
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    locale: "en_US",
    // og:image inherited from app/opengraph-image.tsx (branded card).
  },
  twitter: {
    card: "summary_large_image",
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
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

export const blogSchema = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "@id": `${BLOG_URL}#blog`,
  url: BLOG_URL,
  name: BLOG_TITLE,
  description: BLOG_DESCRIPTION,
  inLanguage: "en",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  author: { "@id": `${SITE_URL}/#person` },
  publisher: { "@id": `${SITE_URL}/#person` },
};

export const blogBreadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": `${BLOG_URL}#breadcrumb`,
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
      name: "Blog",
      item: BLOG_URL,
    },
  ],
};
