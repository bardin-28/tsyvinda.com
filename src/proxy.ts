import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { localizePath, splitLocalePath } from "@/i18n/locales";
import { routing } from "@/i18n/routing";
import { AUTH_UI_ENABLED, ROUTES } from "@/shared/const";
import { AUTH_COOKIES } from "@/shared/lib/cookies";
import { isIndexingEnabled } from "@/shared/lib/indexing";
import {
  MARKDOWN_PATH_HEADER,
  MARKDOWN_ROUTE,
} from "@/shared/lib/markdown/markdownRoute";

/** Authenticated-only routes: the blog cover generator and the profile page. */
const PROTECTED_PREFIXES = ["/blog/cover", "/profile"];

/** Sent on every page while search engine indexing is switched off in the admin panel. */
export const NOINDEX_HEADER = "noindex, nofollow";

/** Maps "/…" to the English page and "/uk/…" to the Ukrainian one (see i18n/routing.ts). */
const handleLanguageRouting = createIntlMiddleware(routing);

const isProtected = (pathname: string): boolean =>
  PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

/**
 * Optimistic check on cookie presence — the backend remains the source of truth for the
 * protected API calls. Returns a redirect (in the page's language) for signed-out visitors.
 */
function authRedirect(request: NextRequest): NextResponse | null {
  const hasSession =
    request.cookies.has(AUTH_COOKIES.REFRESH) ||
    request.cookies.has(AUTH_COOKIES.SESSION_FLAG);
  if (hasSession) return null;

  const { locale } = splitLocalePath(request.nextUrl.pathname);
  // With the auth UI off there is no sign-in page to send the visitor to.
  if (!AUTH_UI_ENABLED) {
    return NextResponse.redirect(
      new URL(localizePath(ROUTES.HOME, locale), request.url),
    );
  }
  const loginUrl = new URL(localizePath(ROUTES.LOGIN, locale), request.url);
  loginUrl.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

/**
 * AI agents ask for Markdown with `Accept: text/markdown` (browsers never send it). Explicitly
 * refusing it with `q=0` keeps HTML.
 */
function wantsMarkdown(request: NextRequest): boolean {
  const accept = request.headers.get("accept") ?? "";
  return accept
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .some(
      (part) =>
        part.startsWith("text/markdown") && !/;\s*q=0(\.0+)?\s*(;|$)/.test(part),
    );
}

// Next.js 16 renamed `middleware` to `proxy` (nodejs runtime, no edge).
// Runs on every page: picks the language from the URL, gates the protected routes and, while
// indexing is off, tells search engines not to index or follow the page (robots.txt stays open
// so they can see this header). Agents asking for Markdown get the page's Markdown version.
export async function proxy(request: NextRequest) {
  const { path } = splitLocalePath(request.nextUrl.pathname);
  if (isProtected(path)) {
    const redirect = authRedirect(request);
    if (redirect) return redirect;
  } else if (wantsMarkdown(request)) {
    const headers = new Headers(request.headers);
    headers.set(MARKDOWN_PATH_HEADER, request.nextUrl.pathname);
    return NextResponse.rewrite(new URL(MARKDOWN_ROUTE, request.url), {
      request: { headers },
    });
  }

  const response = handleLanguageRouting(request);
  if (!(await isIndexingEnabled())) {
    response.headers.set("X-Robots-Tag", NOINDEX_HEADER);
  }
  return response;
}

export const config = {
  // Pages only: skip API proxying, the MCP endpoint and its discovery files, everything under /_next/ (assets and the dev
  // HMR socket: rewriting it to /en/_next/... breaks hot reload and the page reloads forever), static
  // files (sitemap/robots/images) and the generated OG cards (they live under app/[locale] and
  // are requested with their prefix).
  matcher: [
    "/((?!api/|mcp$|\\.well-known/|_next/|favicon|.*opengraph-image|.*\\.(?:png|jpe?g|gif|svg|webp|ico|txt|xml|json|webmanifest)$).*)",
  ],
};
