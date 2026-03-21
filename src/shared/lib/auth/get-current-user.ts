import "server-only";

import { serializeUser } from "entities/user/model/serialize-user";
import { cookies } from "next/headers";
import { db } from "shared/api/db";
import { verifyAuthToken } from "shared/lib/auth/jwt";
import {
  type CookieReader,
  getAuthTokenFromCookies,
} from "shared/lib/auth/session";

async function getCurrentUserFromCookies(cookieStore: CookieReader) {
  const token = getAuthTokenFromCookies(cookieStore);

  if (!token) {
    return null;
  }

  const payload = await verifyAuthToken(token);

  if (!payload) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return null;
  }

  return serializeUser(user);
}

async function getCurrentUser() {
  const cookieStore = await cookies();

  return getCurrentUserFromCookies(cookieStore);
}

export { getCurrentUser, getCurrentUserFromCookies };
