import { type NextRequest, NextResponse } from "next/server";

import { verifyAuthToken } from "shared/lib/auth/jwt";
import {
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_PATH,
} from "shared/lib/auth/constants";
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
  const hasToken = Boolean(token);
  const session = token ? await verifyAuthToken(token) : null;
  const isAuthRoute = authRoutes.has(pathname);
  const isAuthenticated = Boolean(session);
  const hasInvalidToken = hasToken && !isAuthenticated;

  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!isAuthenticated && !isAuthRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);

    const response = NextResponse.redirect(loginUrl);

    if (hasInvalidToken) {
      response.cookies.set(AUTH_COOKIE_NAME, "", {
        httpOnly: true,
        maxAge: 0,
        path: AUTH_COOKIE_PATH,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
