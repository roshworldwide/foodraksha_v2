import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";

/**
 * Coarse gate only: no cookie, no entry. It deliberately does not touch the
 * database — the real check is requireRole() in each group's layout, which is
 * what actually decides who may see what.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (hasSession) return NextResponse.next();

  const loginPath = pathname.startsWith("/staff") ? "/staff/login" : "/login";
  const url = request.nextUrl.clone();
  url.pathname = loginPath;
  url.search = "";
  // Where to come back to once signed in.
  if (pathname !== "/") url.searchParams.set("next", `${pathname}${search}`);

  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/application/:path*",
    "/staff",
    "/staff/((?!login).*)",
  ],
};
