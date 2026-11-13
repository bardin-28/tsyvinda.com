import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { routing } from "@/i18n/routing";
import { jsonLd } from "@/shared/lib/schemas";

import { BlogBackground } from "./components/BlogBackground/BlogBackground";
import { loadBlogSeoCopy } from "./const/copy";
import {
  buildBlogBreadcrumbSchema,
  buildBlogMetadata,
  buildBlogSchema,
} from "./const/seo";

type BlogLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: BlogLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  return buildBlogMetadata(locale, await loadBlogSeoCopy(locale));
}

export default async function BlogLayout({
  children,
  params,
}: BlogLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return children;
  setRequestLocale(locale);
  const copy = await loadBlogSeoCopy(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(buildBlogSchema(locale, copy)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(buildBlogBreadcrumbSchema(locale, copy)),
        }}
      />
      <BlogBackground />
      {children}
    </>
  );
}
