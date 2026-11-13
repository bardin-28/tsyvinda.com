import { absoluteUrl } from "@/i18n/seo";
import type { Locale } from "@/i18n/locales";
import { PAGE_UPDATED_AT, ROUTES } from "@/shared/const";
import {
  ALTERNATE_NAME,
  ALUMNI_OF,
  AVATAR,
  EMAIL,
  EMPLOYER,
  KNOWS_ABOUT,
  LOCATION,
  LOGO,
  SITE_URL,
  SOCIAL_LINKS,
} from "./site";

/** Translated texts the site-wide schemas need (from the `common` messages). */
export type SiteSchemaCopy = {
  name: string;
  jobTitle: string;
  description: string;
  city: string;
  country: string;
  nav: Record<
    "home" | "about" | "blog" | "contacts",
    { name: string; description: string }
  >;
  /** Unprefixed CMS addresses in this language (default slugs when omitted) */
  paths?: Partial<Record<"about" | "blog" | "contacts", string>>;
};

export function buildPersonSchema(locale: Locale, copy: SiteSchemaCopy) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: copy.name,
    alternateName: ALTERNATE_NAME,
    url: absoluteUrl("/", locale),
    mainEntityOfPage: absoluteUrl("/", locale),
    image: {
      "@type": "ImageObject",
      url: `${SITE_URL}${AVATAR.url}`,
      width: AVATAR.width,
      height: AVATAR.height,
    },
    jobTitle: copy.jobTitle,
    description: copy.description,
    email: EMAIL,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "professional inquiries",
      email: EMAIL,
      url: absoluteUrl(copy.paths?.contacts ?? ROUTES.CONTACTS, locale),
      availableLanguage: ["English", "Ukrainian"],
    },
    gender: "Male",
    nationality: { "@type": "Country", name: copy.country },
    address: {
      "@type": "PostalAddress",
      addressLocality: copy.city,
      addressCountry: LOCATION.countryCode,
    },
    worksFor: {
      "@type": "Organization",
      name: EMPLOYER.name,
      url: EMPLOYER.url,
    },
    alumniOf: ALUMNI_OF.map((school) => ({
      "@type": "CollegeOrUniversity",
      name: school,
    })),
    hasOccupation: {
      "@type": "Occupation",
      name: copy.jobTitle,
      occupationLocation: { "@type": "City", name: copy.city },
      skills: [
        "React",
        "Next.js",
        "TypeScript",
        "GraphQL",
        "Apollo",
        "Node.js",
        "Express",
        "MongoDB",
        "Redux Toolkit",
        "Storybook",
        "Jest",
        "SCSS",
        "Docker",
      ].join(", "),
    },
    knowsAbout: KNOWS_ABOUT,
    knowsLanguage: ["English", "Ukrainian"],
    sameAs: [SOCIAL_LINKS.linkedin, SOCIAL_LINKS.telegram],
  };
}

/**
 * The personal brand as an Organization (founded and run by the Person), so agents that look
 * for a business entity find name, logo, contact point, address and profiles.
 */
export function buildOrganizationSchema(locale: Locale, copy: SiteSchemaCopy) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: copy.name,
    alternateName: ALTERNATE_NAME,
    url: absoluteUrl("/", locale),
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}${LOGO.url}`,
      width: LOGO.width,
      height: LOGO.height,
    },
    image: `${SITE_URL}${AVATAR.url}`,
    description: copy.description,
    email: EMAIL,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: EMAIL,
      url: absoluteUrl(copy.paths?.contacts ?? ROUTES.CONTACTS, locale),
      availableLanguage: ["English", "Ukrainian"],
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: copy.city,
      addressCountry: LOCATION.countryCode,
    },
    areaServed: "Worldwide",
    knowsAbout: KNOWS_ABOUT,
    founder: { "@id": `${SITE_URL}/#person` },
    sameAs: [SOCIAL_LINKS.linkedin, SOCIAL_LINKS.telegram],
  };
}

export function buildWebsiteSchema(locale: Locale, copy: SiteSchemaCopy) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: absoluteUrl("/", locale),
    name: copy.name,
    alternateName: ALTERNATE_NAME,
    description: copy.description,
    inLanguage: locale,
    publisher: { "@id": `${SITE_URL}/#person` },
  };
}

const NAV_SCHEMA_PATHS = {
  home: "/",
  about: "/about",
  blog: "/blog",
  contacts: "/contacts",
} as const;

export function buildSiteNavigationSchema(
  locale: Locale,
  copy: SiteSchemaCopy,
) {
  return {
    "@context": "https://schema.org",
    "@graph": (
      Object.keys(NAV_SCHEMA_PATHS) as (keyof typeof NAV_SCHEMA_PATHS)[]
    ).map((key) => ({
      "@type": "SiteNavigationElement",
      "@id": `${SITE_URL}/#nav-${key}`,
      name: copy.nav[key].name,
      description: copy.nav[key].description,
      url: absoluteUrl(
        key === "home" ? "/" : (copy.paths?.[key] ?? NAV_SCHEMA_PATHS[key]),
        locale,
      ),
      isPartOf: { "@id": `${SITE_URL}/#website` },
    })),
  };
}

export function buildHomeBreadcrumbSchema(locale: Locale, homeName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${absoluteUrl("/", locale)}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: homeName,
        item: absoluteUrl("/", locale),
      },
    ],
  };
}

export function buildHomePageSchema(locale: Locale, copy: SiteSchemaCopy) {
  const url = absoluteUrl("/", locale);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: copy.name,
    description: copy.description,
    inLanguage: locale,
    dateModified: PAGE_UPDATED_AT.home,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: `${SITE_URL}${AVATAR.url}`,
      width: AVATAR.width,
      height: AVATAR.height,
    },
    about: { "@id": `${SITE_URL}/#person` },
    mainEntity: { "@id": `${SITE_URL}/#person` },
    breadcrumb: { "@id": `${url}#breadcrumb` },
  };
}

/** JSON for a `<script type="application/ld+json">`; `<` escaped so text cannot close the tag. */
export function jsonLd(schema: unknown): string {
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}
