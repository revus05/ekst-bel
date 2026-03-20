import { type NextRequest, NextResponse } from "next/server";

import { verifyAuthToken } from "shared/lib/auth/jwt";
import { getAuthTokenFromCookies } from "shared/lib/auth/session";

const authRoutes = new Set(["/login", "/register"]);
const publicFilePattern = /\.[^/]+$/;

function isBypassedPath(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/.well-known") ||
    pathname === "/favicon.ico" ||
    publicFilePattern.test(pathname)
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isBypassedPath(pathname)) {
    return NextResponse.next();
  }

  const token = getAuthTokenFromCookies(request.cookies);
  const session = token ? await verifyAuthToken(token) : null;
  const isAuthRoute = authRoutes.has(pathname);
  const isAuthenticated = Boolean(session);

  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!isAuthenticated && !isAuthRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
