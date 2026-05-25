import type { MetadataRoute } from "next";

import { getPosts } from "@/api/posts";
import { ROUTES } from "@/shared/const";
import { SITE_URL } from "@/shared/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}${ROUTES.ABOUT}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}${ROUTES.CONTACTS}`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}${ROUTES.BLOG}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  let postEntries: MetadataRoute.Sitemap = [];
  try {
    const { items } = await getPosts({ limit: 50 });
    postEntries = items.map((post) => ({
      url: `${SITE_URL}${ROUTES.blogPost(post.slug)}`,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch {
    // Backend unavailable — ship static sitemap rather than failing the route.
  }

  return [...staticEntries, ...postEntries];
}
