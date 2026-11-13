import { RouteMapProvider, pagePath, type RouteMap } from "@/shared/cms";
import { getRouteMap } from "@/shared/cms/api";
import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { routing } from "@/i18n/routing";
import { OG_LOCALES, type Locale } from "@/i18n/locales";
import { absoluteUrl, localizedAlternates } from "@/i18n/seo";
import { KEYWORDS, NAME, SITE_URL } from "@/shared/lib/site";
import {
  buildPersonSchema,
  buildSiteNavigationSchema,
  buildWebsiteSchema,
  jsonLd,
  type SiteSchemaCopy,
} from "@/shared/lib/schemas";
import { UserProvider } from "@/shared/contexts/UserContext";
import { AntdProvider } from "@/shared/providers/AntdProvider";
import { SiteHeader, SiteFooter, LocalePreference } from "@/shared/components";
import "./(home)/globals.css";
import {
  ConsentProvider,
  CookieBanner,
  CookiePreferences,
  GoogleAnalytics,
} from "@/shared/consent";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
});

const GA_ID = process.env.GA_ID ?? "";

export const viewport: Viewport = {
  themeColor: "#fd7e14",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

async function siteSchemaCopy(
  locale: Locale,
  routeMap: RouteMap,
): Promise<SiteSchemaCopy> {
  const t = await getTranslations({ locale, namespace: "common" });
  return {
    paths: {
      about: pagePath(routeMap, "about", locale),
      blog: pagePath(routeMap, "blog", locale),
      contacts: pagePath(routeMap, "contacts", locale),
    },
    name: t("site.name"),
    jobTitle: t("site.jobTitle"),
    description: t("site.description"),
    city: t("site.city"),
    country: t("site.country"),
    nav: {
      home: { name: t("nav.home"), description: t("nav.homeDescription") },
      about: { name: t("nav.about"), description: t("nav.aboutDescription") },
      blog: { name: t("nav.blog"), description: t("nav.blogDescription") },
      contacts: {
        name: t("nav.contacts"),
        description: t("nav.contactsDescription"),
      },
    },
  };
}

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "common.site" });
  const name = t("name");
  const description = t("description");
  return {
    title: {
      default: name,
      template: `%s — ${name}`,
    },
    applicationName: NAME,
    authors: [{ name: NAME, url: SITE_URL }],
    creator: NAME,
    publisher: NAME,
    generator: "Next.js",
    keywords: KEYWORDS,
    icons: {
      icon: [
        { url: "/favicon/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon/favicon_32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon/favicon_64.png", sizes: "64x64", type: "image/png" },
      ],
      apple: { url: "/favicon/favicon.png", sizes: "180x180" },
    },
    description,
    metadataBase: new URL(SITE_URL),
    alternates: localizedAlternates("/", locale),
    openGraph: {
      type: "profile",
      url: absoluteUrl("/", locale),
      siteName: name,
      title: name,
      description,
      locale: OG_LOCALES[locale],
      // og:image is supplied per language by app/[locale]/opengraph-image.tsx (branded card).
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
    category: "technology",
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  // Lets the pages below render statically per language
  setRequestLocale(locale);
  // CMS addresses for menus and links (default slugs while the API is unreachable)
  const routeMap = await getRouteMap();
  const schemaCopy = await siteSchemaCopy(locale, routeMap);

  return (
    <html lang={locale} className={roboto.variable}>
      <head>
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd(buildPersonSchema(locale, schemaCopy)),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd(buildWebsiteSchema(locale, schemaCopy)),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd(buildSiteNavigationSchema(locale, schemaCopy)),
          }}
        />
      </head>
      <body>
        <NextIntlClientProvider>
          <ConsentProvider>
            <AntdProvider>
              <RouteMapProvider routeMap={routeMap}>
                <UserProvider>
                  <LocalePreference />
                  <SiteHeader />
                  {children}
                  <SiteFooter />
                </UserProvider>
                <CookieBanner />
                <CookiePreferences />
              </RouteMapProvider>
            </AntdProvider>
            {/* Loads gtag only after the visitor allows analytics cookies */}
            {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
          </ConsentProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
