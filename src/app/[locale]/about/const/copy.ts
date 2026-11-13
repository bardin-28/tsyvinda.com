import { getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/locales";

import type { AboutSeoCopy } from "./seo";

/** About page SEO texts in `locale` (server only). */
export async function loadAboutSeoCopy(locale: Locale): Promise<AboutSeoCopy> {
  const t = await getTranslations({ locale, namespace: "about.seo" });
  const common = await getTranslations({ locale, namespace: "common" });
  return {
    title: t("title"),
    socialTitle: t("socialTitle"),
    description: t("description"),
    keywords: t("keywords")
      .split(",")
      .map((keyword) => keyword.trim()),
    siteName: common("site.name"),
    homeName: common("nav.home"),
  };
}
