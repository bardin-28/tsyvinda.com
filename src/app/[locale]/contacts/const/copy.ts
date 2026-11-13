import { getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/locales";

import type { ContactsSeoCopy } from "./seo";

/** Contacts page SEO texts in `locale` (server only). */
export async function loadContactsSeoCopy(
  locale: Locale,
): Promise<ContactsSeoCopy> {
  const t = await getTranslations({ locale, namespace: "contacts.seo" });
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
