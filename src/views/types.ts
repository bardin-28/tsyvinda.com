import type { Locale } from "@/i18n/locales";
import type { WebsitePage } from "@/shared/cms";

/** What the catch-all route passes to a CMS page view. */
export type CmsViewProps = {
  page: WebsitePage;
  locale: Locale;
};
