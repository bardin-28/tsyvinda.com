import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { localizePath } from "@/i18n/locales";
import { routing } from "@/i18n/routing";
import { AUTH_UI_ENABLED, ROUTES } from "@/shared/const";

type LoginLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: LoginLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const t = await getTranslations({ locale, namespace: "auth.meta.login" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const title: string = t("title");
  const description: string = t("description", { name: tCommon("site.name") });

  return {
    title,
    description,
    alternates: { canonical: localizePath(ROUTES.LOGIN, locale) },
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: { index: false, follow: false, noimageindex: true },
    },
    openGraph: { title, description },
    twitter: { title, description },
  };
}

export default async function LoginLayout({
  children,
  params,
}: LoginLayoutProps) {
  // Auth UI is disabled for now (see AUTH_UI_ENABLED): the route 404s.
  if (!AUTH_UI_ENABLED) notFound();

  const { locale } = await params;
  if (hasLocale(routing.locales, locale)) setRequestLocale(locale);

  return children;
}
