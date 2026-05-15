import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import Script from "next/script";
import "./(home)/globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const GA_ID = process.env.GA_ID ?? "";

const schema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Vladyslav Tsyvinda",
  url: "https://tsyvinda.com",
  sameAs: [
    "https://linkedin.com/in/bardin28",
    "https://t.me/Bardin28",
    "https://instagram.com/bardin_28",
  ],
};

export const metadata: Metadata = {
  title: "Vladyslav Tsyvinda",
  icons: {
    icon: [
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/favicon_32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon_64.png", sizes: "64x64", type: "image/png" },
    ],
    apple: { url: "/favicon/favicon.png", sizes: "180x180" },
  },
  description:
    "Personal website of Vladyslav Tsyvinda — get in touch via LinkedIn, Telegram, or Instagram.",
  metadataBase: new URL("https://tsyvinda.com"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://tsyvinda.com",
    siteName: "Vladyslav Tsyvinda",
    title: "Vladyslav Tsyvinda",
    description:
      "Personal website of Vladyslav Tsyvinda — get in touch via LinkedIn, Telegram, or Instagram.",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Vladyslav Tsyvinda",
    description:
      "Personal website of Vladyslav Tsyvinda — get in touch via LinkedIn, Telegram, or Instagram.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={roboto.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </head>
      <body>
        {children}
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
