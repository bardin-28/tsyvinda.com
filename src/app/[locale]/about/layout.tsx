import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { routing } from "@/i18n/routing";
import { jsonLd } from "@/shared/lib/schemas";

import { loadAboutSeoCopy } from "./const/copy";
import {
  buildAboutBreadcrumbSchema,
  buildAboutMetadata,
  buildProfilePageSchema,
} from "./const/seo";

type AboutLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: AboutLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  return buildAboutMetadata(locale, await loadAboutSeoCopy(locale));
}

export default async function AboutLayout({
  children,
  params,
}: AboutLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return children;
  setRequestLocale(locale);
  const copy = await loadAboutSeoCopy(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(buildProfilePageSchema(locale, copy)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(buildAboutBreadcrumbSchema(locale, copy)),
        }}
      />
      {children}
    </>
  );
}
