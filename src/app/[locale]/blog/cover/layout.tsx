import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { localizePath } from "@/i18n/locales";
import { routing } from "@/i18n/routing";
import { ROUTES } from "@/shared/const";

type CoverLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: CoverLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const t = await getTranslations({ locale, namespace: "cover.meta" });
  return {
    title: t("title"),
    description: t("description"),
    robots: { index: false, follow: false },
    alternates: { canonical: localizePath(ROUTES.BLOG_COVER, locale) },
  };
}

export default async function CoverLayout({
  children,
  params,
}: CoverLayoutProps) {
  const { locale } = await params;
  if (hasLocale(routing.locales, locale)) setRequestLocale(locale);

  return <>{children}</>;
}
