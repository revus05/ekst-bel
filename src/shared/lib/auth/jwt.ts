import type { UserRole } from "entities/user/model/types";
import "server-only";

import { jwtVerify, SignJWT } from "jose";

import { env } from "shared/config/env";

type AuthTokenPayload = {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
};

const jwtSecret = new TextEncoder().encode(env.JWT_SECRET);

async function signAuthToken(payload: AuthTokenPayload) {
  return new SignJWT({
    email: payload.email,
    name: payload.name,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN)
    .sign(jwtSecret);
}

async function verifyAuthToken(
  token: string,
): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, jwtSecret, {
      algorithms: ["HS256"],
    });

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      (payload.role !== "ADMIN" && payload.role !== "USER")
    ) {
      return null;
    }

    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export type { AuthTokenPayload };
export { signAuthToken, verifyAuthToken };
