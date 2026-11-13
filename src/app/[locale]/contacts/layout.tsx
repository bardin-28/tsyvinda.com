import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { routing } from "@/i18n/routing";
import { jsonLd } from "@/shared/lib/schemas";

import { loadContactsSeoCopy } from "./const/copy";
import {
  buildContactsBreadcrumbSchema,
  buildContactsMetadata,
  buildContactsPageSchema,
} from "./const/seo";

type ContactsLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: ContactsLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  return buildContactsMetadata(locale, await loadContactsSeoCopy(locale));
}

export default async function ContactsLayout({
  children,
  params,
}: ContactsLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return children;
  setRequestLocale(locale);
  const copy = await loadContactsSeoCopy(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(buildContactsPageSchema(locale, copy)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(buildContactsBreadcrumbSchema(locale, copy)),
        }}
      />
      {children}
    </>
  );
}
