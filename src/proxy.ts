import { NextResponse, type NextRequest } from "next/server";

import { ROUTES } from "@/shared/const";
import { AUTH_COOKIES } from "@/shared/lib/cookies";

// Next.js 16 renamed `middleware` to `proxy` (nodejs runtime, no edge).
// Gate the blog cover generator behind authentication: it is an internal
// tool, not a public page. This is an optimistic check on cookie presence —
// the backend remains the source of truth for the protected API calls.
export function proxy(request: NextRequest) {
  const hasSession =
    request.cookies.has(AUTH_COOKIES.REFRESH) ||
    request.cookies.has(AUTH_COOKIES.SESSION_FLAG);

  if (hasSession) {
    return NextResponse.next();
  }

  const loginUrl = new URL(ROUTES.LOGIN, request.url);
  loginUrl.searchParams.set("from", ROUTES.BLOG_COVER);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/blog/cover", "/blog/cover/:path*"],
};
