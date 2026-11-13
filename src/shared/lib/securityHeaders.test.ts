import {
  buildContentSecurityPolicy,
  buildSecurityHeaders,
  HSTS_MAX_AGE_SECONDS,
} from "./securityHeaders";

function headerValue(isDev: boolean, key: string): string | undefined {
  return buildSecurityHeaders({ isDev }).find((header) => header.key === key)
    ?.value;
}

describe("buildContentSecurityPolicy", () => {
  const production = buildContentSecurityPolicy({ isDev: false });

  it("locks down plugins, base URLs, form targets and framing", () => {
    expect(production).toContain("default-src 'self'");
    expect(production).toContain("object-src 'none'");
    expect(production).toContain("base-uri 'self'");
    expect(production).toContain("form-action 'self'");
    expect(production).toContain("frame-ancestors 'none'");
    expect(production).toContain("script-src-attr 'none'");
    expect(production).toMatch(/upgrade-insecure-requests$/);
  });

  it("allows Google Analytics and Turnstile", () => {
    expect(production).toContain("https://www.googletagmanager.com");
    expect(production).toContain("https://*.google-analytics.com");
    expect(production).toContain("frame-src https://challenges.cloudflare.com");
  });

  it("allows eval and the HMR websocket only in development", () => {
    expect(production).not.toContain("'unsafe-eval'");
    expect(production).not.toContain("ws:");

    const development = buildContentSecurityPolicy({ isDev: true });
    expect(development).toContain("'unsafe-eval'");
    expect(development).toContain("ws:");
    expect(development).not.toContain("upgrade-insecure-requests");
  });
});

describe("buildSecurityHeaders", () => {
  it("sends the full set in production", () => {
    const keys = buildSecurityHeaders({ isDev: false }).map(
      (header) => header.key,
    );
    expect(keys).toEqual(
      expect.arrayContaining([
        "Content-Security-Policy",
        "Strict-Transport-Security",
        "X-Frame-Options",
        "X-Content-Type-Options",
        "Referrer-Policy",
        "Permissions-Policy",
        "Cross-Origin-Opener-Policy",
        "Cross-Origin-Resource-Policy",
      ]),
    );
    expect(headerValue(false, "Strict-Transport-Security")).toBe(
      `max-age=${HSTS_MAX_AGE_SECONDS}; includeSubDomains`,
    );
    expect(headerValue(false, "X-Frame-Options")).toBe("DENY");
  });

  it("skips HSTS in development (plain http://localhost)", () => {
    expect(headerValue(true, "Strict-Transport-Security")).toBeUndefined();
  });
});
