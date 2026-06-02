import { NextResponse, type NextRequest } from "next/server";

import { ROUTES } from "@/shared/const";
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

  const loginUrl = new URL(ROUTES.LOGIN, request.url);
  loginUrl.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/blog/cover", "/blog/cover/:path*", "/profile", "/profile/:path*"],
};
