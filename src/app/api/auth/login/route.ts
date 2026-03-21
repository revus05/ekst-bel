import { serializeUser } from "entities/user/model/serialize-user";
import { createAuthSchemas } from "features/auth/model/schemas";
import { cookies } from "next/headers";
import { db } from "shared/api/db";
import {
  createErrorResponse,
  createSuccessResponse,
} from "shared/api/response";
import { signAuthToken } from "shared/lib/auth/jwt";
import { verifyPassword } from "shared/lib/auth/password";
import { setAuthCookie } from "shared/lib/auth/session";
import { getMessages } from "shared/lib/i18n/messages";
import { getLocaleFromCookies } from "shared/lib/locale/server";

async function POST(request: Request) {
  const locale = getLocaleFromCookies(await cookies());
  const t = getMessages(locale);
  const { loginSchema } = createAuthSchemas(locale);

  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;

      return createErrorResponse(
        400,
        "VALIDATION_ERROR",
        t.routeErrors.invalidData,
        {
          email: fieldErrors.email?.[0],
          password: fieldErrors.password?.[0],
        },
      );
    }

    const user = await db.user.findUnique({
      where: { email: parsed.data.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return createErrorResponse(
        401,
        "INVALID_CREDENTIALS",
        t.auth.invalidCredentials,
        {
          password: t.auth.invalidCredentials,
        },
      );
    }

    const isPasswordValid = await verifyPassword(
      parsed.data.password,
      user.password,
    );

    if (!isPasswordValid) {
      return createErrorResponse(
        401,
        "INVALID_CREDENTIALS",
        t.auth.invalidCredentials,
        {
          password: t.auth.invalidCredentials,
        },
      );
    }

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

    console.error("[auth/login] Unexpected error.", error);

    return createErrorResponse(
      500,
      "INTERNAL_SERVER_ERROR",
      t.routeErrors.internalLogin,
    );
  }
}

export { POST };
