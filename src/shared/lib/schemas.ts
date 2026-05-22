import {
  ALTERNATE_NAME,
  ALUMNI_OF,
  AVATAR,
  DESCRIPTION,
  EMPLOYER,
  JOB_TITLE,
  KNOWS_ABOUT,
  LOCATION,
  NAME,
  SITE_URL,
  SOCIAL_LINKS,
} from "./site";

export const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${SITE_URL}/#person`,
  name: NAME,
  alternateName: ALTERNATE_NAME,
  url: SITE_URL,
  mainEntityOfPage: SITE_URL,
  image: {
    "@type": "ImageObject",
    url: `${SITE_URL}${AVATAR.url}`,
    width: AVATAR.width,
    height: AVATAR.height,
  },
  jobTitle: JOB_TITLE,
  description: DESCRIPTION,
  gender: "Male",
  nationality: { "@type": "Country", name: LOCATION.country },
  address: {
    "@type": "PostalAddress",
    addressLocality: LOCATION.city,
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
    name: JOB_TITLE,
    occupationLocation: { "@type": "City", name: LOCATION.city },
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
  sameAs: [SOCIAL_LINKS.linkedin, SOCIAL_LINKS.telegram, SOCIAL_LINKS.instagram],
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: NAME,
  alternateName: "Bardin28",
  description: DESCRIPTION,
  inLanguage: "en",
  publisher: { "@id": `${SITE_URL}/#person` },
};

export const siteNavigationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SiteNavigationElement",
      "@id": `${SITE_URL}/#nav-home`,
      name: "Home",
      description: "Contact channels and intro.",
      url: SITE_URL,
      isPartOf: { "@id": `${SITE_URL}/#website` },
    },
    {
      "@type": "SiteNavigationElement",
      "@id": `${SITE_URL}/#nav-about`,
      name: "About",
      description: "Bio, stack, experience, education.",
      url: `${SITE_URL}/about`,
      isPartOf: { "@id": `${SITE_URL}/#website` },
    },
    {
      "@type": "SiteNavigationElement",
      "@id": `${SITE_URL}/#nav-blog`,
      name: "Blog",
      description: "Articles on frontend engineering, React, Next.js, and product delivery.",
      url: `${SITE_URL}/blog`,
      isPartOf: { "@id": `${SITE_URL}/#website` },
    },
  ],
};

export const homeBreadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": `${SITE_URL}/#breadcrumb`,
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_URL,
    },
  ],
};

export const homePageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/#webpage`,
  url: SITE_URL,
  name: NAME,
  description: DESCRIPTION,
  inLanguage: "en",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  primaryImageOfPage: {
    "@type": "ImageObject",
    url: `${SITE_URL}${AVATAR.url}`,
    width: AVATAR.width,
    height: AVATAR.height,
  },
  about: { "@id": `${SITE_URL}/#person` },
  mainEntity: { "@id": `${SITE_URL}/#person` },
  breadcrumb: { "@id": `${SITE_URL}/#breadcrumb` },
};
