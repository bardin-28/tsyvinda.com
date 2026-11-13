import type { Metadata } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/locales";
import { routing } from "@/i18n/routing";
import type { WebsitePage } from "@/shared/cms";
import { getWebsitePage } from "@/shared/cms/api";
import { cmsPageMetadata } from "@/shared/cms/metadata";

import { HomeView } from "./components/HomeView/HomeView";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * The published Home page. While the site is being built the API may be unreachable: an empty
 * shell is prerendered then (refreshed within a minute, like the blog feed) so a backend outage
 * never blocks a deploy. At runtime a failure goes to the error page.
 */
async function loadHomePage(locale: Locale): Promise<WebsitePage | null> {
  try {
    return await getWebsitePage("home", locale);
  } catch (error) {
    if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) return null;
    throw error;
  }
}

/**
 * Home: its sections come from the CMS (page `home`, admin → Website → Pages). Its address is
 * fixed ("/", "/uk"), so it keeps its own route instead of the catch-all.
 */
export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const page = await loadHomePage(locale);
  if (!page) return {};
  const t = await getTranslations({ locale, namespace: "common.site" });
  return cmsPageMetadata(page, {
    siteName: t("name"),
    openGraphType: "profile",
    absoluteTitle: true,
  });
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const page = await loadHomePage(locale);
  if (!page && process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD) notFound();
  return <HomeView blocks={page?.blocks ?? []} />;
}
