import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const API_URL = process.env.API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  // Allow an alternate build directory so the e2e suite can run a second build
  // (with a Turnstile site key baked in) alongside the default keyless build
  // without the two `next build` outputs clobbering each other. Defaults to the
  // standard `.next` for normal dev/build/deploy.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  // `npm run dev:local` is reached through the backend's nginx-proxy at https://tsyvinda.local;
  // Next dev blocks its dev resources (HMR) for hosts not listed here.
  allowedDevOrigins: ["tsyvinda.local"],
  images: {
    // Local stack only: covers live on https://api.tsyvinda.local (127.0.0.1), which Next's SSRF
    // guard rejects as a private IP. Set only by `dev:local`; never enable in production.
    dangerouslyAllowLocalIP: process.env.NEXT_IMAGE_ALLOW_LOCAL_IP === "true",
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_URL}/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
