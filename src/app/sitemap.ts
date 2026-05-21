import type { MetadataRoute } from "next";

import { ROUTES } from "@/shared/const";
import { SITE_URL } from "@/shared/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
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
  ];
}
