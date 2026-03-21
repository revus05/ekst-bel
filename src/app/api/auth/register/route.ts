import { Prisma } from "@prisma/client";
import { serializeUser } from "entities/user/model/serialize-user";
import { createAuthSchemas } from "features/auth/model/schemas";
import { cookies } from "next/headers";
import { db } from "shared/api/db";
import {
  createErrorResponse,
  createSuccessResponse,
} from "shared/api/response";
import { signAuthToken } from "shared/lib/auth/jwt";
import { hashPassword } from "shared/lib/auth/password";
import { setAuthCookie } from "shared/lib/auth/session";
import { getMessages } from "shared/lib/i18n/messages";
import { getLocaleFromCookies } from "shared/lib/locale/server";

async function POST(request: Request) {
  const locale = getLocaleFromCookies(await cookies());
  const t = getMessages(locale);
  const { registerSchema } = createAuthSchemas(locale);

  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;

      return createErrorResponse(
        400,
        "VALIDATION_ERROR",
        t.routeErrors.invalidData,
        {
          email: fieldErrors.email?.[0],
          name: fieldErrors.name?.[0],
          password: fieldErrors.password?.[0],
        },
      );
    }

    const existingUser = await db.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true },
    });

    if (existingUser) {
      return createErrorResponse(
        409,
        "EMAIL_ALREADY_EXISTS",
        t.routeErrors.emailExists,
        {
          email: t.routeErrors.emailExists,
        },
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const usersCount = await db.user.count();
    const user = await db.user.create({
      data: {
        email: parsed.data.email,
        name: parsed.data.name,
        password: passwordHash,
        role: usersCount === 0 ? "ADMIN" : "USER",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const token = await signAuthToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = createSuccessResponse({
      user: serializeUser(user),
    });

    setAuthCookie(response, token);

    return response;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return createErrorResponse(
        400,
        "INVALID_JSON",
        t.routeErrors.invalidJson,
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return createErrorResponse(
        409,
        "EMAIL_ALREADY_EXISTS",
        t.routeErrors.emailExists,
        {
          email: t.routeErrors.emailExists,
        },
      );
    }

    console.error("[auth/register] Unexpected error.", error);

    return createErrorResponse(
      500,
      "INTERNAL_SERVER_ERROR",
      t.routeErrors.internalRegister,
    );
  }
}

export { POST };
