import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { routing } from "@/i18n/routing";
import {
  buildHomeBreadcrumbSchema,
  buildHomePageSchema,
  jsonLd,
} from "@/shared/lib/schemas";

import { loadHomeSchemaCopy } from "./const/copy";

type HomeLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function HomeLayout({
  children,
  params,
}: HomeLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return children;
  setRequestLocale(locale);
  const copy = await loadHomeSchemaCopy(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(buildHomePageSchema(locale, copy)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(buildHomeBreadcrumbSchema(locale, copy.nav.home.name)),
        }}
      />
      {children}
    </>
  );
}
