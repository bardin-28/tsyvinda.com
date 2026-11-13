import { API } from "@/api";

/** Website-wide settings edited in the admin panel (Settings → General). */
export type SiteSettings = {
  /** Off: every page is served with `X-Robots-Tag: noindex, nofollow` and the sitemap is empty */
  indexingEnabled: boolean;
  updatedAt: string | null;
};

export function getSiteSettings(): Promise<SiteSettings> {
  return API.get<SiteSettings>("/site-settings");
}
