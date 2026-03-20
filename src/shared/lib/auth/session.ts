import "server-only";

import type { NextResponse } from "next/server";

import {
  AUTH_COOKIE_MAX_AGE,
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_PATH,
} from "shared/lib/auth/constants";

function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    maxAge: AUTH_COOKIE_MAX_AGE,
    path: AUTH_COOKIE_PATH,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

function clearAuthCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    maxAge: 0,
    path: AUTH_COOKIE_PATH,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

type CookieReader = {
  get(name: string): { value: string } | undefined;
};

function getAuthTokenFromCookies(cookieStore: CookieReader) {
  return cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
}

export type { CookieReader };
export { clearAuthCookie, getAuthTokenFromCookies, setAuthCookie };
