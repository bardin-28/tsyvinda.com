import { NextResponse, type NextRequest } from "next/server";

import { AUTH_UI_ENABLED, ROUTES } from "@/shared/const";
import { AUTH_COOKIES } from "@/shared/lib/cookies";

// Next.js 16 renamed `middleware` to `proxy` (nodejs runtime, no edge).
// Gate authenticated-only routes (the blog cover generator and the profile
// page) behind authentication. This is an optimistic check on cookie
// presence — the backend remains the source of truth for the protected API
// calls.
export function proxy(request: NextRequest) {
  const hasSession =
    request.cookies.has(AUTH_COOKIES.REFRESH) ||
    request.cookies.has(AUTH_COOKIES.SESSION_FLAG);

  if (hasSession) {
    return NextResponse.next();
  }

  // With the auth UI off there is no sign-in page to send the visitor to.
  if (!AUTH_UI_ENABLED) {
    return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
  }

  const loginUrl = new URL(ROUTES.LOGIN, request.url);
  loginUrl.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/blog/cover", "/blog/cover/:path*", "/profile", "/profile/:path*"],
};
