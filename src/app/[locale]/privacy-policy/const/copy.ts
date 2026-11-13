import { getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/locales";

import type { PrivacyPolicySeoCopy } from "./seo";

/** Privacy policy SEO texts in `locale` (server only). */
export async function loadPrivacyPolicySeoCopy(
  locale: Locale,
): Promise<PrivacyPolicySeoCopy> {
  const t = await getTranslations({ locale, namespace: "privacy.seo" });
  const common = await getTranslations({ locale, namespace: "common" });
  return {
    title: t("title"),
    socialTitle: t("socialTitle"),
    description: t("description"),
    siteName: common("site.name"),
    homeName: common("nav.home"),
  };
}
