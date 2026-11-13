/**
 * HTTP security headers for every website response (applied in next.config.ts `headers()`).
 * Imported by next.config.ts, so this file must not use the `@/` path alias.
 */

export type SecurityHeader = { key: string; value: string };

type SecurityHeaderOptions = {
  /** `next dev`: React needs eval and HMR a websocket; no HTTPS upgrade / HSTS on localhost. */
  isDev: boolean;
};

/** HSTS lifetime: two years (the hstspreload.org minimum is one). */
export const HSTS_MAX_AGE_SECONDS = 63_072_000;

/** Google Analytics (gtag) script, beacons and config. */
const GOOGLE_ANALYTICS_SCRIPT_ORIGIN = "https://www.googletagmanager.com";
const GOOGLE_ANALYTICS_CONNECT_ORIGINS = [
  "https://*.google-analytics.com",
  "https://*.analytics.google.com",
  "https://*.googletagmanager.com",
];

/** Cloudflare Turnstile: script, challenge iframe and its requests. */
const TURNSTILE_ORIGIN = "https://challenges.cloudflare.com";

/**
 * Content-Security-Policy. Pages are prerendered (ISR) and cached at the edge, so per-request
 * nonces are not possible and Next's inline bootstrap scripts need 'unsafe-inline'.
 * `script-src-attr 'none'` still blocks inline event handlers (onerror=…) in injected markup.
 * `img-src https:` covers post covers/bodies from the CDN, OSM map tiles and GA pixels.
 */
export function buildContentSecurityPolicy({
  isDev,
}: SecurityHeaderOptions): string {
  const scriptSources = [
    "'self'",
    "'unsafe-inline'",
    GOOGLE_ANALYTICS_SCRIPT_ORIGIN,
    TURNSTILE_ORIGIN,
  ];
  const connectSources = [
    "'self'",
    ...GOOGLE_ANALYTICS_CONNECT_ORIGINS,
    TURNSTILE_ORIGIN,
  ];
  if (isDev) {
    scriptSources.push("'unsafe-eval'");
    connectSources.push("ws:", "wss:");
  }

  const directives: [name: string, sources: string[]][] = [
    ["default-src", ["'self'"]],
    ["script-src", scriptSources],
    ["script-src-attr", ["'none'"]],
    ["style-src", ["'self'", "'unsafe-inline'"]],
    ["img-src", ["'self'", "data:", "blob:", "https:"]],
    ["font-src", ["'self'", "data:"]],
    ["connect-src", connectSources],
    ["media-src", ["'self'", "blob:", "https:"]],
    ["worker-src", ["'self'", "blob:"]],
    ["frame-src", [TURNSTILE_ORIGIN]],
    ["manifest-src", ["'self'"]],
    ["object-src", ["'none'"]],
    ["base-uri", ["'self'"]],
    ["form-action", ["'self'"]],
    ["frame-ancestors", ["'none'"]],
  ];
  if (!isDev) directives.push(["upgrade-insecure-requests", []]);

  return directives
    .map(([name, sources]) => [name, ...sources].join(" "))
    .join("; ");
}

/** Browser features the site never uses, switched off for the page and every iframe. */
export const PERMISSIONS_POLICY = [
  "accelerometer=()",
  "autoplay=()",
  "bluetooth=()",
  "browsing-topics=()",
  "camera=()",
  "display-capture=()",
  "encrypted-media=()",
  "fullscreen=(self)",
  "geolocation=()",
  "gyroscope=()",
  "hid=()",
  "idle-detection=()",
  "magnetometer=()",
  "microphone=()",
  "midi=()",
  "payment=()",
  "picture-in-picture=()",
  "screen-wake-lock=()",
  "serial=()",
  "usb=()",
  "xr-spatial-tracking=()",
].join(", ");

/**
 * Full header set. Cross-Origin-Embedder-Policy is left out on purpose: `require-corp` would
 * block the Turnstile iframe, GA and OSM tiles, and the site needs no cross-origin isolation.
 */
export function buildSecurityHeaders({
  isDev,
}: SecurityHeaderOptions): SecurityHeader[] {
  const headers: SecurityHeader[] = [
    {
      key: "Content-Security-Policy",
      value: buildContentSecurityPolicy({ isDev }),
    },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: PERMISSIONS_POLICY },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "Cross-Origin-Resource-Policy", value: "same-site" },
    { key: "Origin-Agent-Cluster", value: "?1" },
    { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
    // Legacy XSS auditor off: it is gone from browsers and could be abused where it remains
    { key: "X-XSS-Protection", value: "0" },
  ];
  if (!isDev) {
    headers.push({
      key: "Strict-Transport-Security",
      value: `max-age=${HSTS_MAX_AGE_SECONDS}; includeSubDomains`,
    });
  }
  return headers;
}
