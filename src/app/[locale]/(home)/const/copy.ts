import { getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/locales";
import type { SiteSchemaCopy } from "@/shared/lib/schemas";

/** Site texts the home page schemas need, in `locale` (server only). */
export async function loadHomeSchemaCopy(
  locale: Locale,
): Promise<SiteSchemaCopy> {
  const t = await getTranslations({ locale, namespace: "common" });
  return {
    name: t("site.name"),
    jobTitle: t("site.jobTitle"),
    description: t("site.description"),
    city: t("site.city"),
    country: t("site.country"),
    nav: {
      home: { name: t("nav.home"), description: t("nav.homeDescription") },
      about: { name: t("nav.about"), description: t("nav.aboutDescription") },
      blog: { name: t("nav.blog"), description: t("nav.blogDescription") },
      contacts: {
        name: t("nav.contacts"),
        description: t("nav.contactsDescription"),
      },
    },
  };
}
