import { z } from "zod";

import { LOCALES } from "@/i18n/locales";

/**
 * The API's website contract (be: packages/shared-types/src/content), restated as zod schemas —
 * the website does not depend on the API's packages. **When the API changes a block, change its
 * schema here.** Every response is checked by `parsePage.ts`.
 */

export const PAGE_KEYS = [
  "home",
  "about",
  "contacts",
  "blog",
  "privacy-policy",
  "cookie-policy",
] as const;
export type PageKey = (typeof PAGE_KEYS)[number];
/** Pages with an editable address (Home is always "/") */
export type RoutedPageKey = Exclude<PageKey, "home">;

const localeSchema = z.enum(LOCALES);
const pageKeySchema = z.enum(PAGE_KEYS);

/** Unprefixed path per language ("/about"); a language is missing when the page has no version in it. */
export const localizedPathsSchema = z.partialRecord(localeSchema, z.string());
export type LocalizedPaths = z.infer<typeof localizedPathsSchema>;

/** A link to another page: its key and its path in the page's language (null = not published). */
const pageLinkSchema = z
  .object({ key: pageKeySchema, path: z.string().nullable() })
  .nullable();
export type PageLink = z.infer<typeof pageLinkSchema>;

const sectionHead = {
  tag: z.string(),
  title: z.string(),
  lede: z.string(),
};

export const roleSchema = z.object({
  title: z.string(),
  org: z.string(),
  type: z.string(),
  period: z.string(),
  location: z.string(),
  bullets: z.array(z.string()),
});
export type Role = z.infer<typeof roleSchema>;

export const recommendationSchema = z.object({
  name: z.string(),
  role: z.string(),
  relation: z.string(),
  quote: z.array(z.string()),
});
export type Recommendation = z.infer<typeof recommendationSchema>;

/** Content group inside a block (each page keeps its own copy); null kept for old revisions. */
const industries = z.object({ items: z.array(z.string()) }).nullable();
const experience = z.object({ roles: z.array(roleSchema) }).nullable();
const recommendations = z
  .object({ items: z.array(recommendationSchema) })
  .nullable();

/** `data` of every section type, keyed by type. */
export const BLOCK_DATA_SCHEMAS = {
  homeHero: z.object({
    firstName: z.string(),
    lastName: z.string(),
    rolePrimary: z.string(),
    roleSecondary: z.string(),
    /** Uploaded photo URL; null/absent → the default photo (AVATAR) */
    avatar: z.string().nullish(),
    avatarAlt: z.string(),
    contactLabel: z.string(),
    contactAriaLabel: z.string(),
    contactLink: pageLinkSchema,
    aboutLabel: z.string(),
    aboutLink: pageLinkSchema,
    scrollLabel: z.string(),
  }),
  homeAbout: z.object({ ...sectionHead, lead: z.string(), industries }),
  homeExperience: z.object({
    ...sectionHead,
    count: z.number().int().nullable(),
    seeAllLabel: z.string(),
    seeAllLink: pageLinkSchema,
    experience,
  }),
  homeRecommendation: z.object({
    ...sectionHead,
    position: z.number().int().nullable(),
    recommendations,
  }),
  homeContact: z.object({
    ...sectionHead,
    buttonLabel: z.string(),
    buttonAriaLabel: z.string(),
    buttonLink: pageLinkSchema,
  }),
  aboutHero: z.object({
    headlineFirst: z.string(),
    headlineSecond: z.string(),
    lead: z.string(),
    /** Uploaded photo URL; null/absent → the default photo (AVATAR) */
    avatar: z.string().nullish(),
    avatarAlt: z.string(),
    industries,
  }),
  aboutStack: z.object({
    ...sectionHead,
    groups: z.array(z.object({ name: z.string(), items: z.array(z.string()) })),
  }),
  aboutExperience: z.object({ ...sectionHead, experience }),
  aboutRecommendations: z.object({ ...sectionHead, recommendations }),
  aboutEducation: z.object({
    ...sectionHead,
    items: z.array(
      z.object({
        school: z.string(),
        degree: z.string(),
        period: z.string(),
        skills: z.array(z.string()),
      }),
    ),
  }),
  ctaBanner: z.object({
    title: z.string(),
    text: z.string(),
    linkLabel: z.string(),
    link: pageLinkSchema,
  }),
  contactsHero: z.object({
    title: z.string(),
    lead: z.string(),
    mapLabel: z.string(),
  }),
  contactChannels: z.object({}),
  blogHero: z.object({
    titleStart: z.string(),
    titleAccent: z.string(),
    lead: z.string(),
  }),
  blogFeed: z.object({}),
  blogTopics: z.object({
    heading: z.string(),
    intro: z.string(),
    topics: z.array(z.object({ title: z.string(), description: z.string() })),
  }),
  legalHeader: z.object({
    title: z.string(),
    lastUpdatedLabel: z.string(),
    updatedAt: z.string().nullable(),
  }),
  richText: z.object({ heading: z.string(), html: z.string() }),
  cookieTable: z.object({ heading: z.string(), intro: z.string() }),
  cookieSettings: z.object({
    heading: z.string(),
    text: z.string(),
    buttonLabel: z.string(),
  }),
} as const;

export type BlockType = keyof typeof BLOCK_DATA_SCHEMAS;
export type BlockData<T extends BlockType> = z.infer<
  (typeof BLOCK_DATA_SCHEMAS)[T]
>;

/** One section of a page, `data` checked against its type. */
export type Block = {
  [T in BlockType]: {
    id: string;
    type: T;
    anchor: string | null;
    data: BlockData<T>;
  };
}[BlockType];

export function isBlockType(value: unknown): value is BlockType {
  return typeof value === "string" && Object.hasOwn(BLOCK_DATA_SCHEMAS, value);
}

/** The page envelope; blocks are checked one by one in parsePage. */
export const websitePageSchema = z.object({
  key: pageKeySchema,
  locale: localeSchema,
  locales: z.array(localeSchema),
  title: z.string(),
  seo: z.object({
    title: z.string(),
    socialTitle: z.string(),
    description: z.string(),
    keywords: z.array(z.string()),
    ogImageUrl: z.string().nullable(),
    noindex: z.boolean(),
  }),
  blocks: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      anchor: z.string().nullable(),
      data: z.unknown(),
    }),
  ),
  paths: localizedPathsSchema,
  publishedAt: z.string(),
});

export type WebsitePage = Omit<z.infer<typeof websitePageSchema>, "blocks"> & {
  blocks: Block[];
};

export const routeResolutionSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("page"),
    key: pageKeySchema,
    paths: localizedPathsSchema,
  }),
  z.object({
    kind: z.literal("post"),
    slug: z.string(),
    paths: localizedPathsSchema,
  }),
  z.object({
    kind: z.literal("redirect"),
    location: z.string(),
    permanent: z.boolean(),
  }),
]);
export type RouteResolution = z.infer<typeof routeResolutionSchema>;

export const routeMapSchema = z.object({
  pages: z.partialRecord(pageKeySchema, localizedPathsSchema),
});
export type RouteMap = z.infer<typeof routeMapSchema>;
