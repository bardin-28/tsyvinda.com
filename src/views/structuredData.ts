import type { Locale } from "@/i18n/locales";
import { absoluteUrl } from "@/i18n/seo";
import type { WebsitePage } from "@/shared/cms";
import { AVATAR, SITE_URL, SOCIAL_LINKS } from "@/shared/lib/site";

/** schema.org type per CMS page (be: PAGE_DEFINITIONS[key].schemaType). */
const SCHEMA_TYPES: Record<WebsitePage["key"], string> = {
  home: "WebPage",
  about: "ProfilePage",
  contacts: "ContactPage",
  blog: "CollectionPage",
  "privacy-policy": "WebPage",
  "cookie-policy": "WebPage",
};

/** Absolute URL of the page in its language. */
export function cmsPageUrl(page: WebsitePage): string {
  return absoluteUrl(page.paths[page.locale] ?? "/", page.locale);
}

/**
 * JSON-LD of a CMS page: its schema.org type, name/description from the editor's OG texts and
 * the publish date as `dateModified`. `extra` adds type-specific properties.
 */
export function buildCmsPageSchema(
  page: WebsitePage,
  extra: Record<string, unknown> = {},
) {
  const url = cmsPageUrl(page);
  return {
    "@context": "https://schema.org",
    "@type": SCHEMA_TYPES[page.key],
    "@id": `${url}#webpage`,
    url,
    name: page.seo.title,
    description: page.seo.description,
    inLanguage: page.locale,
    dateModified: page.publishedAt,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#person` },
    breadcrumb: { "@id": `${url}#breadcrumb` },
    ...extra,
  };
}

/** Home → this page. */
export function buildCmsBreadcrumbSchema(
  page: WebsitePage,
  homeName: string,
  locale: Locale = page.locale,
) {
  const url = cmsPageUrl(page);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: homeName,
        item: absoluteUrl("/", locale),
      },
      { "@type": "ListItem", position: 2, name: page.title, item: url },
    ],
  };
}

/** Type-specific JSON-LD properties of a page. */
function schemaExtras(page: WebsitePage): Record<string, unknown> {
  switch (page.key) {
    case "about":
      return {
        mainEntity: { "@id": `${SITE_URL}/#person` },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${SITE_URL}${AVATAR.url}`,
          width: AVATAR.width,
          height: AVATAR.height,
        },
        significantLink: [SOCIAL_LINKS.linkedin, SOCIAL_LINKS.telegram],
      };
    case "contacts":
      return { mainEntity: { "@id": `${SITE_URL}/#person` } };
    case "privacy-policy":
    case "cookie-policy": {
      // A legal document's own "last updated" date beats the publish date
      const header = page.blocks.find((block) => block.type === "legalHeader");
      const updatedAt =
        header?.type === "legalHeader" ? header.data.updatedAt : null;
      return updatedAt ? { dateModified: updatedAt } : {};
    }
    default:
      return {};
  }
}

/** Page + breadcrumb schemas of a CMS page (Home has its own, in its layout). */
export function cmsPageSchemas(page: WebsitePage, homeName: string): object[] {
  return [
    buildCmsPageSchema(page, schemaExtras(page)),
    buildCmsBreadcrumbSchema(page, homeName),
  ];
}
