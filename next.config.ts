import type { NextConfig } from "next";

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

export default nextConfig;
