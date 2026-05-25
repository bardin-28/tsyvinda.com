import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import Script from "next/script";
import { DESCRIPTION, KEYWORDS, NAME, SITE_URL } from "@/shared/lib/site";
import {
  homeBreadcrumbSchema,
  homePageSchema,
  personSchema,
  siteNavigationSchema,
  websiteSchema,
} from "@/shared/lib/schemas";
import { UserProvider } from "@/shared/contexts/UserContext";
import { AntdProvider } from "@/shared/providers/AntdProvider";
import { SiteHeader, SiteFooter } from "@/shared/components";
import "./(home)/globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const GA_ID = process.env.GA_ID ?? "";

export const viewport: Viewport = {
  themeColor: "#fd7e14",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: NAME,
    template: `%s — ${NAME}`,
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
  description: DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: SITE_URL,
    siteName: NAME,
    title: NAME,
    description: DESCRIPTION,
    locale: "en_US",
    // og:image is supplied site-wide by app/opengraph-image.tsx (branded card).
  },
  twitter: {
    card: "summary_large_image",
    title: NAME,
    description: DESCRIPTION,
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={roboto.variable}>
      <head>
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteNavigationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(homeBreadcrumbSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(homePageSchema) }}
        />
      </head>
      <body>
        <AntdProvider>
          <UserProvider>
            <SiteHeader />
            {children}
            <SiteFooter />
          </UserProvider>
        </AntdProvider>
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
