"use client";

import Script from "next/script";
import { useEffect } from "react";

import { removeAnalyticsCookies, setGaDisabled } from "../../analyticsCookies";
import { useConsent } from "../../ConsentProvider";

type GoogleAnalyticsProps = {
  /** GA4 measurement ID (`GA_ID` env var). */
  gaId: string;
};

/**
 * Loads Google Analytics only after the visitor allows analytics cookies. Nothing is requested
 * from Google before that. Withdrawing consent stops an already loaded gtag (disable flag) and
 * deletes its cookies.
 */
export function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  const { isReady, preferences } = useConsent();
  const isAllowed = isReady && preferences.analytics;

  useEffect(() => {
    if (!isReady) return;
    setGaDisabled(gaId, !isAllowed);
    if (!isAllowed) removeAnalyticsCookies();
  }, [gaId, isAllowed, isReady]);

  if (!isAllowed) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
